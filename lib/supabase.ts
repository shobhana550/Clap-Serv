/**
 * Supabase client configuration for Clap-Serv
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Check if running in browser/client environment
const isClient = typeof window !== 'undefined';

// Mock storage for SSR (server-side rendering)
const mockStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isClient ? AsyncStorage : mockStorage,
    autoRefreshToken: true,
    persistSession: isClient,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper function to get current session
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
