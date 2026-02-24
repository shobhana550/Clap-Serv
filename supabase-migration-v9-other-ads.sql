-- =============================================================
-- Migration v9: "Other" category + hyperlocal_ads table
-- Run this in your Supabase SQL editor
-- =============================================================

-- 1. Insert the "Other" category (city-range, 30km, no skills required)
--    ON CONFLICT DO NOTHING so it's safe to re-run.
INSERT INTO service_categories (name, description, icon, max_distance_km)
VALUES (
  'Other',
  'Any service not listed above — connect with nearby providers in your city',
  'question-circle',
  30
)
ON CONFLICT (name) DO NOTHING;

-- 2. Create hyperlocal_ads table (admin-controlled banners shown in-app)
CREATE TABLE IF NOT EXISTS hyperlocal_ads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  subtitle     TEXT,
  cta_text     TEXT NOT NULL DEFAULT 'Learn More',
  cta_url      TEXT,
  bg_color     TEXT NOT NULL DEFAULT '#E20010',
  text_color   TEXT NOT NULL DEFAULT '#FFFFFF',
  is_active    BOOLEAN NOT NULL DEFAULT false,
  target_city  TEXT,          -- NULL = show to all cities
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RLS for hyperlocal_ads
ALTER TABLE hyperlocal_ads ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active ads
CREATE POLICY "Active ads readable by all" ON hyperlocal_ads
  FOR SELECT USING (is_active = true);

-- Only admins can manage ads (insert/update/delete)
CREATE POLICY "Admins can manage ads" ON hyperlocal_ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 4. Seed one sample ad (inactive by default — admin activates it)
INSERT INTO hyperlocal_ads (title, subtitle, cta_text, cta_url, bg_color, text_color, is_active)
VALUES (
  'Grow Your Business Locally',
  'Reach thousands of customers in your city — zero commission',
  'List Your Service',
  'https://app.clap-serv.com',
  '#E20010',
  '#FFFFFF',
  false
);
