-- =====================================================
-- MIGRATION v10: Security Fixes
-- 1. Restrict service_requests to authenticated users only
-- 2. Restrict profiles to authenticated users only
-- 3. Fix get_user_push_tokens authorization check
-- =====================================================


-- =====================================================
-- 1. RESTRICT SERVICE REQUESTS TO AUTHENTICATED USERS
-- =====================================================
DROP POLICY IF EXISTS "Service requests are viewable by everyone" ON service_requests;

CREATE POLICY "Service requests viewable by authenticated users"
  ON service_requests FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================================================
-- 2. RESTRICT PROFILES TO AUTHENTICATED USERS
-- =====================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles viewable by authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================================================
-- 3. FIX get_user_push_tokens — ADD AUTHORIZATION CHECK
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_push_tokens(target_user_id UUID)
RETURNS TABLE(token TEXT) AS $$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Must be requesting own tokens or be an admin
  IF target_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT pt.token FROM push_tokens pt WHERE pt.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_push_tokens(UUID) TO authenticated;
