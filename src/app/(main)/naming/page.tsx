'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { KoreanDatePicker } from '@/components/ui/KoreanDatePicker';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useNamingStore } from '@/stores/namingStore';
import { cn } from '@/lib/utils';
import { DemoBanner } from '@/components/naming/DemoBanner';

interface NamingFormData {
  surname: string;
  surnameHanja: string;
  parent1BirthDate: string;
  parent1BirthTime: string;
  parent2BirthDate: string;
  parent2BirthTime: string;
  babyBirthDate: string;
  babyBirthTime: string;
  gender: 'male' | 'female' | 'unknown';
  hangryeolChar: string;
  siblingNames: string;
}

function getHangryeolPreview(chars: string[], position: '앞' | '뒤' | '모름'): string {
  if (chars.length === 0) return '';
  const suffixes = ['서', '혁', '호', '아', '준', '민'];
  const prefixes = ['하', '지', '서', '민', '수', '나'];
  return chars.flatMap(c => {
    if (position === '앞') return suffixes.slice(0, 3).map(s => `${c}${s}`);
    if (position === '뒤') return prefixes.slice(0, 3).map(p => `${p}${c}`);
    return [suffixes[0], prefixes[0]].map((x, i) => i === 0 ? `${c}${x}` : `${x}${c}`);
  }).slice(0, 6).join(', ');
}

const LOADING_MESSAGES = [
  'AI가 이름을 찾고 있어요...',
  '행운의 기운을 담는 중...',
  '아이의 운명을 비추는 중...',
  '보석 같은 이름 찾는 중...',
  '축복의 이름을 고르는 중...',
  '거의 다 됐어요...',
];

export default function NamingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [useHangryeol, setUseHangryeol] = useState(false);
  const [hangryeolChars, setHangryeolChars] = useState<string[]>([]);
  const [hangryeolInput, setHangryeolInput] = useState('');
  const [hangryeolPosition, setHangryeolPosition] = useState<'앞' | '뒤' | '모름'>('뒤');
  const [useLuckyDate, setUseLuckyDate] = useState(false);
  const [selectedLuckyDateId, setSelectedLuckyDateId] = useState<string | null>(null);
  const [trendLevel, setTrendLevel] = useState<'trendy' | 'balanced' | 'classic'>('balanced');
  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<NamingFormData>({
    defaultValues: { gender: 'unknown' }
  });
  const generateNames = trpc.naming.generateNames.useMutation();
  const generateNamesPublic = trpc.naming.generateNamesPublic.useMutation();
  const { data: luckyDates } = trpc.birthdate.getMyLuckyDates.useQuery(undefined, {
    retry: false,
  });
  const { setParent1Saju, setParent2Saju } = useNamingStore();

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const guestCookie = cookies.find(c => c.startsWith('destiny-baby-guest='));
    setIsGuest(guestCookie?.split('=')[1] === 'true');
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const onSubmit = async (data: NamingFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        surname: data.surname || '',
        surnameHanja: data.surnameHanja || undefined,
        parent1BirthDate: data.parent1BirthDate,
        parent1BirthTime: data.parent1BirthTime || undefined,
        parent2BirthDate: data.parent2BirthDate || undefined,
        parent2BirthTime: data.parent2BirthTime || undefined,
        babyBirthDate: data.babyBirthDate || undefined,
        babyBirthTime: data.babyBirthTime || undefined,
        gender: data.gender,
        hangryeolChar: useHangryeol && hangryeolChars.length > 0
          ? `${hangryeolPosition}:${hangryeolChars.join(',')}`
          : undefined,
        siblingNames: data.siblingNames ? data.siblingNames.split(',').map(s => s.trim()) : undefined,
        trendLevel,
      };

      // 재생성을 위해 payload는 항상 저장 (로그인/비로그인 공통)
      sessionStorage.setItem('guest-naming-payload', JSON.stringify(payload));

      if (isGuest) {
        const result = await generateNamesPublic.mutateAsync(payload);
        sessionStorage.setItem('guest-naming-result', JSON.stringify(result.names));
        router.push('/naming/result/guest');
      } else {
        const result = await generateNames.mutateAsync(payload);
        // 로그인 유저도 재생성 시 사용할 수 있도록 결과 저장
        sessionStorage.setItem('guest-naming-result', JSON.stringify(result.names));
        router.push(`/naming/result/${result.resultId}`);
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '이름 추천 중 오류가 발생했습니다. 다시 시도해주세요.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {isGuest && <DemoBanner />}
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-400 pt-16 pb-12 px-4 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Sparkles className="w-8 h-8 text-gold-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">AI 작명소</h1>
          <p className="text-base opacity-90 mb-1">사주로 찾아주는 우리 아이 이름</p>
          <p className="text-sm opacity-75">전통 명리학 × 최신 AI 기술</p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* 비로그인 배너 */}
            {isGuest && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg flex-shrink-0">🔐</span>
                <p className="text-sm text-blue-700 font-medium">로그인하면 추천 결과를 저장할 수 있어요</p>
              </div>
            )}
            {/* 성씨 입력 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">✏️ 아기 성씨</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">성씨 *</label>
                  <input
                    type="text"
                    {...register('surname', { required: '성씨를 입력해주세요' })}
                    placeholder="예: 김"
                    maxLength={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                  {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">성씨 한자 <span className="text-gray-400">(선택)</span></label>
                  <input
                    type="text"
                    {...register('surnameHanja')}
                    placeholder="예: 金"
                    maxLength={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">한자를 아시면 입력해주세요</p>
                </div>
              </div>
            </div>

            {/* Parent 1 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👨 아버지 / 부모1 정보</h3>
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
                  {errors.parent1BirthDate && <p className="text-red-500 text-xs mt-1">{errors.parent1BirthDate.message}</p>}
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

            {/* Parent 2 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👩 어머니 / 부모2 정보</h3>
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

            {/* Baby */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👶 아기 정보</h3>

              {/* 길일 토글 - 저장된 길일이 있을 때만 표시 */}
              {luckyDates && luckyDates.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setUseLuckyDate(false)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                        !useLuckyDate ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      직접 입력
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseLuckyDate(true)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                        useLuckyDate ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      저장된 길일 ({luckyDates.length})
                    </button>
                  </div>

                  {useLuckyDate && (
                    <div className="space-y-2">
                      {luckyDates.map(ld => (
                        <button
                          key={ld.id}
                          type="button"
                          onClick={() => {
                            setSelectedLuckyDateId(ld.id);
                            setValue('babyBirthDate', ld.date);
                            if (ld.time) setValue('babyBirthTime', ld.time);
                          }}
                          className={cn(
                            'w-full text-left p-3 rounded-xl border transition-all',
                            selectedLuckyDateId === ld.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-white'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-800">{ld.date}</span>
                              {ld.time && <span className="text-gray-500 text-sm ml-2">{ld.time}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {ld.score > 0 && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                                  {ld.score}점
                                </span>
                              )}
                              {selectedLuckyDateId === ld.id && (
                                <span className="text-primary-500">✓</span>
                              )}
                            </div>
                          </div>
                          {ld.status !== 'candidate' && (
                            <span className={cn(
                              'text-xs mt-1 inline-block px-2 py-0.5 rounded-full',
                              ld.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              ld.status === 'selected' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
                            )}>
                              {ld.status === 'confirmed' ? '확정' : ld.status === 'selected' ? '선택됨' : '지남'}
                            </span>
                          )}
                        </button>
                      ))}
                      <p className="text-xs text-gray-400 text-center mt-2">
                        길일은 프로필 → 내 예비 사주 목록에서 관리할 수 있어요
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 직접 입력 - useLuckyDate가 false이거나 길일 목록이 없을 때 */}
              {!useLuckyDate && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">생년월일 (예정일)</label>
                    <Controller
                      name="babyBirthDate"
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
                      {...register('babyBirthTime')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>
              )}

              {/* 길일 선택 모드일 때 숨겨진 입력으로 폼 값 유지 */}
              {useLuckyDate && (
                <div className="mb-3" />
              )}

              {/* Gender */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">성별</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: '👦 남자', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { value: 'female', label: '👧 여자', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                    { value: 'unknown', label: '🌟 미정', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                  ].map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                      <input type="radio" value={opt.value} {...register('gender')} className="sr-only" />
                      <div className={cn(
                        'text-center py-2 rounded-xl border-2 text-sm font-medium transition-all',
                        watch('gender') === opt.value ? opt.color + ' ring-2 ring-primary-400' : 'border-gray-200 text-gray-500'
                      )}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Level */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">이름 스타일</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'trendy' as const, label: '요즘 인기', desc: '2024~2025 트렌드', color: 'bg-rose-50 border-rose-200 text-rose-700' },
                  { value: 'balanced' as const, label: '균형잡힌', desc: '현대적 + 품격', color: 'bg-violet-50 border-violet-200 text-violet-700' },
                  { value: 'classic' as const, label: '전통 고전', desc: '격조 있는 정통', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrendLevel(opt.value)}
                    className={cn(
                      'text-center py-2.5 px-1 rounded-xl border-2 transition-all',
                      trendLevel === opt.value ? opt.color + ' ring-2 ring-primary-400' : 'border-gray-200 text-gray-500'
                    )}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-primary-600 font-medium flex items-center gap-1">
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                추가 옵션 (항렬, 형제이름)
              </summary>
              <div className="mt-3 space-y-3 pl-5">
                <div className="space-y-3">
                  {/* 항렬 사용 여부 토글 */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">항렬 글자 사용</label>
                    <button
                      type="button"
                      onClick={() => setUseHangryeol(v => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        useHangryeol ? 'bg-primary-400' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        useHangryeol ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {useHangryeol && (
                    <div className="space-y-3">
                      {/* chip 입력 */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">항렬 글자 (최대 3개)</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {hangryeolChars.map((c, i) => (
                            <span key={i} className="flex items-center gap-1 bg-primary-50 border border-primary-200 text-primary-700 text-sm px-2 py-0.5 rounded-full">
                              {c}
                              <button
                                type="button"
                                onClick={() => setHangryeolChars(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-primary-400 hover:text-primary-700 font-bold leading-none"
                              >×</button>
                            </span>
                          ))}
                        </div>
                        {hangryeolChars.length < 3 && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={hangryeolInput}
                              onChange={e => setHangryeolInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const v = hangryeolInput.trim();
                                  if (v && !hangryeolChars.includes(v)) setHangryeolChars(prev => [...prev, v]);
                                  setHangryeolInput('');
                                }
                              }}
                              placeholder="글자 입력 후 Enter"
                              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const v = hangryeolInput.trim();
                                if (v && !hangryeolChars.includes(v)) setHangryeolChars(prev => [...prev, v]);
                                setHangryeolInput('');
                              }}
                              className="px-3 py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-xl border border-primary-200"
                            >추가</button>
                          </div>
                        )}
                      </div>

                      {/* 위치 선택 */}
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">항렬 위치</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { pos: '앞', label: '앞자리', example: '[준]서', desc: '준서, 준혁...' },
                            { pos: '뒤', label: '뒷자리', example: '하[준]', desc: '하준, 지준...' },
                            { pos: '모름', label: '모름', example: '?', desc: '두 위치 모두' },
                          ] as const).map(({ pos, label, example, desc }) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setHangryeolPosition(pos)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${
                                hangryeolPosition === pos
                                  ? 'border-primary-400 bg-primary-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="text-lg font-black text-primary-600">{example}</div>
                              <div className="text-xs font-medium text-gray-700 mt-0.5">{label}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 미리보기 */}
                      {hangryeolChars.length > 0 && (
                        <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                          예시: {getHangryeolPreview(hangryeolChars, hangryeolPosition)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">형제/자매 이름 (쉼표로 구분)</label>
                  <input
                    type="text"
                    {...register('siblingNames')}
                    placeholder="예: 지민, 서연"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>
            </details>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  이름 추천받기 (무료)
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Review CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-br from-secondary-50 to-primary-50 border border-secondary-200 rounded-2xl p-5"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm mb-3">
              <Search className="w-5 h-5 text-secondary-700" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">이미 지은 이름이 있다면?</h3>
            <p className="text-sm text-gray-500 mb-4">
              음양오행, 획수, 발음, 의미를 종합 분석해드려요
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/naming/review')}
              className="w-full bg-white text-primary-600 border-2 border-primary-200 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              이름 검수하기 (무료)
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
