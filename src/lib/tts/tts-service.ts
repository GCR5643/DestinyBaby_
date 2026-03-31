import type { VoiceType } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * ElevenLabs 보이스 ID 설정
 *
 * Voice Library에서 한국어 네이티브 보이스를 선택하는 것이 가장 좋습니다.
 * 1. https://elevenlabs.io/voice-library 에서 Korean 필터로 검색
 * 2. 원하는 보이스의 ID 복사 (More actions → Copy voice ID)
 * 3. Vercel 환경변수에 설정
 *
 * 현재 기본값은 ElevenLabs 기본 제공 보이스 (영어)이므로,
 * 반드시 한국어 보이스로 교체해야 자연스러운 한국어 음성이 생성됩니다.
 *
 * 추천 보이스 유형:
 * - mom: 따뜻하고 부드러운 한국어 여성 보이스 (30대 엄마)
 * - dad: 낮고 차분한 한국어 남성 보이스 (30대 아빠)
 * - grandma: 따뜻하고 느린 한국어 여성 보이스 (60대 할머니)
 * - english: 영어 여성 보이스 (영어 이름 발음용)
 */
const VOICE_IDS: Record<VoiceType, string> = {
  mom: process.env.ELEVENLABS_VOICE_MOM || 'pNInz6obpgDQGcFmaJgB',
  dad: process.env.ELEVENLABS_VOICE_DAD || 'VR6AewLTigWG4xSOukaG',
  grandma: process.env.ELEVENLABS_VOICE_GRANDMA || 'XB0fDUnXU5powFXDhCwa',
  english: process.env.ELEVENLABS_VOICE_ENGLISH || 'EXAVITQu4vr4xnSDxMaL',
};

/**
 * 한국어 음성 최적화 설정 (보이스 타입별)
 *
 * - stability: 높을수록 일관된 톤 (한국어는 0.6~0.75 권장)
 * - similarity_boost: 높을수록 원본 보이스에 가까움 (0.8~0.85 권장)
 * - style: 감정 표현 강도 (한국어 자장가/칭찬 톤은 0.15~0.35)
 * - speed: 한국어 발화 속도 (기본 1.0, 할머니는 0.85로 느리게)
 *
 * 참고: https://elevenlabs.io/docs/overview/capabilities/text-to-speech
 */
const VOICE_SETTINGS: Record<VoiceType, {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}> = {
  mom: {
    stability: 0.38,        // 낮을수록 감정 폭 넓어짐 (ElevenLabs 권장: 0.35~0.45)
    similarity_boost: 0.80,  // 자연스러운 유사도
    style: 0.0,             // ElevenLabs 공식 권장: 항상 0 (레이턴시·안정성)
    speed: 0.90,            // 살짝 느리게 → 다정하고 따뜻한 느낌
  },
  dad: {
    stability: 0.42,        // 약간 안정적, 그래도 감정 표현 허용
    similarity_boost: 0.80,
    style: 0.0,
    speed: 0.93,            // 살짝 느리게 → 든든하고 다정한 아빠 톤
  },
  grandma: {
    stability: 0.35,        // 가장 낮게 → 풍부한 감정 변화 (할머니 사랑)
    similarity_boost: 0.80,
    style: 0.0,
    speed: 0.85,            // 느린 속도 → 할머니 특유의 천천히 부르는 톤
  },
  english: {
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.0,
    speed: 0.95,
  },
};

/**
 * 모델 선택 가이드:
 * - eleven_multilingual_v2: 한국어 포함 29개 언어, 높은 품질, 약간 느림
 * - eleven_flash_v2_5: 32개 언어, 3x 빠름 (비영어), 실시간용
 * - eleven_v3: 70+ 언어, 최고 품질, 가장 느림 (롱폼 내레이션용)
 *
 * 우리 서비스는 짧은 문장(이름 불러주기)이므로 flash가 적합하지만,
 * 감정 표현이 중요하므로 multilingual_v2를 기본으로 사용합니다.
 */
// eleven_v3: 감정 표현 최고, [warmly]/[softly] 태그 지원, 한국어 고품질
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';

// 보이스 타입별 previous_text: 따뜻한 서사 컨텍스트 주입 → 음성 톤 유도
const VOICE_CONTEXT: Record<VoiceType, { previous_text: string }> = {
  mom:     { previous_text: '엄마가 아이를 꼭 안아주며 따뜻하게 속삭였다.' },
  dad:     { previous_text: '아빠가 아이 머리를 쓰다듬으며 다정하게 말했다.' },
  grandma: { previous_text: '할머니가 손주를 꼭 끌어안으며 사랑스럽게 말했다.' },
  english: { previous_text: 'She held the baby close and whispered with love.' },
};

/** 정적 폴백 문장 (LLM 실패 시 사용) — [warmly]/[softly] 태그 포함 (eleven_v3) */
const FALLBACK_SENTENCES: Record<VoiceType, ((name: string) => string)[]> = {
  mom: [
    (name) => `[warmly] ${name}아~ 엄마가 엄청 사랑해~ 알지?`,
    (name) => `[warmly] 우리 ${name}이~ 세상에서 제일 예뻐~`,
    (name) => `[warmly] ${name}아~ 엄마 왔어~ 보고 싶었어~`,
    (name) => `[warmly] 우리 ${name}이 웃는 거 봐~ 엄마 심장 녹는다~`,
    (name) => `[warmly] ${name}아~ 엄마가 꼭 안아줄게~`,
  ],
  dad: [
    (name) => `[warmly] ${name}아~ 아빠야~ 우리 ${name}이 최고야!`,
    (name) => `[warmly] 우리 ${name}이~ 아빠가 세상 끝까지 지켜줄게~`,
    (name) => `[warmly] ${name}아~ 아빠랑 같이 놀자~ 응?`,
    (name) => `[warmly] 우리 ${name}이 웃어봐~ 아빠한테~`,
    (name) => `[warmly] ${name}아~ 아빠 왔어~ 보고 싶었어~`,
  ],
  grandma: [
    (name) => `[softly] 아이고~ 우리 ${name}이~ 할머니 왔다~`,
    (name) => `[softly] 우리 ${name}이~ 이리 와봐~ 기특하기도 해라~`,
    (name) => `[softly] 아이고 예뻐라~ 우리 ${name}이~ 할머니 손주~`,
    (name) => `[softly] 우리 ${name}이 많이 컸구나~ 할머니 눈에 넣어도 안 아프다~`,
  ],
  english: [
    (name) => `[warmly] Oh ${name}! Look at you, you are absolutely adorable!`,
    (name) => `[warmly] Sweet little ${name}~ you are so loved!`,
    (name) => `[warmly] ${name}! Can I hold you? You are the cutest baby!`,
    (name) => `[warmly] Oh my goodness, ${name}~ you are just precious!`,
  ],
};

/** 보이스 타입별 LLM 프롬프트 설정 */
const VOICE_PROMPTS: Record<VoiceType, { system: string; user: (name: string) => string }> = {
  mom: {
    system: `당신은 아기 이름을 처음 들은 따뜻하고 다정한 30대 엄마입니다. 아이 이름을 부르는 짧고 귀여운 한 문장을 생성하세요.
규칙:
- 문장 맨 앞에 반드시 [warmly] 태그를 붙이세요 (예: "[warmly] 서준아~ 사랑해~")
- 반드시 이름을 포함하여 부르는 형식 (예: "OO아~", "우리 OO이~")
- 20자 이내의 짧은 문장 한 개만
- 엄마의 따뜻하고 사랑스러운 말투 (~해, ~야, ~아~)
- 물결표(~)로 다정함 표현
- 다른 설명 없이 문장만 출력`,
    user: (name) => `아이 이름: ${name}\n이 이름을 부르는 귀여운 엄마 문장 1개:`,
  },
  dad: {
    system: `당신은 아기 이름을 처음 들은 든든하고 자상한 30대 아빠입니다. 아이 이름을 부르는 짧고 귀여운 한 문장을 생성하세요.
규칙:
- 문장 맨 앞에 반드시 [warmly] 태그를 붙이세요 (예: "[warmly] 서준아, 아빠가 사랑해~")
- 반드시 이름을 포함하여 부르는 형식
- 20자 이내의 짧은 문장 한 개만
- 아빠의 듬직하고 다정한 말투 (사랑한다, 잘했어, 우리 OO)
- 다른 설명 없이 문장만 출력`,
    user: (name) => `아이 이름: ${name}\n이 이름을 부르는 귀여운 아빠 문장 1개:`,
  },
  grandma: {
    system: `당신은 손자/손녀 이름을 처음 들은 60-70대 한국 할머니입니다. 아이 이름을 부르는 짧고 귀여운 한 문장을 생성하세요.
규칙:
- 문장 맨 앞에 반드시 [softly] 태그를 붙이세요 (예: "[softly] 아이고 우리 서준이~ 기특하기도 해라~")
- 반드시 이름을 포함하여 부르는 형식
- 25자 이내의 짧은 문장 한 개만
- 전형적인 한국 할머니 말투 사용: "~구나", "기특해라", "아이고", "이리 와봐", "~어라"
- 다른 설명 없이 문장만 출력`,
    user: (name) => `손자/손녀 이름: ${name}\n이 이름을 부르는 귀여운 할머니 문장 1개:`,
  },
  english: {
    system: `You are a warm, loving mother greeting her baby for the first time. Generate one short, sweet English sentence calling the baby by name.
Rules:
- Start with [warmly] tag (e.g. "[warmly] Oh my sweet Aria, mama loves you so much!")
- Must include the name
- Under 15 words
- Warm and loving tone
- Output only the sentence, nothing else`,
    user: (name) => `Baby's name: ${name}\nOne loving greeting sentence:`,
  },
};

/**
 * Solar Pro 3로 보이스 타입에 맞는 문장 동적 생성
 */
export async function generateVoiceSentence(name: string, voiceType: VoiceType): Promise<string> {
  const prompt = VOICE_PROMPTS[voiceType];
  try {
    const result = await callLLM(prompt.system, prompt.user(name), {
      temperature: 0.9,
      maxTokens: 60,
    });
    const sentence = result.trim().replace(/^["']|["']$/g, '');
    if (sentence.length > 0 && sentence.length <= 60) return sentence;
    throw new Error('invalid sentence length');
  } catch {
    // 폴백: 정적 문장
    const fallbacks = FALLBACK_SENTENCES[voiceType];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)](name);
  }
}

/** @deprecated FALLBACK_SENTENCES 사용 권장 */
export const PRESET_SENTENCES = FALLBACK_SENTENCES;

/**
 * ElevenLabs TTS 생성
 *
 * @param name - 아이 이름 (한글)
 * @param voiceType - 보이스 종류 (mom/dad/grandma/english)
 * @param text - 커스텀 텍스트 (없으면 프리셋 문장 사용)
 * @param sentenceIndex - 프리셋 문장 인덱스 (기본 0)
 */
export async function generateTTS(
  name: string,
  voiceType: VoiceType,
  text?: string,
  sentenceIndex = 0
): Promise<{ audioBlob: Blob; duration: number }> {
  const voiceId = VOICE_IDS[voiceType];
  const settings = VOICE_SETTINGS[voiceType];

  // 커스텀 텍스트 없으면 Solar Pro 3로 문장 동적 생성
  let sentence: string;
  if (text) {
    sentence = text;
  } else {
    try {
      sentence = await generateVoiceSentence(name, voiceType);
    } catch {
      const fallbacks = FALLBACK_SENTENCES[voiceType];
      sentence = fallbacks[sentenceIndex % fallbacks.length](name);
    }
  }

  // 한국어 텍스트 전처리: 숫자를 한글로 변환 (ElevenLabs 권장)
  const processedText = preprocessKoreanText(sentence);

  const apiKey = process.env.ELEVENLABS_API_KEY!;

  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: processedText,
      model_id: MODEL_ID,
      language_code: voiceType === 'english' ? 'en' : 'ko',
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
        // speed는 모델에 따라 지원 여부가 다름
        ...(settings.speed !== 1.0 && { speed: settings.speed }),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`TTS API error: ${response.status} ${errorText.slice(0, 200)}`);
  }

  const audioBlob = await response.blob();
  // MP3 비트레이트 기반 대략적 duration 추정 (128kbps)
  const duration = (audioBlob.size * 8) / (128 * 1000);

  return { audioBlob, duration };
}

/**
 * 한국어 텍스트 전처리
 * - 숫자를 한글로 변환 (ElevenLabs 한국어 발음 정확도 향상)
 * - 특수 문자 정리
 */
function preprocessKoreanText(text: string): string {
  // 간단한 숫자→한글 변환 (1~10, 100 등 기본)
  const numMap: Record<string, string> = {
    '0': '영', '1': '일', '2': '이', '3': '삼', '4': '사',
    '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구', '10': '십',
  };

  // 단독 숫자만 변환 (문맥에 따라 다를 수 있으므로 보수적으로)
  let result = text;
  for (const [num, kor] of Object.entries(numMap)) {
    result = result.replace(new RegExp(`(?<![\\d])${num}(?![\\d])`, 'g'), kor);
  }

  return result;
}

/**
 * Supabase Storage에 TTS 오디오 업로드
 */
export async function uploadTTSToStorage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  audioBlob: Blob,
  fileName: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('tts-audio')
    .upload(fileName, audioBlob, { contentType: 'audio/mpeg', upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('tts-audio').getPublicUrl(data.path);
  return urlData.publicUrl;
}
