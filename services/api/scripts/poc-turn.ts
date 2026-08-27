/**
 * Step 3 PoC — text-only one turn (no microphone needed)
 *
 * Usage:
 *   npm run poc:turn -w @maju/api -- "저는 팀 프로젝트에서 백엔드 API를 담당했습니다."
 */
import { runInterviewTurn } from '../src/lib/openai.js';
import { env } from '../src/env.js';

const text = process.argv.slice(2).join(' ').trim();

async function main() {
  if (!env.openaiConfigured) {
    console.error('OPENAI_API_KEY is missing. Add it to MAJU/.env or services/api/.env');
    process.exit(1);
  }

  if (!text) {
    console.error('Usage: npm run poc:turn -w @maju/api -- "지원자 답변 텍스트"');
    process.exit(1);
  }

  console.log('--- User ---');
  console.log(text);
  console.log('\nProcessing STT(skip) → LLM → TTS...\n');

  const result = await runInterviewTurn({
    userTranscript: text,
    config: {
      persona: 'pressure',
      language: 'ko',
      peerIntensity: 'medium',
      durationMinutes: 15,
      jobPostingText: '신입 백엔드 개발자 채용',
    },
  });

  console.log('--- Interviewer ---');
  console.log(result.interviewerText);
  console.log(`\nTTS audio: ${result.audio.length} bytes (mp3)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
