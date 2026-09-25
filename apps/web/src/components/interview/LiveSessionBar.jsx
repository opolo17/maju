import { formatTimerDisplay } from '../../lib/interview-session.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';

/**
 * Timer + question progress bar for Live interview.
 */
export default function LiveSessionBar({
  remainingSec,
  turnCount,
  estimatedQuestions,
  sessionTitle,
}) {
  const { t } = useI18n();

  if (remainingSec == null) return null;

  const isExpired = remainingSec <= 0;
  const isUrgent = !isExpired && remainingSec <= 60;
  const isWarning = !isExpired && remainingSec <= 300 && remainingSec > 60;

  let timerHint = null;
  if (isExpired) {
    timerHint = t('interview.live.timerExpired');
  } else if (remainingSec <= 60) {
    timerHint = t('interview.live.timerWarning1');
  } else if (remainingSec <= 300) {
    timerHint = t('interview.live.timerWarning5');
  }

  const timerClass = isExpired
    ? 'border-red-400/40 bg-red-500/15 text-red-200'
    : isUrgent
      ? 'border-amber-400/40 bg-amber-500/15 text-amber-100'
      : isWarning
        ? 'border-maju-accent/40 bg-maju-accent/10 text-maju-accent'
        : 'border-white/15 bg-white/5 text-white/80';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-2">
      {sessionTitle ? (
        <p className="truncate text-center text-sm font-semibold text-white/90">{sessionTitle}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums ${timerClass}`}
          role="timer"
          aria-live="polite"
        >
          <span>{formatTimerDisplay(remainingSec)}</span>
          <span className="font-normal opacity-80">{t('interview.live.timerRemaining')}</span>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
          {t('interview.live.progressQuestions', {
            current: Math.min(turnCount, estimatedQuestions),
            total: estimatedQuestions,
          })}
        </div>
      </div>
      {timerHint ? (
        <p
          className={`text-center text-xs font-medium ${
            isExpired || isUrgent ? 'text-amber-200' : 'text-maju-accent'
          }`}
        >
          {timerHint}
        </p>
      ) : null}
    </div>
  );
}
