const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

async function callLLMWithRetry(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {},
  attempt = 1
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://destiny-baby.app',
      'X-Title': 'Destiny Baby',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-4-maverick',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
      return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1);
    }
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string> {
  return callLLMWithRetry(systemPrompt, userPrompt, options);
}
