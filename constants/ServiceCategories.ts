/**
 * Service Categories for Clap-Serv
 * Optimised for Tier 2/3 India — starting with Darbhanga / Mithila region.
 *
 * Distance types:
 *   local   — ≤10 km   (daily-need, provider comes to you)
 *   nearby  — ≤20 km   (semi-local, specialist or village-range)
 *   city    — ≤30 km   (city-wide, event or project services)
 *   online  — null     (remote / digital)
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // FontAwesome5 icon name
  maxDistanceKm: number | null;
  color: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [

  // ─── LOCAL (≤10 km) ────────────────────────────────────────────────────────

  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Pipe repairs, tap fitting, drainage, and water leak fixes',
    icon: 'wrench',
    maxDistanceKm: 5,
    color: '#3B82F6',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Wiring, switches, MCB, fan & light fitting, load issues',
    icon: 'bolt',
    maxDistanceKm: 5,
    color: '#F59E0B',
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    description: 'TV, fridge, washing machine, mixer, and home appliance repairs',
    icon: 'tools',
    maxDistanceKm: 5,
    color: '#8B5CF6',
  },
  {
    id: 'cook',
    name: 'Cook',
    description: 'Daily cook, part-time bawarchi, event cook for functions and weddings',
    icon: 'utensils',
    maxDistanceKm: 5,
    color: '#F97316',
  },
  {
    id: 'domestic-help',
    name: 'Domestic Help',
    description: 'Maid, housekeeping, utensil washing, sweeping and mopping',
    icon: 'broom',
    maxDistanceKm: 5,
    color: '#14B8A6',
  },
  {
    id: 'laundry',
    name: 'Laundry & Dhobi',
    description: 'Clothes washing, ironing, dhobi services at home or pickup',
    icon: 'tshirt',
    maxDistanceKm: 5,
    color: '#06B6D4',
  },
  {
    id: 'handpump-borewell',
    name: 'Handpump & Borewell',
    description: 'Handpump repair, borewell drilling, submersible pump installation',
    icon: 'tint',
    maxDistanceKm: 5,
    color: '#0EA5E9',
  },
  {
    id: 'tailor',
    name: 'Tailor',
    description: 'Clothes stitching, blouse, kurta, school uniforms, alterations',
    icon: 'cut',
    maxDistanceKm: 5,
    color: '#7C3AED',
  },
  {
    id: 'welder',
    name: 'Welder & Fabricator',
    description: 'Gate welding, window grills, iron furniture, metal fabrication',
    icon: 'fire',
    maxDistanceKm: 5,
    color: '#DC2626',
  },
  {
    id: 'barber',
    name: 'Barber (Home Visit)',
    description: 'Haircut, shave, and grooming at home — for men, elders, children',
    icon: 'user-slash',
    maxDistanceKm: 5,
    color: '#64748B',
  },
  {
    id: 'atta-chakki',
    name: 'Atta Chakki & Grinding',
    description: 'Grain grinding, flour milling, dal processing — home visit or chakki service',
    icon: 'cog',
    maxDistanceKm: 5,
    color: '#92400E',
  },
  {
    id: 'footwear-repair',
    name: 'Footwear Repair (Mochi)',
    description: 'Shoe and chappals repair, cobbler services — home visit or local mochi',
    icon: 'shoe-prints',
    maxDistanceKm: 5,
    color: '#78350F',
  },
  {
    id: 'motor-pump-repair',
    name: 'Motor & Pump Repair',
    description: 'Bore motor rewinding, submersible pump repair, diesel engine, water pump service',
    icon: 'cog',
    maxDistanceKm: 10,
    color: '#374151',
  },
  {
    id: 'inverter-battery',
    name: 'Inverter & Battery Service',
    description: 'Inverter battery water refill, battery replacement, UPS repair, inverter wiring',
    icon: 'battery-full',
    maxDistanceKm: 10,
    color: '#15803D',
  },
  {
    id: 'home-tutor',
    name: 'Home Tutor',
    description: 'Tuition for Class 1-12, board exam prep, subject specialists at home',
    icon: 'graduation-cap',
    maxDistanceKm: 10,
    color: '#2563EB',
  },
  {
    id: 'govt-exam-coaching',
    name: 'BPSC & Govt Exam Coaching',
    description: 'Home tutor for BPSC, SSC, Railway, Police exam preparation',
    icon: 'book-open',
    maxDistanceKm: 10,
    color: '#1D4ED8',
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    description: 'Parlour at home — threading, waxing, facial, hair — ladies only',
    icon: 'spa',
    maxDistanceKm: 10,
    color: '#F472B6',
  },
  {
    id: 'elder-baby-care',
    name: 'Elder & Baby Care',
    description: 'Attendant for elderly, babysitter, baby malish, child caretaker',
    icon: 'baby',
    maxDistanceKm: 10,
    color: '#DB2777',
  },
  {
    id: 'tiffin-service',
    name: 'Tiffin Service',
    description: 'Monthly tiffin subscription — home-cooked meals for students, bachelors, office workers',
    icon: 'utensils',
    maxDistanceKm: 10,
    color: '#EA580C',
  },
  {
    id: 'phone-computer-repair',
    name: 'Phone & Computer Repair',
    description: 'Mobile screen, battery, laptop repair, printer and photocopier servicing',
    icon: 'mobile-alt',
    maxDistanceKm: 10,
    color: '#0891B2',
  },
  {
    id: 'water-tank-cleaning',
    name: 'Water Tank Cleaning',
    description: 'Overhead and underground water tank cleaning and disinfection',
    icon: 'water',
    maxDistanceKm: 10,
    color: '#0284C7',
  },
  {
    id: 'medicine-delivery',
    name: 'Medicine & Essentials Delivery',
    description: 'Home delivery of medicines, medical supplies, and daily essentials',
    icon: 'pills',
    maxDistanceKm: 10,
    color: '#16A34A',
  },
  {
    id: 'yoga-fitness',
    name: 'Yoga & Fitness Trainer',
    description: 'Home-visit yoga instructor, morning fitness trainer, weight loss coach',
    icon: 'running',
    maxDistanceKm: 10,
    color: '#0D9488',
  },
  {
    id: 'music-arts-teacher',
    name: 'Music & Arts Teacher',
    description: 'Harmonium, tabla, singing, drawing for children — home-visit teachers',
    icon: 'music',
    maxDistanceKm: 10,
    color: '#7C3AED',
  },

  // ─── NEARBY (≤20 km) ─ village-range specialist services ──────────────────

  {
    id: 'farming-agriculture',
    name: 'Farming & Agriculture',
    description: 'Tractor ploughing, rotavator, farm labor, crop transport to mandi',
    icon: 'seedling',
    maxDistanceKm: 20,
    color: '#16A34A',
  },
  {
    id: 'harvesting-threshing',
    name: 'Harvesting & Threshing',
    description: 'Combine harvester, paddy/wheat threshing machine, seasonal harvest labor',
    icon: 'tractor',
    maxDistanceKm: 20,
    color: '#65A30D',
  },
  {
    id: 'pesticide-spraying',
    name: 'Pesticide & Crop Spraying',
    description: 'Pesticide, fertilizer, herbicide spraying on fields — manual or machine',
    icon: 'spray-can',
    maxDistanceKm: 20,
    color: '#4D7C0F',
  },
  {
    id: 'irrigation-services',
    name: 'Irrigation Services',
    description: 'Drip irrigation setup, pipe laying, pump connection, channel digging',
    icon: 'water',
    maxDistanceKm: 20,
    color: '#0369A1',
  },
  {
    id: 'veterinary',
    name: 'Veterinary (Pashu Doctor)',
    description: 'On-call vet for cattle, buffalo, goat, poultry — vaccinations, illness treatment',
    icon: 'paw',
    maxDistanceKm: 20,
    color: '#B45309',
  },
  {
    id: 'livestock-services',
    name: 'Livestock Services',
    description: 'Artificial insemination, fodder supply, dairy equipment repair, cattle shed work',
    icon: 'horse',
    maxDistanceKm: 20,
    color: '#92400E',
  },
  {
    id: 'water-tanker',
    name: 'Water Tanker Supply',
    description: 'Water tanker delivery for home, farm, or construction site',
    icon: 'truck',
    maxDistanceKm: 20,
    color: '#0284C7',
  },
  {
    id: 'well-pond-services',
    name: 'Well & Pond Services',
    description: 'Well cleaning, desilting, farm pond digging, rainwater harvesting setup',
    icon: 'tint',
    maxDistanceKm: 20,
    color: '#0369A1',
  },
  {
    id: 'rural-house-repair',
    name: 'Rural & Kachcha House Repair',
    description: 'Mud house repair, thatched roof fixing, asbestos/tin sheet roofing, boundary wall',
    icon: 'home',
    maxDistanceKm: 20,
    color: '#92400E',
  },
  {
    id: 'septic-drain-cleaning',
    name: 'Septic Tank & Drain Cleaning',
    description: 'Septic tank pumping, sewer drain cleaning, nali safai — home and commercial',
    icon: 'trash',
    maxDistanceKm: 15,
    color: '#4B5563',
  },
  {
    id: 'daily-labor',
    name: 'Daily Labor (Mazdoor)',
    description: 'General daily wage labor — construction help, digging, loading/unloading, event setup',
    icon: 'users',
    maxDistanceKm: 15,
    color: '#6B7280',
  },
  {
    id: 'local-transport',
    name: 'Local Transport',
    description: 'Auto/e-rickshaw/jeep booking for local travel, school transport, station pickup/drop',
    icon: 'shuttle-van',
    maxDistanceKm: 15,
    color: '#0F766E',
  },
  {
    id: 'govt-document-help',
    name: 'Government & Document Help',
    description: 'Aadhaar, ration card, caste/income certificate, PMAY, land records, pension, loan forms',
    icon: 'file-alt',
    maxDistanceKm: 15,
    color: '#1D4ED8',
  },

  // ─── CITY-WIDE (≤30 km) ────────────────────────────────────────────────────

  {
    id: 'house-painting',
    name: 'House Painting',
    description: 'Interior and exterior painting, wall putty, texture finish',
    icon: 'paint-brush',
    maxDistanceKm: 30,
    color: '#EC4899',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Cockroach, termite, mosquito, rat, and bedbug treatment',
    icon: 'bug',
    maxDistanceKm: 30,
    color: '#EF4444',
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning',
    description: 'Full home deep cleaning, bathroom scrubbing, kitchen degreasing',
    icon: 'spray-can',
    maxDistanceKm: 30,
    color: '#10B981',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Furniture making and repair, door/window fitting, woodwork',
    icon: 'hammer',
    maxDistanceKm: 30,
    color: '#92400E',
  },
  {
    id: 'mason',
    name: 'Mason & Construction',
    description: 'Raj mistri for wall repair, flooring, tiling, new construction work',
    icon: 'hard-hat',
    maxDistanceKm: 30,
    color: '#6B7280',
  },
  {
    id: 'toilet-construction',
    name: 'Toilet & Sanitation Construction',
    description: 'Toilet building (Swachh Bharat scheme), septic tank construction, soak pit digging',
    icon: 'hard-hat',
    maxDistanceKm: 30,
    color: '#4B5563',
  },
  {
    id: 'ac-repair',
    name: 'AC & Cooler Repair',
    description: 'AC installation, servicing, gas refill, desert cooler repair',
    icon: 'snowflake',
    maxDistanceKm: 30,
    color: '#06B6D4',
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing',
    description: 'Seepage repair, roof waterproofing, bathroom leakage fixing',
    icon: 'shield-alt',
    maxDistanceKm: 30,
    color: '#1D4ED8',
  },
  {
    id: 'pop-false-ceiling',
    name: 'POP & False Ceiling',
    description: 'POP work, gypsum false ceiling, cornices, decorative wall moulding',
    icon: 'layer-group',
    maxDistanceKm: 30,
    color: '#A78BFA',
  },
  {
    id: 'solar-installation',
    name: 'Solar Installation',
    description: 'Solar home lighting, solar pump setup, panel installation, battery bank',
    icon: 'sun',
    maxDistanceKm: 30,
    color: '#CA8A04',
  },
  {
    id: 'garden-lawn',
    name: 'Garden & Lawn Care',
    description: 'Kitchen garden setup, lawn mowing, tree trimming, plant care',
    icon: 'leaf',
    maxDistanceKm: 30,
    color: '#059669',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    description: 'Roof sheet installation, repair, insulation, and maintenance',
    icon: 'home',
    maxDistanceKm: 30,
    color: '#94A3B8',
  },
  {
    id: 'moving',
    name: 'Moving & Packing',
    description: 'House shifting, goods packing, loading and unloading help',
    icon: 'truck',
    maxDistanceKm: 30,
    color: '#F97316',
  },
  {
    id: 'goods-transport',
    name: 'Goods Transport',
    description: 'Tractor trolley, mini truck (Tata Ace), tempo for goods shifting and mandi transport',
    icon: 'truck',
    maxDistanceKm: 30,
    color: '#B45309',
  },
  {
    id: 'driving',
    name: 'Driver Services',
    description: 'Driver for the day, outstation trips, airport drop, monthly driver',
    icon: 'car',
    maxDistanceKm: 30,
    color: '#475569',
  },
  {
    id: 'ambulance',
    name: 'Ambulance & Emergency Transport',
    description: 'Private ambulance for hospital transport, wheelchair vehicle, emergency night transport',
    icon: 'ambulance',
    maxDistanceKm: 30,
    color: '#EF4444',
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Wedding, event, portrait, and product photography',
    icon: 'camera',
    maxDistanceKm: 30,
    color: '#6366F1',
  },
  {
    id: 'videography',
    name: 'Videography',
    description: 'Wedding video, event coverage, reels, short film production',
    icon: 'video',
    maxDistanceKm: 30,
    color: '#4F46E5',
  },
  {
    id: 'mehndi-makeup',
    name: 'Mehndi & Bridal Makeup',
    description: 'Bridal makeup, party makeup, mehndi designs for weddings and events',
    icon: 'magic',
    maxDistanceKm: 30,
    color: '#E11D48',
  },
  {
    id: 'pandit-rituals',
    name: 'Pandit & Rituals',
    description: 'Puja, vivah, grih pravesh, shraddh, satyanarayan katha, Chhath puja',
    icon: 'sun',
    maxDistanceKm: 30,
    color: '#D97706',
  },
  {
    id: 'funeral-last-rites',
    name: 'Funeral & Last Rites',
    description: 'Antim sanskar arrangements — wood, helpers, pandit, transport, cremation coordination',
    icon: 'leaf',
    maxDistanceKm: 30,
    color: '#334155',
  },
  {
    id: 'event-catering',
    name: 'Event Catering',
    description: 'Cook + team for weddings, functions, namkaran — Maithil cuisine speciality',
    icon: 'concierge-bell',
    maxDistanceKm: 30,
    color: '#B45309',
  },
  {
    id: 'sound-lighting',
    name: 'Sound & Lighting',
    description: 'DJ, sound system, LED lighting and decoration for events and baraats',
    icon: 'music',
    maxDistanceKm: 30,
    color: '#EAB308',
  },
  {
    id: 'tent-event-setup',
    name: 'Tent & Event Setup',
    description: 'Shamiyana, pandal, chair-table, stage setup for weddings and functions',
    icon: 'archway',
    maxDistanceKm: 30,
    color: '#16A34A',
  },
  {
    id: 'generator-rental',
    name: 'Generator & Equipment Rental',
    description: 'Generator on rent, water pump, drilling machine, scaffolding rental',
    icon: 'plug',
    maxDistanceKm: 30,
    color: '#4B5563',
  },
  {
    id: 'cctv-inverter',
    name: 'CCTV & Security Setup',
    description: 'CCTV camera installation, inverter/battery fitting, DTH setup',
    icon: 'eye',
    maxDistanceKm: 30,
    color: '#1E293B',
  },
  {
    id: 'home-nursing',
    name: 'Home Nurse & Medical',
    description: 'Trained nurse for home care, IV drip, wound dressing, blood sample pickup',
    icon: 'heartbeat',
    maxDistanceKm: 30,
    color: '#EF4444',
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy',
    description: 'Home-visit physiotherapist for injury recovery, back pain, elder care',
    icon: 'user-md',
    maxDistanceKm: 30,
    color: '#0D9488',
  },
  {
    id: 'madhubani-art',
    name: 'Madhubani Art & Craft',
    description: 'Mithila wall painting, canvas, fabric art — authentic local artists',
    icon: 'palette',
    maxDistanceKm: 30,
    color: '#9333EA',
  },
  {
    id: 'property-caretaker',
    name: 'Property Caretaker',
    description: 'Caretaker for ancestral/vacant property — for NRI and migrant families',
    icon: 'shield-alt',
    maxDistanceKm: 30,
    color: '#475569',
  },
  {
    id: 'security-guard',
    name: 'Security Guard',
    description: 'Security guard for weddings, events, shops, property — daily or monthly',
    icon: 'user-shield',
    maxDistanceKm: 30,
    color: '#1E3A5F',
  },
  {
    id: 'matchmaking',
    name: 'Matchmaking',
    description: 'Traditional matrimonial services — local matchmaker for arranged marriage proposals',
    icon: 'heart',
    maxDistanceKm: 30,
    color: '#E11D48',
  },

  // ─── ONLINE / REMOTE (unlimited) ──────────────────────────────────────────

  {
    id: 'online-tutoring',
    name: 'Online Tutoring',
    description: 'Online academic tutoring via video call — any subject, any board',
    icon: 'laptop',
    maxDistanceKm: null,
    color: '#06B6D4',
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Website design and development services',
    icon: 'code',
    maxDistanceKm: null,
    color: '#3B82F6',
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    description: 'iOS and Android app development',
    icon: 'mobile',
    maxDistanceKm: null,
    color: '#8B5CF6',
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    description: 'Logo, banner, social media and visual design',
    icon: 'pen-nib',
    maxDistanceKm: null,
    color: '#EC4899',
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    description: 'Blog posts, articles, copywriting in Hindi and English',
    icon: 'pencil-alt',
    maxDistanceKm: null,
    color: '#10B981',
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    description: 'Social media management, SEO, and online advertising',
    icon: 'chart-line',
    maxDistanceKm: null,
    color: '#F59E0B',
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    description: 'Wedding video editing, reels, YouTube content production',
    icon: 'film',
    maxDistanceKm: null,
    color: '#EF4444',
  },
  {
    id: 'consulting',
    name: 'Business Consulting',
    description: 'Strategy, GST, business registration, and planning advice',
    icon: 'lightbulb',
    maxDistanceKm: null,
    color: '#F97316',
  },

  // ─── CATCH-ALL ─────────────────────────────────────────────────────────────
  {
    id: 'other',
    name: 'Other',
    description: 'Any service not listed above — post your custom request',
    icon: 'ellipsis-h',
    maxDistanceKm: 30,
    color: '#94A3B8',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getCategoryById = (id: string): ServiceCategory | undefined =>
  SERVICE_CATEGORIES.find(cat => cat.id === id);

export const getCategoryName = (id: string): string =>
  getCategoryById(id)?.name || 'Unknown Category';

export const getCategoriesByDistanceType = (
  type: 'local' | 'nearby' | 'city' | 'online'
): ServiceCategory[] => {
  switch (type) {
    case 'local':
      return SERVICE_CATEGORIES.filter(
        cat => cat.maxDistanceKm !== null && cat.maxDistanceKm <= 10
      );
    case 'nearby':
      return SERVICE_CATEGORIES.filter(
        cat => cat.maxDistanceKm !== null && cat.maxDistanceKm > 10 && cat.maxDistanceKm <= 20
      );
    case 'city':
      return SERVICE_CATEGORIES.filter(
        cat => cat.maxDistanceKm !== null && cat.maxDistanceKm > 20
      );
    case 'online':
      return SERVICE_CATEGORIES.filter(cat => cat.maxDistanceKm === null);
    default:
      return SERVICE_CATEGORIES;
  }
};

export const CATEGORY_GROUPS = {
  local: {
    title: 'Near You (Within 10 KM)',
    categories: getCategoriesByDistanceType('local'),
  },
  nearby: {
    title: 'Village & Town Services (Within 20 KM)',
    categories: getCategoriesByDistanceType('nearby'),
  },
  city: {
    title: 'City-Wide Services (Within 30 KM)',
    categories: getCategoriesByDistanceType('city'),
  },
  online: {
    title: 'Online Services (Anywhere)',
    categories: getCategoriesByDistanceType('online'),
  },
};
