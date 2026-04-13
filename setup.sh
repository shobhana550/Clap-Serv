#!/bin/bash
# ============================================================
# Clap-Serv App — New Machine Setup Script
# Run this ONCE after cloning the repo on a new machine
#
# Works on: macOS, Linux, Windows (Git Bash)
# Repo: https://github.com/shobhana550/Clap-Serv
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=============================================="
echo "   Clap-Serv App — New Machine Setup"
echo "=============================================="
echo ""

# ── 1. CHECK NODE.JS ─────────────────────────────
echo -e "${BLUE}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found.${NC}"
  echo "  Install from: https://nodejs.org (LTS version recommended)"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"

# ── 2. CHECK NPM ─────────────────────────────────
echo -e "${BLUE}[2/6] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found. Reinstall Node.js.${NC}"
  exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"

# ── 3. INSTALL EXPO & EAS CLI ────────────────────
echo -e "${BLUE}[3/6] Checking Expo & EAS CLI...${NC}"
if ! command -v expo &> /dev/null; then
  echo "  Installing Expo CLI globally..."
  npm install -g expo-cli
fi
echo -e "${GREEN}✓ Expo CLI ready${NC}"

if ! command -v eas &> /dev/null; then
  echo "  Installing EAS CLI globally..."
  npm install -g eas-cli
fi
echo -e "${GREEN}✓ EAS CLI ready${NC}"

# ── 4. INSTALL DEPENDENCIES ──────────────────────
echo -e "${BLUE}[4/6] Installing project dependencies...${NC}"
npm install
echo -e "${GREEN}✓ node_modules installed${NC}"

# ── 5. SET UP .ENV FILE ──────────────────────────
echo -e "${BLUE}[5/6] Checking .env file...${NC}"
if [ ! -f .env ]; then
  echo ""
  echo -e "${YELLOW}⚠  .env file not found. Creating from template...${NC}"
  cat > .env << 'ENVEOF'
# Supabase Configuration
# Get these from: https://app.supabase.com → your project → Settings → API
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
ENVEOF
  echo ""
  echo -e "${YELLOW}  ┌─────────────────────────────────────────────────────┐${NC}"
  echo -e "${YELLOW}  │  ACTION REQUIRED: Fill in your .env values           │${NC}"
  echo -e "${YELLOW}  │                                                       │${NC}"
  echo -e "${YELLOW}  │  EXPO_PUBLIC_SUPABASE_URL      → Supabase project URL │${NC}"
  echo -e "${YELLOW}  │  EXPO_PUBLIC_SUPABASE_ANON_KEY → Supabase anon key    │${NC}"
  echo -e "${YELLOW}  │                                                       │${NC}"
  echo -e "${YELLOW}  │  Get from: https://app.supabase.com                   │${NC}"
  echo -e "${YELLOW}  │  Project: clap-serv → Settings → API                 │${NC}"
  echo -e "${YELLOW}  └─────────────────────────────────────────────────────┘${NC}"
  echo ""
  echo "  Edit now with:  nano .env   OR   code .env"
else
  echo -e "${GREEN}✓ .env file exists${NC}"
fi

# ── 6. EAS LOGIN CHECK ───────────────────────────
echo -e "${BLUE}[6/6] Checking EAS login (for builds)...${NC}"
if ! eas whoami &> /dev/null; then
  echo -e "${YELLOW}  Not logged into EAS. Run: eas login${NC}"
  echo -e "${YELLOW}  (Only needed for Android/iOS builds — not for local dev)${NC}"
else
  EAS_USER=$(eas whoami 2>/dev/null)
  echo -e "${GREEN}✓ EAS logged in as: $EAS_USER${NC}"
fi

# ── DONE ─────────────────────────────────────────
echo ""
echo "=============================================="
echo -e "${GREEN}  Setup complete!${NC}"
echo "=============================================="
echo ""
echo "  ── Run locally ──────────────────────────"
echo "  npx expo start              → Expo DevTools (scan QR with phone)"
echo "  npx expo start --web        → Open in browser"
echo "  npx expo start --android    → Android emulator"
echo ""
echo "  ── Deploy web ───────────────────────────"
echo "  git push origin main        → Netlify auto-deploys → app.clap-serv.com"
echo "  npm run build:web           → Manual web build (expo export)"
echo ""
echo "  ── Android build (EAS) ──────────────────"
echo "  eas build --platform android --profile preview   → APK for testing"
echo "  eas build --platform android --profile production → Play Store AAB"
echo ""
echo "  ── OTA update (JS changes only) ─────────"
echo "  eas update --branch main --message 'your message'"
echo "  (No new build needed for JS-only changes)"
echo ""
echo "  ── Supabase migrations ──────────────────"
echo "  Run .sql files from /migrations in Supabase SQL editor:"
echo "  https://app.supabase.com → SQL Editor"
echo ""
echo "  ── Key URLs ─────────────────────────────"
echo "  Web app:        https://app.clap-serv.com"
echo "  Marketing site: https://clap-serv.com"
echo "  Supabase:       https://app.supabase.com"
echo "  Netlify:        https://app.netlify.com"
echo "  Google Ads:     https://ads.google.com"
echo "  PostHog:        https://eu.posthog.com"
echo ""
