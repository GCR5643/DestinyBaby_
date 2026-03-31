// Upstage Solar Pro 3 (OpenAI 호환 API)
// 부하 관리: 총 시간 제한, 429 exponential backoff, 동시 호출 세마포어

const UPSTAGE_BASE_URL = 'https://api.upstage.ai/v1';
const MAX_RETRIES = 3;
const FETCH_TIMEOUT_MS = 12000;       // 개별 요청 12초
const TOTAL_BUDGET_MS = 25000;        // Vercel 30초 제한 대비 총 25초 예산
const MAX_CONCURRENT = 3;             // 동시 LLM 호출 최대 3건

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  /** 개별 요청 타임아웃 (기본 12초, 긴 응답은 20초+ 권장) */
  fetchTimeoutMs?: number;
  /** 총 시간 예산 (기본 25초, 긴 응답은 45초+ 권장) */
  totalBudgetMs?: number;
}

// ========== 세마포어: 동시 호출 제한 ==========
let activeCount = 0;
const waitQueue: (() => void)[] = [];

async function acquireSemaphore(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return;
  }
  // 대기열에 들어가서 슬롯이 비면 실행
  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSemaphore(): void {
  activeCount--;
  const next = waitQueue.shift();
  if (next) next();
}

// ========== fetch with timeout ==========
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ========== retry with budget + 429 backoff ==========
async function callLLMWithRetry(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {},
  attempt = 1,
  startTime = Date.now()
): Promise<string> {
  // 총 시간 예산 체크 (커스텀 또는 기본값)
  const budgetMs = options.totalBudgetMs ?? TOTAL_BUDGET_MS;
  const fetchTimeout = options.fetchTimeoutMs ?? FETCH_TIMEOUT_MS;
  const elapsed = Date.now() - startTime;
  if (elapsed > budgetMs) {
    throw new Error(`LLM total budget exceeded (${elapsed}ms > ${budgetMs}ms)`);
  }

  // 남은 시간으로 개별 타임아웃 조정
  const remainingMs = budgetMs - elapsed;
  const thisTimeout = Math.min(fetchTimeout, remainingMs - 500); // 500ms 여유
  if (thisTimeout < 2000) {
    throw new Error(`LLM insufficient time remaining (${remainingMs}ms)`);
  }

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
      thisTimeout
    );

    // 429 Rate Limit — exponential backoff (2초/4초/8초)
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(2000 * Math.pow(2, attempt - 1), 8000); // 2s, 4s, 8s
      console.warn(`[LLM] 429 Rate Limited (attempt ${attempt}/${MAX_RETRIES}), waiting ${waitMs}ms`);

      if (attempt < MAX_RETRIES && (Date.now() - startTime + waitMs) < TOTAL_BUDGET_MS) {
        await new Promise(r => setTimeout(r, waitMs));
        return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1, startTime);
      }
      throw new Error(`LLM rate limited after ${attempt} attempts`);
    }

    // 기타 서버 에러 — 짧은 backoff 후 retry
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error(`[LLM] API error ${response.status} (attempt ${attempt}/${MAX_RETRIES}):`, errBody.substring(0, 200));
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1, startTime);
      }
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    if (!content) {
      console.error(`[LLM] Empty response (attempt ${attempt}/${MAX_RETRIES})`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1, startTime);
      }
      throw new Error('LLM returned empty content');
    }
    return content;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const isBudget = err instanceof Error && err.message.includes('budget');
    const msg = err instanceof Error ? err.message : String(err);

    if (isBudget) throw err; // 예산 초과는 재시도 없이 즉시 throw

    console.error(`[LLM] ${isTimeout ? 'Timeout' : 'Error'} (attempt ${attempt}/${MAX_RETRIES}):`, msg);

    if (attempt < MAX_RETRIES && (Date.now() - startTime) < TOTAL_BUDGET_MS - 3000) {
      await new Promise(r => setTimeout(r, 800 * attempt));
      return callLLMWithRetry(systemPrompt, userPrompt, options, attempt + 1, startTime);
    }
    throw err;
  }
}

// ========== 공개 API: 세마포어 래핑 ==========
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string> {
  if (!process.env.UPSTAGE_API_KEY) {
    throw new Error('UPSTAGE_API_KEY not configured');
  }

  await acquireSemaphore();
  try {
    return await callLLMWithRetry(systemPrompt, userPrompt, options);
  } finally {
    releaseSemaphore();
  }
}

// ========== 상태 조회 (모니터링용) ==========
export function getLLMStats() {
  return {
    activeRequests: activeCount,
    queueLength: waitQueue.length,
    maxConcurrent: MAX_CONCURRENT,
  };
}
