/**
 * Supabase client configuration for Clap-Serv
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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

/**
 * Secure storage adapter using expo-secure-store on native platforms.
 * Falls back to AsyncStorage on web (SecureStore is not available on web).
 * SecureStore encrypts data using the device's keychain (iOS) or Keystore (Android).
 */
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // Fallback to AsyncStorage if SecureStore fails (e.g., key too long)
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isClient ? secureStorage : mockStorage,
    autoRefreshToken: true,
    persistSession: isClient,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/**
 * Map of Supabase/PostgREST error codes to user-friendly messages.
 * Prevents leaking database schema or internal details to the client.
 */
const ERROR_MAP: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  // PostgREST errors
  'PGRST116': 'The requested record was not found.',
  '23505': 'This record already exists.',
  '23503': 'This operation references data that does not exist.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'A required resource was not found.',
  // RLS errors
  'new row violates row-level security policy': 'You do not have permission to perform this action.',
};

/**
 * Helper function to handle Supabase errors.
 * Returns a generic, safe message that doesn't expose internal details.
 */
export function handleSupabaseError(error: any): string {
  if (!error) return 'An unexpected error occurred.';

  const message = error?.message || '';
  const code = error?.code || '';

  // Check against known error patterns
  for (const [pattern, safeMessage] of Object.entries(ERROR_MAP)) {
    if (message.includes(pattern) || code === pattern) {
      return safeMessage;
    }
  }

  // For unknown errors, return a generic message (don't expose raw error)
  if (process.env.NODE_ENV === 'development') {
    console.error('[Supabase Error]', error);
  }
  return 'Something went wrong. Please try again later.';
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
