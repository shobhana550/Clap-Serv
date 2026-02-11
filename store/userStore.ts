/**
 * User profile store using Zustand
 * Manages user profile data for Clap-Serv
 */

import { create } from 'zustand';
import { Profile, ProviderProfile } from '@/types';
import { supabase } from '@/lib/supabase';

interface UserState {
  profile: Profile | null;
  providerProfile: ProviderProfile | null;
  loading: boolean;

  // Actions
  setProfile: (profile: Profile | null) => void;
  setProviderProfile: (providerProfile: ProviderProfile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<{ error?: string }>;
  fetchProviderProfile: (userId: string) => Promise<void>;
  updateProviderProfile: (userId: string, data: Partial<ProviderProfile>) => Promise<{ error?: string }>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  providerProfile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),

  setProviderProfile: (providerProfile) => set({ providerProfile }),

  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);

        // If profile doesn't exist (PGRST116), create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');

          // Get user email from auth
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Create new profile
            const newProfile = {
              id: userId,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'buyer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              set({ loading: false });
              return;
            }

            console.log('Profile created successfully:', createdProfile);
            set({ profile: createdProfile, loading: false });

            // If role is provider or both, create provider profile
            if (newProfile.role === 'provider' || newProfile.role === 'both') {
              await supabase
                .from('provider_profiles')
                .insert({
                  user_id: userId,
                  skills: [],
                  portfolio_items: [],
                  certifications: [],
                  rating: 0,
                  total_reviews: 0,
                });
            }

            return;
          }
        }

        set({ loading: false });
        return;
      }

      set({ profile: data, loading: false });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ loading: false });
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return { error: error.message };
      }

      // Refetch profile after update
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (updatedProfile) {
        set({ profile: updatedProfile });
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred' };
    }
  },

  fetchProviderProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching provider profile:', error);
        return;
      }

      set({ providerProfile: data });
    } catch (error) {
      console.error('Error fetching provider profile:', error);
    }
  },

  updateProviderProfile: async (userId, data) => {
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .upsert({
          user_id: userId,
          ...data,
        });

      if (error) {
        return { error: error.message };
      }

      // Refetch provider profile after update
      const { data: updatedProfile } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (updatedProfile) {
        set({ providerProfile: updatedProfile });
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred' };
    }
  },

  clearProfile: () => set({ profile: null, providerProfile: null }),
}));
