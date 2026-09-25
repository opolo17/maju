import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Crown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function SidebarProfileMenu() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef(null);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    t('nav.defaultUser');

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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setLoggingOut(false);
    }
  }

  const menuItemClass =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-maju-text transition hover:bg-gray-50';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-gray-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-maju-muted">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-maju-text">{displayName}</span>
          <span className="block truncate text-xs text-maju-subtle">{user?.email}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-maju-subtle transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-200/70"
        >
          <Link
            to="/settings"
            role="menuitem"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 shrink-0 text-maju-muted" strokeWidth={2} aria-hidden />
            {t('nav.settings')}
          </Link>
          <Link
            to="/pricing"
            role="menuitem"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            <Crown className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
            {t('nav.sidebar.planLabel')}
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={handleLogout}
            className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <LogOut className="h-4 w-4 shrink-0 text-maju-muted" strokeWidth={2} aria-hidden />
            {loggingOut ? t('common.processing') : t('nav.logout')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
