'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSaju } from '@/lib/saju/saju-calculator';
import { analyzeCompatibility } from '@/lib/saju/compatibility';
import type { SajuResult } from '@/types';
import type { CompatibilityResult } from '@/lib/saju/compatibility';
import { getElementColor, getElementEmoji } from '@/lib/utils/index';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function DateInput({ value, onChange, placeholder = '날짜 선택', label }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="relative">
      {label && <label className="text-xs text-gray-500 mb-1 block">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary-400 bg-white appearance-none"
        style={{ colorScheme: 'light' }}
      />
    </div>
  );
}

function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr);
  const weekday = d.toLocaleDateString('ko-KR', { weekday: 'long' });
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

const PILLAR_LABELS = ['연주 (年柱)', '월주 (月柱)', '일주 (日柱)', '시주 (時柱)'];

const ELEMENT_KO: Record<string, string> = {
  wood: '목', fire: '화', earth: '토', metal: '금', water: '수',
};

function SajuPillarsCard({ result }: { result: SajuResult }) {
  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      <h2 className="font-bold text-gray-800 mb-4">사주 팔자</h2>
      <div className="grid grid-cols-4 gap-2">
        {pillars.map((pillar, i) => (
          <div key={i} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{PILLAR_LABELS[i].split(' ')[0]}</div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <div className="text-xl font-black text-primary-700">{pillar.heavenlyStem}</div>
              <div className="text-lg text-gray-600">{pillar.earthlyBranch}</div>
            </div>
            <div className="mt-1 text-xs" style={{ color: getElementColor(pillar.element) }}>
              {getElementEmoji(pillar.element)} {pillar.element}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElementSummaryCard({ result }: { result: SajuResult }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      <h2 className="font-bold text-gray-800 mb-3">오행 분석</h2>
      <div className="grid grid-cols-5 gap-2">
        {(['wood', 'fire', 'earth', 'metal', 'water'] as const).map(el => (
          <div key={el} className="text-center">
            <div className="text-2xl">{getElementEmoji(el)}</div>
            <div className="text-xs font-medium mt-1" style={{ color: getElementColor(el) }}>
              {ELEMENT_KO[el]}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {result.mainElement === el ? '주' : result.lackingElement === el ? '부족' : ''}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-primary-50 rounded-xl">
        <p className="text-sm text-primary-800">
          <strong>주요 오행:</strong> {getElementEmoji(result.mainElement)} {result.mainElement} ·{' '}
          <strong>보완 필요:</strong> {getElementEmoji(result.lackingElement)} {result.lackingElement}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1 — 내 사주
// ─────────────────────────────────────────────
interface SajuForm {
  birthDate: string;
  birthTime: string;
}

function MySajuTab() {
  const [result, setResult] = useState<SajuResult | null>(null);
  const { register, handleSubmit } = useForm<SajuForm>();

  const onSubmit = (data: SajuForm) => {
    const saju = calculateSaju(data.birthDate, data.birthTime || undefined);
    setResult(saju);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
            <input type="date" {...register('birthDate', { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
            <input type="time" {...register('birthTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-3.5 rounded-2xl font-bold">
            🔮 사주 분석하기
          </button>
        </form>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SajuPillarsCard result={result} />
          <ElementSummaryCard result={result} />
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2 — 부모 궁합
// ─────────────────────────────────────────────
interface CompatForm {
  p1BirthDate: string;
  p1BirthTime: string;
  p2BirthDate: string;
  p2BirthTime: string;
}

const LEVEL_CONFIG = {
  excellent: { label: '천생연분', color: '#e91e8c', bg: 'bg-pink-50', border: 'border-pink-200' },
  good:      { label: '좋은 궁합', color: '#7c3aed', bg: 'bg-violet-50', border: 'border-violet-200' },
  average:   { label: '보통 궁합', color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200' },
  poor:      { label: '노력 필요', color: '#6b7280', bg: 'bg-gray-50', border: 'border-gray-200' },
} as const;

function CompatibilityTab() {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const { register, handleSubmit } = useForm<CompatForm>();

  const onSubmit = (data: CompatForm) => {
    const saju1 = calculateSaju(data.p1BirthDate, data.p1BirthTime || undefined);
    const saju2 = calculateSaju(data.p2BirthDate, data.p2BirthTime || undefined);
    setResult(analyzeCompatibility(saju1, saju2));
  };

  const cfg = result ? LEVEL_CONFIG[result.level] : null;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Person 1 */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">👤 첫 번째 사람</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
                <input type="date" {...register('p1BirthDate', { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                <input type="time" {...register('p1BirthTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-2xl">💕</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Person 2 */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">👤 두 번째 사람</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
                <input type="date" {...register('p2BirthDate', { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                <input type="time" {...register('p2BirthTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white py-3.5 rounded-2xl font-bold">
            💕 궁합 분석하기
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {result && cfg && (
          <motion.div
            key="compat-result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="space-y-4"
          >
            {/* Score card */}
            <div className={`rounded-2xl p-6 shadow-md border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">궁합 등급</p>
                  <p className="text-xl font-black" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black" style={{ color: cfg.color }}>{result.score}</div>
                  <div className="text-xs text-gray-400">/ 100</div>
                </div>
              </div>

              {/* Score gauge */}
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(to right, ${cfg.color}88, ${cfg.color})` }}
                />
              </div>

              <p className="mt-4 text-sm text-gray-700 leading-relaxed">{result.overallComment}</p>
            </div>

            {/* Aspects */}
            <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="font-bold text-gray-800">세부 궁합</h3>
              {result.aspects.map((aspect, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{aspect.title}</span>
                    <span className="font-bold" style={{ color: aspect.score >= 80 ? '#10b981' : aspect.score >= 65 ? '#f59e0b' : '#ef4444' }}>
                      {aspect.score}점
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${aspect.score}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: aspect.score >= 80 ? '#10b981' : aspect.score >= 65 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{aspect.comment}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3 — 출산일 추천 (Premium)
// ─────────────────────────────────────────────
interface RecommendedDate {
  date: string;
  score: number;
  reason: string;
  luckyElement: string;
}

type BirthRecMode = 'unknown' | 'known';

function BirthRecommendTab() {
  const [isPurchased] = useState(false);
  const [mode, setMode] = useState<BirthRecMode>('unknown');
  const [results, setResults] = useState<RecommendedDate[] | null>(null);
  const [computedDueDate, setComputedDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mode A fields
  const [conceptionDate, setConceptionDate] = useState('');
  // Mode B fields
  const [dueDate, setDueDate] = useState('');
  // Common fields
  const [momBirthDate, setMomBirthDate] = useState('');
  const [momBirthTime, setMomBirthTime] = useState('');
  const [dadBirthDate, setDadBirthDate] = useState('');
  const [dadBirthTime, setDadBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');

  const handleAnalyze = async () => {
    if (!isPurchased) return;
    if (!momBirthDate) return;

    let resolvedDueDate: string;
    if (mode === 'unknown') {
      if (!conceptionDate) return;
      const d = new Date(conceptionDate);
      d.setDate(d.getDate() + 280);
      resolvedDueDate = d.toISOString().split('T')[0];
      setComputedDueDate(resolvedDueDate);
    } else {
      if (!dueDate) return;
      resolvedDueDate = dueDate;
      setComputedDueDate(null);
    }

    setLoading(true);
    try {
      const { calculateSaju } = await import('@/lib/saju/saju-calculator');
      const { recommendBirthDates } = await import('@/lib/saju/birth-date-recommender');
      const parent1Saju = calculateSaju(momBirthDate, momBirthTime || undefined);
      const parent2Saju = dadBirthDate ? calculateSaju(dadBirthDate, dadBirthTime || undefined) : undefined;
      const startDate = new Date(resolvedDueDate);
      startDate.setDate(startDate.getDate() - 14);
      const endDate = new Date(resolvedDueDate);
      endDate.setDate(endDate.getDate() + 14);
      const rec = recommendBirthDates(parent1Saju, parent2Saju, startDate, 5, endDate);
      setResults(rec);
    } finally {
      setLoading(false);
    }
  };

  // Compute D-day difference between rec.date and the resolved due date
  const getDDay = (recDateStr: string, dueDateStr: string): string => {
    const rec = new Date(recDateStr);
    const due = new Date(dueDateStr);
    const diffDays = Math.round((rec.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '예정일 당일';
    if (diffDays > 0) return `예정일로부터 D+${diffDays}`;
    return `예정일로부터 D${diffDays}`;
  };

  const resolvedDueDateForDisplay = mode === 'known' ? dueDate : computedDueDate;

  return (
    <div className="space-y-4">
      {/* Input form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode('unknown'); setResults(null); setComputedDueDate(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                mode === 'unknown'
                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span>📅</span>
              <span>예정일 모름</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('known'); setResults(null); setComputedDueDate(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                mode === 'known'
                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span>📋</span>
              <span>예정일 있음</span>
            </button>
          </div>

          {/* Mode A: conception date */}
          {mode === 'unknown' && (
            <div className="space-y-2">
              <DateInput
                label="임신 확인일 (또는 마지막 생리 시작일) *"
                value={conceptionDate}
                onChange={v => {
                  setConceptionDate(v);
                  setResults(null);
                  if (v) {
                    const d = new Date(v);
                    d.setDate(d.getDate() + 280);
                    setComputedDueDate(d.toISOString().split('T')[0]);
                  } else {
                    setComputedDueDate(null);
                  }
                }}
              />
              {computedDueDate && (
                <div className="text-xs text-primary-700 bg-primary-50 rounded-xl px-3 py-2">
                  예상 예정일: <strong>{formatKoreanDate(computedDueDate)}</strong> (±2주)
                </div>
              )}
            </div>
          )}

          {/* Mode B: direct due date */}
          {mode === 'known' && (
            <DateInput
              label="예정일 *"
              value={dueDate}
              onChange={v => { setDueDate(v); setResults(null); }}
            />
          )}

          {/* Mom */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">👩 엄마 생년월일 *</p>
            <DateInput value={momBirthDate} onChange={setMomBirthDate} />
            <input
              type="time"
              value={momBirthTime}
              onChange={e => setMomBirthTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary-400 bg-white appearance-none"
              style={{ colorScheme: 'light' }}
            />
          </div>

          {/* Dad */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">👨 아빠 생년월일 (선택)</p>
            <DateInput value={dadBirthDate} onChange={setDadBirthDate} />
            <input
              type="time"
              value={dadBirthTime}
              onChange={e => setDadBirthTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary-400 bg-white appearance-none"
              style={{ colorScheme: 'light' }}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">성별</label>
            <div className="flex gap-2">
              {([['male', '남자아이'], ['female', '여자아이'], ['unknown', '모름']] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGender(val)}
                  className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                    gender === val
                      ? 'bg-primary-50 border-primary-400 text-primary-700 font-semibold'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isPurchased ? (
            <div className="relative">
              <button
                type="button"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3.5 rounded-2xl font-bold shadow-lg"
                onClick={() => alert('결제 기능은 준비 중입니다.')}
              >
                🔒 출산일 추천받기 — 15,000원
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">예정일 ±14일 내 최적 출산 날짜 TOP5 추천</p>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3.5 rounded-2xl font-bold disabled:opacity-60"
            >
              {loading ? '분석 중...' : '✨ 최적 출산일 분석하기'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Premium paywall overlay preview */}
      {!isPurchased && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden shadow-md">
          <div className="blur-sm pointer-events-none select-none">
            <div className="bg-white p-5 space-y-3">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-sm">{n}</div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-amber-200 rounded w-32" />
                    <div className="h-3 bg-amber-100 rounded w-48" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-amber-300 rounded w-12 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl p-6 shadow-xl mx-4 text-center">
              <div className="text-4xl mb-3">🔮</div>
              <h3 className="font-black text-gray-900 text-lg mb-1">프리미엄 기능</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                예정일 ±14일 내 사주가 가장 좋은<br />출산 날짜 TOP5를 추천해드려요
              </p>
              <div className="text-2xl font-black text-amber-500 mb-4">15,000원</div>
              <button
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-2xl font-bold shadow-md"
                onClick={() => alert('결제 기능은 준비 중입니다.')}
              >
                🔒 구매하고 확인하기
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {isPurchased && results && (
          <motion.div
            key="birth-results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="font-bold text-gray-800 px-1">추천 출산 날짜 TOP5</h3>
            {results.map((rec, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-md border border-amber-100 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-black text-lg shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{formatKoreanDate(rec.date)}</p>
                  {resolvedDueDateForDisplay && (
                    <p className="text-xs text-primary-600 font-medium mt-0.5">
                      {getDDay(rec.date, resolvedDueDateForDisplay)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.reason}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    {getElementEmoji(rec.luckyElement as Parameters<typeof getElementEmoji>[0])} 행운 오행: {ELEMENT_KO[rec.luckyElement] ?? rec.luckyElement}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-amber-500">{rec.score}</span>
                  <span className="text-xs text-gray-400 block">점</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const TABS = [
  { id: 'my', label: '내 사주', icon: '🔮' },
  { id: 'compat', label: '부모 궁합', icon: '💕' },
  { id: 'birth', label: '출산일 추천', icon: '✨' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function SajuPage() {
  const [activeTab, setActiveTab] = useState<TabId>('my');

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <div className="text-4xl mb-3">🔮</div>
        <h1 className="text-2xl font-bold mb-1">사주 분석</h1>
        <p className="text-sm opacity-80">생년월일시로 사주를 분석해드려요</p>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Tab pills */}
        <div className="flex gap-2 -mt-5 mb-5 bg-white rounded-2xl p-1.5 shadow-md">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my' && (
            <motion.div key="my" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <MySajuTab />
            </motion.div>
          )}
          {activeTab === 'compat' && (
            <motion.div key="compat" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <CompatibilityTab />
            </motion.div>
          )}
          {activeTab === 'birth' && (
            <motion.div key="birth" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <BirthRecommendTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
