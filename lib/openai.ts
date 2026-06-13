import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

const client = new Groq({ apiKey });
const MODEL_NAME = 'llama-3.3-70b-versatile';

export async function callGPT(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7,
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const text = response?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
      throw new Error('Groq returned empty response text');
    }

    return text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Groq error';
    throw new Error(`Groq API request failed: ${message}`);
  }
}
