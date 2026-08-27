import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Textarea } from '@maju/ui';
import { Mic, Square, Play } from 'lucide-react';
import { PERSONA_OPTIONS } from '../constants/interview.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { playBase64Audio, pocTurnAudio, pocTurnText } from '../lib/api.js';

function OptionCard({ selected, title, description, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border-2 p-3 text-left transition-colors ${
        selected
          ? 'border-[#2AD175] bg-[#E3F58F]/15'
          : 'border-gray-200 bg-white hover:border-[#2AD175]/40'
      }`}
    >
      <p className="text-sm font-semibold text-[#2A2A2A]">{title}</p>
      <p className="mt-1 text-xs text-[#64748B]">{description}</p>
    </button>
  );
}

export default function InterviewPocPage() {
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();

  const [persona, setPersona] = useState('pressure');
  const [jobPostingText, setJobPostingText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleTextSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await pocTurnText({
        text: textInput.trim(),
        persona,
        jobPostingText: jobPostingText.trim() || undefined,
      });
      setResult(data);
      await playBase64Audio(data.audioBase64, data.audioMimeType);
    } catch (err) {
      setError(err.message ?? 'PoC 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordToggle() {
    setError('');
    setResult(null);

    if (isRecording) {
      setLoading(true);
      try {
        const blob = await stopRecording();
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('persona', persona);
        if (jobPostingText.trim()) {
          formData.append('jobPostingText', jobPostingText.trim());
        }

        const data = await pocTurnAudio(formData);
        setResult(data);
        setTextInput(data.userTranscript);
        await playBase64Audio(data.audioBase64, data.audioMimeType);
      } catch (err) {
        setError(err.message ?? '음성 PoC에 실패했습니다.');
      } finally {
        setLoading(false);
      }
      return;
    }

    await startRecording();
  }

  async function replayAudio() {
    if (!result?.audioBase64) return;
    await playBase64Audio(result.audioBase64, result.audioMimeType);
  }

  return (
    <div className="space-y-8">
      <section>
        <Link to="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-[#2A2A2A]">
          ← 대시보드
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">AI PoC · 한 턴 테스트</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
          STT(Whisper) → LLM(GPT) → TTS(OpenAI) 파이프라인을 검증합니다. Step 4 Live 연동 전
          테스트용입니다.
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-[#64748B]">면접관 페르소나</p>
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

      <section>
        <label htmlFor="poc-job" className="mb-1.5 block text-sm font-medium text-[#64748B]">
          채용 공고 맥락 (선택)
        </label>
        <Textarea
          id="poc-job"
          rows={3}
          value={jobPostingText}
          onChange={(e) => setJobPostingText(e.target.value)}
          placeholder="공고를 넣으면 AI 면접관이 맥락에 맞게 질문합니다."
        />
      </section>

      <section className="rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-6">
        <h2 className="font-bold">방법 A · 음성 녹음</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          버튼을 눌러 녹음 시작 → 다시 눌러 종료 및 AI 응답 생성
        </p>
        <Button
          type="button"
          className="mt-4"
          variant={isRecording ? 'secondary' : 'primary'}
          disabled={loading}
          onClick={handleRecordToggle}
        >
          {isRecording ? (
            <>
              <Square className="mr-2 inline h-4 w-4" />
              녹음 종료 & AI 응답
            </>
          ) : (
            <>
              <Mic className="mr-2 inline h-4 w-4" />
              녹음 시작
            </>
          )}
        </Button>
        {recorderError ? (
          <p className="mt-3 text-sm text-red-600">{recorderError}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold">방법 B · 텍스트 입력</h2>
        <form onSubmit={handleTextSubmit} className="mt-4 space-y-4">
          <Textarea
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="지원자 답변을 직접 입력해도 됩니다. (STT 생략)"
            required
          />
          <Button type="submit" disabled={loading || isRecording}>
            {loading ? 'AI 처리 중…' : '텍스트로 한 턴 실행'}
          </Button>
        </form>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <section className="space-y-4 rounded-2xl border border-[#2AD175]/30 bg-[#E3F58F]/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748B]">지원자 (STT / 입력)</p>
            <p className="mt-2 text-sm leading-relaxed text-[#2A2A2A]">{result.userTranscript}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#64748B]">AI 면접관</p>
            <p className="mt-2 text-sm leading-relaxed text-[#2A2A2A]">{result.interviewerText}</p>
          </div>
          <Button type="button" variant="secondary" onClick={replayAudio}>
            <Play className="mr-2 inline h-4 w-4" />
            TTS 다시 듣기
          </Button>
        </section>
      ) : null}
    </div>
  );
}
