import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Alert, Button, EmptyState } from '@maju/ui';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DashboardCoachSidebar from '../components/dashboard/DashboardCoachSidebar.jsx';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import DashboardRecommendCard from '../components/dashboard/DashboardRecommendCard.jsx';
import DashboardResumeCard from '../components/dashboard/DashboardResumeCard.jsx';
import DashboardScoreCard from '../components/dashboard/DashboardScoreCard.jsx';
import DashboardTutorial from '../components/dashboard/DashboardTutorial.jsx';
import DashboardWeeklyCard from '../components/dashboard/DashboardWeeklyCard.jsx';
import SessionCard from '../components/dashboard/SessionCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useSessions } from '../hooks/useSessions.js';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';
import { dismissTutorial, isTutorialDismissed, loadOnboarding } from '../lib/user-preferences.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isDevToolsEnabled } from '../lib/dev.js';

function sessionActivityAt(session) {
  return session.endedAt ?? session.startedAt ?? session.createdAt;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const labels = useInterviewLabels();
  const navigate = useNavigate();

  const {
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
    clearDeleteTarget,
  } = useSessions();

  const [showTutorial, setShowTutorial] = useState(() => !isTutorialDismissed(user?.id));

  const resumeSession = grouped.live[0] ?? grouped.draft[0] ?? null;

  const latestCompleted = useMemo(() => {
    return [...grouped.completed]
      .filter((session) => session.report?.overallScore != null)
      .sort(
        (a, b) =>
          new Date(sessionActivityAt(b)).getTime() - new Date(sessionActivityAt(a)).getTime(),
      )[0];
  }, [grouped.completed]);

  const recentSessions = useMemo(() => {
    return [...grouped.live, ...grouped.draft, ...grouped.completed]
      .filter((session) => session.id !== resumeSession?.id)
      .slice(0, 5);
  }, [grouped.live, grouped.draft, grouped.completed, resumeSession?.id]);

  const hasAnySessions = sessions.length > 0;
  const hasCompleted = growthStats.completedCount > 0;
  const onboarding = loadOnboarding(user?.id);

  const subtitle = onboarding.goal
    ? t('dashboard.introGoal', { goal: t(`onboarding.goal.${onboarding.goal}.title`) })
    : hasCompleted
      ? t('dashboard.introReturning')
      : t('dashboard.intro');

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <DashboardHeader
          weeklyCount={hasCompleted ? growthStats.weeklyCompletedCount : 0}
          subtitle={subtitle}
        />
        {isDevToolsEnabled ? (
          <Button size="sm" variant="secondary" onClick={() => navigate('/interview/demo')}>
            {t('dashboard.devDemo')}
          </Button>
        ) : null}
      </div>

      {actionError ? <Alert>{actionError}</Alert> : null}

      {showTutorial ? (
        <DashboardTutorial
          onDismiss={() => {
            dismissTutorial(user?.id);
            setShowTutorial(false);
          }}
          onStart={() => navigate('/interview/new')}
        />
      ) : null}

      {loading ? (
        <LoadingState message={t('dashboard.loadingSessions')} />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : !hasAnySessions ? (
        <EmptyState title={t('dashboard.empty')}>
          <Button onClick={() => navigate('/interview/new')}>{t('dashboard.firstInterview')}</Button>
        </EmptyState>
      ) : (
        <div className="flex w-full flex-col gap-3">
          {resumeSession ? (
            <DashboardResumeCard session={resumeSession} labels={labels} t={t} />
          ) : null}

          {hasCompleted && latestCompleted ? (
            <div className="grid gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <DashboardRecommendCard
                  session={latestCompleted}
                  report={latestCompleted.report}
                  stats={growthStats}
                  t={t}
                />
              </div>
              <div className="lg:col-span-3">
                <DashboardScoreCard stats={growthStats} />
              </div>
              <div className="lg:col-span-3">
                <DashboardWeeklyCard weeklyCount={growthStats.weeklyCompletedCount} />
              </div>
            </div>
          ) : (
            <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-maju-text">{t('dashboard.hero.newInterviewTitle')}</h2>
                <p className="mt-1 text-sm text-maju-muted">{t('dashboard.hero.newInterviewDesc')}</p>
              </div>
              <Button
                className="shrink-0 bg-gradient-to-r from-maju-accent to-maju-highlight text-maju-text"
                onClick={() => navigate('/interview/new')}
              >
                {t('dashboard.newInterview')}
              </Button>
            </section>
          )}

          <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-stretch">
            {recentSessions.length > 0 ? (
              <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
                  <h2 className="text-sm font-bold text-maju-text">{t('dashboard.recentSessions')}</h2>
                  <Link
                    to="/sessions"
                    className="inline-flex items-center gap-1 text-xs font-medium text-maju-muted transition hover:text-maju-accent"
                  >
                    {t('dashboard.viewAllSessions')}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
                <ul>
                  {recentSessions.map((session) => (
                    <li key={session.id}>
                      <SessionCard
                        session={session}
                        onDelete={handleDeleteRequest}
                        deletingId={deletingId}
                        labels={labels}
                        t={t}
                        variant="list"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasCompleted ? <DashboardCoachSidebar stats={growthStats} /> : null}
          </div>
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
