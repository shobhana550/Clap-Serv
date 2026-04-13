# Clap-Serv — Claude Code Context

This file is auto-loaded by Claude Code on every session. It contains full project context so any machine with this repo has complete knowledge.

---

## What This Project Is

Clap-Serv is a hyperlocal service marketplace app targeting Bihar/Mithila, India. Zero commission, open bidding model. One founder (kaushal550), building toward a Protocol Cooperative — community-owned platform.

**Live URLs:**
- Android app: https://play.google.com/store/apps/details?id=com.clapserv.app
- Web app: https://app.clap-serv.com
- Marketing site: https://clap-serv.com

---

## Repos & Deployment

| Repo | GitHub | Deploys to |
|------|--------|------------|
| Main app (Expo/React Native) | github.com/shobhana550/Clap-Serv | Netlify → app.clap-serv.com |
| Marketing website | github.com/shobhana550/shobhana550.github.io | Netlify → clap-serv.com (branch: `master`) |
| Marketing automation (Python) | github.com/shobhana550/clap-serv-marketing | GitHub Actions cron |

**Git user:** kaushal550 | **Org used in repos:** shobhana550

---

## Tech Stack

- **Frontend:** Expo / React Native (TypeScript)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Web:** Expo web build → Netlify
- **Analytics:** PostHog (EU) + Firebase Analytics + GA4
- **Marketing automation:** Python pipeline, posts to LinkedIn / Facebook / Instagram daily + YouTube Shorts

---

## Environment Files (NOT in git — copy manually between machines)

- `Clap-Serv/.env` — Supabase URL, anon key, service role key
- `clap-serv-marketing/.env` — Gemini API key, YouTube OAuth, social media API keys

---

## Active Integrations

| Service | Key / ID |
|---------|---------|
| PostHog | token: `phc_zaYSSE5mWmf6tEMBtcMk4rBP6WYozTqCwYsp6oiifLZa`, host: https://eu.posthog.com |
| GA4 | Measurement ID: `G-5V51025B3V` |
| Google Ads conversion | `AW-581763427` (in `app/+html.tsx`) |
| Firebase | project: `clap-serv`, Android app ID: `1:579075048940:android:eeb9f7272cec8e6b00ecc9` |
| Web3Forms (contact) | access key: `c04f2a18-9901-4caf-8266-0dd10cdd9d5e` |

---

## Key Files

| File | Purpose |
|------|---------|
| `app/+html.tsx` | GA4, PostHog, Google Ads tags injected for web |
| `app/_layout.tsx` | PostHogProvider wrapping app, user identify on auth |
| `lib/analytics.ts` | Unified analytics hook — fires PostHog + Firebase + GA4 |
| `google-services.json` | Firebase Android config |
| `app.json` | `googleServicesFile` wired under android config |
| `migrations/add-village-categories.sql` | 8 new Bihar-specific service categories |

---

## Google Ads Campaigns (live April 2026)

- **Buyer campaign:** ₹4K/month, Search, Bihar/Mithila hyperlocal, Hindi+Hinglish keywords
- **Provider campaign:** ₹2K/month, Search, targeting service providers
- Both: Presence-only location targeting, bidding on Conversions

---

## Marketing Automation (clap-serv-marketing repo)

- **9 AM IST:** Daily post → LinkedIn, Facebook, Instagram
- **10 AM IST:** YouTube Short (fixed April 2026 — was failing due to missing `playwright install` in workflow)
- **10 PM IST:** Feedback collection
- **Twitter/X:** Disabled — needs $100/mo X API Basic plan. Code preserved, re-enable by adding "twitter" back to PLATFORMS in `main.py`

---

## Pending / Not Yet Done

- EAS full build needed for Firebase Analytics to take effect natively on Android (JS-only OTA update is not enough)
- Facebook Ads campaign not yet created (₹3K buyers + ₹2K providers planned)
- YouTube OAuth may need re-auth with correct Google account (YOUTUBE_REFRESH_TOKEN in GitHub Secrets)
- Company registration (Section 8 or OPC, ~₹10K-20K with CA) — unlocks Startup Bihar grant
- Web3Forms — verify which email receives contact submissions at web3forms.com
- Provider onboarding flow — distinct signup/UX for providers (deferred)
- CLAP token governance model — future, not yet built

---

## Architecture Decisions (non-obvious)

- Supabase is source of truth for bio/social links — NOT AsyncStorage
- Marketing site deploys from `master` branch (not `main`) of shobhana550.github.io
- YouTube workflow is a separate `youtube.yml` file — splitting from `marketing.yml` fixed a GitHub Actions cron matching bug where multiple crons in one file fire unreliably
- Twitter disabled in PLATFORMS list in `main.py` — code kept for future re-enable
- `app/+html.tsx` is how all web analytics (GA4, PostHog, Google Ads) reach the web app

---

## Product Vision & USPs

**Core philosophy:** Decentralization of services — empowering local providers, fair competition, financial inclusion, community ownership.

**Key USPs:**
1. **Zero Commission & Zero Subscription** — Urban Company charges ₹50K upfront from providers. Clap-Serv charges ZERO.
2. **Transparent Bidding** — Open bidding, provider who deserves wins
3. **Empowered Negotiations** — Users negotiate directly, no middleman fixing rates
4. **Financial Inclusivity** — Any skilled person can join, no financial barrier
5. **Clap-Coin** — 1% fee on successful bids; 0.75% refunded on unsuccessful bids
6. **Localized Ad Spaces** — Providers buy hyperlocal slider placements
7. **Smart Contracts (future)** — Blockchain escrow, funds release after completion

**Origin story:** Born from founder's personal pain — opaque car repair quote + needing a compassionate lawyer during grief (loss of brother) and finding none. Car4Serviz (2018) → failed (2020) → Clap-Serv relaunch (2023).

**Target market:** Bihar/Mithila first — 70M internet users, NOT a "next market", it's NOW. Hinglish-first, hyperlocal.

**Competitors:**
- Urban Company: ₹50K upfront → Clap-Serv: ZERO
- JustDial: directory only → Clap-Serv: active bidding + chat
- WhatsApp groups: unverified → Clap-Serv: verified profiles, ratings
- Fiverr: urban/English → Clap-Serv: Hinglish, Bihar-first

---

## Future Model (Protocol Cooperative — upcoming, not live)

- **Section 8 company** structure — profits legally cannot go to founders
- **CLAP token** — governance earned through participation, not purchased; surplus returns to community
- **Optional premium features** — priority listing, analytics for providers
- **Voluntary patron contributions** — Wikipedia model
- All framed as FUTURE on the website — do not present as current

---

## Content Rules (for marketing copy)

- Never say "book in seconds" (Urban Company language)
- Say "ek request dalo, 5 bids aayenge"
- Celebrate provider dignity — "Apni pehchaan, apna kaam"
- Real competition is WhatsApp groups, not Urban Company
- Use real cultural references: Chhath, baraat, makhana, Madhubani
- Posts start with human insight, not product claim
- No competitor naming — describe behavior instead
- One sharp USP per post via contrast or story
