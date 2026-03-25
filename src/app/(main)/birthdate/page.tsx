'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Baby, Users, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import { KoreanDatePicker } from '@/components/ui/KoreanDatePicker';

interface BirthDateFormData {
  parent1BirthDate: string;
  parent1BirthTime: string;
  parent2BirthDate: string;
  parent2BirthTime: string;
  babyGender: 'male' | 'female' | 'unknown';
  pregnancyStartDate: string;
  currentWeeks: string;
  dueDate: string;
}

const BIRTH_TIMES = [
  { value: '', label: '모름' },
  { value: '23-01', label: '자시 (23~01시)' },
  { value: '01-03', label: '축시 (01~03시)' },
  { value: '03-05', label: '인시 (03~05시)' },
  { value: '05-07', label: '묘시 (05~07시)' },
  { value: '07-09', label: '진시 (07~09시)' },
  { value: '09-11', label: '사시 (09~11시)' },
  { value: '11-13', label: '오시 (11~13시)' },
  { value: '13-15', label: '미시 (13~15시)' },
  { value: '15-17', label: '신시 (15~17시)' },
  { value: '17-19', label: '유시 (17~19시)' },
  { value: '19-21', label: '술시 (19~21시)' },
  { value: '21-23', label: '해시 (21~23시)' },
];

type RecommendResult = {
  safeStart: string;
  safeEnd: string;
  recommendedDates: Array<{
    date: string;
    score: number;
    dayPillar: string;
    reason: string;
  }>;
  allDates: Array<{
    date: string;
    score: number;
    dayPillar: string;
    reason: string;
  }>;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 75 ? '#6C5CE7' : score >= 60 ? '#27ae60' : '#f39c12';
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-800">
        {score}
      </span>
    </div>
  );
}

export default function BirthDatePage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const guestCookie = cookies.find(c => c.startsWith('destiny-baby-guest='));
    setIsGuest(guestCookie?.split('=')[1] === 'true');
  }, []);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } =
    useForm<BirthDateFormData>({
      defaultValues: { babyGender: 'unknown' },
    });

  const recommendDates = trpc.birthdate.recommendDates.useMutation();
  const saveLuckyDate = trpc.birthdate.saveLuckyDate.useMutation();

  const goNext = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const onSubmit = async (data: BirthDateFormData) => {
    try {
      const res = await recommendDates.mutateAsync({
        parent1BirthDate: data.parent1BirthDate,
        parent1BirthTime: data.parent1BirthTime || undefined,
        parent2BirthDate: data.parent2BirthDate || undefined,
        parent2BirthTime: data.parent2BirthTime || undefined,
        babyGender: data.babyGender,
        pregnancyStartDate: data.pregnancyStartDate || undefined,
        currentWeeks: data.currentWeeks ? Number(data.currentWeeks) : undefined,
        dueDate: data.dueDate,
      });
      setResult(res);
      setDirection(1);
      setStep(3);
    } catch (e) {
      console.error('추천 실패:', e);
    }
  };

  const handleSave = async (d: RecommendResult['recommendedDates'][number]) => {
    if (savedDates.includes(d.date)) return;
    try {
      await saveLuckyDate.mutateAsync({
        date: d.date,
        score: d.score,
        source: 'recommendation',
      });
    } catch {
      // 비로그인 사용자는 저장 실패해도 로컬 상태로만 표시
    }
    setSavedDates(prev => [...prev, d.date]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-purple-100 text-purple-700';
    if (score >= 60) return 'bg-green-100 text-green-700';
    if (score >= 45) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-400 pt-16 pb-12 px-4 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Calendar className="w-8 h-8 text-gold-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">탄생일 추천</h1>
          <p className="text-base opacity-90 mb-1">사주로 찾아주는 우리 아이 길일</p>
          <p className="text-sm opacity-75">전통 명리학 × 의학적 안정기 분석</p>
        </motion.div>
      </div>

      {/* 비로그인 배너 */}
      {isGuest && (
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🔐</span>
            <p className="text-sm text-blue-700 font-medium">로그인하면 길일을 저장할 수 있어요</p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 mt-4 mb-2">
        <div className="flex items-center gap-2 justify-center">
          {[
            { n: 1, icon: Users, label: '부모 정보' },
            { n: 2, icon: Baby, label: '아기 정보' },
            { n: 3, icon: Sparkles, label: '추천 결과' },
          ].map(({ n, icon: Icon, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                step >= n ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn('text-xs hidden sm:block', step >= n ? 'text-primary-600 font-medium' : 'text-gray-400')}>
                {label}
              </span>
              {n < 3 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-2 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-4"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                부모 정보 입력
              </h2>

              {/* Parent 1 */}
              <div className="mb-5">
                <h3 className="font-semibold text-gray-700 mb-3">👨 부모1 정보</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
                    <Controller
                      name="parent1BirthDate"
                      control={control}
                      rules={{ required: '필수 입력입니다' }}
                      render={({ field }) => (
                        <KoreanDatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="생년월일 선택"
                        />
                      )}
                    />
                    {errors.parent1BirthDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.parent1BirthDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">태어난 시간 (선택)</label>
                    <select
                      {...register('parent1BirthTime')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white"
                    >
                      {BIRTH_TIMES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent 2 */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">👩 부모2 정보 (선택)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                    <Controller
                      name="parent2BirthDate"
                      control={control}
                      render={({ field }) => (
                        <KoreanDatePicker
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="생년월일 선택"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">태어난 시간 (선택)</label>
                    <select
                      {...register('parent2BirthTime')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white"
                    >
                      {BIRTH_TIMES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!watch('parent1BirthDate')) {
                    alert('부모1 생년월일은 필수입니다.');
                    return;
                  }
                  goNext();
                }}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2"
              >
                다음 단계
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 mt-4"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Baby className="w-5 h-5 text-primary-500" />
                아기 정보
              </h2>

              {/* 성별 */}
              <div className="mb-5">
                <label className="text-xs text-gray-500 mb-2 block font-medium">성별</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: '👦 남아' },
                    { value: 'female', label: '👧 여아' },
                    { value: 'unknown', label: '🤔 모름' },
                  ].map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setValue('babyGender', g.value as 'male' | 'female' | 'unknown')}
                      className={cn(
                        'py-3 rounded-xl font-bold text-sm transition-all',
                        watch('babyGender') === g.value
                          ? 'bg-primary-500 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-600 border border-gray-200'
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 임신 판정 시점 */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block font-medium">임신 판정 시점 (선택)</label>
                <Controller
                  name="pregnancyStartDate"
                  control={control}
                  render={({ field }) => (
                    <KoreanDatePicker
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="날짜 선택"
                    />
                  )}
                />
              </div>

              {/* 현재 주수 */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block font-medium">현재 주수 (선택)</label>
                <input
                  type="number"
                  min={1}
                  max={42}
                  {...register('currentWeeks')}
                  placeholder="예: 20"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
                <p className="text-xs text-gray-400 mt-1">임신 판정일을 입력하면 자동 계산됩니다</p>
              </div>

              {/* 출산 예정일 */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 mb-1 block font-medium">출산 예정일 *</label>
                <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: '출산 예정일은 필수입니다' }}
                  render={({ field }) => (
                    <KoreanDatePicker
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="예정일 선택"
                    />
                  )}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm border border-gray-200 text-gray-600 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  이전
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={recommendDates.isPending}
                  onClick={handleSubmit(onSubmit)}
                  className="flex-2 flex-grow bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {recommendDates.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      길일 추천받기
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* 의학적 안정기 */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs text-blue-500 font-bold mb-1">의학적 안정기</p>
                <p className="text-base font-black text-blue-800">
                  {formatDate(result.safeStart)} ~ {formatDate(result.safeEnd)}
                </p>
                <p className="text-xs text-blue-400 mt-1">이 기간 내 추천 길일을 선택하세요</p>
              </div>

              {/* 추천 카드 */}
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  추천 길일 TOP 3
                </h3>
                <div className="space-y-3">
                  {result.recommendedDates.map((d, i) => (
                    <motion.div
                      key={d.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="bg-white rounded-2xl p-5 shadow-md border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                              {i + 1}순위
                            </span>
                            <span className="text-lg font-black text-gray-800">{formatDate(d.date)}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">일주: {d.dayPillar}</p>
                        </div>
                        <ScoreCircle score={d.score} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{d.reason}</p>
                      <button
                        type="button"
                        onClick={() => handleSave(d)}
                        disabled={savedDates.includes(d.date) || saveLuckyDate.isPending}
                        className={cn(
                          'w-full py-2.5 rounded-xl text-sm font-bold transition-all',
                          savedDates.includes(d.date)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60'
                        )}
                      >
                        {savedDates.includes(d.date) ? '✓ 저장됨' : '이 날짜 저장하기'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 전체 달력 뷰 */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3">전체 기간 점수 보기</h3>
                <div className="grid grid-cols-7 gap-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                  ))}
                  {(() => {
                    if (!result.allDates.length) return null;
                    const firstDate = new Date(result.allDates[0].date);
                    const firstDow = firstDate.getDay();
                    const blanks = Array.from({ length: firstDow });
                    return (
                      <>
                        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                        {result.allDates.map(d => {
                          const date = new Date(d.date);
                          return (
                            <div
                              key={d.date}
                              className={cn(
                                'rounded-lg p-1 text-center cursor-default',
                                getScoreColor(d.score)
                              )}
                              title={`${d.date} | ${d.dayPillar} | ${d.score}점`}
                            >
                              <div className="text-xs font-bold">{date.getDate()}</div>
                              <div className="text-xs opacity-70">{d.score}</div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
                <div className="flex gap-3 mt-3 flex-wrap">
                  {[
                    { color: 'bg-purple-100 text-purple-700', label: '75점 이상 (최길)' },
                    { color: 'bg-green-100 text-green-700', label: '60점 이상 (길)' },
                    { color: 'bg-yellow-100 text-yellow-700', label: '45점 이상 (보통)' },
                    { color: 'bg-gray-100 text-gray-500', label: '45점 미만' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={cn('w-3 h-3 rounded-sm', color)} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 다시하기 */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setDirection(-1);
                  setResult(null);
                  setSavedDates([]);
                }}
                className="w-full py-3 rounded-2xl text-sm font-bold text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all"
              >
                다시 입력하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
