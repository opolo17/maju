import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button, Logo } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-[#2A2A2A]' : 'text-[#64748B] hover:text-[#2A2A2A]'
  }`;

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white text-[#2A2A2A]">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink to="/dashboard" className={navLinkClass}>
              대시보드
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-[#64748B] sm:inline">
              {user?.email}
            </span>
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
