import type { VoiceType } from '@/types';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

const VOICE_IDS: Record<VoiceType, string> = {
  mom: process.env.ELEVENLABS_VOICE_MOM || 'pNInz6obpgDQGcFmaJgB',
  dad: process.env.ELEVENLABS_VOICE_DAD || 'VR6AewLTigWG4xSOukaG',
  grandma: process.env.ELEVENLABS_VOICE_GRANDMA || 'XB0fDUnXU5powFXDhCwa',
  english: process.env.ELEVENLABS_VOICE_ENGLISH || 'EXAVITQu4vr4xnSDxMaL',
};

export const PRESET_SENTENCES = [
  (name: string) => `${name}아~ 놀자~`,
  (name: string) => `${name}아~ 밥먹자~`,
  (name: string) => `${name}아~ 사랑해~`,
  (name: string) => `${name}아 안녕~`,
];

export async function generateTTS(
  name: string,
  voiceType: VoiceType,
  text?: string
): Promise<{ audioBlob: Blob; duration: number }> {
  const voiceId = VOICE_IDS[voiceType];
  const sentence = text || PRESET_SENTENCES[0](name);

  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: sentence,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: voiceType === 'grandma' ? 0.3 : 0.0,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const duration = audioBlob.size / 16000; // approximate

  return { audioBlob, duration };
}

export async function uploadTTSToStorage(
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
