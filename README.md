# Clap-Serv

A cross-platform service marketplace app built with Expo, React Native, and Supabase.

Connecting service buyers with qualified providers through competitive bidding.

## Features

### Authentication
- Email/password login and registration
- Role selection (Buyer, Provider, or Both)
- OTP-based password reset (no redirect links)
- Change password for logged-in users
- Protected routes with automatic redirection

### Buyer Features
- Post service requests with category, budget, timeline, location, and attachments
- Browse and search verified service providers
- View and manage submitted requests
- Review incoming proposals from providers
- Accept proposals to create projects
- In-app notifications for proposal updates

### Provider Features
- Browse matching opportunities filtered by skills and distance
- Submit proposals with pricing and timeline
- Skill-based category selection in profile
- Dashboard with active bids and project stats
- Push notifications when new matching requests are posted

### Admin Panel (Web)
- Manage users, providers, and verification status
- Manage service categories (add/edit/delete)
- Manage regions
- View all requests and projects
- Provider verification workflow

### Notifications
- Push notifications via Expo (mobile)
- In-app notification center
- Category-based provider matching — only providers with matching skills get notified
- Distance-based filtering for local services

### Additional
- Role switching for dual-role users
- Real-time dashboard stats from Supabase
- Location auto-capture for physical service requests
- Web-compatible (conditional native module loading)
- Safe area handling for Android navigation buttons

## Project Structure

```
clap-serv/
├── app/
│   ├── (admin)/                # Admin panel
│   │   ├── index.tsx           # Admin dashboard
│   │   ├── categories.tsx      # Manage service categories
│   │   ├── providers.tsx       # Manage/verify providers
│   │   ├── users.tsx           # Manage users
│   │   ├── regions.tsx         # Manage regions
│   │   ├── requests.tsx        # View all requests
│   │   ├── projects.tsx        # View all projects
│   │   └── _layout.tsx
│   ├── (auth)/                 # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx # OTP-based reset flow
│   │   ├── reset-password.tsx
│   │   ├── diagnostic.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                 # Main app tabs
│   │   ├── index.tsx           # Dashboard (buyer/provider stats)
│   │   ├── browse.tsx          # Browse opportunities/providers
│   │   ├── projects.tsx        # Active projects
│   │   ├── messages.tsx        # Conversations
│   │   ├── profile.tsx         # User profile
│   │   └── _layout.tsx         # Tab navigation with safe area
│   ├── requests/               # Service requests
│   │   ├── new.tsx             # Post new request
│   │   ├── my-requests.tsx     # View my requests
│   │   └── [id].tsx            # Request detail
│   ├── proposals/              # Proposals
│   │   ├── index.tsx           # View proposals
│   │   └── new/[requestId].tsx # Submit proposal
│   ├── projects/               # Projects
│   │   ├── [id].tsx            # Project detail
│   │   └── [id]/chat.tsx       # Project chat
│   ├── profile/                # Profile management
│   │   ├── edit.tsx            # Edit profile + skills
│   │   └── provider-gigs.tsx   # Provider gigs
│   ├── settings/               # Settings
│   │   ├── index.tsx           # Settings menu
│   │   └── change-password.tsx # Change password
│   ├── notifications.tsx       # Notification center
│   ├── _layout.tsx             # Root layout with auth guards
│   └── index.tsx               # Entry point
├── components/
│   ├── BrowseProviders.tsx     # Provider listing for buyers
│   ├── cards/
│   │   ├── RequestCard.tsx     # Service request card
│   │   └── ProposalCard.tsx    # Proposal card
│   └── ui/                     # Reusable UI components
│       ├── CategoryMultiSelect.tsx
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── index.ts
├── constants/
│   ├── Colors.ts               # Color palette
│   ├── ServiceCategories.ts    # Service categories
│   └── Config.ts               # App configuration
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── categoryCache.ts        # Category cache (5-min TTL)
│   ├── useCategoryLookup.ts    # Category lookup hook
│   ├── api/
│   │   └── admin.ts            # Admin API functions
│   ├── notifications/
│   │   ├── index.ts            # Notification entry point
│   │   ├── providerMatcher.ts  # Match providers by skills + distance
│   │   ├── pushTokenService.ts # Push token registration
│   │   └── sendNotification.ts # Send push + in-app notifications
│   └── utils/
│       ├── location.ts         # Geolocation (native + web)
│       ├── formatting.ts       # Currency, dates, distances
│       └── validation.ts       # Zod schemas
├── store/                      # Zustand state management
│   ├── authStore.ts            # Authentication
│   ├── userStore.ts            # Profile + provider profile
│   ├── roleStore.ts            # Active role
│   ├── notificationStore.ts    # Notifications
│   └── adminStore.ts           # Admin operations
├── types/
│   ├── database.types.ts       # Database types
│   └── index.ts                # App types
├── utils/
│   └── alert.ts                # Cross-platform alerts
├── supabase-schema.sql         # Base database schema
├── supabase-migration-v2.sql   # Migration: verification, review counts
├── supabase-migration-v3.sql   # Migration: category system
├── supabase-migration-v4-notifications.sql  # Migration: notifications
├── supabase-rls-fix.sql        # RLS policy fixes
├── tailwind.config.js
└── eas.json                    # EAS Build config
```

## Setup

### Prerequisites
- Node.js 18+
- npm
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open SQL Editor and run the following files in order:
   - `supabase-schema.sql` — base tables, RLS policies, service categories
   - `supabase-migration-v2.sql` — verification, indexes, review counts
   - `supabase-migration-v3.sql` — category system updates
   - `supabase-migration-v4-notifications.sql` — notification tables, push tokens
   - `supabase-rls-fix.sql` — RLS policy fixes

3. Create storage buckets (Storage tab):
   - `avatars` (public)
   - `attachments` (private)
   - `portfolios` (public)

4. (Optional) Update the **Reset Password email template** in Authentication > Email Templates to include `{{ .Token }}` for OTP codes

### 3. Configure Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from Supabase Dashboard > Settings > API.

### 4. Run the App

```bash
# Web
npm run web

# iOS (requires macOS)
npm run ios

# Android
npm run android
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (name, role, location, avatar) |
| `provider_profiles` | Provider data (skills, hourly rate, bio, rating, verification) |
| `service_categories` | Service categories with distance limits |
| `service_requests` | Buyer service requests |
| `proposals` | Provider bids on requests |
| `projects` | Accepted proposals become projects |
| `conversations` | Messaging threads |
| `messages` | Individual messages |
| `notifications` | In-app notifications |
| `push_tokens` | Device push notification tokens |
| `regions` | Geographic regions |
| `reviews` | User reviews and ratings |

All tables have Row Level Security (RLS) enabled.

## Service Categories

Categories are grouped by service range:

- **Local (2-5 KM)**: Plumbing, Electrical, Appliance Repair
- **City (30 KM)**: House Painting, Pest Control, Cleaning, Landscaping, Carpentry, HVAC, Roofing, Moving, Photography
- **Online (Unlimited)**: Web Development, Mobile Development, Graphic Design, Content Writing, Digital Marketing, Video Editing, Virtual Assistant, Business Consulting, Online Tutoring, Translation

## Tech Stack

- **Framework**: Expo SDK 54 + React Native
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: @expo/vector-icons (FontAwesome)
- **Notifications**: expo-notifications (mobile), in-app (web)

## License

Private project - All rights reserved
