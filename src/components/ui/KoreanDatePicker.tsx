'use client';

import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { parse, format, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface KoreanDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  openToDate?: Date;
}

const CustomInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; placeholder?: string }
>(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 flex items-center justify-between bg-white text-left"
  >
    <span className={value ? 'text-gray-800' : 'text-gray-400'}>
      {value || placeholder}
    </span>
    <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
  </button>
));
CustomInput.displayName = 'CustomInput';

export function KoreanDatePicker({
  value,
  onChange,
  label,
  placeholder = '날짜 선택',
  required,
  openToDate,
}: KoreanDatePickerProps) {
  const selected: Date | null = (() => {
    if (!value) return null;
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  })();

  const handleChange = (date: Date | null) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="relative w-full kdp-wrapper">
      {label && (
        <label className="text-xs text-gray-500 mb-1 block">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <DatePicker
        selected={selected}
        onChange={handleChange}
        locale={ko}
        dateFormat="yyyy년 MM월 dd일"
        placeholderText={placeholder}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={50}
        minDate={new Date(1940, 0, 1)}
        maxDate={new Date(2040, 11, 31)}
        openToDate={selected ?? openToDate}
        customInput={<CustomInput placeholder={placeholder} />}
        popperPlacement="bottom-start"
      />
    </div>
  );
}
