// Upstage Solar Pro 3 (OpenAI 호환 API)
const UPSTAGE_BASE_URL = 'https://api.upstage.ai/v1';
const MAX_RETRIES = 3;
const FETCH_TIMEOUT_MS = 15000; // 15초 (Vercel 30초 제한 고려)

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callLLMWithRetry(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {},
  attempt = 1
): Promise<string> {
  try {
    const response = await fetchWithTimeout(
      `${UPSTAGE_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.UPSTAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'solar-pro3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2000,
        }),
      },
      FETCH_TIMEOUT_MS
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error(`[LLM] API error ${response.status} (attempt ${attempt}/${MAX_RETRIES}):`, errBody.substring(0, 200));
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1);
      }
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    if (!content) {
      console.error(`[LLM] Empty response (attempt ${attempt}/${MAX_RETRIES})`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1);
      }
      throw new Error('LLM returned empty content');
    }
    return content;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[LLM] ${isTimeout ? 'Timeout' : 'Error'} (attempt ${attempt}/${MAX_RETRIES}):`, msg);

    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 800 * attempt));
      return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1);
    }
    throw err;
  }
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string> {
  if (!process.env.UPSTAGE_API_KEY) {
    throw new Error('UPSTAGE_API_KEY not configured');
  }
  return callLLMWithRetry(systemPrompt, userPrompt, options);
}
