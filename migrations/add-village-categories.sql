-- =====================================================
-- MIGRATION: Add Village & Tier 2/3 India service categories
-- Run this in Supabase SQL Editor AFTER add-darbhanga-categories.sql
-- Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING
-- =====================================================

INSERT INTO service_categories (name, description, icon, max_distance_km)
VALUES

  -- ── AGRICULTURE & FARMING ──────────────────────────────────────────────────
  -- Bihar is 80% agricultural. House = home + land + livestock for most families.

  ('Farming & Agriculture',
   'Tractor ploughing, rotavator, farm labor, irrigation setup, crop transport to mandi',
   'seedling', 30),

  ('Harvesting & Threshing',
   'Combine harvester, paddy/wheat threshing machine, seasonal harvest labor hiring',
   'tractor', 30),

  ('Pesticide & Crop Spraying',
   'Pesticide, fertilizer, and herbicide spraying on fields — manual or machine',
   'spray-can', 20),

  ('Irrigation Services',
   'Drip irrigation setup, pipe laying, pump connection, channel digging for fields',
   'water', 20),

  -- ── LIVESTOCK & ANIMAL CARE ───────────────────────────────────────────────
  -- For many families, livestock = primary income. Completely missing in urban apps.

  ('Veterinary (Pashu Doctor)',
   'On-call vet for cattle, buffalo, goat, poultry — vaccinations, illness treatment',
   'paw', 20),

  ('Livestock Services',
   'Artificial insemination, fodder supply, dairy equipment repair, cattle shed construction',
   'horse', 30),

  -- ── WATER ACCESS & SUPPLY ────────────────────────────────────────────────
  -- Municipal water is absent or unreliable across most of Bihar.

  ('Water Tanker Supply',
   'Water tanker delivery for home, farm, or construction — municipal and private',
   'truck', 20),

  ('Well & Pond Services',
   'Well cleaning, desilting, farm pond digging, rainwater harvesting setup',
   'tint', 20),

  -- ── MOTOR, PUMP & ENGINE REPAIR ──────────────────────────────────────────
  -- Bore motor rewinding is one of the highest-frequency rural repair jobs.

  ('Motor & Pump Repair',
   'Bore motor rewinding, submersible pump repair, diesel engine repair, water pump service',
   'cog', 10),

  -- ── RURAL HOUSE REPAIR ────────────────────────────────────────────────────
  -- Village homes are not standardized — kachcha houses, thatched roofs, open wells.

  ('Rural & Kachcha House Repair',
   'Mud house repair, thatched roof fixing, asbestos/tin sheet roofing, boundary wall',
   'home', 20),

  ('Toilet & Sanitation Construction',
   'Toilet building (Swachh Bharat scheme), septic tank construction, soak pit digging',
   'hard-hat', 30),

  ('Septic Tank & Drain Cleaning',
   'Septic tank pumping, sewer drain cleaning, nali safai — home and commercial',
   'trash', 15),

  -- ── SOLAR & POWER ────────────────────────────────────────────────────────
  -- 8-12 hour power cuts in Bihar. Solar adoption is rising fast. MNRE schemes active.

  ('Solar Installation',
   'Solar home lighting, solar pump setup, panel installation, battery bank — scheme-linked',
   'sun', 30),

  ('Inverter & Battery Service',
   'Inverter battery water refill, battery replacement, UPS repair, inverter wiring',
   'battery-full', 10),

  -- ── GOVERNMENT & DOCUMENT HELP ────────────────────────────────────────────
  -- CRITICAL. People pay ₹100–500 for each of these regularly. CSC-type demand.

  ('Government & Document Help',
   'Aadhaar update, ration card, caste/income certificate, PMAY, land records (pahani), pension, loan application',
   'file-alt', 15),

  -- ── TRANSPORT & LOGISTICS ────────────────────────────────────────────────
  -- Rapido/Ola absent in most of Bihar. Informal transport is the norm.

  ('Local Transport',
   'Auto/e-rickshaw/jeep booking for local travel, school transport, station pickup/drop',
   'shuttle-van', 15),

  ('Goods Transport',
   'Tractor trolley, mini truck (Tata Ace), tempo for local goods shifting and mandi transport',
   'truck', 30),

  ('Ambulance & Emergency Transport',
   'Private ambulance for hospital transport, wheelchair vehicle, emergency night transport',
   'ambulance', 30),

  -- ── DAILY LABOR ───────────────────────────────────────────────────────────
  -- "Mujhe kal 2 mazdoor chahiye" — said every day across Bihar. No platform serves this.

  ('Daily Labor (Mazdoor)',
   'General daily wage labor for construction help, digging, loading/unloading, event setup, farm work',
   'users', 15),

  -- ── HOME FOOD SERVICES ────────────────────────────────────────────────────

  ('Tiffin Service',
   'Monthly tiffin subscription — home-cooked meals delivered to students, bachelors, office workers',
   'utensils', 10),

  ('Medicine & Essentials Delivery',
   'Home delivery of medicines, medical supplies, and daily essentials in local areas',
   'pills', 10),

  -- ── MICRO & TRADITIONAL SERVICES ─────────────────────────────────────────
  -- High-frequency, hyper-local, entirely informal today.

  ('Atta Chakki & Grinding',
   'Grain grinding, flour milling, dal processing — home visit or nearby chakki service',
   'cog', 5),

  ('Footwear Repair (Mochi)',
   'Shoe and chappals repair, cobbler services — home visit or local mochi',
   'shoe-prints', 5),

  -- ── PROPERTY & SECURITY ───────────────────────────────────────────────────

  ('Property Caretaker',
   'Caretaker for ancestral/vacant property — for NRI and migrant families in cities/abroad',
   'shield-alt', 30),

  ('Security Guard',
   'Security guard for weddings, events, shops, property — daily or monthly',
   'user-shield', 30),

  -- ── FUNERAL & LAST RITES ─────────────────────────────────────────────────
  -- Exists as an industry, but zero digital presence. High emotional urgency.

  ('Funeral & Last Rites',
   'Antim sanskar arrangements — wood, helpers, pandit, transport, cremation ground coordination',
   'leaf', 30),

  -- ── WELLNESS & LIFESTYLE ─────────────────────────────────────────────────

  ('Yoga & Fitness Trainer',
   'Home-visit yoga instructor, morning fitness trainer, weight loss coach',
   'running', 10),

  ('Music & Arts Teacher',
   'Harmonium, tabla, singing, drawing for children — home-visit teachers',
   'music', 10),

  -- ── SOCIAL SERVICES ──────────────────────────────────────────────────────

  ('Matchmaking',
   'Traditional matrimonial services — local matchmaker for arranged marriage proposals',
   'heart', 30),

  -- ── LAND & LEGAL SERVICES ────────────────────────────────────────────────
  -- Ameen (land surveyor) and Anchal agents are in massive daily demand across Bihar.
  -- Zero digital presence today — entirely word of mouth.

  ('Land Measurement (Ameen)',
   'Licensed land surveyor (ameen) for plot measurement, boundary dispute, registry prep, court-ordered survey',
   'ruler', 30),

  ('Legal & Advocate Services',
   'Local lawyer/advocate for property disputes, family cases, civil matters, FIR drafting, court affidavits',
   'balance-scale', 30),

  ('Anchal & Revenue Agent',
   'Anchal kachahri agent for dakhil kharij, lagan receipt, jamabandi, mutation, land record correction',
   'stamp', 15),

  ('Loan & Bank Agent',
   'KCC (Kisan Credit Card), PM Kisan, SHG loan, Mudra loan, gold loan — application and follow-up help',
   'university', 20),

  -- ── GARDEN & HORTICULTURE ─────────────────────────────────────────────────

  ('Garden & Landscaping (Mali)',
   'Garden maintenance, lawn mowing, plant nursery, tree cutting, kitchen garden setup, seasonal planting',
   'leaf', 10),

  -- ── ANIMAL TRANSPORT ──────────────────────────────────────────────────────
  -- Pashu mandi transport is completely informal and high-frequency in rural Bihar.

  ('Animal Transport',
   'Cattle/buffalo/goat transport to mandi or veterinary — tractor trolley or pickup vehicle',
   'horse', 30),

  -- ── WATER BORING ──────────────────────────────────────────────────────────
  -- One of the highest-ticket rural services. Almost no digital discovery.

  ('Water Boring & Drilling',
   'Hand pump boring, submersible boring, ring well construction, borewell survey and drilling',
   'tint', 30),

  -- ── CONSTRUCTION MATERIAL SUPPLY ──────────────────────────────────────────

  ('Sand, Brick & Construction Supply',
   'Local delivery of reti (sand), eet (brick), gitti, cement bags — for home construction',
   'truck', 20)

ON CONFLICT (name) DO NOTHING;

-- ── VERIFY: full category list after migration ────────────────────────────
SELECT
  name,
  description,
  CASE
    WHEN max_distance_km IS NULL  THEN '🌐 Online'
    WHEN max_distance_km <= 10    THEN '📍 Local'
    WHEN max_distance_km <= 20    THEN '🏘️  Nearby'
    ELSE                               '🏙️  City-wide'
  END AS reach,
  max_distance_km
FROM service_categories
ORDER BY
  CASE
    WHEN max_distance_km IS NULL  THEN 4
    WHEN max_distance_km <= 10    THEN 1
    WHEN max_distance_km <= 20    THEN 2
    ELSE 3
  END,
  name;
