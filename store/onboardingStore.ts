/**
 * Onboarding Store for Clap-Serv
 * Manages first-time user walkthrough state with AsyncStorage persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'clap_serv_onboarding_seen';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  isOnboarding: boolean;
  currentStep: number;
  initialized: boolean;
  initialize: () => Promise<void>;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeenOnboarding: false,
  isOnboarding: false,
  currentStep: 0,
  initialized: false,

  initialize: async () => {
    try {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ hasSeenOnboarding: seen === 'true', initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  startOnboarding: () => {
    set({ isOnboarding: true, currentStep: 0 });
  },

  nextStep: () => {
    set((state) => ({ currentStep: state.currentStep + 1 }));
  },

  prevStep: () => {
    set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) }));
  },

  skipOnboarding: async () => {
    set({ isOnboarding: false, hasSeenOnboarding: true, currentStep: 0 });
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
  },

  completeOnboarding: async () => {
    set({ isOnboarding: false, hasSeenOnboarding: true, currentStep: 0 });
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
  },

  resetOnboarding: async () => {
    set({ hasSeenOnboarding: false, isOnboarding: false, currentStep: 0 });
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch {}
  },
}));
