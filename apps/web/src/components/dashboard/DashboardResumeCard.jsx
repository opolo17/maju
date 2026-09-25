import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { Button } from '@maju/ui';
import { getSessionDisplayTitle } from '../../lib/interview-session.js';

export default function DashboardResumeCard({ session, labels, t }) {
  const navigate = useNavigate();
  const isLive = session.status === 'live';
  const title = getSessionDisplayTitle(session, labels.getPersonaLabel, t);

  function handleContinue() {
    navigate(isLive ? `/interview/${session.id}/live` : `/interview/${session.id}/lobby`);
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-maju-accent/25 bg-gradient-to-r from-maju-highlight/50 to-maju-highlight/20 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-maju-accent">
          <PlayCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-maju-muted">{t('dashboard.resume.label')}</p>
          <h2 className="truncate text-sm font-semibold text-maju-text">{title}</h2>
          <p className="truncate text-xs text-maju-subtle">
            {isLive ? t('dashboard.resume.liveDesc') : t('dashboard.resume.draftDesc')}
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleContinue}>
        {isLive ? t('dashboard.continue') : t('dashboard.prepare')}
      </Button>
    </section>
  );
}
