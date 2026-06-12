import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({ apiKey });

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

function extractTextFromResponse(res: unknown): string | undefined {
  if (res === null || typeof res !== 'object') return undefined;
  const r = res as Record<string, unknown>;
  const choices = r.choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const first = choices[0];
  if (first === null || typeof first !== 'object') return undefined;
  const f = first as Record<string, unknown>;
  // Try message.content
  const message = f.message;
  if (message && typeof message === 'object') {
    const m = message as Record<string, unknown>;
    const content = m.content;
    if (typeof content === 'string') return content;
  }
  // Fallback to text
  const text = f.text;
  if (typeof text === 'string') return text;
  return undefined;
}

/**
 * Call the OpenAI Chat Completions API with a system prompt and a user message.
 * Throws a readable Error on failure.
 */
export async function callGPT(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7,
  model?: string,
): Promise<string> {
  const modelToUse = model ?? DEFAULT_MODEL;

  try {
    const resp = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
    });

    const text = extractTextFromResponse(resp);
    if (!text) throw new Error('OpenAI returned no text in the response');
    return text;
  } catch (err: unknown) {
    let msg = 'OpenAI API request failed';
    if (err instanceof Error) msg += `: ${err.message}`;
    throw new Error(msg);
  }
}

export default openai;
