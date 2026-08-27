import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import { listSessions, retrySession } from '../lib/api.js';
import {
  formatSessionDate,
  PERSONA_LABELS,
  scoreAccentClass,
  STATUS_LABELS,
} from '../constants/interview.js';

function SessionCard({ session, onRetry, retryingId }) {
  const { config, status, createdAt, id, report, startedAt, endedAt } = session;
  const personaLabel = PERSONA_LABELS[config.persona] ?? config.persona;
  const isRetrying = retryingId === id;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-[#2AD175]/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              {STATUS_LABELS[status] ?? status}
            </p>
            {status === 'completed' && report?.overallScore != null ? (
              <span
                className={`rounded-full bg-[#F8FAFC] px-2 py-0.5 text-xs font-bold ${scoreAccentClass(report.overallScore)}`}
              >
                {report.overallScore}점
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 font-bold text-[#2A2A2A]">
            {personaLabel} · {config.durationMinutes}분
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
            {config.jobPostingText || config.cheatSheetText || '내용 없음'}
          </p>
          <p className="mt-3 text-xs text-[#94A3B8]">
            생성 {formatSessionDate(createdAt)}
            {endedAt ? ` · 종료 ${formatSessionDate(endedAt)}` : null}
            {!endedAt && startedAt ? ` · 시작 ${formatSessionDate(startedAt)}` : null}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'draft' ? (
          <Link to={`/interview/${id}/lobby`}>
            <Button size="sm">면접 시작</Button>
          </Link>
        ) : null}
        {status === 'live' ? (
          <Link to={`/interview/${id}/live`}>
            <Button size="sm">면접 계속</Button>
          </Link>
        ) : null}
        {status === 'completed' ? (
          <>
            <Link to={`/interview/${id}/report`}>
              <Button size="sm" variant="secondary">
                리포트 보기
              </Button>
            </Link>
            <Button
              size="sm"
              variant="secondary"
              disabled={isRetrying}
              onClick={() => onRetry(session)}
            >
              {isRetrying ? '생성 중…' : '같은 설정으로 재도전'}
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}

function SessionGroup({ title, sessions, onRetry, retryingId }) {
  if (sessions.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRetry={onRetry}
            retryingId={retryingId}
          />
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryingId, setRetryingId] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let mounted = true;

    listSessions()
      .then((data) => {
        if (mounted) setSessions(data.sessions ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message ?? '세션 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const live = sessions.filter((s) => s.status === 'live');
    const draft = sessions.filter((s) => s.status === 'draft');
    const completed = sessions.filter((s) => s.status === 'completed');
    const other = sessions.filter(
      (s) => s.status !== 'live' && s.status !== 'draft' && s.status !== 'completed',
    );
    return { live, draft, completed, other };
  }, [sessions]);

  async function handleRetry(session) {
    setActionError('');
    setRetryingId(session.id);
    try {
      const { session: newSession } = await retrySession(session.config);
      navigate(`/interview/${newSession.id}/lobby`);
    } catch (err) {
      setActionError(err.message ?? '재도전 세션 생성에 실패했습니다.');
    } finally {
      setRetryingId(null);
    }
  }

  const totalCompleted = grouped.completed.length;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#64748B]">대시보드</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            안녕하세요
            {user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ''}
          </h1>
          <p className="mt-3 max-w-xl text-[#64748B]">
            면접 설정 → Live 진행 → AI 리포트까지 한 사이클을 완주해 보세요.
            {totalCompleted > 0 ? ` 완료한 면접 ${totalCompleted}건.` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/interview/demo">
            <Button variant="secondary" size="lg">
              UI 데모
            </Button>
          </Link>
          <Link to="/interview/new">
            <Button size="lg">새 면접 시작</Button>
          </Link>
        </div>
      </section>

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[#64748B]">불러오는 중…</p>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-8 text-center">
          <p className="text-sm text-[#64748B]">아직 저장된 면접이 없습니다.</p>
          <Link to="/interview/new" className="mt-4 inline-block">
            <Button>첫 면접 설정하기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <SessionGroup
            title="진행 중"
            sessions={grouped.live}
            onRetry={handleRetry}
            retryingId={retryingId}
          />
          <SessionGroup
            title="설정 완료"
            sessions={grouped.draft}
            onRetry={handleRetry}
            retryingId={retryingId}
          />
          <SessionGroup
            title="완료"
            sessions={grouped.completed}
            onRetry={handleRetry}
            retryingId={retryingId}
          />
          <SessionGroup
            title="기타"
            sessions={grouped.other}
            onRetry={handleRetry}
            retryingId={retryingId}
          />
        </div>
      )}
    </div>
  );
}
