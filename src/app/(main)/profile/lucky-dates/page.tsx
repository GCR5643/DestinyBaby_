'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Hospital,
  Star,
  Clock,
  ChevronLeft,
  X,
  Check,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { cn, formatKoreanDate, formatTime } from '@/lib/utils';

// -----------------------------------------------------------------------
// 로컬 타입 (DB row 형태)
// -----------------------------------------------------------------------
type LuckyDateStatus = 'candidate' | 'selected' | 'confirmed' | 'passed';
type LuckyDateSource = 'recommendation' | 'manual' | 'hospital';

interface LuckyDateRow {
  id: string;
  date: string;
  time?: string | null;
  score?: number | null;
  status?: LuckyDateStatus | null;
  source?: LuckyDateSource | null;
  hospital_note?: string | null;
  saju_analysis?: Record<string, unknown> | null;
}

// -----------------------------------------------------------------------
// 상수 & 헬퍼
// -----------------------------------------------------------------------
const STATUS_LABEL: Record<LuckyDateStatus, string> = {
  candidate: '후보',
  selected: '선택됨',
  confirmed: '확정',
  passed: '지남',
};

const SOURCE_LABEL: Record<LuckyDateSource, string> = {
  recommendation: 'AI 추천',
  manual: '직접 추가',
  hospital: '병원 일정',
};

const SOURCE_ICON: Record<LuckyDateSource, string> = {
  recommendation: '✨',
  manual: '✏️',
  hospital: '🏥',
};

function statusBadgeClass(status: LuckyDateStatus | null | undefined): string {
  switch (status) {
    case 'selected':
      return 'bg-primary-100 text-primary-700 border border-primary-300';
    case 'confirmed':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'passed':
      return 'bg-gray-100 text-gray-400';
    default:
      return 'bg-gray-100 text-gray-500';
  }
}

function cardBgClass(status: LuckyDateStatus | null | undefined): string {
  switch (status) {
    case 'selected':
      return 'bg-primary-50 border border-primary-200';
    case 'confirmed':
      return 'bg-green-50 border border-green-200';
    case 'passed':
      return 'bg-gray-50 border border-gray-100 opacity-60';
    default:
      return 'bg-white border border-gray-100';
  }
}

function getDayPillar(row: LuckyDateRow): string | null {
  const analysis = row.saju_analysis;
  if (!analysis) return null;
  if (typeof analysis.dayPillar === 'string') return analysis.dayPillar;
  return null;
}

// -----------------------------------------------------------------------
// 메인 페이지
// -----------------------------------------------------------------------
export default function LuckyDatesPage() {
  const { data: rawDates, refetch } = trpc.birthdate.getMyLuckyDates.useQuery();
  const saveLuckyDate = trpc.birthdate.saveLuckyDate.useMutation({ onSuccess: () => refetch() });
  const updateLuckyDate = trpc.birthdate.updateLuckyDate.useMutation({ onSuccess: () => refetch() });
  const deleteLuckyDate = trpc.birthdate.deleteLuckyDate.useMutation({ onSuccess: () => refetch() });

  const luckyDates: LuckyDateRow[] = (rawDates ?? []) as LuckyDateRow[];

  // 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // 수정 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editStatus, setEditStatus] = useState<LuckyDateStatus>('candidate');

  // 삭제 확인 상태
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ---- 핸들러 ----
  const handleAdd = () => {
    if (!newDate) return;
    saveLuckyDate.mutate({
      date: newDate,
      time: newTime || undefined,
      source: 'manual',
    });
    setNewDate('');
    setNewTime('');
    setShowAddForm(false);
  };

  const handleStartEdit = (row: LuckyDateRow) => {
    setEditingId(row.id);
    setEditDate(row.date);
    setEditTime(row.time ?? '');
    setEditNote(row.hospital_note ?? '');
    setEditStatus((row.status as LuckyDateStatus) ?? 'candidate');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateLuckyDate.mutate({
      id: editingId,
      date: editDate || undefined,
      time: editTime || undefined,
      status: editStatus,
      hospitalNote: editNote || undefined,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteLuckyDate.mutate({ id });
    setConfirmDeleteId(null);
  };

  // ---- 렌더 ----
  return (
    <div className="min-h-screen bg-ivory pb-28">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-400 pt-12 pb-8 px-4">
        <div className="flex items-center gap-3 text-white mb-4">
          <Link href="/profile" className="p-1">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">내 예비 사주 목록</h1>
        </div>
        <p className="text-white/70 text-sm ml-10">
          저장된 길일을 관리하고, 산부인과 일정에 맞춰 조정하세요
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 추가 버튼 */}
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white rounded-2xl shadow-sm border border-dashed border-primary-300 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          길일 직접 추가
        </button>

        {/* 추가 폼 (바텀시트 스타일) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  길일 추가
                </h2>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">날짜 *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">시간 (선택)</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={!newDate || saveLuckyDate.isPending}
                    className="flex-1 bg-primary-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    저장
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewDate(''); setNewTime(''); }}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 빈 상태 */}
        {luckyDates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">저장된 길일이 없어요</p>
            <p className="text-gray-400 text-sm mb-6">탄생일 추천을 받아보세요</p>
            <Link
              href="/birthdate"
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm inline-block"
            >
              탄생일 추천받기
            </Link>
          </motion.div>
        )}

        {/* 길일 카드 목록 */}
        <AnimatePresence initial={false}>
          {luckyDates.map((row, i) => {
            const isEditing = editingId === row.id;
            const status = (row.status as LuckyDateStatus) ?? 'candidate';
            const source = (row.source as LuckyDateSource) ?? 'recommendation';
            const dayPillar = getDayPillar(row);

            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={cn('rounded-2xl shadow-sm p-4', cardBgClass(status))}
              >
                {isEditing ? (
                  /* ---- 수정 모드 ---- */
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-primary-500" />
                      길일 수정
                    </h3>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">날짜</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">시간</label>
                      <input
                        type="time"
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">상태</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as LuckyDateStatus)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white"
                      >
                        <option value="candidate">후보</option>
                        <option value="selected">선택됨</option>
                        <option value="confirmed">확정</option>
                        <option value="passed">지남</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <Hospital className="w-3 h-3" />
                        병원 메모
                      </label>
                      <textarea
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        rows={3}
                        placeholder="예: 오전 10시 제왕절개 예약 확인 필요"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateLuckyDate.isPending}
                        className="flex-1 bg-primary-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- 보기 모드 ---- */
                  <>
                    {/* 상단: 날짜 + 상태 배지 */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-lg font-black text-gray-800">
                          {formatKoreanDate(row.date)}
                        </p>
                        {row.time && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(row.time)}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold px-2.5 py-1 rounded-full',
                          statusBadgeClass(status),
                        )}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </div>

                    {/* 중간: 점수 + 일주 + 출처 */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {row.score != null && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-700">{row.score}점</span>
                        </div>
                      )}
                      {dayPillar && (
                        <div className="bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1">
                          <span className="text-xs font-bold text-purple-700">일주: {dayPillar}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                        <span className="text-xs">{SOURCE_ICON[source]}</span>
                        <span className="text-xs text-gray-600">{SOURCE_LABEL[source]}</span>
                      </div>
                    </div>

                    {/* 병원 메모 */}
                    {row.hospital_note && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-2.5 mb-3">
                        <Hospital className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">{row.hospital_note}</p>
                      </div>
                    )}

                    {/* 하단: 수정/삭제 버튼 */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleStartEdit(row)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 rounded-xl font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정
                      </button>
                      {confirmDeleteId === row.id ? (
                        <div className="flex gap-1.5 ml-auto">
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={deleteLuckyDate.isPending}
                            className="text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors px-3 py-2 rounded-xl font-medium"
                          >
                            삭제 확인
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 rounded-xl"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(row.id)}
                          className="ml-auto flex items-center gap-1.5 text-xs text-red-400 bg-red-50 hover:bg-red-100 transition-colors px-3 py-2 rounded-xl font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          삭제
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
