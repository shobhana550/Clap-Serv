-- Seed sample gigs for existing providers
-- Run in Supabase SQL Editor

INSERT INTO provider_gigs (provider_id, title, description, price, duration)
SELECT
  pp.user_id,
  gig.title,
  gig.description,
  gig.price,
  gig.duration
FROM provider_profiles pp
CROSS JOIN LATERAL (
  VALUES
    (
      'Deep Home Cleaning',
      'Complete top-to-bottom cleaning of your home including kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products used.',
      1500,
      '4-6 hours'
    ),
    (
      'Sofa & Carpet Steam Cleaning',
      'Professional steam cleaning for sofas, mattresses, and carpets. Removes stains, dust mites, and odors effectively.',
      800,
      '2-3 hours'
    ),
    (
      'Post-Construction Cleaning',
      'Heavy-duty cleaning after renovation or construction. Remove dust, debris, paint marks, and make your space move-in ready.',
      3500,
      '1-2 days'
    )
) AS gig(title, description, price, duration)
WHERE pp.user_id IN (
  -- Pick first 5 providers to seed
  SELECT user_id FROM provider_profiles LIMIT 5
)
ON CONFLICT DO NOTHING;


-- Add more variety for providers who have specific skills
INSERT INTO provider_gigs (provider_id, title, description, price, duration)
SELECT
  pp.user_id,
  gig.title,
  gig.description,
  gig.price,
  gig.duration
FROM provider_profiles pp
CROSS JOIN LATERAL (
  VALUES
    (
      'Interior Wall Painting',
      'Professional interior painting for 1 BHK/2 BHK/3 BHK flats. Includes wall preparation, primer coat, and 2 finish coats. Premium paints available.',
      8000,
      '2-3 days'
    ),
    (
      'Exterior Weather Coat Painting',
      'Weather-resistant exterior painting to protect your building from rain and humidity. Long-lasting finish with 5-year warranty.',
      15000,
      '4-5 days'
    )
) AS gig(title, description, price, duration)
WHERE pp.user_id IN (
  SELECT user_id FROM provider_profiles OFFSET 2 LIMIT 3
)
ON CONFLICT DO NOTHING;


INSERT INTO provider_gigs (provider_id, title, description, price, duration)
SELECT
  pp.user_id,
  gig.title,
  gig.description,
  gig.price,
  gig.duration
FROM provider_profiles pp
CROSS JOIN LATERAL (
  VALUES
    (
      'Electrical Wiring & Fitting',
      'Complete home electrical wiring, switch/socket replacement, ceiling fan installation, and short-circuit troubleshooting by certified electrician.',
      500,
      '1-3 hours'
    ),
    (
      'AC Installation & Service',
      'Split AC and window AC installation, gas refilling, filter cleaning, and general servicing for all major brands.',
      1200,
      '2-4 hours'
    ),
    (
      'Plumbing Repair & Fitting',
      'Tap replacement, pipe leak repair, flush tank repair, shower fitting, and drainage unblocking. Available for emergency calls.',
      400,
      '1-2 hours'
    )
) AS gig(title, description, price, duration)
WHERE pp.user_id IN (
  SELECT user_id FROM provider_profiles OFFSET 1 LIMIT 4
)
ON CONFLICT DO NOTHING;


-- Verify what was inserted
SELECT
  p.full_name,
  pg.title,
  pg.price,
  pg.duration
FROM provider_gigs pg
JOIN profiles p ON p.id = pg.provider_id
ORDER BY p.full_name, pg.created_at;
