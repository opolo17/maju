import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { COPY } from './i18n';

const LanguageContext = createContext(null);

function getInitialLang() {
  const saved = localStorage.getItem('maju-lang');
  if (saved === 'ko' || saved === 'en') return saved;
  return navigator.language.startsWith('ko') ? 'ko' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    localStorage.setItem('maju-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      t: COPY[lang],
      setLang,
      toggleLang: () => setLang((prev) => (prev === 'ko' ? 'en' : 'ko')),
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
