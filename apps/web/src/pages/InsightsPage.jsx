import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, EmptyState, PageHeader } from '@maju/ui';
import DashboardRecommendedRetry from '../components/dashboard/DashboardRecommendedRetry.jsx';
import GrowthPanel from '../components/dashboard/GrowthPanel.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useSessions } from '../hooks/useSessions.js';
import { useI18n } from '../i18n/LanguageContext.jsx';

function sessionActivityAt(session) {
  return session.endedAt ?? session.startedAt ?? session.createdAt;
}

export default function InsightsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { loading, error, growthStats, grouped } = useSessions();

  const hasInsights = growthStats.completedCount > 0;

  const latestCompleted = useMemo(() => {
    return [...grouped.completed]
      .filter((session) => session.report?.overallScore != null)
      .sort(
        (a, b) =>
          new Date(sessionActivityAt(b)).getTime() - new Date(sessionActivityAt(a)).getTime(),
      )[0];
  }, [grouped.completed]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('nav.sidebar.insights')}
        description={t('insights.intro')}
        actions={
          hasInsights ? (
            <Button size="lg" onClick={() => navigate('/interview/new')}>
              {t('insights.practiceCta')}
            </Button>
          ) : null
        }
      />

      {loading ? (
        <LoadingState message={t('dashboard.loadingSessions')} />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : !hasInsights ? (
        <EmptyState title={t('insights.emptyTitle')} description={t('insights.emptyDesc')}>
          <Button onClick={() => navigate('/interview/new')}>{t('dashboard.firstInterview')}</Button>
        </EmptyState>
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          <GrowthPanel
            stats={growthStats}
            sections={['header', 'summary', 'chart', 'rubric', 'weaknesses']}
            split
          />
          {latestCompleted ? (
            <DashboardRecommendedRetry
              session={latestCompleted}
              report={latestCompleted.report}
              t={t}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
