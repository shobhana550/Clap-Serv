-- Seed fake bios and social links for all providers (presentation only)
-- Run in Supabase SQL Editor

WITH ranked AS (
  SELECT
    user_id,
    (ROW_NUMBER() OVER (ORDER BY user_id))::int AS rn
  FROM provider_profiles
)
UPDATE provider_profiles pp
SET
  bio = CASE ranked.rn % 8
    WHEN 0 THEN 'Experienced home cleaning professional with 7+ years of service across Patna and surrounding areas. Known for attention to detail and eco-friendly cleaning solutions. 200+ satisfied clients.'
    WHEN 1 THEN 'Certified electrician and AC technician with 10 years of hands-on experience. Specialise in residential wiring, appliance installation, and emergency repairs. Available 7 days a week.'
    WHEN 2 THEN 'Professional painter with expertise in interior and exterior work. Use only premium quality paints from Asian Paints and Berger. Completed 300+ projects across Bihar and Jharkhand.'
    WHEN 3 THEN 'Skilled carpenter and furniture maker with a workshop in Darbhanga. Custom furniture, modular kitchens, and door/window fittings. 15 years of craftsmanship experience.'
    WHEN 4 THEN 'Plumbing expert handling everything from minor leaks to full bathroom renovations. Fast response time, transparent pricing, and guaranteed workmanship for 6 months.'
    WHEN 5 THEN 'Pest control specialist using government-approved chemicals. Termite treatment, cockroach/rodent control, and annual AMC packages available for homes and commercial spaces.'
    WHEN 6 THEN 'Professional photographer and videographer covering weddings, events, and product shoots. 500+ events covered. Drone photography available. Quick delivery of edited content.'
    ELSE 'Reliable and hardworking service professional committed to quality work and customer satisfaction. Available for bookings across the city with flexible scheduling.'
  END,
  social_links = CASE ranked.rn % 5
    WHEN 0 THEN '[{"id":"1","platform":"YouTube","url":"https://youtube.com/@clapserv-demo"},{"id":"2","platform":"Instagram","url":"https://instagram.com/clapserv.demo"},{"id":"3","platform":"WhatsApp","url":"https://wa.me/919876543210"}]'::jsonb
    WHEN 1 THEN '[{"id":"1","platform":"Website","url":"https://clapserv.in"},{"id":"2","platform":"LinkedIn","url":"https://linkedin.com/in/demo-provider"}]'::jsonb
    WHEN 2 THEN '[{"id":"1","platform":"Instagram","url":"https://instagram.com/pro.cleaning.bihar"},{"id":"2","platform":"Facebook","url":"https://facebook.com/procleaningbihar"}]'::jsonb
    WHEN 3 THEN '[{"id":"1","platform":"YouTube","url":"https://youtube.com/@handyman.darbhanga"},{"id":"2","platform":"WhatsApp","url":"https://wa.me/919123456789"}]'::jsonb
    ELSE '[{"id":"1","platform":"Facebook","url":"https://facebook.com/demo.services.patna"}]'::jsonb
  END
FROM ranked
WHERE pp.user_id = ranked.user_id;

-- Verify
SELECT
  p.full_name,
  LEFT(pp.bio, 60) || '...' AS bio_preview,
  jsonb_array_length(pp.social_links) AS link_count
FROM provider_profiles pp
JOIN profiles p ON p.id = pp.user_id
ORDER BY p.full_name;
