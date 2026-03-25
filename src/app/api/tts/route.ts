import { NextRequest, NextResponse } from 'next/server';
import { generateTTS } from '@/lib/tts/tts-service';
import type { VoiceType } from '@/types';

export async function POST(request: NextRequest) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: 'TTS API 키가 설정되지 않았습니다' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    !['mom', 'dad', 'grandma', 'english'].includes(
      (body as Record<string, unknown>).voiceType as string
    )
  ) {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  const { name, voiceType, text } = body as {
    name: string;
    voiceType: VoiceType;
    text?: string;
  };

  try {
    const { audioBlob } = await generateTTS(name, voiceType, text);
    const arrayBuffer = await audioBlob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(arrayBuffer.byteLength),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS 생성 실패';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
