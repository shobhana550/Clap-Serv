/**
 * Service Categories for Clap-Serv
 * Each category has a maximum distance in kilometers
 * null means online/unlimited range
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from @expo/vector-icons
  maxDistanceKm: number | null; // null for online services
  color: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // Local services (short range)
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Plumbing repairs, installations, and maintenance',
    icon: 'wrench',
    maxDistanceKm: 5,
    color: '#3B82F6',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical repairs, wiring, and installations',
    icon: 'bolt',
    maxDistanceKm: 5,
    color: '#F59E0B',
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    description: 'Repair and maintenance of home appliances',
    icon: 'tools',
    maxDistanceKm: 5,
    color: '#8B5CF6',
  },

  // City-wide services (medium range)
  {
    id: 'house-painting',
    name: 'House Painting',
    description: 'Interior and exterior painting services',
    icon: 'paint-brush',
    maxDistanceKm: 30,
    color: '#EC4899',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Pest removal and prevention services',
    icon: 'bug',
    maxDistanceKm: 30,
    color: '#EF4444',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'House cleaning and deep cleaning services',
    icon: 'broom',
    maxDistanceKm: 30,
    color: '#10B981',
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    description: 'Garden design, maintenance, and lawn care',
    icon: 'leaf',
    maxDistanceKm: 30,
    color: '#059669',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Furniture making, repairs, and woodwork',
    icon: 'hammer',
    maxDistanceKm: 30,
    color: '#92400E',
  },
  {
    id: 'hvac',
    name: 'HVAC Services',
    description: 'Heating, ventilation, and air conditioning',
    icon: 'snowflake',
    maxDistanceKm: 30,
    color: '#06B6D4',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    description: 'Roof repairs, installations, and maintenance',
    icon: 'home',
    maxDistanceKm: 30,
    color: '#B3B8C4',
  },
  {
    id: 'moving',
    name: 'Moving & Packing',
    description: 'Relocation, packing, and moving services',
    icon: 'truck',
    maxDistanceKm: 30,
    color: '#F97316',
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Event, portrait, and commercial photography',
    icon: 'camera',
    maxDistanceKm: 30,
    color: '#6366F1',
  },

  // Online services (unlimited range)
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
    description: 'Logo, branding, and visual design services',
    icon: 'palette',
    maxDistanceKm: null,
    color: '#EC4899',
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    description: 'Blog posts, articles, and copywriting',
    icon: 'pencil',
    maxDistanceKm: null,
    color: '#10B981',
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    description: 'SEO, social media, and online advertising',
    icon: 'trending-up',
    maxDistanceKm: null,
    color: '#F59E0B',
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    description: 'Video production and post-production',
    icon: 'film',
    maxDistanceKm: null,
    color: '#EF4444',
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant',
    description: 'Administrative and business support services',
    icon: 'briefcase',
    maxDistanceKm: null,
    color: '#6366F1',
  },
  {
    id: 'consulting',
    name: 'Business Consulting',
    description: 'Strategy, planning, and business advice',
    icon: 'lightbulb',
    maxDistanceKm: null,
    color: '#F97316',
  },
  {
    id: 'tutoring',
    name: 'Online Tutoring',
    description: 'Academic tutoring and training services',
    icon: 'book',
    maxDistanceKm: null,
    color: '#06B6D4',
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Document and content translation services',
    icon: 'language',
    maxDistanceKm: null,
    color: '#8B5CF6',
  },
];

// Helper function to get category by ID
export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(cat => cat.id === id);
};

// Helper function to get category name by ID
export const getCategoryName = (id: string): string => {
  return getCategoryById(id)?.name || 'Unknown Category';
};

// Helper function to get categories by distance type
export const getCategoriesByDistanceType = (type: 'local' | 'city' | 'online'): ServiceCategory[] => {
  switch (type) {
    case 'local':
      return SERVICE_CATEGORIES.filter(cat => cat.maxDistanceKm !== null && cat.maxDistanceKm <= 5);
    case 'city':
      return SERVICE_CATEGORIES.filter(cat => cat.maxDistanceKm !== null && cat.maxDistanceKm > 5);
    case 'online':
      return SERVICE_CATEGORIES.filter(cat => cat.maxDistanceKm === null);
    default:
      return SERVICE_CATEGORIES;
  }
};

// Category groups for organization
export const CATEGORY_GROUPS = {
  local: {
    title: 'Local Services (Within 5 KM)',
    categories: getCategoriesByDistanceType('local'),
  },
  city: {
    title: 'City Services (Within 30 KM)',
    categories: getCategoriesByDistanceType('city'),
  },
  online: {
    title: 'Online Services (Anywhere)',
    categories: getCategoriesByDistanceType('online'),
  },
};
