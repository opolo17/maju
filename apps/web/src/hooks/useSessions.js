import { useEffect, useMemo, useState } from 'react';
import { deleteSession, listSessions } from '../lib/api.js';
import { buildGrowthStats } from '../lib/growth-stats.js';
import { useI18n } from '../i18n/LanguageContext.jsx';

export function useSessions() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let mounted = true;

    listSessions()
      .then((data) => {
        if (mounted) setSessions(data.sessions ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message ?? t('dashboard.loadFailed'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  const grouped = useMemo(() => {
    const live = sessions.filter((s) => s.status === 'live');
    const draft = sessions.filter((s) => s.status === 'draft');
    const completed = sessions.filter((s) => s.status === 'completed');
    const other = sessions.filter(
      (s) => s.status !== 'live' && s.status !== 'draft' && s.status !== 'completed',
    );
    return { live, draft, completed, other };
  }, [sessions]);

  const growthStats = useMemo(() => buildGrowthStats(sessions), [sessions]);

  function handleDeleteRequest(session) {
    setDeleteTarget(session);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const session = deleteTarget;
    setDeleteTarget(null);
    setActionError('');
    setDeletingId(session.id);
    try {
      await deleteSession(session.id);
      setSessions((prev) => prev.filter((item) => item.id !== session.id));
    } catch (err) {
      setActionError(err.message ?? t('dashboard.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  }

  const deleteTargetLabel =
    deleteTarget?.status === 'completed'
      ? t('dashboard.deleteTargetReport')
      : t('dashboard.deleteTargetRecord');

  return {
    sessions,
    loading,
    error,
    grouped,
    growthStats,
    deletingId,
    deleteTarget,
    deleteTargetLabel,
    actionError,
    handleDeleteRequest,
    handleConfirmDelete,
    clearDeleteTarget: () => setDeleteTarget(null),
  };
}
