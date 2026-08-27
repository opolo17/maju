import type { PersonaId } from '@maju/types';
import { Hono } from 'hono';
import { requireAuth, type AuthVariables } from '../middleware/auth.js';
import { env } from '../env.js';
import { runInterviewTurn, runInterviewTurnFromAudio } from '../lib/openai.js';

const poc = new Hono<{ Variables: AuthVariables }>();

poc.post('/turn', requireAuth, async (c) => {
  if (!env.openaiConfigured) {
    return c.json(
      {
        error: 'openai_not_configured',
        message: 'OPENAI_API_KEY is required in MAJU/.env or services/api/.env',
      },
      503,
    );
  }

  const contentType = c.req.header('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const audioEntry = body.audio;

      if (!audioEntry || typeof audioEntry === 'string') {
        return c.json({ error: 'invalid_audio', message: 'audio file is required' }, 400);
      }

      const persona = parsePersona(body.persona);
      const jobPostingText = stringField(body.jobPostingText);
      const cheatSheetText = stringField(body.cheatSheetText);

      const arrayBuffer = await audioEntry.arrayBuffer();
      const audio = Buffer.from(arrayBuffer);
      const filename = audioEntry.name || 'recording.webm';

      const result = await runInterviewTurnFromAudio(audio, filename, {
        persona,
        jobPostingText,
        cheatSheetText,
        language: 'ko',
        peerIntensity: 'medium',
        durationMinutes: 15,
      });

      return c.json({
        userTranscript: result.userTranscript,
        interviewerText: result.interviewerText,
        audioBase64: result.audio.toString('base64'),
        audioMimeType: 'audio/mpeg',
      });
    }

    const json = await c.req.json<{
      text?: string;
      persona?: PersonaId;
      jobPostingText?: string;
      cheatSheetText?: string;
    }>();

    const text = json.text?.trim();
    if (!text) {
      return c.json({ error: 'invalid_text', message: 'text is required for JSON requests' }, 400);
    }

    const result = await runInterviewTurn({
      userTranscript: text,
      config: {
        persona: json.persona ?? 'pressure',
        jobPostingText: json.jobPostingText,
        cheatSheetText: json.cheatSheetText,
        language: 'ko',
        peerIntensity: 'medium',
        durationMinutes: 15,
      },
    });

    return c.json({
      userTranscript: result.userTranscript,
      interviewerText: result.interviewerText,
      audioBase64: result.audio.toString('base64'),
      audioMimeType: 'audio/mpeg',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PoC turn failed';
    return c.json({ error: 'poc_turn_failed', message }, 500);
  }
});

function parsePersona(value: unknown): PersonaId | undefined {
  if (value === 'gentle' || value === 'pressure' || value === 'followup') {
    return value;
  }
  return undefined;
}

function stringField(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export { poc };
