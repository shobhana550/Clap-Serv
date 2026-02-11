/**
 * Authentication store using Zustand
 * Manages auth state for Clap-Serv
 */

import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SignUpData, SignInData } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearPasswordRecovery: () => void;
  signIn: (data: SignInData) => Promise<{ error?: string }>;
  signUp: (data: SignUpData) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isPasswordRecovery: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setSession: (session) => set({ session }),

  setLoading: (loading) => set({ loading }),

  clearPasswordRecovery: () => set({ isPasswordRecovery: false }),

  signIn: async (data) => {
    try {
      set({ loading: true });

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set({
        user: authData.user,
        session: authData.session,
        isAuthenticated: true,
        loading: false,
      });

      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message || 'An error occurred during sign in' };
    }
  },

  signUp: async (data) => {
    try {
      set({ loading: true });

      // Sign up with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      // Create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            role: data.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // If role is provider or both, create provider profile
        if (data.role === 'provider' || data.role === 'both') {
          const { error: providerError } = await supabase
            .from('provider_profiles')
            .insert({
              user_id: authData.user.id,
              skills: [],
              portfolio_items: [],
              certifications: [],
              rating: 0,
              total_reviews: 0,
            });

          if (providerError) {
            console.error('Error creating provider profile:', providerError);
          }
        }
      }

      set({
        user: authData.user,
        session: authData.session,
        isAuthenticated: true,
        loading: false,
      });

      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message || 'An error occurred during sign up' };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  resetPassword: async (email) => {
    try {
      // No redirectTo - we use OTP code verification in the app
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred' };
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Don't treat recovery as a normal sign-in
          set({
            user: session?.user ?? null,
            session,
            isAuthenticated: !!session,
            isPasswordRecovery: true,
          });
        } else {
          set({
            user: session?.user ?? null,
            session,
            isAuthenticated: !!session,
          });
        }
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },
}));
