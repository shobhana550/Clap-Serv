# Clap-Serv — Hyperlocal Service Marketplace

A mobile-first platform connecting buyers with local service providers across Indian cities. Built with React Native / Expo for Android, iOS, and Web.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo ~54 |
| Routing | Expo Router v6 (file-based, typed routes) |
| Backend / DB | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (email/password, magic link, OAuth-ready) |
| State Management | Zustand v5 |
| Forms & Validation | React Hook Form + Zod |
| Styling | NativeWind v2 (Tailwind CSS for RN) + StyleSheet |
| Push Notifications | expo-notifications (native) + Supabase Edge trigger |
| Location | expo-location (native) · Browser Geolocation API (web) · Nominatim reverse geocode · IP fallback (ipapi.co / ip-api.com) |
| File Uploads | expo-image-picker · expo-document-picker |
| Icons | @expo/vector-icons (FontAwesome) |
| Currency | INR (₹) |
| Web Deployment | Netlify (static export via `expo export --platform web`) |
| APK Distribution | GitHub Releases |
| Marketing Site | Static HTML/CSS/JS → GitHub Pages (shobhana550.github.io) |
| Contact Form | Web3Forms (AJAX, no backend) |

---

## Database Schema (Supabase)

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles — name, email, role (`buyer` / `provider` / `both`), location (JSONB), `is_admin`, `is_blocked` |
| `provider_profiles` | Provider-specific data — bio, skills (array of category UUIDs), hourly rate, `is_verified`, `push_token` |
| `service_categories` | Category master — name, icon, description, `max_distance_km` (null = online/unlimited) |
| `service_regions` | Admin-managed geographic regions — city, state, lat/lng, `radius_km`, `is_active` |
| `region_categories` | Junction: which categories are active in which region |
| `service_requests` | Buyer requests — title, description, budget range (min/max INR), timeline, deadline, location (JSONB), status |
| `proposals` | Provider bids on requests — price, timeline, cover letter, status |
| `conversations` | Chat threads between buyer and provider per request |
| `messages` | Individual chat messages |
| `ratings` | Post-completion ratings (1–5 stars, review text) |
| `hyperlocal_ads` | Admin-managed promotional banners — title, subtitle, CTA text/URL, bg/text color, target city, `is_active` |

### RLS Policy Pattern
- Users can only read/write their own rows
- Admins (`is_admin = true` in profiles) bypass restrictions via `requireAdmin()` server-side check
- `hyperlocal_ads`: public read for `is_active = true`; admin full CRUD

---

## Features Built

### Authentication
- Email + password sign-up / login
- Forgot password → reset via email link
- Password recovery flow (`isPasswordRecovery` guard in root layout)
- Auto-redirect: unauthenticated → login; authenticated in auth group → tabs
- Profile auto-created on first login if missing

### User Roles
- **Buyer** — posts service requests, receives proposals, chats, rates providers
- **Provider** — browses matching requests, submits proposals, chats, manages gigs
- **Both** — full access to both sides
- Role stored in `profiles.role`; role store (`roleStore`) controls UI visibility

### Home Screen (Buyer + Provider)
- Hyperlocal ad banner at top (fetched from `hyperlocal_ads` where `is_active = true`, target city matched or null)
- Welcome section with user name
- Quick stats
- Recent activity feed

### Service Categories
- Fetched from `service_categories` in Supabase
- **"Other" category** — special rules:
  - Always pinned first in all dropdowns
  - Notifies ALL providers within 30km city range (ignores skills filter)
  - Forces physical (not online) matching
  - Shows "City-wide" purple badge in UI

### Post Service Request (Buyer)
- Category selection (Other pinned first with City-wide badge)
- Title + description with character counters
- Budget range in INR (₹ min – ₹ max)
- Date + time picker (native DateTimePicker / web datetime-local input)
- Location field:
  - Priority 1: saved profile location (set during onboarding or previous edit)
  - Priority 2: browser geolocation → Nominatim reverse geocode → city/state
  - Priority 3: IP-based geolocation (ipapi.co → ip-api.com fallback)
  - Pencil icon to manually override city (typed input saved back to profile)
  - Refresh icon to re-detect
- Optional attachments (camera / gallery / document)
- On submit: inserts to `service_requests`, triggers `notifyMatchingProviders` in background

### Provider Matching & Notifications
- **Standard categories**: providers within `max_distance_km`, skills array contains `category_id`
- **Other category**: all providers within 30km, no skills filter, physical only
- Distance calculated via Haversine formula
- Push notifications sent via Expo push API to matching providers' `push_token`
- Notification deep-links: `new_opportunity` → request detail, `new_message` → chat, `proposal_accepted` → request

### Browse (Provider)
- Lists open service requests matching provider's location and skills
- "Other" category requests visible to all providers within range regardless of skills
- Category filter dropdown (Other pinned first)
- Distance badge per request

### Proposals
- Provider submits proposal (price, timeline, cover letter)
- Buyer sees proposals on request detail
- Accept/reject proposal → triggers notification

### Chat / Messaging
- Per-conversation threads (buyer ↔ provider per request)
- Realtime via Supabase Realtime subscriptions
- Notification on new message

### Ratings
- Post-completion: buyer rates provider (1–5 stars + text)
- Aggregate rating shown on provider profile

### Provider Profile
- Public profile: bio, skills, rating, gigs/reviews
- Editable: profile picture, bio, hourly rate, skills (multi-select from categories)
- `is_verified` badge (admin-toggled)

### Notifications Screen
- In-app notification list with read/unread state
- Tapping deep-links to relevant screen

### Settings
- Edit profile
- Change password
- Legal: Help, About, Privacy Policy, Terms of Service

### Onboarding
- First-time walkthrough (shown once, stored in AsyncStorage)
- Role selection, feature highlights

### Admin Panel (Web-only)
Accessible at `/(admin)` — web browser only, `is_admin` guard.

| Screen | Features |
|---|---|
| Dashboard | Total users, providers, requests counts |
| Users | Search, block/unblock, view provider profile |
| Providers | Verify/unverify providers |
| Requests | Browse all service requests |
| Categories | Create / edit categories (name, icon, description, max_distance_km) |
| Regions | Create / edit / delete service regions, assign categories per region |
| Hyperlocal Ads | Create ads (title, subtitle, CTA, colors, target city), toggle active/inactive, delete, live preview |

---

## Location Logic

```
On Web:
  1. Browser Geolocation API (HTTPS / localhost only)
     └─ Success → Nominatim reverse geocode (lat/lng → city/state)
        └─ Fail  → IP geolocation fallback (keeps browser lat/lng)
  2. IP fallback (ipapi.co → ip-api.com)
     └─ Returns city/state directly

On Native:
  1. expo-location (GPS) → expo-location reverseGeocodeAsync
  2. Falls back to null if permission denied

Manual override:
  - Pencil icon in Post Request form
  - User types "City" or "City, State"
  - Saved back to profile.location for future use
```

> **Note on ISP geolocation inaccuracy:** IP-based geolocation in rural Bihar maps to Patna (state ISP hub). Manual override solves this — once corrected, profile saves the right city for all future requests.

---

## Push Notifications

- Registered via `registerForPushNotifications(userId)` on login
- Token stored in `provider_profiles.push_token`
- Notification handler shows banner in foreground (native only)
- Deep-link routing via `addNotificationResponseReceivedListener` in root layout

---

## Deployment

### Web App (Netlify)
```bash
npm run build:web        # runs: expo export --platform web
# outputs to: dist/
```
- Drag `dist/` folder to Netlify, or connect repo (netlify.toml handles build + SPA redirects)
- 55 pre-rendered static HTML routes

### Android APK
- Built via EAS / Expo build
- Hosted on GitHub Releases: `https://github.com/shobhana550/Clap-Serv/releases`
- Current release: `v1.0.0`

### Marketing Site
- Repo: `https://github.com/shobhana550/shobhana550.github.io`
- Hosted on: GitHub Pages
- Contact form: Web3Forms (email: contact@clap-serv.com)
- APK download links both point to GitHub Release v1.0.0

---

## Project Structure

```
Clap-Serv/
├── app/
│   ├── _layout.tsx              # Root layout — auth guard, push notifications
│   ├── (auth)/                  # Login, register, forgot/reset password
│   ├── (tabs)/                  # Main tab navigator (home, browse, messages, profile)
│   ├── (admin)/                 # Admin panel (web-only)
│   │   ├── _layout.tsx          # Sidebar nav + admin/auth guard
│   │   ├── index.tsx            # Dashboard
│   │   ├── users.tsx
│   │   ├── providers.tsx
│   │   ├── requests.tsx
│   │   ├── categories.tsx
│   │   ├── regions.tsx
│   │   └── ads.tsx              # Hyperlocal ads management
│   ├── requests/
│   │   ├── new.tsx              # Post service request
│   │   ├── [id].tsx             # Request detail + proposals
│   │   └── my-requests.tsx
│   ├── proposals/new/[requestId].tsx
│   ├── messages/chat.tsx
│   ├── profile/
│   │   ├── [id].tsx             # Public provider profile
│   │   ├── edit.tsx
│   │   └── provider-gigs.tsx
│   ├── settings/
│   └── legal/                   # Help, About, Privacy, Terms
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── api/admin.ts             # Admin CRUD (all server-side admin auth check)
│   ├── categoryCache.ts         # Pre-warmed category cache on app start
│   ├── notifications/
│   │   ├── index.ts             # registerForPushNotifications
│   │   ├── providerMatcher.ts   # Match providers by location + skills
│   │   ├── sendNotification.ts  # Expo push API sender
│   │   └── pushTokenService.ts
│   └── utils/location.ts        # Geolocation, reverse geocode, Haversine distance
├── store/
│   ├── authStore.ts
│   ├── userStore.ts
│   ├── roleStore.ts
│   ├── adminStore.ts
│   ├── notificationStore.ts
│   └── onboardingStore.ts
├── types/index.ts
├── supabase-migration-v9-other-ads.sql   # Run in Supabase SQL editor
├── netlify.toml                          # Netlify build config + SPA redirects
└── app.json
```

---

## Supabase Migration

Run `supabase-migration-v9-other-ads.sql` in the Supabase SQL editor to:
1. Insert the "Other" special category (`max_distance_km = 30`, icon = `question-circle`)
2. Create the `hyperlocal_ads` table with RLS policies
3. Seed one inactive sample ad

---

## Environment Variables

Set in `.env` (or Expo secrets for EAS builds):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
