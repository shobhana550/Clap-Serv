/**
 * Role store using Zustand
 * Manages active role (buyer/provider) for Clap-Serv
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/types';
import { Config } from '@/constants/Config';

interface RoleState {
  activeRole: 'buyer' | 'provider';
  userRole: UserRole | null; // The user's actual role (buyer, provider, or both)

  // Actions
  setActiveRole: (role: 'buyer' | 'provider') => Promise<void>;
  setUserRole: (role: UserRole) => void;
  switchRole: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  activeRole: 'buyer',
  userRole: null,

  setActiveRole: async (role) => {
    try {
      await AsyncStorage.setItem(Config.storageKeys.ACTIVE_ROLE, role);
      set({ activeRole: role });
    } catch (error) {
      console.error('Error setting active role:', error);
    }
  },

  setUserRole: (role) => set({ userRole: role }),

  switchRole: async () => {
    const { activeRole, userRole } = get();

    // Only allow switching if user has 'both' role
    if (userRole === 'both') {
      const newRole = activeRole === 'buyer' ? 'provider' : 'buyer';
      await get().setActiveRole(newRole);
    }
  },

  initialize: async () => {
    try {
      const savedRole = await AsyncStorage.getItem(Config.storageKeys.ACTIVE_ROLE);
      if (savedRole === 'buyer' || savedRole === 'provider') {
        set({ activeRole: savedRole });
      }
    } catch (error) {
      console.error('Error initializing role store:', error);
    }
  },
}));
