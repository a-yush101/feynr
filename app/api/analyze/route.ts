import { NextResponse } from 'next/server';
import { callGPT } from '../../../lib/openai';
import { ANALYZER_PROMPT } from '../../../lib/prompts';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

interface AnalyzeRequestBody {
  topic?: unknown;
  depthLevel?: unknown;
  explanation?: unknown;
}

interface AnalyzeResponseBody {
  claims: JsonArray;
  gaps: JsonArray;
  misconceptions: JsonArray;
  firstQuestion: string;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
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

function validateAnalyzeResponse(value: unknown): value is AnalyzeResponseBody {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as JsonObject;
  return (
    Array.isArray(body.claims) &&
    Array.isArray(body.gaps) &&
    Array.isArray(body.misconceptions) &&
    isString(body.firstQuestion)
  );
}

async function parseAnalyzeResponse(text: string): Promise<AnalyzeResponseBody> {
  const payload = extractJsonPayload(text);
  try {
    const parsed = JSON.parse(payload);
    if (!validateAnalyzeResponse(parsed)) {
      throw new Error('Missing expected response fields.');
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error.';
    throw new Error(`Failed to parse GPT response as JSON: ${message}\nResponse text: ${text}`);
  }
}

export async function POST(request: Request) {
  const body: AnalyzeRequestBody = await request.json().catch(() => ({}));
  const { topic, depthLevel, explanation } = body;

  if (!isString(topic) || !isString(explanation) || (!isString(depthLevel) && typeof depthLevel !== 'number')) {
    return NextResponse.json(
      {
        error: 'Invalid request body. Required fields: topic (string), depthLevel (string or number), explanation (string).',
      },
      { status: 400 },
    );
  }

  const userMessage = `Topic: ${topic}\nDepth level: ${depthLevel}\nExplanation: ${explanation}\n\nRespond with a JSON object containing the keys \"claims\", \"gaps\", \"misconceptions\", and \"firstQuestion\". The \"firstQuestion\" should be a single focused Socratic follow-up question that targets a specific gap in the explanation. Return valid JSON only; code fences are allowed.`;

  try {
    const responseText = await callGPT(ANALYZER_PROMPT, userMessage, 0.3);
    const parsed = await parseAnalyzeResponse(responseText);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
