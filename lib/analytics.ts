/**
 * Unified analytics — fires to PostHog (mobile + web) and Firebase Analytics (Android).
 * All key conversion events go through here.
 * Usage: import { track } from '@/lib/analytics';
 *        track('request_posted', { category: 'Electrician' });
 */

import { Platform } from 'react-native';
import { usePostHog } from 'posthog-react-native';

// ─── Key conversion events ────────────────────────────────────────────────────
export type AnalyticsEvent =
  | 'user_signed_up'
  | 'user_logged_in'
  | 'request_posted'          // MOST IMPORTANT — buyer posts first request
  | 'bid_submitted'           // provider submits a bid
  | 'bid_accepted'            // buyer accepts a bid
  | 'job_completed'           // job marked complete by both parties
  | 'provider_profile_created'
  | 'provider_gig_added'
  | 'chat_opened'
  | 'notification_tapped'
  | 'app_rated';

// ─── Firebase Analytics (Android only) ───────────────────────────────────────
async function firebaseTrack(event: string, params?: Record<string, any>) {
  if (Platform.OS !== 'android') return;
  try {
    const analytics = await import('@react-native-firebase/analytics');
    await analytics.default().logEvent(event, params);
  } catch {
    // Firebase not available — silently skip
  }
}

// ─── Web GA4 via gtag ─────────────────────────────────────────────────────────
function gtagTrack(event: string, params?: Record<string, any>) {
  if (Platform.OS !== 'web') return;
  try {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, params);
    }
  } catch {
    // gtag not loaded yet — silently skip
  }
}

// ─── Standalone track (outside React components) ─────────────────────────────
// Use this in non-component code. PostHog won't be available here — Firebase + GA4 only.
export function track(event: AnalyticsEvent, properties?: Record<string, any>) {
  firebaseTrack(event, properties);
  gtagTrack(event, properties);
}

// ─── Hook for use inside React components (adds PostHog) ──────────────────────
export function useAnalytics() {
  const posthog = usePostHog();

  return {
    track: (event: AnalyticsEvent, properties?: Record<string, any>) => {
      // PostHog — works on both Android and web
      posthog?.capture(event, properties);
      // Firebase — Android only
      firebaseTrack(event, properties);
      // GA4 — web only
      gtagTrack(event, properties);
    },
    identify: (userId: string, traits?: Record<string, any>) => {
      posthog?.identify(userId, traits);
    },
    reset: () => {
      posthog?.reset();
    },
  };
}
