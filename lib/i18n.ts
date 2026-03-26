import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import hiEn from '@/locales/hi-en.json';

export type Language = 'en' | 'hi' | 'hi-en';

export const LANGUAGE_STORAGE_KEY = '@clap_serv_language';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en',    label: 'English',   nativeLabel: 'English',  flag: '🇬🇧' },
  { code: 'hi',    label: 'Hindi',     nativeLabel: 'हिंदी',    flag: '🇮🇳' },
  { code: 'hi-en', label: 'Hinglish',  nativeLabel: 'Hinglish', flag: '🤝' },
];

export async function initI18n(): Promise<void> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).catch(() => null);
  const lng = (stored as Language) || 'en';

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en:    { translation: en },
        hi:    { translation: hi },
        'hi-en': { translation: hiEn },
      },
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
}

export default i18n;
