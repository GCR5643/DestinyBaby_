'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Star, ChevronRight, Volume2, Calendar, ClipboardCheck, Sun } from 'lucide-react';
import { useState, useRef } from 'react';

// 고정 배경 원형 데이터 (Math.random() 대신 고정값으로 hydration mismatch 방지)
const BG_CIRCLES = [
  { w: 54, h: 42, left: 12, top: 8, dur: 4.2, delay: 0.5 },
  { w: 38, h: 65, left: 27, top: 33, dur: 3.8, delay: 1.1 },
  { w: 71, h: 28, left: 45, top: 72, dur: 4.7, delay: 0.2 },
  { w: 22, h: 58, left: 63, top: 15, dur: 3.3, delay: 1.7 },
  { w: 49, h: 36, left: 80, top: 50, dur: 4.0, delay: 0.8 },
  { w: 33, h: 71, left: 91, top: 85, dur: 3.6, delay: 1.4 },
  { w: 60, h: 44, left: 7,  top: 60, dur: 4.5, delay: 0.0 },
  { w: 28, h: 55, left: 20, top: 90, dur: 3.1, delay: 1.9 },
  { w: 75, h: 32, left: 38, top: 45, dur: 4.9, delay: 0.4 },
  { w: 41, h: 67, left: 55, top: 25, dur: 3.4, delay: 1.2 },
  { w: 57, h: 23, left: 70, top: 70, dur: 4.3, delay: 0.7 },
  { w: 26, h: 48, left: 85, top: 10, dur: 3.9, delay: 1.6 },
  { w: 63, h: 39, left: 3,  top: 40, dur: 4.1, delay: 0.3 },
  { w: 35, h: 62, left: 16, top: 55, dur: 3.7, delay: 1.0 },
  { w: 47, h: 30, left: 33, top: 80, dur: 4.6, delay: 0.6 },
  { w: 20, h: 74, left: 50, top: 5,  dur: 3.2, delay: 1.8 },
  { w: 68, h: 41, left: 66, top: 38, dur: 4.8, delay: 0.1 },
  { w: 31, h: 53, left: 77, top: 62, dur: 3.5, delay: 1.3 },
  { w: 52, h: 27, left: 88, top: 30, dur: 4.4, delay: 0.9 },
  { w: 44, h: 60, left: 95, top: 75, dur: 3.0, delay: 1.5 },
];

const FEATURES = [
  { emoji: '🔮', title: 'AI 사주 작명', desc: '전통 명리학 기반 AI가 사주에 맞는 이름을 추천' },
  { emoji: '📅', title: '탄생일 추천', desc: '의학적 안정기 × 사주 길일로 최적의 출산일 추천' },
  { emoji: '✅', title: '이름 검수', desc: '이미 지은 이름의 사주 적합도 분석' },
  { emoji: '🎵', title: '음성 AI', desc: '엄마·아빠·할머니 목소리로 이름 불러보기' },
  { emoji: '📊', title: '사주 리포트', desc: '획수/음양오행/발음 분석 상세 리포트' },
  { emoji: '🃏', title: '운명 카드', desc: '사주로 결정되는 우리 아이의 운명 카드 뽑기' },
];

const COMPARE_ROWS = [
  { feature: '이름 추천', traditional: '10~30만원', destiny: '무료', destinyOk: true },
  { feature: '탄생일 추천', traditional: '10~30만원', destiny: '무료', destinyOk: true },
  { feature: '사주 상세 분석', traditional: '별도 비용', destiny: '1,000원', destinyOk: true },
  { feature: '음성 AI', traditional: '❌', destiny: '✅', destinyOk: true },
  { feature: '운명 카드', traditional: '❌', destiny: '✅', destinyOk: true },
];

const REVIEWS = [
  { name: '김**', text: '사주를 보고 이름을 정해줘서 더 믿음이 가요. 아이가 건강하게 잘 크고 있어요 😊', rating: 5 },
  { name: '박**', text: '기존 작명소에 15만원 내려다가 여기서 무료로 받았어요! 이름도 너무 예쁘게 나왔어요', rating: 5 },
  { name: '이**', text: '음성으로 이름 불러주는 기능이 너무 감동이에요 ㅠㅠ 할머니도 좋아하셨어요', rating: 5 },
];

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoicePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const sampleText = encodeURIComponent('서윤, 이 이름에는 밝고 따뜻한 기운이 담겨 있습니다');
      const url = `/api/tts?text=${sampleText}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400 pt-16 pb-20 px-4 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {BG_CIRCLES.map((c, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: c.w,
                height: c.h,
                left: `${c.left}%`,
                top: `${c.top}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: c.dur, repeat: Infinity, delay: c.delay }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span>전통 명리학 × 최신 AI</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight">
            우리 아이 이름 &amp; 탄생일,<br />
            AI가 사주로<br />찾아드려요 ✨
          </h1>
          <p className="text-white/80 text-base mb-8">
            기존 작명소 10~30만원 → <strong className="text-gold-400">무료</strong>로!
          </p>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
            <Link href="/naming"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all">
              <Sparkles className="w-5 h-5 text-gold-400" />
              이름 추천받기 (무료)
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/birthdate"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all">
              <Calendar className="w-5 h-5 text-primary-500" />
              탄생일 추천받기 (무료)
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/daily-fortune"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all">
              <Sun className="w-5 h-5 text-amber-500" />
              오늘의 운세 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/naming/review"
              className="flex items-center justify-center gap-2 bg-white/20 border-2 border-white/40 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-white/30 transition-all">
              <ClipboardCheck className="w-5 h-5 text-white" />
              이름 검수받기 (무료)
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Naming Preview */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">이름 추천 미리보기</h2>
          <p className="text-center text-gray-500 text-sm mb-6">이런 이름들이 추천돼요</p>

          <div className="space-y-3">
            {[
              { name: '지우', hanja: '智宇', score: 92, reason: '지혜롭고 드넓은 기운', color: '#2980b9' },
              { name: '서연', hanja: '瑞然', score: 88, reason: '상서로운 기운이 흐르는', color: '#27ae60' },
            ].map((n, i) => (
              <motion.div key={n.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4"
                style={{ borderLeft: `4px solid ${n.color}` }}
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-800">{n.name}</span>
                    <span className="text-gray-400 text-sm">{n.hanja}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{n.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black" style={{ color: n.color }}>{n.score}</div>
                  <div className="text-xs text-gray-400">사주 적합도</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Audio demo teaser */}
          <div
            className={`mt-4 bg-primary-50 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${isPlaying ? 'bg-primary-100' : 'hover:bg-primary-100'}`}
            onClick={handleVoicePlay}
            role="button"
            aria-label="음성 AI 체험 재생"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={isPlaying ? { duration: 0.8, repeat: Infinity } : {}}
              >
                <Volume2 className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800">
                {isPlaying ? '재생 중...' : '음성 AI 체험'}
              </p>
              <p className="text-xs text-primary-600">"서윤, 이 이름에는 밝고 따뜻한 기운이 담겨 있습니다"</p>
            </div>
            {isPlaying ? (
              <motion.div
                className="ml-auto flex gap-0.5 items-end h-5"
                initial="idle"
                animate="playing"
              >
                {[0, 0.15, 0.3].map((delay) => (
                  <motion.span
                    key={delay}
                    className="w-1 bg-primary-400 rounded-full"
                    animate={{ height: ['6px', '16px', '6px'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </motion.div>
            ) : (
              <ChevronRight className="w-4 h-4 text-primary-400 ml-auto" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="bg-white py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-xl md:text-2xl font-bold text-center mb-8">&apos;운명의 아이&apos;만의 특별함</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-primary-50 rounded-2xl p-4"
                >
                  <div className="text-3xl mb-2">{f.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-center mb-6">기존 작명소 vs 운명의 아이</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-md">
            <div className="grid grid-cols-3 bg-primary-500 text-white text-sm font-bold">
              <div className="p-3">항목</div>
              <div className="p-3 text-center">기존 작명소</div>
              <div className="p-3 text-center">운명의 아이</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="p-3 text-gray-600 font-medium">{row.feature}</div>
                <div className="p-3 text-center text-gray-400">{row.traditional}</div>
                <div className="p-3 text-center text-primary-600 font-bold">{row.destiny}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <div className="bg-white py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-center mb-6">이런 분들이 좋아했어요</h2>
            <div className="space-y-3">
              {REVIEWS.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                      {r.name[0]}
                    </div>
                    <span className="font-medium text-sm text-gray-700">{r.name}</span>
                    <div className="flex ml-auto">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-br from-primary-600 to-secondary-400 py-12 px-4 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-black mb-3">지금 바로 시작해보세요</h2>
          <p className="text-white/80 mb-6">AI가 사주로 찾아주는 우리 아이의 운명</p>
          <div className="flex flex-col md:flex-row gap-3 max-w-xs md:max-w-xl mx-auto">
            <Link href="/naming"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 py-4 px-8 rounded-2xl font-black text-lg shadow-xl">
              <Sparkles className="w-5 h-5 text-gold-400" />
              무료로 이름 추천받기
            </Link>
            <Link href="/birthdate"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 py-4 px-8 rounded-2xl font-black text-lg shadow-xl">
              <Calendar className="w-5 h-5 text-primary-500" />
              무료로 탄생일 추천받기
            </Link>
            <Link href="/daily-fortune"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 py-4 px-8 rounded-2xl font-black text-lg shadow-xl">
              <Sun className="w-5 h-5 text-amber-500" />
              오늘의 운세 보기
            </Link>
          </div>
          <p className="text-xs text-white/50 mt-3">전통 명리학 기반 · 오락 목적 · 결과 참고용</p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 font-semibold mb-3">운명의 아이</p>
          <div className="space-y-1 text-xs text-gray-500 mb-4">
            <p>대표: 이건찬</p>
            <p>문의: support@destiny-baby.com</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors font-semibold text-gray-500">개인정보처리방침</Link>
            <span className="text-gray-300">|</span>
            <a href="mailto:support@destiny-baby.com" className="hover:text-gray-600 transition-colors">고객센터</a>
          </div>
          <p className="text-xs text-gray-400 mt-4">© {new Date().getFullYear()} 운명의 아이. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
