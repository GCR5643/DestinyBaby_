'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';

// 월요일 시작 한국어 로케일 (ko locale의 weekStartsOn을 0→1로 변경)
const koMonday = {
  ...ko,
  options: { ...ko.options, weekStartsOn: 1 as const },
};
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface KoreanDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function KoreanDatePicker({
  value,
  onChange,
  label,
  placeholder = '날짜 선택',
  required,
}: KoreanDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(parsed)) return parsed;
    }
    return new Date(1990, 0, 1);
  });
  const overlayRef = useRef<HTMLDivElement>(null);

  const selected: Date | undefined = (() => {
    if (!value) return undefined;
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : undefined;
  })();

  const displayValue = selected
    ? format(selected, 'yyyy년 MM월 dd일', { locale: ko })
    : '';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    }
  };

  // Year/month dropdowns for the caption
  const currentYear = month.getFullYear();
  const currentMonthIndex = month.getMonth();
  const years = Array.from({ length: 2040 - 1940 + 1 }, (_, i) => 1940 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="relative w-full">
      {label && (
        <label className="text-xs text-gray-500 mb-1 block">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 flex items-center justify-between bg-white text-left"
      >
        <span className={displayValue ? 'text-gray-800' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            ref={overlayRef}
            className="bg-white rounded-2xl shadow-xl p-4 w-[320px]"
          >
            {/* Custom year/month selects */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <select
                value={currentYear}
                onChange={(e) =>
                  setMonth(new Date(Number(e.target.value), currentMonthIndex, 1))
                }
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-400"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
              <select
                value={currentMonthIndex}
                onChange={(e) =>
                  setMonth(new Date(currentYear, Number(e.target.value), 1))
                }
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-400"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m + 1}월
                  </option>
                ))}
              </select>
            </div>

            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonth}
              locale={koMonday}
              fromYear={1940}
              toYear={2040}
              classNames={{
                root: 'w-full',
                months: 'flex flex-col',
                month: 'space-y-2',
                month_caption: 'hidden',
                nav: 'flex items-center justify-between mb-2',
                button_previous:
                  'h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600',
                button_next:
                  'h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday:
                  'text-gray-500 rounded-md w-9 font-normal text-[0.8rem] text-center',
                weeks: 'w-full',
                week: 'flex w-full mt-1',
                day: 'text-center text-sm relative p-0',
                day_button:
                  'h-9 w-9 p-0 font-normal rounded-full hover:bg-gray-100 mx-auto flex items-center justify-center',
                selected: 'bg-primary-500 text-white hover:bg-primary-600 rounded-full',
                today: 'font-bold text-primary-600',
                outside: 'text-gray-300',
                disabled: 'text-gray-300',
              }}
            />

            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
