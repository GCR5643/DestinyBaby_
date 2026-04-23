'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gem } from 'lucide-react';

interface CalendarDay {
  date: number;
  checkedIn: boolean;
  streak: number;
  bonus: number;
  isToday: boolean;
  isFuture: boolean;
}

interface MonthlyCalendarProps {
  year: number;
  month: number;
  checkinDates: { checkin_date: string; streak: number; bonus_fragments: number }[];
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function MonthlyCalendar({ year, month, checkinDates, onMonthChange }: MonthlyCalendarProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const checkinMap = new Map(
    checkinDates.map(r => [r.checkin_date, { streak: r.streak, bonus: r.bonus_fragments }])
  );

  const days: (CalendarDay | null)[] = [];
  // Fill empty cells before first day
  for (let i = 0; i < firstDay; i++) days.push(null);
  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = checkinMap.get(dateStr);
    const dateObj = new Date(year, month - 1, d);
    days.push({
      date: d,
      checkedIn: !!record,
      streak: record?.streak || 0,
      bonus: record?.bonus || 0,
      isToday: dateStr === todayStr,
      isFuture: dateObj > today,
    });
  }

  const canGoNext = !(year === today.getFullYear() && month === today.getMonth() + 1);

  const handlePrev = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  return (
    <div className="bg-white rounded-card border border-primary-100 shadow-soft p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-display font-bold text-gray-800">
          {year}년 {MONTH_NAMES[month - 1]}
        </h3>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center relative">
            {day && (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition ${
                  day.checkedIn
                    ? 'bg-primary-500 text-white font-bold'
                    : day.isToday
                    ? 'bg-primary-50 text-primary-600 font-bold ring-2 ring-primary-300'
                    : day.isFuture
                    ? 'text-gray-300'
                    : 'text-gray-500'
                }`}
              >
                {day.date}
              </div>
            )}
            {/* Bonus indicator */}
            {day?.bonus ? (
              <div className="absolute -top-0.5 -right-0.5">
                <Gem className="w-3 h-3 text-yellow-500" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary-500" /> 출석
        </span>
        <span className="flex items-center gap-1">
          <Gem className="w-3 h-3 text-yellow-500" /> 보너스
        </span>
      </div>
    </div>
  );
}
