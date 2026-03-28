import type { VoiceType } from '@/types';

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
    stability: 0.65,        // 약간 변화 허용 → 자연스러운 엄마 톤
    similarity_boost: 0.85,  // 높은 유사도
    style: 0.25,            // 따뜻한 감정 표현
    speed: 0.95,            // 살짝 느리게 → 다정한 느낌
  },
  dad: {
    stability: 0.70,        // 안정적인 아빠 톤
    similarity_boost: 0.80,  // 적당한 유사도
    style: 0.15,            // 차분한 감정
    speed: 1.0,             // 기본 속도
  },
  grandma: {
    stability: 0.60,        // 자연스러운 변화 허용
    similarity_boost: 0.85,  // 높은 유사도
    style: 0.35,            // 풍부한 감정 (할머니의 사랑)
    speed: 0.85,            // 느린 속도 → 할머니 톤
  },
  english: {
    stability: 0.75,        // 영어는 안정적으로
    similarity_boost: 0.80,
    style: 0.10,            // 깔끔한 발음
    speed: 1.0,
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
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

/** 프리셋 문장 템플릿 */
export const PRESET_SENTENCES: Record<VoiceType, ((name: string) => string)[]> = {
  mom: [
    (name) => `${name}아~ 사랑해~`,
    (name) => `우리 ${name}이, 오늘도 정말 잘했어~`,
    (name) => `${name}아~ 밥 먹자~`,
    (name) => `${name}아, 엄마가 안아줄게~`,
  ],
  dad: [
    (name) => `${name}아, 아빠야. 사랑한다~`,
    (name) => `우리 ${name}이 잘 자~`,
    (name) => `${name}아, 같이 놀자!`,
    (name) => `${name}아, 아빠가 지켜줄게.`,
  ],
  grandma: [
    (name) => `우리 ${name}이~ 할머니가 왔어~`,
    (name) => `${name}아~ 이리 와~ 예쁜 우리 ${name}이~`,
    (name) => `우리 ${name}이 많이 컸네~ 기특해~`,
  ],
  english: [
    (name) => `Hello ${name}! You are so special.`,
    (name) => `${name}, you are loved.`,
  ],
};

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
  const presets = PRESET_SENTENCES[voiceType];
  const sentence = text || presets[sentenceIndex % presets.length](name);

  // 한국어 텍스트 전처리: 숫자를 한글로 변환 (ElevenLabs 권장)
  const processedText = preprocessKoreanText(sentence);

  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: processedText,
      model_id: MODEL_ID,
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
      },
      // speed는 모델에 따라 지원 여부가 다름
      ...(settings.speed !== 1.0 && { speed: settings.speed }),
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
