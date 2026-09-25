import React, { useState } from 'react';
import { toPersianNumber } from '../../utils/jalali';
import { formatCurrency } from '../../utils/formatters';

/**
 * Income vs Expense grouped bar chart with Persian months & tooltips
 */
export function IncomeExpenseBarChart({ data = [], currency = 'IRT' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-neutral-400">داده‌ای برای نمایش وجود ندارد</div>;
  }

  // Find max value for scaling
  const hasAnyData = data.some(d => (d.income || 0) > 0 || (d.expense || 0) > 0);
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.income || 0, d.expense || 0)),
    1000000
  );

  const height = 220;
  const paddingBottom = 35;
  const chartHeight = height - paddingBottom;

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-4 text-xs font-medium text-[#7c695c] dark:text-[#a89587]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>درآمد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>هزینه</span>
          </div>
        </div>
        <span className="text-[11px] text-[#8e7b6f]">واحد: {currency === 'IRR' ? 'ریال' : 'تومان'}</span>
      </div>

      <div className="relative h-60 w-full overflow-x-auto">
        <div className="min-w-[500px] h-full flex flex-col justify-end">
          {/* Chart area */}
          <div className="relative flex-1 flex items-end justify-between gap-2 px-2 border-b border-[#e8dfd7] dark:border-[#422c22]">
            {data.map((item, idx) => {
              const incomeH = (item.income || 0) > 0 ? Math.max(((item.income || 0) / maxVal) * chartHeight, 4) : 0;
              const expenseH = (item.expense || 0) > 0 ? Math.max(((item.expense || 0) / maxVal) * chartHeight, 4) : 0;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 bg-[#1e130e] text-white text-[11px] p-2 rounded-xl shadow-xl whitespace-nowrap border border-[#402a1f] pointer-events-none">
                      <div className="font-bold text-[#fbbf24] mb-0.5">{item.monthName}</div>
                      <div className="text-emerald-400">درآمد: {formatCurrency(item.income, currency)}</div>
                      <div className="text-rose-400">هزینه: {formatCurrency(item.expense, currency)}</div>
                    </div>
                  )}

                  {/* Bars side by side */}
                  <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incomeH}px` }}
                      className={`w-1/2 max-w-[14px] rounded-t-md transition-all duration-300 ${
                        isHovered ? 'bg-emerald-400 scale-y-105' : 'bg-emerald-500'
                      }`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseH}px` }}
                      className={`w-1/2 max-w-[14px] rounded-t-md transition-all duration-300 ${
                        isHovered ? 'bg-rose-400 scale-y-105' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-[11px] text-[#7c695c] dark:text-[#a89587] font-medium mt-1 truncate max-w-[40px]">
                    {item.monthName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {!hasAnyData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-[#8d7c71] dark:text-[#a89587] bg-white/90 dark:bg-[#241712]/90 px-3.5 py-1.5 rounded-xl border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
              هنوز داده‌ای برای مقایسه ۱۲ ماهه ثبت نشده است
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Donut chart for Expense or Income category distribution
 */
export function CategoryDonutChart({ items = [], currency = 'IRT', emptyMessage = 'هزینه‌ای ثبت نشده است' }) {
  const [activeItem, setActiveItem] = useState(null);

  if (!items || items.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-neutral-400">{emptyMessage}</div>;
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const palette = [
    '#7e22ce', '#d97706', '#059669', '#e11d48', '#0284c7',
    '#9333ea', '#ea580c', '#10b981', '#f43f5e', '#64748b'
  ];

  // Calculate SVG stroke dashes
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="18"
            className="text-neutral-100 dark:text-neutral-800"
          />
          {items.map((item, idx) => {
            const fraction = totalAmount > 0 ? item.amount / totalAmount : 0;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += fraction * circumference;
            const color = palette[idx % palette.length];

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={activeItem === item ? "22" : "18"}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[10px] text-[#8d7c71] dark:text-[#a89587]">
            {activeItem ? activeItem.category : 'مجموع'}
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
            {activeItem
              ? `${toPersianNumber(activeItem.percentage)}٪`
              : formatCurrency(totalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 w-full space-y-2.5 max-h-52 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const color = palette[idx % palette.length];
          const isSelected = activeItem === item;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                isSelected
                  ? 'bg-[#f7f2ed] dark:bg-[#34241c] font-bold'
                  : 'hover:bg-neutral-50 dark:hover:bg-[#2d1e17]/50'
              }`}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[#3b281d] dark:text-[#e4d6cc] truncate max-w-[130px]">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#8d7c71] dark:text-[#9e8b7f] font-medium">
                  {toPersianNumber(item.percentage)}٪
                </span>
                <span className="font-semibold text-[#2a1a12] dark:text-[#f8f2ed]">
                  {formatCurrency(item.amount, currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Cash flow chart showing cumulative / period trajectory
 */
export function CashFlowChart({ inflow = 0, outflow = 0, net = 0, currency = 'IRT' }) {
  const max = Math.max(inflow, outflow, Math.abs(net), 100000);
  const inflowRatio = (inflow / max) * 100;
  const outflowRatio = (outflow / max) * 100;
  const isNetPositive = net >= 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">ورود وجه نقد (درآمد و دریافتی‌ها)</span>
          <span className="font-bold text-emerald-600">{formatCurrency(inflow, currency)}</span>
        </div>
        <div className="h-3 w-full bg-neutral-100 dark:bg-[#332219] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(inflowRatio, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-rose-600 dark:text-rose-400">خروج وجه نقد (هزینه‌ها و پرداخت‌ها)</span>
          <span className="font-bold text-rose-600">{formatCurrency(outflow, currency)}</span>
        </div>
        <div className="h-3 w-full bg-neutral-100 dark:bg-[#332219] rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(outflowRatio, 100)}%` }}
          />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#2c1d16] border border-[#e8dfd7] dark:border-[#3d2a20] flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-[#4a362a] dark:text-[#d3c4b9]">
          جریان نقدی خالص این دوره:
        </span>
        <span className={`font-bold ${isNetPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formatCurrency(net, currency, true)}
        </span>
      </div>
    </div>
  );
}
