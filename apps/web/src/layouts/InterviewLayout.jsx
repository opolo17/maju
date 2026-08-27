import { Link, Outlet } from 'react-router-dom';

export default function InterviewLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-white">
            MAJU
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            ← 대시보드
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
