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

export function validateAttachment(att: ChatAttachment): string | null {
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
  // Sanitize filename
  const safeName = att.name.replace(/[^a-zA-Z0-9._-]/g, '_');
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
    throw new Error(`Upload failed: ${error.message}`);
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
