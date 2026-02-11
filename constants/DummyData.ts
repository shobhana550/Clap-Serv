import { SERVICE_CATEGORIES } from './ServiceCategories';

export interface DummyBuyer {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
}

export interface DummyServiceRequest {
  id: string;
  title: string;
  description: string;
  category_id: string;
  budget_min: number;
  budget_max: number;
  location: string;
  created_at: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  timeline: string;
  buyer: DummyBuyer;
  proposal_count: number;
}

export interface DummyProvider {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
}

export interface DummyProposal {
  id: string;
  request_id: string;
  provider: DummyProvider;
  price: number;
  timeline: string;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const DUMMY_SERVICE_REQUESTS: DummyServiceRequest[] = [
  {
    id: 'req-001',
    title: 'Need a Professional Plumber for Bathroom Renovation',
    description: 'Looking for an experienced plumber to help with a complete bathroom renovation. The job includes installing a new bathtub, shower fixtures, toilet, and sink. Must have experience with modern plumbing systems and be able to work with existing pipes.',
    category_id: 'home-services',
    budget_min: 800,
    budget_max: 1500,
    location: 'San Francisco, CA',
    created_at: '2026-01-25T10:30:00Z',
    status: 'open',
    deadline: '2026-02-15',
    timeline: '2-3 weeks',
    buyer: {
      id: 'buyer-001',
      name: 'Sarah Johnson',
      rating: 4.8,
      reviewCount: 12
    },
    proposal_count: 5
  },
  {
    id: 'req-002',
    title: 'Logo Design for Tech Startup',
    description: 'We are a new AI-focused startup looking for a talented graphic designer to create our brand logo. We want something modern, clean, and memorable. The logo should work well in both color and monochrome. Please include 3-5 initial concepts and unlimited revisions.',
    category_id: 'creative-services',
    budget_min: 300,
    budget_max: 600,
    location: 'Remote',
    created_at: '2026-01-26T14:20:00Z',
    status: 'open',
    deadline: '2026-02-10',
    timeline: '1-2 weeks',
    buyer: {
      id: 'buyer-002',
      name: 'Michael Chen',
      rating: 5.0,
      reviewCount: 8
    },
    proposal_count: 12
  },
  {
    id: 'req-003',
    title: 'Website Development for Small Business',
    description: 'Need a professional website for my consulting business. Looking for a 5-7 page responsive website with contact form, blog section, and service pages. Must be SEO optimized and mobile-friendly. Prefer WordPress or similar CMS for easy updates.',
    category_id: 'web-development',
    budget_min: 2000,
    budget_max: 4000,
    location: 'Austin, TX',
    created_at: '2026-01-24T09:15:00Z',
    status: 'in_progress',
    deadline: '2026-03-01',
    timeline: '4-6 weeks',
    buyer: {
      id: 'buyer-003',
      name: 'Jennifer Martinez',
      rating: 4.6,
      reviewCount: 15
    },
    proposal_count: 8
  },
  {
    id: 'req-004',
    title: 'Tax Preparation Services for Small Business',
    description: 'Looking for a certified accountant to help with business tax preparation for the 2025 tax year. We are an LLC with around $250K in revenue. Need help with deductions, estimated taxes, and filing. Must be familiar with California state taxes.',
    category_id: 'professional-services',
    budget_min: 500,
    budget_max: 1000,
    location: 'Los Angeles, CA',
    created_at: '2026-01-23T11:45:00Z',
    status: 'open',
    deadline: '2026-04-10',
    timeline: '2-3 weeks',
    buyer: {
      id: 'buyer-004',
      name: 'David Thompson',
      rating: 4.9,
      reviewCount: 20
    },
    proposal_count: 6
  },
  {
    id: 'req-005',
    title: 'Personal Trainer for Weight Loss Program',
    description: 'Seeking a certified personal trainer to help me lose 30 pounds over the next 3 months. Looking for someone who can create a customized workout plan and provide nutritional guidance. Prefer in-person sessions 3x per week in the morning.',
    category_id: 'health-wellness',
    budget_min: 600,
    budget_max: 1200,
    location: 'Seattle, WA',
    created_at: '2026-01-27T07:00:00Z',
    status: 'open',
    deadline: '2026-02-05',
    timeline: '3 months',
    buyer: {
      id: 'buyer-005',
      name: 'Emily Rodriguez',
      rating: 4.7,
      reviewCount: 5
    },
    proposal_count: 3
  },
  {
    id: 'req-006',
    title: 'Content Writing for Blog Posts',
    description: 'Need a skilled content writer to create 8 blog posts per month for our marketing agency website. Topics will be related to digital marketing, SEO, and social media. Each post should be 1000-1500 words, SEO optimized, and engaging. Looking for a long-term partnership.',
    category_id: 'writing-translation',
    budget_min: 400,
    budget_max: 800,
    location: 'Remote',
    created_at: '2026-01-26T16:30:00Z',
    status: 'open',
    deadline: '2026-02-01',
    timeline: 'Ongoing monthly',
    buyer: {
      id: 'buyer-006',
      name: 'Robert Williams',
      rating: 4.8,
      reviewCount: 25
    },
    proposal_count: 15
  },
  {
    id: 'req-007',
    title: 'House Cleaning Service - Weekly',
    description: 'Looking for a reliable cleaning service to clean my 3-bedroom house every week. Need deep cleaning of all rooms, bathrooms, kitchen, and floors. Should bring own supplies. Must be trustworthy and detail-oriented.',
    category_id: 'home-services',
    budget_min: 100,
    budget_max: 150,
    location: 'Denver, CO',
    created_at: '2026-01-25T13:20:00Z',
    status: 'open',
    timeline: 'Weekly ongoing',
    buyer: {
      id: 'buyer-007',
      name: 'Amanda Garcia',
      rating: 4.5,
      reviewCount: 10
    },
    proposal_count: 7
  },
  {
    id: 'req-008',
    title: 'Mobile App Development - Fitness Tracking',
    description: 'Need an experienced mobile app developer to create a fitness tracking app for both iOS and Android. The app should track workouts, calories, and progress. Need clean UI/UX, integration with health APIs, and user authentication. React Native preferred.',
    category_id: 'mobile-development',
    budget_min: 8000,
    budget_max: 15000,
    location: 'Remote',
    created_at: '2026-01-22T10:00:00Z',
    status: 'in_progress',
    deadline: '2026-06-01',
    timeline: '3-4 months',
    buyer: {
      id: 'buyer-008',
      name: 'James Anderson',
      rating: 5.0,
      reviewCount: 18
    },
    proposal_count: 20
  },
  {
    id: 'req-009',
    title: 'Social Media Management for Restaurant',
    description: 'Looking for a social media manager to handle our restaurant Instagram and Facebook accounts. Need 4-5 posts per week, engagement with followers, and monthly analytics reports. Must have experience in the food industry and be creative with content.',
    category_id: 'digital-marketing',
    budget_min: 500,
    budget_max: 900,
    location: 'Miami, FL',
    created_at: '2026-01-26T12:00:00Z',
    status: 'open',
    deadline: '2026-02-08',
    timeline: 'Monthly ongoing',
    buyer: {
      id: 'buyer-009',
      name: 'Lisa Brown',
      rating: 4.6,
      reviewCount: 9
    },
    proposal_count: 11
  },
  {
    id: 'req-010',
    title: 'Video Editing for YouTube Channel',
    description: 'Need a video editor for my tech review YouTube channel. Looking for someone to edit 2-3 videos per week (10-15 minutes each). Must add intros, outros, transitions, color correction, and sound mixing. Experience with tech content preferred.',
    category_id: 'video-animation',
    budget_min: 200,
    budget_max: 400,
    location: 'Remote',
    created_at: '2026-01-27T09:30:00Z',
    status: 'open',
    timeline: 'Weekly ongoing',
    buyer: {
      id: 'buyer-010',
      name: 'Chris Taylor',
      rating: 4.9,
      reviewCount: 14
    },
    proposal_count: 9
  },
  {
    id: 'req-011',
    title: 'Legal Consultation for Contract Review',
    description: 'Need a business attorney to review and advise on several vendor contracts for our company. Looking for someone with experience in SaaS and technology contracts. Should be able to identify potential issues and suggest modifications.',
    category_id: 'professional-services',
    budget_min: 300,
    budget_max: 600,
    location: 'Boston, MA',
    created_at: '2026-01-25T15:45:00Z',
    status: 'completed',
    deadline: '2026-01-30',
    timeline: '1 week',
    buyer: {
      id: 'buyer-011',
      name: 'Patricia Moore',
      rating: 5.0,
      reviewCount: 22
    },
    proposal_count: 4
  },
  {
    id: 'req-012',
    title: 'Electrical Work for Home Office Setup',
    description: 'Need a licensed electrician to install additional outlets and lighting for my new home office. The job includes running new circuits, installing 4 outlets, 2 ceiling lights, and ensuring everything is up to code. Must be available this week.',
    category_id: 'home-services',
    budget_min: 400,
    budget_max: 700,
    location: 'Portland, OR',
    created_at: '2026-01-26T08:15:00Z',
    status: 'open',
    deadline: '2026-02-03',
    timeline: '1-2 days',
    buyer: {
      id: 'buyer-012',
      name: 'Kevin White',
      rating: 4.7,
      reviewCount: 7
    },
    proposal_count: 8
  },
  {
    id: 'req-013',
    title: 'Spanish Translation for Website Content',
    description: 'Need a professional translator to translate our company website from English to Spanish. The content includes about 20 pages covering services, about us, blog posts, and product descriptions. Must be a native Spanish speaker with marketing translation experience.',
    category_id: 'writing-translation',
    budget_min: 600,
    budget_max: 1000,
    location: 'Remote',
    created_at: '2026-01-24T14:30:00Z',
    status: 'open',
    deadline: '2026-02-20',
    timeline: '2-3 weeks',
    buyer: {
      id: 'buyer-013',
      name: 'Maria Gonzalez',
      rating: 4.8,
      reviewCount: 16
    },
    proposal_count: 10
  },
  {
    id: 'req-014',
    title: 'SEO Optimization for E-commerce Website',
    description: 'Looking for an SEO expert to optimize our online store for search engines. Need keyword research, on-page optimization, meta tags, and content recommendations. Our site is built on Shopify with about 100 products. Goal is to increase organic traffic by 50%.',
    category_id: 'digital-marketing',
    budget_min: 1000,
    budget_max: 2000,
    location: 'Remote',
    created_at: '2026-01-23T11:00:00Z',
    status: 'in_progress',
    deadline: '2026-03-15',
    timeline: '6-8 weeks',
    buyer: {
      id: 'buyer-014',
      name: 'Steven Lee',
      rating: 4.6,
      reviewCount: 11
    },
    proposal_count: 13
  },
  {
    id: 'req-015',
    title: 'Pet Sitting for Two Weeks',
    description: 'Need a reliable pet sitter to take care of my golden retriever while I am on vacation. Looking for someone who can stay at my house, walk the dog twice daily, and provide lots of love and attention. Must have experience with large dogs.',
    category_id: 'other',
    budget_min: 400,
    budget_max: 600,
    location: 'Chicago, IL',
    created_at: '2026-01-27T06:00:00Z',
    status: 'open',
    deadline: '2026-02-12',
    timeline: '2 weeks',
    buyer: {
      id: 'buyer-015',
      name: 'Rachel Kim',
      rating: 5.0,
      reviewCount: 6
    },
    proposal_count: 4
  }
];

export const DUMMY_PROPOSALS: DummyProposal[] = [
  {
    id: 'prop-001',
    request_id: 'req-001',
    provider: {
      id: 'provider-001',
      name: 'John Smith Plumbing',
      rating: 4.9,
      reviewCount: 45,
      completedJobs: 87
    },
    price: 1200,
    timeline: '2 weeks',
    cover_letter: 'Hello! I have over 10 years of experience in residential plumbing and have completed numerous bathroom renovations similar to yours. I am licensed, insured, and can provide references from recent clients. I would love to discuss your project in detail and provide a detailed estimate.',
    status: 'pending',
    created_at: '2026-01-25T11:30:00Z'
  },
  {
    id: 'prop-002',
    request_id: 'req-002',
    provider: {
      id: 'provider-002',
      name: 'Creative Designs Studio',
      rating: 5.0,
      reviewCount: 68,
      completedJobs: 120
    },
    price: 450,
    timeline: '10 days',
    cover_letter: 'Hi Michael! I specialize in tech startup branding and have created logos for over 50 companies in the AI and software space. I will provide you with 5 unique concepts and work with you through unlimited revisions until you are 100% satisfied. Check out my portfolio for examples of my work!',
    status: 'accepted',
    created_at: '2026-01-26T15:00:00Z'
  },
  {
    id: 'prop-003',
    request_id: 'req-003',
    provider: {
      id: 'provider-003',
      name: 'WebDev Pro',
      rating: 4.8,
      reviewCount: 52,
      completedJobs: 95
    },
    price: 3200,
    timeline: '5 weeks',
    cover_letter: 'I am a full-stack developer with 8 years of experience building business websites. I can create a beautiful, responsive WordPress site for your consulting business with all the features you need. I will also train you on how to manage the content yourself.',
    status: 'pending',
    created_at: '2026-01-24T10:00:00Z'
  },
  {
    id: 'prop-004',
    request_id: 'req-004',
    provider: {
      id: 'provider-004',
      name: 'TaxPro Services',
      rating: 5.0,
      reviewCount: 91,
      completedJobs: 156
    },
    price: 750,
    timeline: '2 weeks',
    cover_letter: 'As a CPA with 15 years of experience, I specialize in small business taxes in California. I have helped hundreds of LLCs with their tax preparation and can ensure you maximize your deductions while staying compliant with all regulations.',
    status: 'pending',
    created_at: '2026-01-23T13:00:00Z'
  },
  {
    id: 'prop-005',
    request_id: 'req-005',
    provider: {
      id: 'provider-005',
      name: 'FitLife Personal Training',
      rating: 4.9,
      reviewCount: 38,
      completedJobs: 72
    },
    price: 900,
    timeline: '3 months',
    cover_letter: 'Hi Emily! I am a certified personal trainer with a specialty in weight loss transformation. I have helped over 50 clients achieve their weight loss goals through personalized workout plans and nutrition coaching. I would love to help you reach your goal of losing 30 pounds!',
    status: 'accepted',
    created_at: '2026-01-27T08:00:00Z'
  },
  {
    id: 'prop-006',
    request_id: 'req-006',
    provider: {
      id: 'provider-006',
      name: 'ContentWriter Plus',
      rating: 4.7,
      reviewCount: 55,
      completedJobs: 102
    },
    price: 640,
    timeline: 'Monthly ongoing',
    cover_letter: 'I am a professional content writer with extensive experience in digital marketing topics. I have written hundreds of blog posts for marketing agencies and understand SEO best practices. I can deliver 8 high-quality, engaging posts per month on schedule.',
    status: 'pending',
    created_at: '2026-01-26T17:00:00Z'
  },
  {
    id: 'prop-007',
    request_id: 'req-010',
    provider: {
      id: 'provider-007',
      name: 'VideoEdit Masters',
      rating: 5.0,
      reviewCount: 43,
      completedJobs: 88
    },
    price: 300,
    timeline: 'Weekly ongoing',
    cover_letter: 'I have been editing tech YouTube videos for over 5 years and have worked with several popular tech channels. I can deliver professionally edited videos with dynamic transitions, color grading, and sound mixing that will keep your viewers engaged.',
    status: 'rejected',
    created_at: '2026-01-27T10:00:00Z'
  },
  {
    id: 'prop-008',
    request_id: 'req-009',
    provider: {
      id: 'provider-008',
      name: 'Social Buzz Agency',
      rating: 4.8,
      reviewCount: 62,
      completedJobs: 115
    },
    price: 700,
    timeline: 'Monthly ongoing',
    cover_letter: 'We specialize in restaurant social media management and have helped dozens of local restaurants grow their Instagram following by 200%+. We create beautiful food photography, engaging captions, and build real community engagement.',
    status: 'pending',
    created_at: '2026-01-26T13:30:00Z'
  }
];

// Helper function to get request by ID
export const getRequestById = (id: string): DummyServiceRequest | undefined => {
  return DUMMY_SERVICE_REQUESTS.find(req => req.id === id);
};

// Helper function to get proposals for a request
export const getProposalsForRequest = (requestId: string): DummyProposal[] => {
  return DUMMY_PROPOSALS.filter(prop => prop.request_id === requestId);
};

// Helper function to get time ago string
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};
