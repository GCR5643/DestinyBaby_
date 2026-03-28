'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Star, ChevronRight, Volume2, Calendar, ClipboardCheck, Sun, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParentStore } from '@/stores/parentStore';
import { useUserStore } from '@/stores/userStore';

// 고정 배경 원형 데이터
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
];

const FEATURES = [
  { emoji: '🔮', title: 'AI 사주 작명', desc: '전통 명리학 기반 AI가 사주에 맞는 이름을 추천' },
  { emoji: '📅', title: '탄생일 추천', desc: '의학적 안정기 × 사주 길일로 최적의 출산일 추천' },
  { emoji: '✅', title: '이름 검수', desc: '이미 지은 이름의 사주 적합도 분석' },
  { emoji: '🎵', title: '음성 AI', desc: '엄마·아빠·할머니 목소리로 이름 불러보기' },
  { emoji: '📊', title: '사주 리포트', desc: '획수/음양오행/발음 분석 상세 리포트' },
  { emoji: '☀️', title: '오늘의 운수', desc: '사주 기반 매일 맞춤 운수·칭찬·육아팁' },
];


const REVIEWS = [
  { name: '김**', text: '사주를 보고 이름을 정해줘서 더 믿음이 가요. 아이가 건강하게 잘 크고 있어요 😊', rating: 5 },
  { name: '박**', text: '기존 작명소에 15만원 내려다가 여기서 무료로 받았어요! 이름도 너무 예쁘게 나왔어요', rating: 5 },
  { name: '이**', text: '음성으로 이름 불러주는 기능이 너무 감동이에요 ㅠㅠ 할머니도 좋아하셨어요', rating: 5 },
];

// 오늘 날짜 기반 탄생일 예시
function getTodayLuckyPreview() {
  const d = new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  return { year, month, day };
}

export default function LandingPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const todayLucky = getTodayLuckyPreview();
  const { user } = useUserStore();
  const { hasAnyParent } = useParentStore();

  // 온보딩 팝업: 비로그인 or 로그인했어도 부모정보 미입력 시
  useEffect(() => {
    const dismissed = sessionStorage.getItem('onboarding-dismissed');
    if (dismissed) return;
    // 약간 딜레이 후 표시 (페이지 로드 직후는 어색)
    const timer = setTimeout(() => {
      if (!user || !hasAnyParent()) {
        setShowOnboarding(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, hasAnyParent]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('onboarding-dismissed', 'true');
  };

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

  const handleReviewSubmit = () => {
    if (reviewName.trim()) {
      router.push(`/naming/review?name=${encodeURIComponent(reviewName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* ========== Hero ========== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400 pt-14 pb-16 px-4 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {BG_CIRCLES.map((c, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-white/5"
              style={{ width: c.w, height: c.h, left: `${c.left}%`, top: `${c.top}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: c.dur, repeat: Infinity, delay: c.delay }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-sm mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span>전통 명리학 × 최신 AI</span>
          </div>

          <h1 className="text-3xl font-black mb-3 leading-tight">
            우리 아이 이름 &amp; 탄생일,<br />
            AI가 사주로<br />찾아드려요 ✨
          </h1>
          <p className="text-white/80 text-base mb-6">
            기존 작명소 10~30만원 → <strong className="text-gold-400">무료</strong>로!
          </p>

          <div className="flex flex-col gap-2.5">
            <Link href="/naming"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 py-3.5 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all">
              <Sparkles className="w-5 h-5 text-gold-400" />
              이름 추천받기 (무료)
              <ChevronRight className="w-4 h-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/birthdate"
                className="flex items-center justify-center gap-1.5 bg-white/20 border border-white/40 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
                <Calendar className="w-4 h-4" />
                탄생일 추천
              </Link>
              <Link href="/daily-fortune"
                className="flex items-center justify-center gap-1.5 bg-white/20 border border-white/40 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
                <Sun className="w-4 h-4" />
                오늘의 운세
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-6 mt-6">

        {/* ========== 1. 이름 추천 미리보기 ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              이름 추천 미리보기
            </h2>
            <Link href="/naming" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
              추천받기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { name: '서윤', hanja: '瑞潤', score: 94, element: '수(水)', reason: '상서로운 기운과 윤택함을 갖춘 이름', color: '#2563eb' },
              { name: '지호', hanja: '智浩', score: 91, element: '목(木)', reason: '지혜롭고 넓은 뜻을 품은 이름', color: '#059669' },
              { name: '하윤', hanja: '夏潤', score: 88, element: '화(火)', reason: '여름의 따뜻한 기운과 윤기를 담은 이름', color: '#d97706' },
            ].map((n, i) => (
              <motion.div key={n.name}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                style={{ borderLeft: `4px solid ${n.color}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-800">{n.name}</span>
                    <span className="text-gray-400 text-xs">{n.hanja}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{n.element}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{n.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: n.color }}>{n.score}</div>
                  <div className="text-[10px] text-gray-400">종합점수</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link href="/naming" className="block mt-3 text-center bg-primary-500 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-600 transition-colors">
            무료로 이름 추천받기
          </Link>
        </motion.section>

        {/* ========== 2. 탄생일 추천 미리보기 ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              탄생일 추천 미리보기
            </h2>
            <Link href="/birthdate" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
              추천받기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            {/* 오늘의 길일 하이라이트 */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-medium">{todayLucky.month}월</span>
                  <span className="text-lg font-black leading-none">{todayLucky.day}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {todayLucky.year}년 {todayLucky.month}월 {todayLucky.day}일은
                  </p>
                  <p className="text-xs text-primary-600 font-medium mt-0.5">
                    목(木) 기운이 왕성한 날로, 창의적이고 성장하는 에너지를 품고 있습니다
                  </p>
                </div>
              </div>
            </div>

            {/* 미니 달력 */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
              {['일','월','화','수','목','금','토'].map(d => (
                <div key={d} className="text-gray-400 font-medium py-1">{d}</div>
              ))}
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1;
                const isToday = day === todayLucky.day;
                const isLucky = [3, 8, 12, 18, 23, 28].includes(day);
                return (
                  <div key={day} className={`py-1.5 rounded-lg text-xs font-medium ${
                    isToday ? 'bg-primary-500 text-white' :
                    isLucky ? 'bg-green-100 text-green-700' :
                    'text-gray-600'
                  }`}>
                    {day}
                    {isLucky && !isToday && <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-500 rounded-sm" /> 오늘</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-100 rounded-sm" /> 추천 길일</span>
            </div>
          </div>

          <Link href="/birthdate" className="block mt-3 text-center bg-primary-500 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-600 transition-colors">
            무료로 탄생일 추천받기
          </Link>
        </motion.section>

        {/* ========== 3. 오늘의 운세 미리보기 ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              오늘의 운세 미리보기
            </h2>
            <Link href="/daily-fortune" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
              보러가기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { emoji: '☀️', title: '오늘의 운세', preview: '오늘은 새로운 시작에 좋은 기운이 감돌아요', bg: 'bg-amber-50', text: 'text-amber-700' },
              { emoji: '⭐', title: '칭찬 한마디', preview: '"오늘도 열심히 노력하는 모습이 멋져요!"', bg: 'bg-primary-50', text: 'text-primary-700' },
              { emoji: '💬', title: '대화 주제', preview: '"오늘 제일 좋았던 일이 뭐야?"', bg: 'bg-blue-50', text: 'text-blue-700' },
              { emoji: '🌱', title: '육아팁', preview: '흙놀이로 토(土) 기운을 보충해보세요', bg: 'bg-green-50', text: 'text-green-700' },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`${card.bg} rounded-2xl p-3.5`}
              >
                <div className="text-2xl mb-1.5">{card.emoji}</div>
                <p className={`text-xs font-bold ${card.text} mb-1`}>{card.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{card.preview}</p>
              </motion.div>
            ))}
          </div>

          <Link href="/daily-fortune" className="block mt-3 text-center bg-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-amber-600 transition-colors">
            오늘의 운세 보러가기
          </Link>
        </motion.section>

        {/* ========== 4. 이름 검수 미리보기 ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-500" />
              이름 검수받기
            </h2>
            <Link href="/naming/review" className="text-xs text-primary-500 font-medium flex items-center gap-0.5">
              검수받기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-600 mb-4">
              이미 이름을 지으셨나요? 사주·획수·음양 분석으로 이름의 적합도를 확인해보세요.
            </p>

            {/* 이름 입력 폼 */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReviewSubmit()}
                placeholder="아이 이름 입력 (예: 김서윤)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                maxLength={10}
              />
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewName.trim()}
                className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                검수
              </button>
            </div>

            {/* 예시 카드 */}
            <div className="bg-emerald-50 rounded-xl p-3.5 flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-black">A+</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">검수 예시: 김서윤</p>
                <p className="text-xs text-gray-500 mt-0.5">사주 적합도 94점 · 획수 분석 길 · 음양 조화 양호</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </motion.section>

        {/* ========== 음성 AI 체험 ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div
            className={`bg-primary-50 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${isPlaying ? 'bg-primary-100' : 'hover:bg-primary-100'}`}
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
                {isPlaying ? '재생 중...' : '🎵 음성 AI 체험'}
              </p>
              <p className="text-xs text-primary-600">&quot;서윤, 이 이름에는 밝고 따뜻한 기운이 담겨 있습니다&quot;</p>
            </div>
            {isPlaying ? (
              <motion.div className="ml-auto flex gap-0.5 items-end h-5">
                {[0, 0.15, 0.3].map((delay) => (
                  <motion.span key={delay} className="w-1 bg-primary-400 rounded-full"
                    animate={{ height: ['6px', '16px', '6px'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </motion.div>
            ) : (
              <ChevronRight className="w-4 h-4 text-primary-400 ml-auto" />
            )}
          </div>
        </motion.section>
      </div>

      {/* ========== 리뷰 ========== */}
      <div className="bg-white py-10 px-4 mt-8">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-lg font-bold text-center mb-5">이런 분들이 좋아했어요</h2>
            <div className="space-y-2.5">
              {REVIEWS.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 bg-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                      {r.name[0]}
                    </div>
                    <span className="font-medium text-sm text-gray-700">{r.name}</span>
                    <div className="flex ml-auto">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-gold-400 fill-gold-400" />
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

      {/* ========== 특별함 (최하단) ========== */}
      <div className="bg-white py-10 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-lg font-bold text-center mb-6">&apos;운명의 아이&apos;만의 특별함</h2>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-primary-50 rounded-2xl p-3.5"
                >
                  <div className="text-2xl mb-1.5">{f.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-xs mb-0.5">{f.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========== 온보딩 팝업 (hover card) ========== */}
      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative">
            <button onClick={dismissOnboarding} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 text-lg">✕</button>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">✨</div>
              <div>
                <p className="font-bold text-gray-800 text-sm mb-1">
                  {!user ? '로그인하고 맞춤 서비스를 받아보세요' : '부모 정보를 입력해주세요'}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {!user
                    ? '로그인 후 부모 생년월일을 입력하면 작명·탄생일·운세에서 자동으로 채워져요'
                    : '프로필에서 부모 생년월일을 입력하면 작명·탄생일·운세에서 매번 입력하지 않아도 돼요'}
                </p>
                <button
                  onClick={() => { dismissOnboarding(); router.push(!user ? '/login?redirect=/profile' : '/profile'); }}
                  className="mt-3 bg-primary-500 text-white text-xs font-bold px-5 py-2 rounded-lg"
                >
                  {!user ? '로그인하기' : '프로필에서 입력하기'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========== Footer ========== */}
      <footer className="bg-gray-100 border-t border-gray-200 px-4 py-8">
        <div className="max-w-lg mx-auto">
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
