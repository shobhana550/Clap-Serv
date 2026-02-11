-- Clap-Serv Database Migration v3
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This migration adds: auto-region creation by authenticated users

-- =====================================================
-- 1. Allow authenticated users to insert regions
--    (so the app can auto-create regions from user locations)
-- =====================================================
CREATE POLICY "Authenticated users can insert regions"
  ON service_regions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. Change default is_active to FALSE for new regions
--    (admin must manually activate regions)
-- =====================================================
ALTER TABLE service_regions ALTER COLUMN is_active SET DEFAULT FALSE;

-- =====================================================
-- DONE! After running this migration:
-- 1. Users can now save their city/state in Edit Profile
-- 2. A region will be auto-created (inactive) when a new city is detected
-- 3. Go to Admin Panel > Regions to activate regions
-- =====================================================
