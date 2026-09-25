import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar.jsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-maju-text">
      <AppSidebar />

      <main className="min-w-0 flex-1 overflow-auto px-4 py-4 lg:px-5 lg:py-5">
        <Outlet />
      </main>
    </div>
  );
}
