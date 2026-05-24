import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { COPY } from './i18n';

const LanguageContext = createContext(null);

const SUPPORTED_LANGS = ['ko', 'en', 'ja'];

function getInitialLang() {
  const saved = localStorage.getItem('maju-lang');
  if (SUPPORTED_LANGS.includes(saved)) return saved;

  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('ja')) return 'ja';
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    localStorage.setItem('maju-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLanguage = (next) => {
    if (SUPPORTED_LANGS.includes(next)) setLang(next);
  };

  const value = useMemo(
    () => ({
      lang,
      t: COPY[lang],
      setLang: setLanguage,
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
