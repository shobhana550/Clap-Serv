import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { Language, LANGUAGE_STORAGE_KEY } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (i18n.language as Language) || 'en',

  setLanguage: async (lang: Language) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
