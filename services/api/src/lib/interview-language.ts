import type { InterviewConfig, Locale } from '@maju/types';

export function resolveInterviewLanguage(config?: Partial<InterviewConfig>): Locale {
  const lang = config?.language;
  if (lang === 'ko' || lang === 'en' || lang === 'ja') return lang;
  return 'ko';
}

/** Whisper `language` param (ISO-639-1) */
export function whisperLanguageCode(locale: Locale): string {
  return locale;
}

export function outputLanguageRule(locale: Locale): string {
  const rules: Record<Locale, string> = {
    ko: '모든 출력(면접관 발화·질문·마무리)은 반드시 한국어로 작성하세요.',
    en: 'All output (interviewer speech, questions, closing remarks) MUST be in English.',
    ja: 'すべての出力（面接官の発話・質問・締めの挨拶）は必ず日本語で書いてください。',
  };
  return rules[locale];
}

export function peerOutputLanguageRule(locale: Locale): string {
  const rules: Record<Locale, string> = {
    ko: '답변은 반드시 한국어로 작성하세요.',
    en: 'Write the answer strictly in English.',
    ja: '回答は必ず日本語で書いてください。',
  };
  return rules[locale];
}

export function peerPersonaLanguageGuide(locale: Locale): string {
  const guides: Record<Locale, string> = {
    ko: '이름·headline·background·experiences·tone 모두 한국어로 작성하세요. 이름은 한국어 실명.',
    en: 'Write name, headline, background, experiences, and tone in English. Use realistic English names.',
    ja: 'name・headline・background・experiences・tone はすべて日本語で書いてください。名前は日本語の実名。',
  };
  return guides[locale];
}

export function defaultClosingRemark(locale: Locale): string {
  const remarks: Record<Locale, string> = {
    ko: '오늘 면접은 여기까지입니다. 답변해 주셔서 감사합니다. 수고하셨습니다.',
    en: "That concludes today's interview. Thank you for your answers — well done.",
    ja: '本日の面接はここまでです。ご回答ありがとうございました。お疲れさまでした。',
  };
  return remarks[locale];
}

export function sttEmptyError(locale: Locale): string {
  const errors: Record<Locale, string> = {
    ko: '음성에서 텍스트를 인식하지 못했습니다.',
    en: 'Could not transcribe speech from the audio.',
    ja: '音声からテキストを認識できませんでした。',
  };
  return errors[locale];
}

export function openingUserPrompt(locale: Locale): string {
  const prompts: Record<Locale, string> = {
    ko: '면접을 시작해 주세요.',
    en: 'Please start the interview.',
    ja: '面接を開始してください。',
  };
  return prompts[locale];
}

export function closingUserPrompt(locale: Locale): string {
  const prompts: Record<Locale, string> = {
    ko: '면접 시간이 종료되었습니다. 면접관 마무리 멘트를 해 주세요.',
    en: 'Interview time is up. Please give a closing remark as the interviewer.',
    ja: '面接時間が終了しました。面接官として締めの挨拶をお願いします。',
  };
  return prompts[locale];
}

export function candidateAnswerLabel(locale: Locale, turnIndex: number): string {
  const labels: Record<Locale, string> = {
    ko: `지원자 답변 (${turnIndex}번째)`,
    en: `Candidate answer (turn ${turnIndex})`,
    ja: `候補者の回答（${turnIndex}回目）`,
  };
  return labels[locale];
}

export function jobPostingLabel(locale: Locale): string {
  return { ko: '채용 공고', en: 'Job posting', ja: '求人票' }[locale];
}

export function cheatSheetLabel(locale: Locale): string {
  return { ko: '면접 족보', en: 'Interview cheat sheet', ja: '面接メモ' }[locale];
}

export function defaultReportSummary(locale: Locale): string {
  const summaries: Record<Locale, string> = {
    ko: '면접이 완료되었습니다.',
    en: 'The interview has been completed.',
    ja: '面接が完了しました。',
  };
  return summaries[locale];
}

export function defaultQuestionFeedbackTip(locale: Locale): string {
  const tips: Record<Locale, string> = {
    ko: '답변 구조와 근거를 더 구체화해 보세요.',
    en: 'Try to make your answer structure and evidence more specific.',
    ja: '回答の構造と根拠をより具体化してみてください。',
  };
  return tips[locale];
}

export function looksLikeClosingRemark(text: string, locale: Locale): boolean {
  const normalized = text.trim().toLowerCase();
  const patterns: Record<Locale, string[]> = {
    ko: ['여기까지', '수고하', '감사합니다', '마무리'],
    en: ['concludes', 'thank you', 'well done', 'that wraps', 'end of'],
    ja: ['ここまで', 'ありがとう', 'お疲れ', '終了'],
  };
  return patterns[locale].some((p) => normalized.includes(p.toLowerCase()));
}
