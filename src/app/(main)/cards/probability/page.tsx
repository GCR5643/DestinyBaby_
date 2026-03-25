'use client';

import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const GRADE_COLORS: Record<string, string> = {
  B: '#95a5a6',
  A: '#F9CA24',
  S: '#a29bfe',
  SS: '#fd79a8',
  SSS: '#e17055',
};

export default function ProbabilityPage() {
  const { data: probabilities, isLoading } = trpc.cards.getProbabilityConfig.useQuery();

  const total = probabilities?.reduce((sum, p) => sum + p.probability, 0) ?? 100;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)' }}>
      {/* 헤더 */}
      <div className="pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/cards" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">카드 획득 확률 안내</h1>
        </div>
        <p className="text-white/50 text-sm">게임산업진흥법에 따라 확률 정보를 공개합니다</p>
      </div>

      <div className="px-4 space-y-4">
        {/* 등급별 확률 테이블 */}
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-white font-semibold mb-4">등급별 획득 확률</h2>
          {isLoading ? (
            <div className="text-center py-8 text-white/40 text-sm">불러오는 중...</div>
          ) : (
            <div className="space-y-3">
              {(probabilities ?? []).map((p) => {
                const color = GRADE_COLORS[p.grade] ?? '#ffffff';
                const pct = total > 0 ? (p.probability / total) * 100 : p.probability;
                return (
                  <div key={p.grade}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color }}>{p.grade} 등급</span>
                      <span className="text-sm text-white/70">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 천장 시스템 안내 */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
          <h2 className="text-white font-semibold">천장 시스템</h2>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-white/80 text-sm font-semibold">SS등급 이상 확정: 50회</p>
              <p className="text-white/50 text-xs mt-0.5">50회 뽑기 내에 SS등급 이상이 미등장 시 확정 지급</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-white/80 text-sm font-semibold">SSS등급 확정: 90회</p>
              <p className="text-white/50 text-xs mt-0.5">90회 뽑기 내에 SSS등급이 미등장 시 확정 지급</p>
            </div>
          </div>
        </div>

        {/* 소프트 천장 안내 */}
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-white font-semibold mb-2">소프트 천장</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            37회째부터 고등급 확률이 점진적으로 증가합니다.<br />
            뽑기 횟수가 누적될수록 SS · SSS 등급이 나올 확률이 높아집니다.
          </p>
        </div>

        {/* 중복 카드 안내 */}
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-white font-semibold mb-2">중복 카드</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            이미 보유한 카드를 획득 시 <span className="text-gold-400 font-semibold">운명의 조각</span>으로 자동 전환됩니다.<br />
            운명의 조각은 상점에서 원하는 카드와 교환할 수 있습니다.
          </p>
        </div>

        {/* 매일 무료 뽑기 안내 */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <h2 className="text-white font-semibold mb-2">🎁 매일 무료 뽑기</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            로그인한 회원은 매일 1회 무료 뽑기가 제공됩니다.<br />
            무료 뽑기는 자정(00:00)에 초기화됩니다.
          </p>
        </div>

        {/* 법적 고지 */}
        <div className="bg-white/3 rounded-2xl p-4">
          <h2 className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wide">법적 고지</h2>
          <p className="text-white/30 text-xs leading-relaxed">
            본 서비스는 게임산업진흥법에 따라 확률 정보를 공개합니다.
            표시된 확률은 독립 시행으로, 각 뽑기는 이전 결과에 영향을 받지 않습니다.
            천장 시스템은 누적 횟수 기준으로 적용되며, 계정 초기화 또는 서비스 정책 변경 시
            사전 공지 후 변경될 수 있습니다.
          </p>
        </div>

        {/* 뒤로 가기 */}
        <div className="text-center pt-2">
          <Link href="/cards" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← 카드 뽑기로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
