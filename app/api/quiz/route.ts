import { NextResponse } from 'next/server';
import { callGPT } from '../../../lib/openai';
import { QUIZ_PROMPT } from '../../../lib/prompts';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correct?: string;
  answer?: string;
  explanation: string;
  id?: number;
}

interface QuizRequestBody {
  topic?: unknown;
  weakSpots?: unknown;
}

interface QuizResponseBody {
  questions: QuizQuestion[];
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isWeakSpots(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  return value.every(isString);
}

function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const q = value as JsonObject;
  const type = q.type;
  if (type !== 'mcq' && type !== 'short') return false;
  if (!isString(q.question) || !isString(q.explanation)) return false;
  // Accept either 'correct' or 'answer' field
  if (!isString(q.correct) && !isString(q.answer)) return false;
  // For MCQ, options should be present if provided
  if (type === 'mcq' && q.options && !Array.isArray(q.options)) return false;
  if (type === 'mcq' && Array.isArray(q.options) && !q.options.every(isString)) return false;
  return true;
}

function removeMarkdownCodeFences(text: string): string {
  return text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1').trim();
}

function extractJsonPayload(text: string): string {
  const cleaned = removeMarkdownCodeFences(text);
  const start = cleaned.search(/[\[{]/);
  if (start === -1) return cleaned;
  const endBrace = cleaned.lastIndexOf('}');
  const endBracket = cleaned.lastIndexOf(']');
  const end = Math.max(endBrace, endBracket);
  if (end === -1) return cleaned;
  return cleaned.slice(start, end + 1).trim();
}

function validateQuizResponse(value: unknown): value is QuizResponseBody {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as JsonObject;
  if (!Array.isArray(body.questions)) return false;
  return body.questions.every(isQuizQuestion);
}

async function parseQuizResponse(text: string): Promise<QuizResponseBody> {
  const payload = extractJsonPayload(text);
  try {
    const parsed = JSON.parse(payload);
    if (!validateQuizResponse(parsed)) {
      throw new Error('Missing or invalid quiz response fields.');
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error.';
    throw new Error(`Failed to parse GPT response as JSON: ${message}\nResponse text: ${text}`);
  }
}

export async function POST(request: Request) {
  const body: QuizRequestBody = await request.json().catch(() => ({}));
  const { topic, weakSpots } = body;

  if (!isString(topic) || !isWeakSpots(weakSpots)) {
    return NextResponse.json(
      {
        error: 'Invalid request body. Required fields: topic (string), weakSpots (array of strings).',
      },
      { status: 400 },
    );
  }

  const weakSpotsText = weakSpots.join('\n- ');
  const userMessage = `Topic: ${topic}\n\nUser's weak spots:\n- ${weakSpotsText}\n\nGenerate exactly 4 quiz questions that directly target these weak spots. Each question should be tailored to probe understanding of the specific gaps identified. For each question provide: question, type (either "mcq" or "short"), correct answer, and explanation. For MCQ questions, provide exactly 4 options. Return valid JSON only with a root "questions" key containing an array of question objects. Code fences are allowed.`;

  try {
    const responseText = await callGPT(QUIZ_PROMPT, userMessage, 0.3, 'json_object');
    const parsed = await parseQuizResponse(responseText);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
