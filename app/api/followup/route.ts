import { NextResponse } from 'next/server';
import { callGPT } from '../../../lib/openai';
import { SOCRATIC_PROMPT } from '../../../lib/prompts';

type ConversationMessage = {
  role: string;
  content: string;
};

interface FollowupRequestBody {
  topic?: unknown;
  conversationHistory?: unknown;
  userAnswer?: unknown;
  questionCount?: unknown;
  depthLevel?: unknown;
}

interface FollowupResponseBody {
  nextQuestion: string | null;
  shouldEnd: boolean;
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

/**
 * Detect if the model wants to end the session.
 * The model may return "END", "END.", "END - sufficient coverage", etc.
 * We treat any response that STARTS with "END" (case-insensitive) as a session end signal.
 */
function detectShouldEnd(text: string): boolean {
  const upper = text.trim().toUpperCase();
  return (
    upper === 'END' ||
    upper.startsWith('END ') ||
    upper.startsWith('END.') ||
    upper.startsWith('END,') ||
    upper.startsWith('END-') ||
    upper.startsWith('END—')
  );
}

export async function POST(request: Request) {
  const body: FollowupRequestBody = await request.json().catch(() => ({}));
  const { topic, conversationHistory, userAnswer, questionCount, depthLevel } = body;

  if (!isString(topic) || !isConversationHistory(conversationHistory) || !isString(userAnswer)) {
    return NextResponse.json(
      {
        error: 'Invalid request body. Required fields: topic (string), conversationHistory (array of {role, content}), userAnswer (string).',
      },
      { status: 400 },
    );
  }

  // Count how many AI questions have been asked so far
  const aiTurnCount =
    typeof questionCount === 'number'
      ? questionCount
      : conversationHistory.filter((m) => m.role === 'assistant').length;

  // Hard cap: force end after 5 questions regardless of model output
  if (aiTurnCount >= 5) {
    return NextResponse.json({ nextQuestion: null, shouldEnd: true });
  }

  const historyText = conversationHistory
    .map((message) => `${message.role === 'assistant' ? 'Tutor' : 'Student'}: ${message.content}`)
    .join('\n');

  const level = isString(depthLevel) ? depthLevel : 'intermediate';

  const userMessage = `Topic: ${topic}
Learner level: ${level}

Conversation so far (${aiTurnCount} tutor question(s) asked):
${historyText}

Student's latest answer: ${userAnswer}

Using the learner level "${level}", decide: ask one more conversational question appropriate for that level, or return END. Remember: end after 3-5 exchanges, or sooner if understanding is clear.`;

  try {
    const responseText = await callGPT(SOCRATIC_PROMPT, userMessage, 0.4);
    const trimmed = responseText.trim();
    const shouldEnd = detectShouldEnd(trimmed);
    const nextQuestion = shouldEnd ? null : trimmed;

    const payload: FollowupResponseBody = {
      nextQuestion,
      shouldEnd,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
