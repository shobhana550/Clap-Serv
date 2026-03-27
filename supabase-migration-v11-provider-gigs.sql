-- =====================================================
-- MIGRATION v11: Provider Gigs Table
-- Creates provider_gigs table so gigs/portfolio
-- are persisted in Supabase instead of AsyncStorage
-- =====================================================

CREATE TABLE IF NOT EXISTS provider_gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by provider
CREATE INDEX IF NOT EXISTS provider_gigs_provider_id_idx ON provider_gigs(provider_id);

-- Enable RLS
ALTER TABLE provider_gigs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view gigs (for buyer profile browsing)
CREATE POLICY "Provider gigs are viewable by authenticated users"
  ON provider_gigs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Providers can insert their own gigs
CREATE POLICY "Providers can insert own gigs"
  ON provider_gigs FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

-- Providers can update their own gigs
CREATE POLICY "Providers can update own gigs"
  ON provider_gigs FOR UPDATE
  USING (auth.uid() = provider_id);

-- Providers can delete their own gigs
CREATE POLICY "Providers can delete own gigs"
  ON provider_gigs FOR DELETE
  USING (auth.uid() = provider_id);
