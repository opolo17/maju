import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  PlusCircle,
  Video,
} from 'lucide-react';
import { Logo } from '@maju/ui';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import SidebarProfileMenu from './SidebarProfileMenu.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-gray-100 text-maju-text'
      : 'text-maju-muted hover:bg-gray-50 hover:text-maju-text'
  }`;

export default function AppSidebar() {
  const { t } = useI18n();

  const navItems = [
    { to: '/dashboard', label: t('nav.sidebar.dashboard'), icon: LayoutDashboard },
    { to: '/sessions', label: t('nav.sidebar.sessions'), icon: Video },
    { to: '/insights', label: t('nav.sidebar.insights'), icon: MessageSquareText },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="px-5 py-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <Logo />
        </Link>
        <p className="mt-2 text-[11px] leading-relaxed text-maju-subtle">{t('nav.sidebar.appTagline')}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navItemClass} end={to === '/dashboard'}>
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {label}
          </NavLink>
        ))}

        <NavLink
          to="/interview/new"
          className={({ isActive }) =>
            `mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-maju-accent to-maju-highlight text-maju-text shadow-sm'
                : 'border border-gray-200 bg-white text-maju-text hover:border-maju-accent/40 hover:bg-maju-surface/60'
            }`
          }
        >
          <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('dashboard.newInterview')}
        </NavLink>
      </nav>

      <div className="space-y-3 border-t border-gray-100 px-3 py-4">
        <LanguageSwitcher variant="sidebar" />
        <SidebarProfileMenu />
      </div>
    </aside>
  );
}
