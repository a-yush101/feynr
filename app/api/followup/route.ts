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

export async function POST(request: Request) {
  const body: FollowupRequestBody = await request.json().catch(() => ({}));
  const { topic, conversationHistory, userAnswer } = body;

  if (!isString(topic) || !isConversationHistory(conversationHistory) || !isString(userAnswer)) {
    return NextResponse.json(
      {
        error: 'Invalid request body. Required fields: topic (string), conversationHistory (array of {role, content}), userAnswer (string).',
      },
      { status: 400 },
    );
  }

  const historyText = conversationHistory
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');

  const userMessage = `Topic: ${topic}\n\nConversation history:\n${historyText}\n\nUser answer: ${userAnswer}\n\nBased on the full conversation so far, decide whether to ask one more focused Socratic follow-up question or to end the session. If you ask another question, return only the question text. If the session should end, return the word END. Use the context of prior questions and answers to determine whether the user has been probed thoroughly (around 3-5 total questions).`;

  try {
    const responseText = await callGPT(SOCRATIC_PROMPT, userMessage, 0.3);
    const trimmed = responseText.trim();
    const shouldEnd = /^END$/i.test(trimmed);
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
