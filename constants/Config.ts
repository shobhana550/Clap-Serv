/**
 * App-wide configuration constants for Clap-Serv
 */

export const Config = {
  // App information
  app: {
    name: 'Clap-Serv',
    version: '1.0.0',
    description: 'Service marketplace connecting buyers and providers',
  },

  // API and Backend
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Supabase will be configured via environment variables
  // See .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

  // User roles
  userRoles: {
    BUYER: 'buyer',
    PROVIDER: 'provider',
    BOTH: 'both',
  } as const,

  // Service request statuses
  requestStatus: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const,

  // Proposal statuses
  proposalStatus: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
  } as const,

  // Project statuses
  projectStatus: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const,

  // File upload
  fileUpload: {
    maxSizeInMB: 10,
    maxSizeInBytes: 10 * 1024 * 1024, // 10 MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxImagesPerRequest: 5,
    maxDocumentsPerRequest: 3,
  },

  // Location and distance
  location: {
    defaultRadius: 30, // km
    localServiceRadius: 2, // km
    cityServiceRadius: 30, // km
    locationAccuracy: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    },
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Budget ranges (for filtering)
  budgetRanges: [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500 - $1,000', min: 500, max: 1000 },
    { label: '$1,000 - $5,000', min: 1000, max: 5000 },
    { label: '$5,000+', min: 5000, max: null },
  ],

  // Notifications
  notifications: {
    enabled: true,
    types: {
      NEW_PROPOSAL: 'new_proposal',
      PROPOSAL_ACCEPTED: 'proposal_accepted',
      PROPOSAL_REJECTED: 'proposal_rejected',
      NEW_MESSAGE: 'new_message',
      PROJECT_UPDATE: 'project_update',
      NEW_OPPORTUNITY: 'new_opportunity',
    },
  },

  // Real-time features
  realtime: {
    messagePollingInterval: 5000, // 5 seconds fallback if realtime fails
    reconnectInterval: 3000, // 3 seconds
    maxReconnectAttempts: 5,
  },

  // UI/UX
  ui: {
    // Touch targets (minimum 44px for accessibility)
    minTouchTarget: 44,

    // Animation durations (ms)
    animationDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },

    // Debounce times (ms)
    debounce: {
      search: 300,
      input: 500,
    },

    // Toast/Snackbar durations (ms)
    toastDuration: {
      short: 2000,
      medium: 4000,
      long: 6000,
    },
  },

  // Storage keys for AsyncStorage
  storageKeys: {
    AUTH_TOKEN: '@clap_serv:auth_token',
    USER_DATA: '@clap_serv:user_data',
    ACTIVE_ROLE: '@clap_serv:active_role',
    ONBOARDING_COMPLETED: '@clap_serv:onboarding_completed',
    PUSH_TOKEN: '@clap_serv:push_token',
  },

  // External links
  links: {
    privacyPolicy: 'https://clapserv.com/privacy',
    termsOfService: 'https://clapserv.com/terms',
    support: 'https://clapserv.com/support',
    feedback: 'https://clapserv.com/feedback',
  },

  // Feature flags (for gradual rollout)
  features: {
    enablePushNotifications: true,
    enableVideoCall: false, // Not in MVP
    enablePaymentEscrow: false, // Not in MVP per PRD
    enableReviews: false, // Not in MVP
    enableAdvancedFilters: false, // Not in MVP
  },
};

// Type exports for better TypeScript support
export type UserRole = typeof Config.userRoles[keyof typeof Config.userRoles];
export type RequestStatus = typeof Config.requestStatus[keyof typeof Config.requestStatus];
export type ProposalStatus = typeof Config.proposalStatus[keyof typeof Config.proposalStatus];
export type ProjectStatus = typeof Config.projectStatus[keyof typeof Config.projectStatus];
export type NotificationType = typeof Config.notifications.types[keyof typeof Config.notifications.types];
