'use client';

import { Gem, ArrowUp, ArrowDown } from 'lucide-react';

interface TransactionItemProps {
  amount: number;
  type: string;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

const TYPE_LABELS: Record<string, { label: string; icon: 'earn' | 'spend' }> = {
  checkin: { label: '출석 보상', icon: 'earn' },
  checkin_bonus: { label: '연속 출석 보너스', icon: 'earn' },
  purchase: { label: '조각 구매', icon: 'earn' },
  fortune_spend: { label: '오늘의 운수', icon: 'spend' },
  refund: { label: '환불', icon: 'earn' },
  signup_bonus: { label: '가입 보너스', icon: 'earn' },
};

export default function TransactionItem({
  amount,
  type,
  description,
  balanceAfter,
  createdAt,
}: TransactionItemProps) {
  const typeInfo = TYPE_LABELS[type] || { label: type, icon: amount > 0 ? 'earn' : 'spend' };
  const isEarn = amount > 0;

  const dateStr = new Date(createdAt).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isEarn ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {isEarn ? (
            <ArrowDown className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowUp className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{typeInfo.label}</p>
          <p className="text-xs text-gray-400">{description || dateStr}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-bold ${
            isEarn ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {isEarn ? '+' : ''}{amount}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
          <Gem className="w-3 h-3" />
          {balanceAfter}
        </p>
      </div>
    </div>
  );
}
