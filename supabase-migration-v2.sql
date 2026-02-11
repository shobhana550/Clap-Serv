-- Clap-Serv Database Migration v2
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This migration adds: admin flags, verification, blocking, regions, and updated distances

-- =====================================================
-- 1. Update local service distances from 2km to 5km
-- =====================================================
UPDATE service_categories SET max_distance_km = 5 WHERE max_distance_km = 2;

-- =====================================================
-- 2. Add admin and blocking flags to profiles
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 3. Add verification flag to provider_profiles
-- =====================================================
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 4. Service Regions table (admin-defined)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',
  lat NUMERIC,
  lng NUMERIC,
  radius_km INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Region-Category mapping table
-- =====================================================
CREATE TABLE IF NOT EXISTS region_categories (
  region_id UUID REFERENCES service_regions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (region_id, category_id)
);

-- =====================================================
-- 6. Enable RLS on new tables
-- =====================================================
ALTER TABLE service_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS Policies for service_regions
-- =====================================================

-- Anyone can read active regions
CREATE POLICY "Anyone can read active regions"
  ON service_regions FOR SELECT
  USING (is_active = TRUE);

-- Admins have full CRUD access to regions
CREATE POLICY "Admins can insert regions"
  ON service_regions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update regions"
  ON service_regions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can delete regions"
  ON service_regions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Admins can also read inactive regions
CREATE POLICY "Admins can read all regions"
  ON service_regions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- =====================================================
-- 8. RLS Policies for region_categories
-- =====================================================

-- Anyone can read region-category mappings
CREATE POLICY "Anyone can read region categories"
  ON region_categories FOR SELECT
  USING (TRUE);

-- Admins can manage region-category mappings
CREATE POLICY "Admins can insert region categories"
  ON region_categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can delete region categories"
  ON region_categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- =====================================================
-- 9. Admin RLS policies for existing tables
-- =====================================================

-- Admins can update any profile (for blocking)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Admins can update any provider_profile (for verification)
CREATE POLICY "Admins can update any provider profile"
  ON provider_profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Admins can manage service categories
CREATE POLICY "Admins can insert service categories"
  ON service_categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update service categories"
  ON service_categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can delete service categories"
  ON service_categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- =====================================================
-- 10. Indexes for new tables
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_service_regions_city ON service_regions(city);
CREATE INDEX IF NOT EXISTS idx_service_regions_active ON service_regions(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_verified ON provider_profiles(is_verified) WHERE is_verified = TRUE;

-- =====================================================
-- DONE! After running this migration:
-- 1. Set is_admin = TRUE on your profile:
--    UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
-- 2. Verify by querying: SELECT id, email, is_admin FROM profiles;
-- =====================================================
