/**
 * Admin store using Zustand
 * Manages admin state for Clap-Serv
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  checkAdmin: (userId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: false,
  loading: true,

  checkAdmin: async (userId: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        set({ isAdmin: false, loading: false });
        return;
      }

      set({ isAdmin: data?.is_admin === true, loading: false });
    } catch (error) {
      console.error('Error checking admin status:', error);
      set({ isAdmin: false, loading: false });
    }
  },
}));
