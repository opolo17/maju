import { useNavigate } from 'react-router-dom';
import { Alert, Button, EmptyState, PageHeader } from '@maju/ui';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import SessionGroup from '../components/dashboard/SessionGroup.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useSessions } from '../hooks/useSessions.js';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';

export default function SessionsPage() {
  const { t } = useI18n();
  const labels = useInterviewLabels();
  const navigate = useNavigate();

  const {
    sessions,
    loading,
    error,
    grouped,
    deletingId,
    deleteTarget,
    deleteTargetLabel,
    actionError,
    handleDeleteRequest,
    handleConfirmDelete,
    clearDeleteTarget,
  } = useSessions();

  const groupProps = { onDelete: handleDeleteRequest, deletingId, labels, t };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('nav.sidebar.sessions')}
        description={t('sessions.intro')}
        actions={
          <Button size="lg" onClick={() => navigate('/interview/new')}>
            {t('dashboard.newInterview')}
          </Button>
        }
      />

      {actionError ? <Alert>{actionError}</Alert> : null}

      {loading ? (
        <LoadingState message={t('dashboard.loadingSessions')} />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : sessions.length === 0 ? (
        <EmptyState title={t('dashboard.empty')}>
          <Button onClick={() => navigate('/interview/new')}>{t('dashboard.firstInterview')}</Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          <SessionGroup title={t('dashboard.groupLive')} sessions={grouped.live} {...groupProps} />
          <SessionGroup title={t('dashboard.groupDraft')} sessions={grouped.draft} {...groupProps} />
          <SessionGroup title={t('dashboard.groupCompleted')} sessions={grouped.completed} {...groupProps} />
          <SessionGroup title={t('dashboard.groupOther')} sessions={grouped.other} {...groupProps} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('dashboard.deleteTitle')}
        message={t('dashboard.deleteMessage', { target: deleteTargetLabel })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={clearDeleteTarget}
      />
    </div>
  );
}
