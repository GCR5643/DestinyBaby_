'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, RotateCcw, BookOpen, Sparkles, Save, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { KoreanDatePicker } from '@/components/ui/KoreanDatePicker';
import type { NamingReport } from '@/types';

interface ReviewForm {
  name: string;
  hanja: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | 'unknown';
  parent1BirthDate: string;
  parent1BirthTime: string;
  parent2BirthDate: string;
  parent2BirthTime: string;
}

interface EvaluationResult {
  report: NamingReport;
  reportId: string | undefined;
}

function getScoreGrade(score: number): { color: string; bg: string; border: string; emoji: string; label: string } {
  if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', emoji: '\uD83D\uDFE2', label: '훌륭한 이름입니다!' };
  if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', emoji: '\uD83D\uDFE1', label: '좋은 이름이지만 보완할 점이 있어요' };
  return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', emoji: '\uD83D\uDD34', label: '개선이 필요한 이름이에요' };
}

function ScoreBar({ label, score, comment, delay }: { label: string; score: number; comment: string; delay: number }) {
  const barColor = score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-800">{score}점</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <p className="text-xs text-gray-500">{comment}</p>
    </motion.div>
  );
}

function TotalScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const grade = getScoreGrade(score);
  const strokeColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center"
    >
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-3xl font-black text-gray-800"
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${grade.bg} ${grade.color} ${grade.border} border`}
      >
        {grade.emoji} {grade.label}
      </motion.div>
    </motion.div>
  );
}

export default function NamingReviewPage() {
  const router = useRouter();
  const [showParents, setShowParents] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const saveResultMutation = trpc.naming.saveResult.useMutation({
    onSuccess: (data) => {
      if (data.saved && result?.reportId) {
        setSavedReportId(result.reportId);
      }
    },
  });

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const guestCookie = cookies.find(c => c.startsWith('destiny-baby-guest='));
    setIsGuest(guestCookie?.split('=')[1] === 'true');
  }, []);
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<ReviewForm>({
    defaultValues: { gender: 'unknown' },
  });
  const evaluateName = trpc.naming.evaluateName.useMutation();

  const onSubmit = async (data: ReviewForm) => {
    setResult(null);
    setSavedReportId(null);
    const res = await evaluateName.mutateAsync({
      name: data.name,
      hanja: data.hanja || undefined,
      birthDate: data.birthDate,
      birthTime: data.birthTime || undefined,
      gender: data.gender,
      parent1BirthDate: data.parent1BirthDate || undefined,
      parent1BirthTime: data.parent1BirthTime || undefined,
      parent2BirthDate: data.parent2BirthDate || undefined,
      parent2BirthTime: data.parent2BirthTime || undefined,
    });

    setResult({
      report: res.report,
      reportId: res.reportId,
    });
  };

  const handleReset = () => {
    setResult(null);
    setSavedReportId(null);
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (result?.reportId) {
      saveResultMutation.mutate({ resultId: result.reportId });
    }
  };

  // 총점 계산: 4개 세부 점수 평균
  const computeTotalScore = (report: NamingReport): number => {
    const ohengScore = report.sajuFitScore;
    const strokeScore = report.strokeAnalysis.luckScore;
    const pronunciationScore = report.pronunciationAnalysis.harmony;
    // 의미 점수: parentCompatibility.combined를 의미 점수로 활용
    const meaningScore = report.parentCompatibility.combined;
    return Math.round((ohengScore + strokeScore + pronunciationScore + meaningScore) / 4);
  };

  // 세부 점수별 코멘트 생성
  const getOhengComment = (report: NamingReport): string => {
    return report.yinYangFiveElements.recommendation;
  };

  const getStrokeComment = (report: NamingReport): string => {
    const { totalStrokes, luckScore } = report.strokeAnalysis;
    if (luckScore >= 80) return `총 ${totalStrokes}획으로 수리격이 좋습니다.`;
    if (luckScore >= 60) return `총 ${totalStrokes}획으로 보통 수준의 수리격입니다.`;
    return `총 ${totalStrokes}획으로 수리격 보완이 필요합니다.`;
  };

  const getPronunciationComment = (report: NamingReport): string => {
    return report.pronunciationAnalysis.comment;
  };

  const getMeaningComment = (report: NamingReport): string => {
    return report.meaningBreakdown.map(m => `${m.char}(${m.hanja})`).join(' + ') + ' — ' + (report.overallComment.split('.')[0] || '좋은 의미를 담고 있습니다');
  };

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-secondary-400 pt-12 pb-8 px-4 text-white text-center">
        <Search className="w-8 h-8 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-1">이름 검수하기</h1>
        <p className="text-sm opacity-80">아이의 이름을 입력하면 종합 분석 결과를 알려드려요</p>
        <p className="text-xs opacity-60 mt-1">무료</p>
      </div>

      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-4">
        {/* 입력 폼 */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* 비로그인 배너 */}
                {isGuest && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">🔐</span>
                    <p className="text-sm text-blue-700 font-medium">로그인하면 검수 결과를 저장할 수 있어요</p>
                  </div>
                )}

                {/* 이름 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">아이 이름</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">이름 (한글) *</label>
                      <input
                        {...register('name', { required: '이름을 입력해주세요' })}
                        placeholder="예: 지우"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">한자 (선택)</label>
                      <input
                        {...register('hanja')}
                        placeholder="예: 智宇"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 아기 생년월일 */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">아이 생년월일</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
                      <Controller
                        name="birthDate"
                        control={control}
                        rules={{ required: '생년월일을 입력해주세요' }}
                        render={({ field }) => (
                          <KoreanDatePicker
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="생년월일 선택"
                          />
                        )}
                      />
                      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">태어난 시간 (선택)</label>
                      <input
                        type="time"
                        {...register('birthTime')}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>

                  {/* 성별 */}
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 mb-2 block">성별</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'male' as const, label: '남자' },
                        { value: 'female' as const, label: '여자' },
                        { value: 'unknown' as const, label: '미정' },
                      ].map(opt => (
                        <label key={opt.value} className="cursor-pointer">
                          <input type="radio" value={opt.value} {...register('gender')} className="sr-only" />
                          <div className={`text-center py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                            watch('gender') === opt.value
                              ? 'border-primary-400 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-500'
                          }`}>
                            {opt.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 부모 사주 (접이식) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowParents(v => !v)}
                    className="flex items-center gap-2 text-sm text-primary-600 font-medium w-full text-left"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showParents ? 'rotate-180' : ''}`} />
                    부모 사주 추가 (선택) -- 부모 궁합까지 분석해요
                  </button>

                  <AnimatePresence>
                    {showParents && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">아버지 / 부모1</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                                <Controller
                                  name="parent1BirthDate"
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
                                <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                                <input
                                  type="time"
                                  {...register('parent1BirthTime')}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">어머니 / 부모2</h4>
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
                                <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                                <input
                                  type="time"
                                  {...register('parent2BirthTime')}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={evaluateName.isPending}
                  className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {evaluateName.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      이름 검수하기 (무료)
                    </>
                  )}
                </button>

                {evaluateName.error && (
                  <p className="text-red-500 text-sm text-center">
                    분석 중 오류가 발생했습니다. 다시 시도해주세요.
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 로딩 스켈레톤 */}
        {evaluateName.isPending && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-4"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            ))}
          </motion.div>
        )}

        {/* 검수 결과 */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 mt-0"
            >
              {/* 이름 & 총점 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-md text-center"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-black text-gray-800">
                    {result.report.name}
                    {result.report.hanja && (
                      <span className="text-gray-400 font-medium ml-1">({result.report.hanja})</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">검수 결과</p>
                </div>
                <TotalScoreCircle score={computeTotalScore(result.report)} />
              </motion.div>

              {/* 세부 점수 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="font-bold text-gray-800 mb-5">세부 분석</h3>
                <div className="space-y-5">
                  <ScoreBar
                    label="음양오행 적합도"
                    score={result.report.sajuFitScore}
                    comment={getOhengComment(result.report)}
                    delay={0.3}
                  />
                  <ScoreBar
                    label="획수(수리격) 분석"
                    score={result.report.strokeAnalysis.luckScore}
                    comment={getStrokeComment(result.report)}
                    delay={0.45}
                  />
                  <ScoreBar
                    label="발음 조화"
                    score={result.report.pronunciationAnalysis.harmony}
                    comment={getPronunciationComment(result.report)}
                    delay={0.6}
                  />
                  <ScoreBar
                    label="의미/뜻"
                    score={result.report.parentCompatibility.combined}
                    comment={getMeaningComment(result.report)}
                    delay={0.75}
                  />
                </div>
              </motion.div>

              {/* 한자 풀이 */}
              {result.report.meaningBreakdown.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-md"
                >
                  <h3 className="font-bold text-gray-800 mb-4">이름 한자 풀이</h3>
                  <div className="space-y-3">
                    {result.report.meaningBreakdown.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="text-center min-w-12">
                          <div className="text-2xl font-bold text-primary-600">{item.hanja}</div>
                          <div className="text-base text-gray-700">{item.char}</div>
                        </div>
                        <p className="text-sm text-gray-600 pt-1">{item.meaning}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 종합 소견 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100"
              >
                <h3 className="font-bold text-gray-800 mb-3">종합 소견</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{result.report.overallComment}</p>
              </motion.div>

              {/* 액션 버튼들 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {/* 사주 상세 리포트 보기 */}
                {result.reportId && (
                  <button
                    onClick={() => router.push(`/naming/report/${result.reportId}?name=${encodeURIComponent(result.report.name)}&hanja=${encodeURIComponent(result.report.hanja)}&from=review`)}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg"
                  >
                    <BookOpen className="w-5 h-5" />
                    사주 상세 리포트 보기
                  </button>
                )}

                {/* 점수 70점 미만: AI 이름 추천 */}
                {computeTotalScore(result.report) < 70 && (
                  <button
                    onClick={() => router.push('/naming')}
                    className="w-full bg-gradient-to-r from-secondary-400 to-secondary-300 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI 이름 추천 받기
                  </button>
                )}

                {/* 결과 저장하기 */}
                {result.reportId && !savedReportId && (
                  <button
                    onClick={handleSave}
                    className="w-full bg-white border-2 border-primary-200 text-primary-600 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    결과 저장하기
                  </button>
                )}

                {savedReportId && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ✓ 저장됨
                  </div>
                )}

                {!result.reportId && (
                  <div className="w-full bg-gray-50 border border-gray-200 text-gray-500 py-3.5 rounded-2xl text-sm text-center px-4">
                    로그인하면 결과를 저장할 수 있어요
                  </div>
                )}

                {/* 다시 검수하기 */}
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 검수하기
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
