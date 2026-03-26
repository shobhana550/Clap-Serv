-- Clap-Serv Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('buyer', 'provider', 'both')) NOT NULL,
  avatar_url TEXT,
  location JSONB, -- {city, state, lat, lng, address}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider specific details
CREATE TABLE provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC,
  bio TEXT,
  portfolio_items JSONB[] DEFAULT '{}',
  certifications JSONB[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0
);

-- Service categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  max_distance_km INTEGER, -- null for online services
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service requests
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES service_categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline TEXT,
  deadline TIMESTAMPTZ,
  location JSONB,
  attachments TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals/Bids
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC NOT NULL,
  timeline_estimate TEXT,
  cover_letter TEXT,
  portfolio_samples TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (accepted proposals)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX idx_service_requests_buyer_id ON service_requests(buyer_id);
CREATE INDEX idx_service_requests_category_id ON service_requests(category_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_proposals_request_id ON proposals(request_id);
CREATE INDEX idx_proposals_provider_id ON proposals(provider_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_projects_buyer_id ON projects(buyer_id);
CREATE INDEX idx_projects_provider_id ON projects(provider_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Provider Profiles: Similar to profiles
CREATE POLICY "Provider profiles are viewable by everyone"
  ON provider_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own provider profile"
  ON provider_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own provider profile"
  ON provider_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service Categories: Public read
CREATE POLICY "Service categories are viewable by everyone"
  ON service_categories FOR SELECT
  USING (true);

-- Service Requests: Public read, owner can CRUD
CREATE POLICY "Service requests are viewable by everyone"
  ON service_requests FOR SELECT
  USING (true);

CREATE POLICY "Users can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own service requests"
  ON service_requests FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can delete own service requests"
  ON service_requests FOR DELETE
  USING (auth.uid() = buyer_id);

-- Proposals: Request owner and proposal creator can read, creator can CRUD
CREATE POLICY "Proposals viewable by request owner and proposal creator"
  ON proposals FOR SELECT
  USING (
    auth.uid() = provider_id OR
    auth.uid() IN (SELECT buyer_id FROM service_requests WHERE id = request_id)
  );

CREATE POLICY "Providers can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = provider_id);

-- Projects: Viewable and editable by participants
CREATE POLICY "Projects viewable by participants"
  ON projects FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = provider_id);

CREATE POLICY "Projects can be created by request owner"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Projects can be updated by participants"
  ON projects FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = provider_id);

-- Conversations: Only participants can access
CREATE POLICY "Conversations viewable by participants"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = provider_id);

CREATE POLICY "Conversations can be created by participants"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = provider_id);

-- Messages: Only conversation participants can read/write
CREATE POLICY "Messages viewable by conversation participants"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT provider_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Messages can be created by conversation participants"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT provider_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Messages can be updated by sender"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Reviews: Public read, only project participants can create
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Reviews can be created by project participants"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    auth.uid() IN (
      SELECT buyer_id FROM projects WHERE id = project_id
      UNION
      SELECT provider_id FROM projects WHERE id = project_id
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA - Service Categories
-- =====================================================

-- Categories optimised for Tier 2/3 India — Darbhanga / Mithila region first.
-- Local = within 10 km | City = within 30 km | NULL = online/remote

INSERT INTO service_categories (name, description, icon, max_distance_km) VALUES
  -- LOCAL (daily-need, provider comes to you)
  ('Plumbing',                  'Pipe repairs, tap fitting, drainage, and water leak fixes',                        'wrench',          5),
  ('Electrical',                'Wiring, switches, MCB, fan & light fitting, load issues',                         'bolt',            5),
  ('Appliance Repair',          'TV, fridge, washing machine, mixer, and home appliance repairs',                  'tools',           5),
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

  -- CITY-WIDE (specialist / event / project services)
  ('House Painting',            'Interior and exterior painting, wall putty, texture finish',                      'paint-brush',    30),
  ('Pest Control',              'Cockroach, termite, mosquito, rat, and bedbug treatment',                        'bug',            30),
  ('Deep Cleaning',             'Full home deep cleaning, bathroom scrubbing, kitchen degreasing',                 'spray-can',      30),
  ('Carpentry',                 'Furniture making and repair, door/window fitting, woodwork',                      'hammer',         30),
  ('Mason & Construction',      'Raj mistri for wall repair, flooring, tiling, new construction work',             'hard-hat',       30),
  ('AC & Cooler Repair',        'AC installation, servicing, gas refill, desert cooler repair',                   'snowflake',      30),
  ('Waterproofing',             'Seepage repair, roof waterproofing, bathroom leakage fixing',                     'shield-alt',     30),
  ('POP & False Ceiling',       'POP work, gypsum false ceiling, cornices, wall decorative moulding',             'layer-group',    30),
  ('Garden & Lawn Care',        'Kitchen garden setup, lawn mowing, tree trimming, plant care',                   'leaf',           30),
  ('Roofing',                   'Roof sheet installation, repair, insulation, and maintenance',                   'home',           30),
  ('Moving & Packing',          'House shifting, goods packing, loading and unloading help',                      'truck',          30),
  ('Driver Services',           'Driver for the day, outstation trips, airport drop, monthly driver',             'car',            30),
  ('Photography',               'Wedding, event, portrait, and product photography',                              'camera',         30),
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
  ('Other',                     'Any service not listed above — post your custom request',                        'ellipsis-h',     30),

  -- ONLINE / REMOTE (unlimited range)
  ('Online Tutoring',           'Online academic tutoring via video call — any subject, any board',               'laptop',         NULL),
  ('Web Development',           'Website design and development services',                                         'code',           NULL),
  ('Mobile Development',        'iOS and Android app development',                                                 'mobile',         NULL),
  ('Graphic Design',            'Logo, banner, social media and visual design',                                    'pen-nib',        NULL),
  ('Content Writing',           'Blog posts, articles, copywriting in Hindi and English',                         'pencil-alt',     NULL),
  ('Digital Marketing',         'Social media management, SEO, and online advertising',                           'chart-line',     NULL),
  ('Video Editing',             'Wedding video editing, reels, YouTube content production',                       'film',           NULL),
  ('Business Consulting',       'Strategy, GST, business registration, and planning advice',                      'lightbulb',      NULL);

-- =====================================================
-- STORAGE BUCKETS (Run these via Supabase Dashboard or API)
-- =====================================================

-- 1. Create these buckets in Supabase Dashboard > Storage:
--    - avatars (public)
--    - attachments (private)
--    - portfolios (public)

-- Or use SQL to create them:
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('avatars', 'avatars', true),
--   ('attachments', 'attachments', false),
--   ('portfolios', 'portfolios', true);

-- Storage policies for avatars bucket (public)
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
