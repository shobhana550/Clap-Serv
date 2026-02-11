-- Fix Row Level Security Policies for Clap-Serv
-- Run this in Supabase SQL Editor
-- This script is SAFE to run multiple times

-- 1. Drop ALL existing policies (comprehensive cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;

    -- Drop all policies on provider_profiles table
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'provider_profiles'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON provider_profiles';
    END LOOP;
END $$;

-- 2. PROFILES table policies
-- Allow anyone to read all profiles (for browsing providers/buyers)
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. PROVIDER_PROFILES table policies
-- Allow anyone to read all provider profiles (for browsing)
CREATE POLICY "Anyone can view provider profiles"
ON provider_profiles FOR SELECT
USING (true);

-- Allow users to insert their own provider profile
CREATE POLICY "Users can insert own provider profile"
ON provider_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own provider profile
CREATE POLICY "Users can update own provider profile"
ON provider_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verify RLS is enabled (should already be enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions to authenticated users
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

GRANT SELECT ON provider_profiles TO authenticated;
GRANT INSERT ON provider_profiles TO authenticated;
GRANT UPDATE ON provider_profiles TO authenticated;

-- 6. Verification: List all policies (run this to confirm)
-- Uncomment the lines below if you want to see the results

-- SELECT tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'provider_profiles')
-- ORDER BY tablename, cmd;

-- Expected output:
-- profiles          | Anyone can view profiles         | SELECT | {}
-- profiles          | Users can insert own profile     | INSERT | {}
-- profiles          | Users can update own profile     | UPDATE | {}
-- provider_profiles | Anyone can view provider profiles| SELECT | {}
-- provider_profiles | Users can insert own provider profile | INSERT | {}
-- provider_profiles | Users can update own provider profile | UPDATE | {}

-- ✅ SUCCESS! If you see "Success. No rows returned", the policies were created correctly.
-- Go to Supabase Dashboard → Authentication → Policies to verify visually.
