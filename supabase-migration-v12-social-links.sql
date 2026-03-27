-- MIGRATION v12: Add social_links column to provider_profiles
ALTER TABLE provider_profiles
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;
