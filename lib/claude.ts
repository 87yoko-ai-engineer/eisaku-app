import Anthropic from '@anthropic-ai/sdk';
import type { CorrectionResult, ChatMessage } from '@/types';

const client = new Anthropic();

function buildSystemPrompt(mode: 'free' | 'challenge', targetGrammar?: string, keywords?: string[]): string {
  const base = `You are an expert English writing coach for Japanese adult learners (TOEIC 600-800 level).
Analyze the English text and return corrections as a JSON object.

IMPORTANT RULES:
- "original" must be an EXACT substring of the input text (used for highlight matching)
- "explanation" must be in Japanese
- "example" must be in English
- "type" must be one of: grammar, vocab, tone, structure, spelling
- "score" ranges from 30 to 100 (start at 100, subtract for each issue)
- Keep corrections focused and meaningful — don't over-correct natural variations
- Do NOT correct the same span twice

Return ONLY valid JSON, no markdown:
{
  "score": number,
  "corrections": [
    {
      "id": number,
      "original": "exact phrase from input",
      "corrected": "corrected phrase",
      "type": "grammar|vocab|tone|structure|spelling",
      "brief": "short label in English",
      "explanation": "日本語での解説（なぜ誤りか、正しい用法）",
      "example": "Example sentence using the corrected form."
    }
  ],
  "summary": "全体的なフィードバック（日本語、1〜2文）"
}`;

  if (mode === 'challenge' && targetGrammar) {
    return base + `\n\nAdditionally, check whether the target grammar "${targetGrammar}" is used correctly.
Add these fields to the root JSON object:
- "grammarCheckPassed": boolean (true if target grammar appears and is used correctly at least once)
- "grammarScore": number 0-100 (quality of target grammar usage)
- "modelAnswer": string (a well-written model English sentence or short paragraph that naturally incorporates the target grammar "${targetGrammar}"${keywords?.length ? ` and uses ALL of these keywords/phrases: ${keywords.join(', ')}` : ''}, addressing the same topic as the learner's input; write in English only)
- "modelAnswerJa": string (Japanese translation of the modelAnswer)`;
  }

  return base;
}

export async function correctText(params: {
  text: string;
  tone: string;
  mode: 'free' | 'challenge';
  level: number;
  targetGrammar?: string;
  keywords?: string[];
}): Promise<CorrectionResult> {
  const { text, tone, mode, level, targetGrammar, keywords } = params;

  const userMessage = `Please correct the following English text.
Tone: ${tone}
Level context: The learner is at level ${level}/5.
${mode === 'challenge' && targetGrammar ? `Target grammar to check: ${targetGrammar}` : ''}

Text to correct:
"""
${text}
"""`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: buildSystemPrompt(mode, targetGrammar, keywords),
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  const parsed = JSON.parse(cleaned) as CorrectionResult;
  return parsed;
}

export async function chatWithContext(params: {
  messages: ChatMessage[];
  correctionContext: string;
}): Promise<string> {
  const { messages, correctionContext } = params;

  const system = `You are a helpful English writing coach for Japanese adult learners (TOEIC 600-800 level).
The learner has just received corrections on their English text. Answer their questions about the corrections clearly and in Japanese.
Keep answers concise and educational. Use examples in English when helpful.

Correction context:
${correctionContext}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
