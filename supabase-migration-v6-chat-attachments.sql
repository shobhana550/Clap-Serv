-- =============================================
-- Migration v6: Chat Attachments Storage + Conversation Uniqueness
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create chat-attachments storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS policies (drop first to make re-runnable)
DROP POLICY IF EXISTS "Users can upload chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat attachments" ON storage.objects;

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read chat attachments
-- (RLS on messages table already gates which messages/attachments a user can see)
CREATE POLICY "Authenticated users can read chat attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND auth.role() = 'authenticated'
  );

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Add unique constraint on conversations to prevent duplicates
-- A buyer can only have one conversation per request per provider
ALTER TABLE conversations
  ADD CONSTRAINT unique_conversation_per_request_provider
  UNIQUE (request_id, buyer_id, provider_id);

-- =============================================
-- DONE! Run this migration before using chat attachments.
-- Also create the bucket manually in Supabase Dashboard > Storage
-- if the INSERT INTO storage.buckets doesn't work via SQL.
-- =============================================
