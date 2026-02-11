-- Clap-Serv Database Migration v5
-- Run this in your Supabase SQL Editor
-- This migration fixes: proposal acceptance flow, conversation creation by buyer

-- =====================================================
-- 1. Allow buyers to update proposal status (accept/reject)
-- =====================================================
-- Currently only providers can update proposals.
-- Buyers need to set status to 'accepted' or 'rejected' when reviewing proposals.

CREATE POLICY "Buyers can update proposals on their requests"
  ON proposals FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT buyer_id FROM service_requests WHERE id = request_id
    )
  );

-- =====================================================
-- 2. Allow buyers to create conversations
-- =====================================================
-- The existing policy only allows participants, but we need to ensure
-- the buyer can create a conversation when accepting a proposal.
-- The existing INSERT policy already covers this:
--   WITH CHECK (auth.uid() = buyer_id OR auth.uid() = provider_id)

-- =====================================================
-- 3. Add last_message fields to conversations for efficient listing
-- =====================================================
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS request_title TEXT;

-- =====================================================
-- 4. Allow participants to update conversations (for last_message)
-- =====================================================
CREATE POLICY "Conversation participants can update"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = provider_id);

-- =====================================================
-- DONE! Run this migration before using the updated proposal flow.
-- =====================================================
