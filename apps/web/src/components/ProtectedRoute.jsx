import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  if (!isConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-maju-muted">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
