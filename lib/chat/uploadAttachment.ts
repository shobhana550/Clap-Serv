/**
 * Chat attachment upload utility
 * Handles file validation, upload to Supabase Storage, and signed URL generation
 */

import { supabase } from '@/lib/supabase';

const BUCKET = 'chat-attachments';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

/** Extensions that are never allowed regardless of MIME type */
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.sh', '.bash', '.csh', '.ksh',
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1',
  '.dll', '.sys', '.drv',
  '.app', '.action', '.command',
  '.apk', '.ipa',
  '.jar', '.class',
  '.php', '.asp', '.aspx', '.jsp',
  '.html', '.htm', '.svg',
];

/**
 * File magic bytes (signatures) for validating actual file type.
 * This prevents MIME type spoofing attacks where an executable
 * is uploaded with a fake image/jpeg MIME type.
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'video/mp4': [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]], // ftyp at offset 4
  'video/quicktime': [[0x00, 0x00, 0x00]],
};

export interface ChatAttachment {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  type: 'image' | 'video' | 'document';
}

export interface UploadedAttachment {
  path: string;
  type: 'image' | 'video' | 'document';
  name: string;
  mimeType: string;
  size: number;
}

export function getAttachmentType(mimeType: string): 'image' | 'video' | 'document' {
  if (IMAGE_TYPES.includes(mimeType.toLowerCase())) return 'image';
  if (VIDEO_TYPES.includes(mimeType.toLowerCase())) return 'video';
  return 'document';
}

/**
 * Check if the file extension is in the blocked list
 */
function hasBlockedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return BLOCKED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Validate file magic bytes match the claimed MIME type.
 * Returns true if valid or if we can't verify (unknown type).
 */
async function validateMagicBytes(uri: string, mimeType: string): Promise<boolean> {
  const signatures = MAGIC_BYTES[mimeType.toLowerCase()];
  if (!signatures) {
    // Unknown type — we can't validate magic bytes, allow it
    // (blocked extensions are checked separately)
    return true;
  }

  try {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 12));

    // Check if any known signature matches
    return signatures.some(sig =>
      sig.every((byte, index) => bytes[index] === byte)
    );
  } catch {
    // If we can't read the file, reject it to be safe
    return false;
  }
}

export function validateAttachment(att: ChatAttachment): string | null {
  // Check blocked extensions first
  if (hasBlockedExtension(att.name)) {
    return `File "${att.name}" has a blocked file type. Executables and scripts are not allowed.`;
  }

  if (att.type === 'image' && att.size > MAX_IMAGE_SIZE) {
    return `Image "${att.name}" is too large (${(att.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 5MB.`;
  }
  if (att.type === 'video' && att.size > MAX_VIDEO_SIZE) {
    return `Video "${att.name}" is too large (${(att.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 20MB.`;
  }
  if (att.type === 'document' && att.size > MAX_DOC_SIZE) {
    return `File "${att.name}" is too large (${(att.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 10MB.`;
  }
  return null;
}

export async function uploadChatAttachment(
  att: ChatAttachment,
  userId: string,
  conversationId: string
): Promise<UploadedAttachment> {
  // Validate magic bytes for images and videos to prevent MIME spoofing
  if (att.type === 'image' || att.type === 'video') {
    const isValid = await validateMagicBytes(att.uri, att.mimeType);
    if (!isValid) {
      throw new Error(
        `File "${att.name}" does not match its declared type. The file may be corrupted or incorrectly named.`
      );
    }
  }

  // Sanitize filename — remove path traversal and special chars
  const safeName = att.name
    .replace(/\.\./g, '') // remove path traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100); // limit filename length
  const timestamp = Date.now();
  const storagePath = `${userId}/${conversationId}/${timestamp}_${safeName}`;

  // Fetch file as blob
  const response = await fetch(att.uri);
  const blob = await response.blob();

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, {
      contentType: att.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error('Upload failed. Please try again.');
  }

  return {
    path: storagePath,
    type: att.type,
    name: att.name,
    mimeType: att.mimeType,
    size: att.size,
  };
}

export async function getAttachmentSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
