import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { LANGUAGES } from '../i18n/index.js';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function LanguageSwitcher({ className = '', dark = false, variant = 'default' }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isSidebar = variant === 'sidebar';

  const current = LANGUAGES.find((item) => item.code === locale);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const triggerClass = isSidebar
    ? 'flex h-10 w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-maju-text transition hover:border-maju-accent/40 hover:bg-maju-surface/60 focus:border-maju-accent focus:outline-none focus:ring-2 focus:ring-maju-accent/20'
    : dark
      ? 'flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-tight text-white/90 shadow-sm backdrop-blur-sm transition hover:border-maju-accent/50 hover:bg-white/10 focus:border-maju-accent focus:outline-none focus:ring-2 focus:ring-maju-accent/25'
      : 'flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3.5 py-2 text-xs font-semibold tracking-tight text-maju-text shadow-sm backdrop-blur-sm transition hover:border-maju-accent/50 focus:border-maju-accent focus:outline-none focus:ring-2 focus:ring-maju-accent/20';

  const iconWrapClass = dark
    ? 'flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-maju-accent/25 to-maju-highlight/35'
    : 'flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-maju-accent/20 to-maju-highlight/40';

  const chevronClass = dark ? 'text-white/50' : 'text-maju-muted';

  const menuClass = isSidebar
    ? 'absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-full min-w-[10.5rem] overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/70'
    : dark
      ? 'absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10.5rem] overflow-hidden rounded-2xl border border-white/10 bg-maju-dark-panel p-1.5 shadow-xl shadow-black/40'
      : 'absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10.5rem] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/70';

  const menuTitleClass = dark
    ? 'text-[10px] font-semibold uppercase tracking-wider text-white/40'
    : 'text-[10px] font-semibold uppercase tracking-wider text-maju-subtle';

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('lang.select')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={triggerClass}
      >
        <span className={iconWrapClass}>
          <Languages
            className={`h-3 w-3 ${dark ? 'text-white/90' : 'text-maju-text'}`}
            strokeWidth={2.25}
          />
        </span>
        <span className={isSidebar ? 'flex-1 truncate text-left' : 'max-w-[5.5rem] truncate sm:max-w-none'}>
          {current?.label}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${chevronClass} ${
            open ? 'rotate-180' : ''
          } ${isSidebar ? 'ml-auto' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul role="listbox" aria-label={t('lang.select')} className={menuClass}>
          <li className="mb-1 px-2 pt-1">
            <span className={menuTitleClass}>{t('lang.menuTitle')}</span>
          </li>
          {LANGUAGES.map(({ code, label }) => {
            const selected = locale === code;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold tracking-tight transition ${
                    selected
                      ? 'bg-gradient-to-r from-maju-accent to-maju-highlight text-maju-text shadow-sm'
                      : dark
                        ? 'text-white/60 hover:bg-white/5 hover:text-white'
                        : 'text-maju-muted hover:bg-maju-surface hover:text-maju-text'
                  }`}
                >
                  {label}
                  {selected ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
