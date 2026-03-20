'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Star, ChevronRight, Volume2 } from 'lucide-react';

const FEATURES = [
  { emoji: '🔮', title: 'AI 사주 작명', desc: '전통 명리학 기반 AI가 사주에 맞는 이름을 추천' },
  { emoji: '🎵', title: '음성 AI', desc: '엄마·아빠·할머니 목소리로 이름 불러보기' },
  { emoji: '🃏', title: '운명 카드', desc: '사주로 결정되는 나만의 운명 카드 뽑기' },
  { emoji: '📊', title: '상세 리포트', desc: '획수·음양오행·발음 분석 완전 리포트' },
];

const COMPARE_ROWS = [
  { feature: '이름 추천', traditional: '10~30만원', destiny: '무료', destinyOk: true },
  { feature: '상세 분석', traditional: '별도 비용', destiny: '1,000원', destinyOk: true },
  { feature: '음성 AI', traditional: '❌', destiny: '✅', destinyOk: true },
  { feature: '운명 카드', traditional: '❌', destiny: '✅', destinyOk: true },
  { feature: 'SNS 카드', traditional: '❌', destiny: '✅', destinyOk: true },
];

const REVIEWS = [
  { name: '김**', text: '사주를 보고 이름을 정해줘서 더 믿음이 가요. 아이가 건강하게 잘 크고 있어요 😊', rating: 5 },
  { name: '박**', text: '기존 작명소에 15만원 내려다가 여기서 무료로 받았어요! 이름도 너무 예쁘게 나왔어요', rating: 5 },
  { name: '이**', text: '음성으로 이름 불러주는 기능이 너무 감동이에요 ㅠㅠ 할머니도 좋아하셨어요', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400 pt-16 pb-20 px-4 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 60 + 20,
                height: Math.random() * 60 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-sm mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span>전통 명리학 × 최신 AI</span>
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight">
            우리 아이 이름,<br />
            AI가 사주로<br />찾아드려요 ✨
          </h1>
          <p className="text-white/80 text-base mb-8">
            기존 작명소 10~30만원 → <strong className="text-gold-400">무료</strong>로!
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/naming"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all">
              <Sparkles className="w-5 h-5 text-gold-400" />
              이름 추천받기 (무료)
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/cards"
              className="flex items-center justify-center gap-2 bg-white/20 border-2 border-white/40 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-white/30 transition-all">
              🃏 운명 카드 뽑기
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Naming Preview */}
      <div className="max-w-lg mx-auto px-4 py-12">
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
          <div className="mt-4 bg-primary-50 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-primary-100 transition-colors">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800">음성 AI 체험</p>
              <p className="text-xs text-primary-600">"지우야~ 사랑해~" 엄마 목소리로 들어보기</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary-400 ml-auto" />
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-center mb-8">운명의 아이만의 특별함</h2>
            <div className="grid grid-cols-2 gap-4">
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
      <div className="max-w-lg mx-auto px-4 py-12">
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
      <div className="bg-white py-12 px-4">
        <div className="max-w-lg mx-auto">
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
          <p className="text-white/80 mb-6">AI가 사주로 찾아주는 우리 아이 이름</p>
          <Link href="/naming"
            className="inline-flex items-center gap-2 bg-white text-primary-700 py-4 px-8 rounded-2xl font-black text-lg shadow-xl">
            <Sparkles className="w-5 h-5 text-gold-400" />
            무료로 시작하기
          </Link>
          <p className="text-xs text-white/50 mt-3">전통 명리학 기반 · 오락 목적 · 결과 참고용</p>
        </motion.div>
      </div>
    </div>
  );
}
