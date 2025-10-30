/**
 * Configurazione i18n (Internationalization)
 * Sistema di traduzione multilingua
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import delle traduzioni
import itTranslations from '../locales/it/translation.json';
import enTranslations from '../locales/en/translation.json';
import esTranslations from '../locales/es/translation.json';

// Configurazione risorse
const resources = {
  it: {
    translation: itTranslations,
  },
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

// Lingue supportate
export const SUPPORTED_LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Lingua di default
export const DEFAULT_LANGUAGE = 'it';

// Configurazione i18next
i18n
  .use(LanguageDetector) // Rileva automaticamente la lingua
  .use(initReactI18next) // Passa i18n down to react-i18next
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    debug: process.env.NODE_ENV === 'development',

    // Language detector options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React già fa l'escape
    },

    // Configurazione avanzata
    react: {
      useSuspense: false, // Disabilita suspense per compatibilità
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transWrapTextNodes: '',
    },

    // Configurazione per formattazione
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,

    // Configurazione per plurali
    pluralSeparator: '_',
    contextSeparator: '_',

    // Configurazione per namespaces
    defaultNS: 'translation',
    ns: ['translation'],
    nsSeparator: ':',
    keySeparator: '.',
  });

// Funzione per cambiare lingua
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    // Salva nel localStorage
    localStorage.setItem('i18nextLng', language);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Hook personalizzato per ottenere la lingua corrente
export const useCurrentLanguage = () => {
  const currentLang = i18n.language;
  const language =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLang) ||
    SUPPORTED_LANGUAGES.find((lang) => lang.code === DEFAULT_LANGUAGE);

  return {
    currentLanguage: language,
    currentLanguageCode: currentLang,
    isRTL: false, // Nessuna lingua RTL supportata
    changeLanguage,
  };
};

// Funzione per ottenere il nome della lingua
export const getLanguageName = (code) => {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language ? language.name : DEFAULT_LANGUAGE;
};

// Funzione per ottenere la bandiera della lingua
export const getLanguageFlag = (code) => {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language ? language.flag : '🇮🇹';
};

// Funzione per formattare date localizzate
export const formatLocalizedDate = (date, options = {}) => {
  const locale = i18n.language === 'it' ? 'it-IT' : i18n.language === 'es' ? 'es-ES' : 'en-GB';

  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
};

// Funzione per formattare numeri localizzati
export const formatLocalizedNumber = (number, options = {}) => {
  const locale = i18n.language === 'it' ? 'it-IT' : i18n.language === 'es' ? 'es-ES' : 'en-GB';

  return new Intl.NumberFormat(locale, options).format(number);
};

// Funzione per formattare valuta localizzata
export const formatLocalizedCurrency = (amount, currency = 'EUR') => {
  const locale = i18n.language === 'it' ? 'it-IT' : i18n.language === 'es' ? 'es-ES' : 'en-GB';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Funzione per ottenere la direzione del testo
export const getTextDirection = (languageCode) => {
  // Per ora solo LTR, ma facilmente estensibile per RTL
  return 'ltr';
};

export default i18n;
