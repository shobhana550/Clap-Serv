# Clap-Serv MVP

A cross-platform service marketplace app built with Expo, React Native Web, NativeWind (Tailwind CSS), and Supabase.

**"The Amazon of Services"** - Connecting service buyers with qualified providers through competitive bidding.

## 🚀 Features Implemented

### ✅ Phase 1-4: Core Foundation (COMPLETED)

#### Authentication System
- **Login Screen** - Email/password authentication
- **Registration Screen** - Role selection (Buyer, Provider, or Both)
- **Forgot Password** - Email-based password reset
- **Auth State Management** - Zustand store with Supabase integration
- **Protected Routes** - Automatic redirection based on auth state

#### Navigation
- **Bottom Tab Navigation** - 5 tabs: Home, Browse, Projects, Messages, Profile
- **Role-Based UI** - Dynamic content based on Buyer/Provider role
- **Role Switching** - Toggle between roles for users with "both" permission

#### Dashboard
- Welcome message with user name
- Quick stats (requests, proposals, projects)
- Role switcher for dual-role users
- Quick actions (contextual to buyer/provider role)
- Recent activity feed

#### UI Components (NativeWind Styled)
- `Button` - 5 variants, 3 sizes, touch-optimized (44px min)
- `Input` - With labels, errors, left/right icons
- `Card` - 3 variants (default, outlined, elevated)
- `Badge` - Status badges (success, warning, error, info)
- `Avatar` - With image or fallback initials

#### Utilities
- **Validation** - Zod schemas for forms
- **Formatting** - Currency, dates, distances, file sizes
- **Location** - Geolocation, distance calculation (Haversine)

#### State Management
- **Auth Store** - Sign in, sign up, sign out, password reset
- **User Store** - Profile and provider profile management
- **Role Store** - Active role with AsyncStorage persistence

## 📁 Project Structure

```
clap-serv/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── browse.tsx       # Browse opportunities/requests
│   │   ├── projects.tsx     # Active projects
│   │   ├── messages.tsx     # Conversations
│   │   ├── profile.tsx      # User profile
│   │   └── _layout.tsx      # Tab navigation
│   ├── _layout.tsx          # Root layout with auth guards
│   └── index.tsx            # Entry point
├── components/
│   └── ui/                  # Reusable UI components
├── constants/
│   ├── Colors.ts            # Color palette
│   ├── ServiceCategories.ts # 22 service categories
│   └── Config.ts            # App configuration
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils/               # Utilities
├── store/                   # Zustand stores
│   ├── authStore.ts
│   ├── userStore.ts
│   └── roleStore.ts
├── types/                   # TypeScript types
│   ├── database.types.ts
│   └── index.ts
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind configuration
├── supabase-schema.sql      # Database schema
└── PROGRESS.md              # Detailed progress
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

#### Create Supabase Project
1. Go to https://supabase.com
2. Create a new project named "clap-serv"
3. Wait for the project to initialize

#### Run Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and click "Run"

This creates:
- 9 database tables
- Row Level Security policies
- Indexes for performance
- 22 pre-populated service categories

#### Create Storage Buckets
1. Go to Storage in Supabase Dashboard
2. Create 3 buckets:
   - `avatars` (public)
   - `attachments` (private)
   - `portfolios` (public)

#### Get Credentials
1. Go to Settings → API
2. Copy your **Project URL** and **anon public key**

### 3. Configure Environment

Update `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run the App

#### Web (Recommended for testing)
```bash
npm run web
```

#### iOS (Requires macOS)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

## 🎨 Design System

### Color Palette (from PRD)
- **Primary** (Deep Blue): `#1E40AF` - Trust and professionalism
- **Secondary** (Light Gray): `#F8FAFC` - Clean backgrounds
- **Accent** (Green): `#10B981` - Success and CTAs
- **Warning** (Amber): `#F59E0B` - Pending states
- **Error** (Red): `#EF4444` - Errors and alerts

### Typography
- Headings: Inter (when loaded)
- Body: System font stack

### Touch Targets
- Minimum 44px height for all interactive elements
- Optimized for mobile-first usage

## 📱 Service Categories

22 categories with distance-based filtering:

### Local Services (2 KM)
- Plumbing, Electrical, Appliance Repair

### City Services (30 KM)
- House Painting, Pest Control, Cleaning, Landscaping, Carpentry, HVAC, Roofing, Moving, Photography

### Online Services (Unlimited)
- Web Development, Mobile Development, Graphic Design, Content Writing, Digital Marketing, Video Editing, Virtual Assistant, Business Consulting, Online Tutoring, Translation

## 🔐 User Roles

Users can register as:
- **Buyer** - Post service requests, receive proposals
- **Provider** - Browse opportunities, submit proposals
- **Both** - Switch between buyer and provider modes

## 📝 Database Schema

See `supabase-schema.sql` for complete schema including:
- `profiles` - User profiles
- `provider_profiles` - Provider-specific data
- `service_categories` - Service categories
- `service_requests` - Service requests from buyers
- `proposals` - Bids from providers
- `projects` - Accepted proposals
- `conversations` - Messaging threads
- `messages` - Individual messages
- `reviews` - User reviews (future)

All tables have Row Level Security (RLS) enabled.

## 🚧 Next Steps (Not Yet Implemented)

The following features are planned but not yet built:

1. **Service Request Management** (Buyer)
   - Post service requests with attachments
   - View and manage requests
   - Accept/reject proposals

2. **Opportunity Browsing** (Provider)
   - Browse available requests
   - Filter by category, budget, distance
   - Submit proposals

3. **Bidding System**
   - Proposal creation and management
   - Proposal comparison for buyers
   - Status tracking

4. **Messaging**
   - Real-time chat with Supabase
   - File sharing
   - Read receipts

5. **Project Management**
   - Active project tracking
   - Status updates
   - Completion flow

6. **Additional Features**
   - Edit profile
   - Provider portfolio
   - Push notifications
   - Advanced filters
   - Reviews and ratings

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register as buyer
- [ ] Register as provider
- [ ] Register as both
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Forgot password flow
- [ ] Role switching (for "both" users)
- [ ] Navigate through all tabs
- [ ] Sign out
- [ ] Auto-redirect when not authenticated

### Known Limitations
- No service request posting yet
- No proposal system yet
- No real-time messaging yet
- Profile editing placeholder
- No payment integration (per PRD - not in MVP)

## 📚 Tech Stack

- **Framework**: Expo SDK 54 with React Native Web
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: @expo/vector-icons (FontAwesome)
- **Utilities**: date-fns, clsx, tailwind-merge

## 🤝 Contributing

This is an MVP in active development. See [PROGRESS.md](PROGRESS.md) for detailed implementation status.

## 📄 License

Private project - All rights reserved

---

**Built with Expo + NativeWind + Supabase** 🚀
