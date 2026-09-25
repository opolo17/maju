import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, ChevronRight, MessageSquare, Users, X } from 'lucide-react';
import { Button } from '@maju/ui';
import { scoreAccentClass } from '../../constants/interview.js';
import { getSessionDisplayTitle } from '../../lib/interview-session.js';
import { getLowestRubricEntry, getSessionFeedbackSnippet } from '../../lib/growth-stats.js';
import RubricMiniBars from './RubricMiniBars.jsx';

export default function SessionCard({
  session,
  onDelete,
  deletingId,
  labels,
  t,
  variant = 'default',
}) {
  const navigate = useNavigate();
  const { config, status, createdAt, id, report, startedAt, endedAt } = session;
  const cardTitle = getSessionDisplayTitle(session, labels.getPersonaLabel, t);
  const personaLabel = labels.getPersonaLabel(config.persona);
  const isCompleted = status === 'completed';
  const isDeleting = deletingId === id;
  const isCompact = variant === 'compact';
  const isList = variant === 'list';

  function openReport() {
    navigate(`/interview/${id}/report`);
  }

  function handleDeleteClick(event) {
    event.stopPropagation();
    if (!isDeleting) onDelete(session);
  }

  function handleCardKeyDown(event) {
    if (!isCompleted) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openReport();
    }
  }

  const dateLabel = endedAt
    ? labels.formatSessionDate(endedAt)
    : startedAt
      ? labels.formatSessionDate(startedAt)
      : labels.formatSessionDate(createdAt);

  const listIcon =
    status === 'live' ? MessageSquare : status === 'draft' ? Briefcase : Users;

  if (isList) {
    const feedback = isCompleted ? getSessionFeedbackSnippet(report) : null;
    const ListIcon = listIcon;

    return (
      <article
        className={`group flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 transition-colors ${
          isCompleted
            ? 'cursor-pointer hover:bg-maju-highlight/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maju-accent/30'
            : ''
        } ${isDeleting ? 'opacity-60' : ''}`}
        onClick={isCompleted ? openReport : undefined}
        onKeyDown={handleCardKeyDown}
        role={isCompleted ? 'button' : undefined}
        tabIndex={isCompleted ? 0 : undefined}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maju-highlight/40 text-maju-accent">
          <ListIcon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-maju-text">{cardTitle}</h3>
          <p className="mt-0.5 text-[11px] text-maju-subtle">
            {personaLabel} · {dateLabel}
          </p>
          {feedback ? (
            <p className="mt-1 line-clamp-1 text-xs text-maju-muted">{feedback}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isCompleted && report?.overallScore != null ? (
            <span
              className={`rounded-lg px-2.5 py-0.5 text-sm font-bold tabular-nums ${
                report.overallScore >= 60
                  ? 'bg-maju-accent/15 text-maju-accent'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {report.overallScore}
            </span>
          ) : null}

          {isCompleted ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-maju-accent opacity-0 transition group-hover:opacity-100">
              {t('dashboard.session.viewReport')}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
          ) : status === 'draft' ? (
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/interview/${id}/lobby`);
              }}
            >
              {t('dashboard.prepare')}
            </Button>
          ) : status === 'live' ? (
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/interview/${id}/live`);
              }}
            >
              {t('dashboard.continue')}
            </Button>
          ) : null}
        </div>
      </article>
    );
  }

  if (variant === 'dashboard') {
    const feedback = isCompleted ? getSessionFeedbackSnippet(report) : null;
    const lowestRubric = report?.rubric ? getLowestRubricEntry(report.rubric) : null;

    return (
      <article
        className={`group flex h-full min-h-[8.5rem] flex-col gap-2 p-3 transition-colors ${
          isCompleted
            ? 'cursor-pointer hover:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maju-accent/30'
            : ''
        } ${isDeleting ? 'opacity-60' : ''}`}
        onClick={isCompleted ? openReport : undefined}
        onKeyDown={handleCardKeyDown}
        role={isCompleted ? 'button' : undefined}
        tabIndex={isCompleted ? 0 : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-maju-muted">
            {labels.getStatusLabel(status)}
          </span>
          {isCompleted && report?.overallScore != null ? (
            <span
              className={`rounded-md bg-maju-surface px-2 py-0.5 text-sm font-bold tabular-nums ${scoreAccentClass(report.overallScore)}`}
            >
              {report.overallScore}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-maju-text">{cardTitle}</h3>
          <p className="mt-1 text-[11px] text-maju-subtle">
            {personaLabel} · {dateLabel}
          </p>
          {feedback ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-maju-muted">{feedback}</p>
          ) : null}
        </div>

        {report?.rubric ? (
          <RubricMiniBars
            rubric={report.rubric}
            labels={labels.rubricLabels}
            highlightKey={lowestRubric?.key ?? null}
            compact
          />
        ) : null}

        {!isCompleted ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {status === 'draft' ? (
              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/interview/${id}/lobby`)}>
                {t('dashboard.prepare')}
              </Button>
            ) : null}
            {status === 'live' ? (
              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/interview/${id}/live`)}>
                {t('dashboard.continue')}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-auto flex justify-end">
            <ChevronRight className="h-4 w-4 text-maju-subtle opacity-0 transition group-hover:opacity-100" aria-hidden />
          </div>
        )}
      </article>
    );
  }

  if (isCompact) {
    return (
      <article
        className={`group flex items-center gap-2 px-3 py-2 transition-colors ${
          isCompleted
            ? 'cursor-pointer hover:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maju-accent/30'
            : ''
        } ${isDeleting ? 'opacity-60' : ''}`}
        onClick={isCompleted ? openReport : undefined}
        onKeyDown={handleCardKeyDown}
        role={isCompleted ? 'button' : undefined}
        tabIndex={isCompleted ? 0 : undefined}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-maju-muted">
              {labels.getStatusLabel(status)}
            </span>
            <h3 className="truncate text-sm font-medium text-maju-text">{cardTitle}</h3>
          </div>
          <p className="mt-0.5 truncate text-xs text-maju-subtle">
            {personaLabel} · {t('common.minutes', { n: config.durationMinutes })} · {dateLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isCompleted && report?.overallScore != null ? (
            <span
              className={`rounded-md bg-maju-surface px-2 py-0.5 text-xs font-bold tabular-nums ${scoreAccentClass(report.overallScore)}`}
            >
              {report.overallScore}
            </span>
          ) : null}

          {!isCompleted ? (
            <>
              {status === 'draft' ? (
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => navigate(`/interview/${id}/lobby`)}
                >
                  {t('dashboard.prepare')}
                </Button>
              ) : null}
              {status === 'live' ? (
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => navigate(`/interview/${id}/live`)}
                >
                  {t('dashboard.continue')}
                </Button>
              ) : null}
              <button
                type="button"
                aria-label={t('common.delete')}
                disabled={isDeleting}
                onClick={handleDeleteClick}
                className="rounded-md p-1 text-maju-subtle transition-colors hover:bg-maju-surface hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label={t('common.delete')}
                disabled={isDeleting}
                onClick={handleDeleteClick}
                className="rounded-md p-1 text-maju-subtle opacity-0 transition-all hover:bg-maju-surface hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
              <ChevronRight className="h-4 w-4 text-maju-subtle" aria-hidden />
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 ${
        isCompleted
          ? 'cursor-pointer hover:border-gray-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maju-accent/30 focus-visible:ring-offset-2'
          : 'hover:border-gray-200'
      } ${isDeleting ? 'opacity-60' : ''}`}
      onClick={isCompleted ? openReport : undefined}
      onKeyDown={handleCardKeyDown}
      role={isCompleted ? 'button' : undefined}
      tabIndex={isCompleted ? 0 : undefined}
    >
      {isCompleted ? (
        <button
          type="button"
          aria-label={t('common.delete')}
          disabled={isDeleting}
          onClick={handleDeleteClick}
          className="absolute right-2.5 top-2.5 rounded-md p-1 text-maju-subtle transition-colors hover:bg-maju-surface hover:text-maju-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ) : null}

      <div className={`flex flex-wrap items-start justify-between gap-3 ${isCompleted ? 'pr-8' : ''}`}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-maju-muted">
              {labels.getStatusLabel(status)}
            </p>
            {isCompleted && report?.overallScore != null ? (
              <span
                className={`rounded-full bg-maju-surface px-2 py-0.5 text-xs font-bold ${scoreAccentClass(report.overallScore)}`}
              >
                {t('common.points', { n: report.overallScore })}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-sm font-medium text-maju-text">{cardTitle}</h3>
          <p className="mt-1 text-xs text-maju-subtle">
            {personaLabel} · {t('common.minutes', { n: config.durationMinutes })}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-maju-muted">
            {config.jobPostingText || config.cheatSheetText || t('common.noContent')}
          </p>
          <p className="mt-2 text-xs text-maju-subtle">
            {t('common.createdAt', { date: labels.formatSessionDate(createdAt) })}
            {endedAt
              ? ` · ${t('common.endedAt', { date: labels.formatSessionDate(endedAt) })}`
              : null}
            {!endedAt && startedAt
              ? ` · ${t('common.startedAt', { date: labels.formatSessionDate(startedAt) })}`
              : null}
          </p>
        </div>
      </div>

      {!isCompleted ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'draft' ? (
            <Button size="sm" onClick={() => navigate(`/interview/${id}/lobby`)}>
              {t('dashboard.prepare')}
            </Button>
          ) : null}
          {status === 'live' ? (
            <Button size="sm" onClick={() => navigate(`/interview/${id}/live`)}>
              {t('dashboard.continue')}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            disabled={isDeleting}
            onClick={() => onDelete(session)}
            className="text-red-600 hover:border-red-200 hover:bg-red-50"
          >
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
