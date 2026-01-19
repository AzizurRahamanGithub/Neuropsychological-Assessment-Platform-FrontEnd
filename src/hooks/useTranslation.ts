'use client';

import { useState, useEffect, useCallback } from 'react';

type Language = 'it' | 'en' | 'de' | 'fr';

interface Translations {
  [key: string]: string | { [key: string]: string };
}

/**
 * Hook for managing multi-language translations
 */
export function useTranslation(defaultLanguage: Language = 'it') {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations from JSON files
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/locales/${currentLanguage}.json`);
        const data = await response.json();
        setTranslations(data);
        
        // Save to localStorage
        localStorage.setItem('preferredLanguage', currentLanguage);
      } catch (error) {
        console.error(`Failed to load ${currentLanguage} translations:`, error);
        // Fall back to English if load fails
        if (currentLanguage !== 'en') {
          setCurrentLanguage('en');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Restore saved language preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') as Language | null;
    if (saved && ['it', 'en', 'de', 'fr'].includes(saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  // Translate function - supports nested keys like "admin.dashboard.title"
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return fallback || key;
        }
      }

      return typeof value === 'string' ? value : fallback || key;
    },
    [translations],
  );

  // Change language
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
  }, []);

  // Get available languages
  const availableLanguages: { code: Language; name: string }[] = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
  ];

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isLoading,
  };
}

/**
 * Hook for formatting values according to current locale
 */
export function useLocaleFormatter(language: Language = 'it') {
  const formatDate = useCallback(
    (date: Date | string): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString(language === 'it' ? 'it-IT' : language === 'en' ? 'en-US' : 'de-DE');
    },
    [language],
  );

  const formatNumber = useCallback(
    (num: number, decimals = 2): string => {
      const locale = language === 'it' ? 'it-IT' : language === 'en' ? 'en-US' : 'de-DE';
      return num.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    [language],
  );

  const formatCurrency = useCallback(
    (amount: number): string => {
      const locale = language === 'it' ? 'it-IT' : language === 'en' ? 'en-US' : 'de-DE';
      const currency = language === 'it' || language === 'de' ? 'EUR' : 'USD';
      return amount.toLocaleString(locale, {
        style: 'currency',
        currency,
      });
    },
    [language],
  );

  return {
    formatDate,
    formatNumber,
    formatCurrency,
  };
}
