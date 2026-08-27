import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Textarea } from '@maju/ui';
import { createSession } from '../lib/api.js';
import {
  DURATION_OPTIONS,
  PEER_INTENSITY_OPTIONS,
  PERSONA_OPTIONS,
} from '../constants/interview.js';

const fieldClass =
  'w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-[#2A2A2A] outline-none transition-shadow focus:border-[#2AD175] focus:ring-2 focus:ring-[#2AD175]/25';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#64748B]';

function OptionCard({ selected, title, description, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border-2 p-4 text-left transition-colors ${
        selected
          ? 'border-[#2AD175] bg-[#E3F58F]/15'
          : 'border-gray-200 bg-white hover:border-[#2AD175]/40'
      }`}
    >
      <p className="font-semibold text-[#2A2A2A]">{title}</p>
      <p className="mt-1 text-sm text-[#64748B]">{description}</p>
    </button>
  );
}

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [jobPostingText, setJobPostingText] = useState('');
  const [cheatSheetText, setCheatSheetText] = useState('');
  const [persona, setPersona] = useState('pressure');
  const [peerIntensity, setPeerIntensity] = useState('medium');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmedJob = jobPostingText.trim();
    const trimmedCheat = cheatSheetText.trim();

    if (!trimmedJob && !trimmedCheat) {
      setError('채용 공고 또는 면접 족보 중 하나 이상을 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const { session } = await createSession({
        jobPostingText: trimmedJob || undefined,
        cheatSheetText: trimmedCheat || undefined,
        persona,
        language: 'ko',
        peerIntensity,
        durationMinutes,
      });
      navigate(`/interview/${session.id}/lobby`, { replace: true });
    } catch (err) {
      setError(err.message ?? '면접 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-[#2A2A2A]">
          ← 대시보드
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">새 면접 설정</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          채용 공고와 AI 면접관 스타일을 설정하면 draft 세션이 저장됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="space-y-4">
          <div>
            <label htmlFor="jobPosting" className={labelClass}>
              채용 공고
            </label>
            <Textarea
              id="jobPosting"
              value={jobPostingText}
              onChange={(e) => setJobPostingText(e.target.value)}
              placeholder="채용 공고문을 붙여넣으세요. 직무·자격 요건·회사 소개 등이 포함되면 좋습니다."
              rows={6}
              variant="default"
              className="border-2 border-gray-200 bg-white py-3 text-sm text-[#2A2A2A] shadow-sm focus:border-[#2AD175] focus:ring-2 focus:ring-[#2AD175]/25"
            />
          </div>

          <div>
            <label htmlFor="cheatSheet" className={labelClass}>
              면접 족보 (선택)
            </label>
            <Textarea
              id="cheatSheet"
              value={cheatSheetText}
              onChange={(e) => setCheatSheetText(e.target.value)}
              placeholder="예상 질문, STAR 답변 메모, 준비 노트 등"
              rows={4}
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>AI 면접관 페르소나</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PERSONA_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                selected={persona === option.id}
                title={option.label}
                description={option.description}
                onSelect={() => setPersona(option.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>피어 프레셔 (가상 지원자 강도)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PEER_INTENSITY_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                selected={peerIntensity === option.id}
                title={option.label}
                description={option.description}
                onSelect={() => setPeerIntensity(option.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <label htmlFor="duration" className={labelClass}>
            면접 시간
          </label>
          <select
            id="duration"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className={fieldClass}
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? '저장 중…' : '면접 저장하기'}
          </Button>
          <Link to="/dashboard">
            <Button type="button" variant="secondary" size="lg">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
