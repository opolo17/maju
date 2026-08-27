import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@maju/ui';
import { getSessionReport, retrySession } from '../lib/api.js';
import {
  formatSessionDate,
  PERSONA_LABELS,
  scoreAccentClass,
  scoreLabel,
  STATUS_LABELS,
} from '../constants/interview.js';

const TURN_ROLE_LABELS = {
  user: '나',
  interviewer: 'AI 면접관',
};

export default function InterviewReportPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(location.state?.session ?? null);
  const [report, setReport] = useState(location.state?.report ?? null);
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getSessionReport(id);
        if (!mounted) return;
        setSession(data.session);
        setReport(data.report);
        setTurns(data.turns ?? []);
      } catch (err) {
        if (!mounted) return;
        if (location.state?.report && location.state?.session) {
          setSession(location.state.session);
          setReport(location.state.report);
          setError('');
        } else {
          setError(err.message ?? '리포트를 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, location.state?.report, location.state?.session]);

  async function handleRetry() {
    if (!session?.config) return;
    setRetrying(true);
    try {
      const { session: newSession } = await retrySession(session.config);
      navigate(`/interview/${newSession.id}/lobby`);
    } catch (err) {
      setError(err.message ?? '재도전 세션 생성에 실패했습니다.');
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#64748B]">리포트 불러오는 중…</p>;
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || '세션을 찾을 수 없습니다.'}
        </p>
        <Link to="/dashboard">
          <Button variant="secondary">대시보드로</Button>
        </Link>
      </div>
    );
  }

  const personaLabel = PERSONA_LABELS[session.config.persona] ?? session.config.persona;
  const userTurnCount = turns.filter((turn) => turn.role === 'user').length;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section>
        <Link to="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-[#2A2A2A]">
          ← 대시보드
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">면접 리포트</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          {personaLabel} · {STATUS_LABELS[session.status] ?? session.status}
          {session.endedAt ? ` · ${formatSessionDate(session.endedAt)}` : ''}
        </p>
      </section>

      {report ? (
        <section className="rounded-2xl border border-[#2AD175]/30 bg-[#E3F58F]/10 p-6 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#64748B]">종합 점수</p>
              <p className={`mt-1 text-4xl font-bold ${scoreAccentClass(report.overallScore)}`}>
                {report.overallScore}
              </p>
              <p className="mt-1 text-sm font-medium text-[#64748B]">
                {scoreLabel(report.overallScore)}
              </p>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {userTurnCount}턴 답변 · AI 생성 {formatSessionDate(report.generatedAt)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#64748B]">요약</p>
            <p className="mt-2 text-sm leading-relaxed text-[#2A2A2A]">{report.summary}</p>
          </div>
          {report.strengths?.length ? (
            <div>
              <p className="text-sm font-semibold text-[#64748B]">강점</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#2A2A2A]">
                {report.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.improvements?.length ? (
            <div>
              <p className="text-sm font-semibold text-[#64748B]">개선 포인트</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#2A2A2A]">
                {report.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-[#64748B]">리포트가 아직 없습니다.</p>
      )}

      {report?.deliveryInsights ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold">Delivery 분석 (HUD)</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-[#64748B]">평균 말하기 속도</dt>
              <dd className="font-semibold text-[#2A2A2A]">
                {report.deliveryInsights.avgSyllableRate != null
                  ? `${report.deliveryInsights.avgSyllableRate.toFixed(1)} 음절/초`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[#64748B]">기준 속도 (보정)</dt>
              <dd className="font-semibold text-[#2A2A2A]">
                {report.deliveryInsights.baselineSyllableRate != null
                  ? `${report.deliveryInsights.baselineSyllableRate.toFixed(1)} 음절/초`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[#64748B]">침묵/정적</dt>
              <dd className="font-semibold text-[#2A2A2A]">
                {report.deliveryInsights.silenceEpisodeCount}회 · 총 {report.deliveryInsights.totalSilenceSec}초
                {report.deliveryInsights.longestSilenceSec > 0
                  ? ` (최장 ${report.deliveryInsights.longestSilenceSec}초)`
                  : ''}
              </dd>
            </div>
            <div>
              <dt className="text-[#64748B]">말하기 템포</dt>
              <dd className="font-semibold text-[#2A2A2A]">
                빠름 {report.deliveryInsights.fastSpeechAlerts}회 · 느림 {report.deliveryInsights.slowSpeechAlerts}회
              </dd>
            </div>
            <div>
              <dt className="text-[#64748B]">시선</dt>
              <dd className="font-semibold text-[#2A2A2A]">
                이탈 {report.deliveryInsights.gazeAwayAlerts}회 · 미검출 {report.deliveryInsights.noFaceAlerts}회
              </dd>
            </div>
            <div>
              <dt className="text-[#64748B]">추적 시간</dt>
              <dd className="font-semibold text-[#2A2A2A]">약 {report.deliveryInsights.trackedSec}초</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">대화 기록 ({turns.length}턴)</h2>
        {turns.length === 0 ? (
          <p className="text-sm text-[#64748B]">저장된 대화가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {turns.map((turn) => (
              <div
                key={turn.id}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  turn.role === 'user'
                    ? 'border-gray-200 bg-[#F8FAFC]'
                    : 'border-[#2AD175]/20 bg-white'
                }`}
              >
                <p className="text-xs font-semibold uppercase text-[#64748B]">
                  {TURN_ROLE_LABELS[turn.role] ?? turn.role}
                </p>
                <p className="mt-1 leading-relaxed text-[#2A2A2A]">{turn.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
        <Link to="/dashboard">
          <Button variant="secondary">대시보드로</Button>
        </Link>
        <Link to="/interview/new">
          <Button variant="secondary">새 면접 시작</Button>
        </Link>
        <Button disabled={retrying} onClick={handleRetry}>
          {retrying ? '생성 중…' : '같은 설정으로 재도전'}
        </Button>
      </section>
    </div>
  );
}
