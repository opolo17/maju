import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LANGUAGES,
  LOCALE_STORAGE_KEY,
  translate,
} from './index.js';

const LanguageContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && LANGUAGES.some((lang) => lang.code === stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key, vars) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, languages: LANGUAGES }),
    [locale, setLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return ctx;
}
