'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import type { VoiceType } from '@/types';
import { cn } from '@/lib/utils';

const VOICES: { type: VoiceType; label: string; emoji: string; description: string }[] = [
  { type: 'mom', label: '엄마', emoji: '👩', description: '부드러운 여성 목소리' },
  { type: 'dad', label: '아빠', emoji: '👨', description: '따뜻한 남성 목소리' },
  { type: 'grandma', label: '할머니', emoji: '👵', description: '다정한 할머니 목소리' },
  { type: 'english', label: '영어', emoji: '🌍', description: '영어 발음으로 들어보기' },
];

export default function VoicePage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('mom');
  const [isPlaying, setIsPlaying] = useState(false);
  const [customText, setCustomText] = useState('');
  const [activePreset, setActivePreset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    `${name}아~ 놀자~`,
    `${name}아~ 밥먹자~`,
    `${name}아~ 사랑해~`,
    `${name}아 안녕~`,
  ];

  const handlePlay = async (text: string) => {
    setIsPlaying(true);
    setError(null);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, voiceType: selectedVoice, text }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'TTS 생성에 실패했습니다');
        setIsPlaying(false);
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError('오디오 재생에 실패했습니다');
        URL.revokeObjectURL(audioUrl);
      };
      await audio.play();
    } catch {
      setError('TTS 생성에 실패했습니다');
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-secondary-400 pt-12 pb-8 px-4 text-white text-center">
        <Volume2 className="w-8 h-8 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-1">음성으로 들어보기</h1>
        <p className="text-sm opacity-80">{name}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Voice selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-gray-800 mb-3">목소리 선택</h2>
          <div className="grid grid-cols-4 gap-2">
            {VOICES.map(v => (
              <button
                key={v.type}
                onClick={() => setSelectedVoice(v.type)}
                className={cn(
                  'flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all',
                  selectedVoice === v.type ? 'border-primary-400 bg-primary-50' : 'border-gray-100'
                )}
              >
                <span className="text-2xl mb-1">{v.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{v.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Presets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-gray-800 mb-3">프리셋 문장</h2>
          <div className="space-y-2">
            {presets.map((text, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="flex-1 text-sm text-gray-700">{text}</span>
                <button
                  onClick={() => { setActivePreset(i); handlePlay(text); }}
                  disabled={isPlaying}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    activePreset === i && isPlaying ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'
                  )}
                >
                  {activePreset === i && isPlaying ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(b => (
                        <div key={b} className="wave-bar w-0.5 h-4 bg-white rounded-full" style={{ animationDelay: `${b * 0.1}s` }} />
                      ))}
                    </div>
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Custom text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-gray-800 mb-3">직접 입력</h2>
          <textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="원하는 문장을 입력하세요..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none mb-3"
          />
          <button
            onClick={() => handlePlay(customText)}
            disabled={!customText || isPlaying}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            음성 생성하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
