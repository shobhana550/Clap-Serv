-- =====================================================
-- Clap-Serv: Reviews / Ratings Table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing broken table from previous attempt (if any)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create reviews table fresh
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, reviewer_id)
);

-- Add foreign keys separately (more reliable)
ALTER TABLE public.reviews
  ADD CONSTRAINT fk_reviews_request FOREIGN KEY (request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
  ADD CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
  ADD CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX idx_reviews_request_id ON public.reviews(request_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
