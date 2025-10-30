/**
 * Language Selector Component
 * Selettore lingua per cambio lingua applicazione
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, changeLanguage, useCurrentLanguage } from '../i18n/config';

export default function LanguageSelector({ variant = 'dropdown', size = 'medium' }) {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage: changeLang } = useCurrentLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === currentLanguage.code) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const success = await changeLanguage(languageCode);
      if (success) {
        setIsOpen(false);
        // Opzionale: mostra notifica di successo
        console.log(`Language changed to ${languageCode}`);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  // Variante dropdown
  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
            ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg px-4 py-3' : 'text-base'}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
            bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
          `}
          aria-label={t('profile.language')}
        >
          <Globe
            className={`w-4 h-4 ${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`}
          />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline ml-1">{currentLanguage.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Overlay per chiudere dropdown */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            {/* Menu dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={loading}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${language.code === currentLanguage.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="flex-1">{language.name}</span>
                    {language.code === currentLanguage.code && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Variante buttons (orizzontale)
  if (variant === 'buttons') {
    return (
      <div className="flex gap-1">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={loading || language.code === currentLanguage.code}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
              ${size === 'small' ? 'text-sm px-2 py-1' : size === 'large' ? 'text-lg px-4 py-3' : 'text-base'}
              ${
                language.code === currentLanguage.code
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={`Switch to ${language.name}`}
          >
            <span>{language.flag}</span>
            {size !== 'small' && <span>{language.name}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Variante minimal (solo bandiera)
  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`
            flex items-center gap-1 px-2 py-1 rounded border transition-all
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
            bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
          `}
          aria-label={t('profile.language')}
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={loading}
                    className={`
                      w-full flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${language.code === currentLanguage.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-sm">{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

// Hook per utilizzare il selettore lingua
export function useLanguageSelector() {
  const { currentLanguage, changeLanguage: changeLang } = useCurrentLanguage();
  const [loading, setLoading] = useState(false);

  const switchLanguage = async (languageCode) => {
    setLoading(true);
    try {
      const success = await changeLanguage(languageCode);
      return success;
    } catch (error) {
      console.error('Error switching language:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentLanguage,
    switchLanguage,
    loading,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

// Componente per impostazioni lingua (più dettagliato)
export function LanguageSettings() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage: changeLang } = useCurrentLanguage();
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (languageCode) => {
    setLoading(true);
    try {
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('profile.language')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Scegli la lingua preferita per l'applicazione
        </p>
      </div>

      <div className="grid gap-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={loading}
            className={`
              w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
              ${
                language.code === currentLanguage.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{language.flag}</span>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">{language.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language.code === 'it' && 'Italiano'}
                  {language.code === 'en' && 'English'}
                  {language.code === 'es' && 'Español'}
                </div>
              </div>
            </div>

            {language.code === currentLanguage.code && (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Attivo</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Suggerimento</h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          La lingua selezionata verrà salvata automaticamente e utilizzata in tutte le sessioni
          future. Puoi cambiarla in qualsiasi momento da questa sezione.
        </p>
      </div>
    </div>
  );
}
