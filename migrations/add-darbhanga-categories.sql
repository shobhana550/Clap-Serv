-- =====================================================
-- MIGRATION: Add Darbhanga / Tier-2 India service categories
-- Run this in Supabase SQL Editor against your EXISTING database.
-- Safe to run — uses INSERT ... ON CONFLICT DO NOTHING.
-- =====================================================

-- 1. Rename categories that had urban/irrelevant names
UPDATE service_categories SET
  name        = 'AC & Cooler Repair',
  description = 'AC installation, servicing, gas refill, desert cooler repair',
  icon        = 'snowflake'
WHERE name = 'HVAC Services';

UPDATE service_categories SET
  name        = 'Garden & Lawn Care',
  description = 'Kitchen garden setup, lawn mowing, tree trimming, plant care'
WHERE name = 'Landscaping';

UPDATE service_categories SET
  name        = 'Deep Cleaning',
  description = 'Full home deep cleaning, bathroom scrubbing, kitchen degreasing',
  icon        = 'spray-can'
WHERE name = 'Cleaning';

UPDATE service_categories SET
  description = 'Pipe repairs, tap fitting, drainage, and water leak fixes',
  max_distance_km = 5
WHERE name = 'Plumbing';

UPDATE service_categories SET
  description = 'Wiring, switches, MCB, fan & light fitting, load issues',
  max_distance_km = 5
WHERE name = 'Electrical';

UPDATE service_categories SET
  description = 'TV, fridge, washing machine, mixer, and home appliance repairs',
  max_distance_km = 5
WHERE name = 'Appliance Repair';

UPDATE service_categories SET
  description = 'Wedding, event, portrait, and product photography'
WHERE name = 'Photography';

-- Remove Virtual Assistant and Translation (low relevance for Bihar Phase 1)
-- NOTE: Only remove if no service_requests reference them.
-- Uncomment only if you are sure:
-- DELETE FROM service_categories WHERE name IN ('Virtual Assistant', 'Translation');

-- 2. Add all new categories (ON CONFLICT skips duplicates safely)
INSERT INTO service_categories (name, description, icon, max_distance_km)
VALUES
  -- LOCAL
  ('Cook',                      'Daily cook, part-time bawarchi, event cook for functions and weddings',            'utensils',        5),
  ('Domestic Help',             'Maid, housekeeping, utensil washing, sweeping and mopping',                       'broom',           5),
  ('Laundry & Dhobi',           'Clothes washing, ironing, dhobi services at home or pickup',                      'tshirt',          5),
  ('Handpump & Borewell',       'Handpump repair, borewell drilling, submersible pump installation',               'tint',            5),
  ('Tailor',                    'Clothes stitching, blouse, kurta, school uniforms, alterations',                  'cut',             5),
  ('Welder & Fabricator',       'Gate welding, window grills, iron furniture, metal fabrication',                  'fire',            5),
  ('Home Tutor',                'Tuition for Class 1-12, board exam prep, subject specialists at home',            'graduation-cap', 10),
  ('Barber (Home Visit)',       'Haircut, shave, and grooming at your home — for men, elders, children',           'user-slash',      5),
  ('Beauty & Wellness',         'Parlour at home — threading, waxing, facial, hair — ladies only',                 'spa',            10),
  ('Elder & Baby Care',         'Attendant for elderly, babysitter, baby malish, child caretaker',                 'baby',           10),
  ('Phone & Computer Repair',   'Mobile screen, battery, laptop repair, printer and photocopier servicing',        'mobile-alt',     10),
  ('BPSC & Govt Exam Coaching', 'Home tutor for BPSC, SSC, Railway, Police exam preparation',                     'book-open',      10),
  ('Water Tank Cleaning',       'Overhead and underground water tank cleaning and disinfection',                   'water',          10),

  -- CITY-WIDE
  ('Mason & Construction',      'Raj mistri for wall repair, flooring, tiling, new construction work',             'hard-hat',       30),
  ('Waterproofing',             'Seepage repair, roof waterproofing, bathroom leakage fixing',                     'shield-alt',     30),
  ('POP & False Ceiling',       'POP work, gypsum false ceiling, cornices, wall decorative moulding',             'layer-group',    30),
  ('Driver Services',           'Driver for the day, outstation trips, airport drop, monthly driver',             'car',            30),
  ('Videography',               'Wedding video, event coverage, reels, short film production',                    'video',          30),
  ('Mehndi & Bridal Makeup',    'Bridal makeup, party makeup, mehndi designs for weddings and events',            'magic',          30),
  ('Pandit & Rituals',          'Puja, vivah, grih pravesh, shraddh, satyanarayan katha, Chhath puja',            'sun',            30),
  ('Event Catering',            'Cook + team for weddings, functions, namkaran — Maithil cuisine speciality',     'concierge-bell', 30),
  ('Sound & Lighting',          'DJ, sound system, LED lighting and decoration for events and baraats',           'music',          30),
  ('Tent & Event Setup',        'Shamiyana, pandal, chair-table, stage setup for weddings and functions',         'archway',        30),
  ('Generator & Equipment Rental', 'Generator on rent, water pump, drilling machine, scaffolding rental',         'plug',           30),
  ('CCTV & Inverter',           'CCTV camera installation, inverter/battery fitting, DTH setup',                  'eye',            30),
  ('Home Nurse & Medical',      'Trained nurse for home care, IV drip, wound dressing, blood sample pickup',      'heartbeat',      30),
  ('Physiotherapy',             'Home-visit physiotherapist for injury recovery, back pain, elder care',          'user-md',        30),
  ('Madhubani Art & Craft',     'Mithila wall painting, canvas, fabric art — authentic local artists',            'palette',        30),
  ('Other',                     'Any service not listed above — post your custom request',                        'ellipsis-h',     30)

ON CONFLICT (name) DO NOTHING;

-- 3. Verify the result
SELECT
  name,
  CASE
    WHEN max_distance_km IS NULL THEN 'Online'
    WHEN max_distance_km <= 10   THEN 'Local'
    ELSE 'City-wide'
  END AS type,
  max_distance_km
FROM service_categories
ORDER BY
  CASE WHEN max_distance_km IS NULL THEN 3 WHEN max_distance_km <= 10 THEN 1 ELSE 2 END,
  name;
