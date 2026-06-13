import { NextResponse } from 'next/server';
import { callGPT } from '../../../lib/openai';
import { REPORT_PROMPT } from '../../../lib/prompts';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

type ConversationMessage = {
  role: string;
  content: string;
};

interface ReportRequestBody {
  topic?: unknown;
  explanation?: unknown;
  conversationHistory?: unknown;
}

interface Misconception {
  excerpt: string;
  problem: string;
  correction: string;
}

interface Evidence {
  excerpt: string;
  justification: string;
}

interface ReportResponseBody {
  scores: {
    accuracy: number;
    depth: number;
    clarity: number;
    completeness: number;
  };
  evidence?: {
    accuracy?: Evidence;
    depth?: Evidence;
    clarity?: Evidence;
    completeness?: Evidence;
  };
  misconceptions: Misconception[] | string[];
  nextSteps: string[];
  overallScore: number;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isConversationHistory(value: unknown): value is ConversationMessage[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      isString((item as Record<string, unknown>).role) &&
      isString((item as Record<string, unknown>).content),
  );
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

function isNumberInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isMisconception(value: unknown): value is Misconception {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const m = value as JsonObject;
  return isString(m.excerpt) && isString(m.problem) && isString(m.correction);
}

function validateReportResponse(value: unknown): value is ReportResponseBody {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as JsonObject;
  const scores = body.scores;
  if (
    scores === null ||
    typeof scores !== 'object' ||
    Array.isArray(scores) ||
    !isNumberInRange((scores as JsonObject).accuracy) ||
    !isNumberInRange((scores as JsonObject).depth) ||
    !isNumberInRange((scores as JsonObject).clarity) ||
    !isNumberInRange((scores as JsonObject).completeness)
  ) {
    return false;
  }

  // misconceptions can be either array of objects or array of strings
  if (!Array.isArray(body.misconceptions)) {
    return false;
  }
  const allMisconceptionsValid = body.misconceptions.every(
    (item) => isMisconception(item) || isString(item),
  );
  if (!allMisconceptionsValid) {
    return false;
  }

  if (!Array.isArray(body.nextSteps) || body.nextSteps.length !== 3 || !body.nextSteps.every(isString)) {
    return false;
  }

  if (!isNumberInRange(body.overallScore)) {
    return false;
  }

  return true;
}

async function parseReportResponse(text: string): Promise<ReportResponseBody> {
  const payload = extractJsonPayload(text);
  try {
    const parsed = JSON.parse(payload);
    if (!validateReportResponse(parsed)) {
      throw new Error('Missing or invalid report response fields.');
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error.';
    throw new Error(`Failed to parse GPT response as JSON: ${message}\nResponse text: ${text}`);
  }
}

export async function POST(request: Request) {
  const body: ReportRequestBody = await request.json().catch(() => ({}));
  const { topic, explanation, conversationHistory } = body;

  if (!isString(topic) || !isString(explanation) || !isConversationHistory(conversationHistory)) {
    return NextResponse.json(
      {
        error: 'Invalid request body. Required fields: topic (string), explanation (string), conversationHistory (array of {role, content}).',
      },
      { status: 400 },
    );
  }

  const historyText = conversationHistory
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');

  const userMessage = `Topic: ${topic}\n\nExplanation: ${explanation}\n\nConversation history:\n${historyText}\n\nReturn a JSON object with keys: scores, misconceptions, nextSteps, and overallScore. Scores should contain numeric accuracy, depth, clarity, and completeness values from 0 to 100. Misconceptions should be a list of specific incorrect or misleading statements the user made. NextSteps should be exactly three actionable improvements. OverallScore should be the average of the four scores. Return valid JSON only; code fences are allowed.`;

  try {
    const responseText = await callGPT(REPORT_PROMPT, userMessage, 0.3, 'json_object');
    const parsed = await parseReportResponse(responseText);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
