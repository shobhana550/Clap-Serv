-- =====================================================
-- Clap-Serv: Security Hardening Migration v8
-- Run this in Supabase SQL Editor
-- =====================================================


-- =====================================================
-- 1. ADD is_admin COLUMN IF MISSING
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;


-- =====================================================
-- 2. ADMIN RLS POLICIES
--    Prevent non-admins from performing admin operations
-- =====================================================

-- Allow admins to update ANY profile (block/unblock users)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Admin-only: insert/update/delete on service_categories
DROP POLICY IF EXISTS "Admins can insert categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON service_categories;

CREATE POLICY "Admins can insert categories"
  ON service_categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update categories"
  ON service_categories FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete categories"
  ON service_categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Admin-only: service_regions CRUD
-- First ensure RLS is enabled
ALTER TABLE service_regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Regions are viewable by everyone" ON service_regions;
DROP POLICY IF EXISTS "Admins can insert regions" ON service_regions;
DROP POLICY IF EXISTS "Admins can update regions" ON service_regions;
DROP POLICY IF EXISTS "Admins can delete regions" ON service_regions;

CREATE POLICY "Regions are viewable by everyone"
  ON service_regions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert regions"
  ON service_regions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update regions"
  ON service_regions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete regions"
  ON service_regions FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Admin-only: region_categories CRUD
ALTER TABLE region_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Region categories are viewable by everyone" ON region_categories;
DROP POLICY IF EXISTS "Admins can insert region categories" ON region_categories;
DROP POLICY IF EXISTS "Admins can delete region categories" ON region_categories;

CREATE POLICY "Region categories are viewable by everyone"
  ON region_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert region categories"
  ON region_categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete region categories"
  ON region_categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- =====================================================
-- 3. RESTRICT PROFILE DATA EXPOSURE
--    Create a secure view that hides email/phone
--    Email/phone only visible to: the user themselves,
--    admins, or the other party in an accepted proposal
-- =====================================================

-- We can't restrict columns with RLS alone, so we create
-- a view for public profile access and keep the table for
-- authenticated self-access.
-- NOTE: The RLS on profiles table stays as-is for the app
-- to function, but we add a secure function for public lookups.

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  caller_id UUID;
  is_caller_admin BOOLEAN;
  has_accepted_proposal BOOLEAN;
BEGIN
  caller_id := auth.uid();

  -- Check if caller is admin
  SELECT is_admin INTO is_caller_admin
  FROM profiles WHERE id = caller_id;

  -- Check if caller has an accepted proposal with this profile
  SELECT EXISTS(
    SELECT 1 FROM proposals p
    JOIN service_requests sr ON p.request_id = sr.id
    WHERE p.status = 'accepted'
    AND (
      (sr.buyer_id = caller_id AND p.provider_id = profile_id)
      OR (p.provider_id = caller_id AND sr.buyer_id = profile_id)
    )
  ) INTO has_accepted_proposal;

  -- Return full profile for: self, admin, or accepted proposal partner
  IF caller_id = profile_id OR is_caller_admin = TRUE OR has_accepted_proposal = TRUE THEN
    SELECT json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'email', p.email,
      'phone', p.phone,
      'role', p.role,
      'avatar_url', p.avatar_url,
      'location', p.location,
      'created_at', p.created_at,
      'is_blocked', p.is_blocked
    ) INTO result
    FROM profiles p WHERE p.id = profile_id;
  ELSE
    -- Public view: hide email and phone
    SELECT json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'email', NULL,
      'phone', NULL,
      'role', p.role,
      'avatar_url', p.avatar_url,
      'location', json_build_object(
        'city', p.location->>'city',
        'state', p.location->>'state'
      ),
      'created_at', p.created_at,
      'is_blocked', p.is_blocked
    ) INTO result
    FROM profiles p WHERE p.id = profile_id;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 4. FIX PUSH TOKENS — REMOVE OVERLY PERMISSIVE POLICY
--    Currently any auth user can read ALL push tokens
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read push tokens for notifications" ON push_tokens;

-- Instead, create a secure function for sending notifications
-- that uses SECURITY DEFINER to read tokens internally
CREATE OR REPLACE FUNCTION public.get_user_push_tokens(target_user_id UUID)
RETURNS TABLE(token TEXT) AS $$
BEGIN
  -- Only allow authenticated users to call this
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT pt.token FROM push_tokens pt WHERE pt.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 5. ATOMIC PROPOSAL ACCEPTANCE (RPC FUNCTION)
--    Prevents race conditions when accepting proposals
-- =====================================================

CREATE OR REPLACE FUNCTION public.accept_proposal(
  p_proposal_id UUID,
  p_request_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_proposal RECORD;
  v_caller_id UUID;
  v_conversation_id UUID;
BEGIN
  v_caller_id := auth.uid();

  -- 1. Lock and verify the request is still open/in_progress
  SELECT * INTO v_request
  FROM service_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.buyer_id != v_caller_id THEN
    RAISE EXCEPTION 'Only the request owner can accept proposals';
  END IF;

  IF v_request.status NOT IN ('open', 'in_progress') THEN
    RAISE EXCEPTION 'Request is no longer accepting proposals (status: %)', v_request.status;
  END IF;

  -- 2. Lock and verify the proposal is still pending
  SELECT * INTO v_proposal
  FROM proposals
  WHERE id = p_proposal_id AND request_id = p_request_id
  FOR UPDATE;

  IF v_proposal IS NULL THEN
    RAISE EXCEPTION 'Proposal not found for this request';
  END IF;

  IF v_proposal.status != 'pending' THEN
    RAISE EXCEPTION 'Proposal is no longer pending (status: %)', v_proposal.status;
  END IF;

  -- 3. Accept the proposal
  UPDATE proposals SET status = 'accepted', updated_at = NOW()
  WHERE id = p_proposal_id;

  -- 4. Reject all other pending proposals
  UPDATE proposals SET status = 'rejected', updated_at = NOW()
  WHERE request_id = p_request_id
    AND id != p_proposal_id
    AND status = 'pending';

  -- 5. Update request status
  UPDATE service_requests SET status = 'in_progress', updated_at = NOW()
  WHERE id = p_request_id;

  -- 6. Create conversation if not exists
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE request_id = p_request_id
    AND buyer_id = v_caller_id
    AND provider_id = v_proposal.provider_id
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (request_id, buyer_id, provider_id, request_title)
    VALUES (p_request_id, v_caller_id, v_proposal.provider_id, v_request.title)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'conversation_id', v_conversation_id,
    'provider_id', v_proposal.provider_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 6. PREVENT BLOCKED USERS FROM PERFORMING ACTIONS
-- =====================================================

-- Blocked users cannot create service requests
DROP POLICY IF EXISTS "Users can create service requests" ON service_requests;
CREATE POLICY "Users can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = TRUE)
  );

-- Blocked users cannot create proposals
DROP POLICY IF EXISTS "Providers can create proposals" ON proposals;
CREATE POLICY "Providers can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    auth.uid() = provider_id
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = TRUE)
  );

-- Blocked users cannot send messages
DROP POLICY IF EXISTS "Messages can be created by conversation participants" ON messages;
CREATE POLICY "Messages can be created by conversation participants"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT provider_id FROM conversations WHERE id = conversation_id
    )
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = TRUE)
  );


-- =====================================================
-- 7. GRANT EXECUTE ON FUNCTIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_public_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_push_tokens(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_proposal(UUID, UUID) TO authenticated;
