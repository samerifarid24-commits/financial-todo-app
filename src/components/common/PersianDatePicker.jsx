import React, { useState, useRef, useEffect } from 'react';
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  getJalaliMonthDays,
  getMonthFirstDayWeekday,
  getTodayJalali,
  formatJalaliString,
  toPersianNumber
} from '../../utils/jalali';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';

export default function PersianDatePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ...',
  error,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value or fallback to today
  const today = getTodayJalali();
  let currentYear = today.jy;
  let currentMonth = today.jm;
  let currentDay = today.jd;

  if (value && typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3) {
      currentYear = parseInt(parts[0], 10) || today.jy;
      currentMonth = parseInt(parts[1], 10) || today.jm;
      currentDay = parseInt(parts[2], 10) || today.jd;
    }
  }

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  // Sync view when opened
  useEffect(() => {
    if (isOpen) {
      setViewYear(currentYear);
      setViewMonth(currentMonth);
    }
  }, [isOpen, currentYear, currentMonth]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const startDayWeekday = getMonthFirstDayWeekday(viewYear, viewMonth); // 0=Sat, 6=Fri

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const dateStr = formatJalaliString(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const t = getTodayJalali();
    onChange(formatJalaliString(t.jy, t.jm, t.jd));
    setIsOpen(false);
  };

  const handleSelectTomorrow = (e) => {
    e.stopPropagation();
    const t = getTodayJalali();
    let d = t.jd + 1;
    let m = t.jm;
    let y = t.jy;
    const maxDays = getJalaliMonthDays(y, m);
    if (d > maxDays) {
      d = 1;
      m = m === 12 ? 1 : m + 1;
      if (m === 1) y += 1;
    }
    onChange(formatJalaliString(y, m, d));
    setIsOpen(false);
  };

  const isToday = (day) => {
    return viewYear === today.jy && viewMonth === today.jm && day === today.jd;
  };

  const isSelected = (day) => {
    return viewYear === currentYear && viewMonth === currentMonth && day === currentDay;
  };

  return (
    <div className="relative w-full text-right" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[#4a3528] dark:text-[#d5c7bc] mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 ${
          error
            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800'
            : 'border-[#e8e0d5] dark:border-[#423329] bg-white dark:bg-[#2c1e18] text-[#2c1d11] dark:text-[#f3ede8] hover:border-[#ca8a04]'
        }`}
      >
        <span className="font-medium">
          {value ? toPersianNumber(value) : <span className="text-neutral-400">{placeholder}</span>}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#7e22ce] dark:text-[#fbbf24] shrink-0" />
      </button>

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 right-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#251914] shadow-2xl border border-[#e8e0d5] dark:border-[#423329] p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f0eae3] dark:border-[#38261e]">
            {/* Next Month (in RTL, Right arrow goes previous month, Left arrow goes next month) */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#f5efe9] dark:hover:bg-[#38261e] text-[#4a3528] dark:text-[#d5c7bc] transition"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center font-bold text-sm text-[#2c1d11] dark:text-[#f3ede8]">
              {PERSIAN_MONTHS[viewMonth - 1]} {toPersianNumber(viewYear)}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#f5efe9] dark:hover:bg-[#38261e] text-[#4a3528] dark:text-[#d5c7bc] transition"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {PERSIAN_WEEKDAYS_SHORT.map((wd, i) => (
              <div
                key={i}
                className={`text-xs font-semibold py-1 ${
                  i === 6 ? 'text-rose-500' : 'text-[#7e6c60] dark:text-[#a8988b]'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset days */}
            {Array.from({ length: startDayWeekday }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-8 w-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const selected = isSelected(day);
              const todayDay = isToday(day);
              const isFriday = (startDayWeekday + idx) % 7 === 6;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-medium transition-all ${
                    selected
                      ? 'bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white shadow-md font-bold'
                      : todayDay
                      ? 'border border-[#d97706] text-[#d97706] font-bold hover:bg-[#fbf5ee] dark:hover:bg-[#35231a]'
                      : isFriday
                      ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'text-[#2c1d11] dark:text-[#e7ddd5] hover:bg-[#f5efe9] dark:hover:bg-[#38261e]'
                  }`}
                >
                  {toPersianNumber(day)}
                </button>
              );
            })}
          </div>

          {/* Quick presets footer */}
          <div className="mt-3 pt-2.5 border-t border-[#f0eae3] dark:border-[#38261e] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[#7e22ce] dark:text-[#fbbf24] font-semibold hover:underline"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={handleSelectTomorrow}
              className="text-[#d97706] dark:text-[#eab308] font-semibold hover:underline"
            >
              فردا
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#8d7c71] hover:text-[#4a3528] dark:hover:text-[#f3ede8]"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
