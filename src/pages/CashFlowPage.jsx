import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalali,
  getTodayJalaliString,
  formatJalaliString,
  toPersianNumber
} from '../utils/jalali';
import { calculateCashFlowStatement } from '../services/financialCalculations';
import { formatCurrency } from '../utils/formatters';
import { CashFlowChart } from '../components/common/Charts';
import PersianDatePicker from '../components/common/PersianDatePicker';
import {
  Activity,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter
} from 'lucide-react';

export default function CashFlowPage() {
  const { accounts, transactions, settings, openPdfReportModal } = useApp();

  const today = getTodayJalali();
  const todayStr = getTodayJalaliString();

  // Period mode: 'today' | 'week' | 'month' | 'custom'
  const [periodMode, setPeriodMode] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Calculate start & end based on period
  const { startDate, endDate } = useMemo(() => {
    if (periodMode === 'today') {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (periodMode === 'week') {
      const startDay = Math.max(1, today.jd - 7);
      return {
        startDate: formatJalaliString(today.jy, today.jm, startDay),
        endDate: todayStr
      };
    }
    if (periodMode === 'custom') {
      return {
        startDate: customStart || formatJalaliString(today.jy, today.jm, 1),
        endDate: customEnd || todayStr
      };
    }
    // Default 'month'
    const maxDays = today.jm <= 6 ? 31 : today.jm <= 11 ? 30 : 29;
    return {
      startDate: formatJalaliString(today.jy, today.jm, 1),
      endDate: formatJalaliString(today.jy, today.jm, maxDays)
    };
  }, [periodMode, customStart, customEnd, today, todayStr]);

  const cashFlow = useMemo(() => {
    return calculateCashFlowStatement(accounts, transactions, startDate, endDate);
  }, [accounts, transactions, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            گزارش تحلیل جریان نقدی (Cash Flow)
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            پایش ورود و خروج پول و نقدینگی بر اساس روز، هفته، ماه یا بازه دلخواه
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPdfReportModal('cash-flow')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 self-start sm:self-auto hover:scale-[1.02] active:scale-95 transition"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ PDF جریان نقدی</span>
        </button>
      </div>

      {/* Filter Mode Selector */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#ede3d8] dark:bg-[#2e1d14] text-xs font-semibold">
            {[
              { key: 'today', label: 'امروز' },
              { key: 'week', label: '۷ روز گذشته' },
              { key: 'month', label: 'ماه جاری' },
              { key: 'custom', label: 'بازه دلخواه' }
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriodMode(p.key)}
                className={`px-3.5 py-1.5 rounded-xl transition ${
                  periodMode === p.key
                    ? 'bg-white dark:bg-[#20120a] text-[#7e22ce] dark:text-[#fbbf24] shadow-sm font-bold'
                    : 'text-[#6c594c] dark:text-[#a89587] hover:text-[#2a1a12]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#7c695c] dark:text-[#a89587] font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#d97706]" />
            <span>
              بازه زمانی: از {toPersianNumber(startDate)} تا {toPersianNumber(endDate)}
            </span>
          </div>
        </div>

        {/* Custom date range pickers when 'custom' is selected */}
        {periodMode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#f0eae3] dark:border-[#38261e]">
            <PersianDatePicker
              label="از تاریخ"
              value={customStart}
              onChange={(d) => setCustomStart(d)}
              placeholder="انتخاب شروع..."
            />
            <PersianDatePicker
              label="تا تاریخ"
              value={customEnd}
              onChange={(d) => setCustomEnd(d)}
              placeholder="انتخاب پایان..."
            />
          </div>
        )}
      </div>

      {/* Cash Flow 4 Main Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Initial Cash */}
        <div className="p-5 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 shadow-sm">
          <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
            موجودی اولیه نقدینگی
          </span>
          <div className="text-lg sm:text-xl font-black text-purple-950 dark:text-purple-100 mt-1">
            {formatCurrency(cashFlow.initialCash, settings.currency)}
          </div>
          <p className="text-[11px] text-purple-700/80 mt-1">ابتدای بازه زمانی</p>
        </div>

        {/* Inflow */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            ورود وجه نقد (دریافتی)
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
            + {formatCurrency(cashFlow.cashInflow, settings.currency)}
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">کل وجوه نقد ورودی</p>
        </div>

        {/* Outflow */}
        <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 shadow-sm">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
            خروج وجه نقد (پرداختی)
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-950 dark:text-rose-100 mt-1">
            - {formatCurrency(cashFlow.cashOutflow, settings.currency)}
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">کل وجوه نقد خروجی</p>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-sm">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            جریان خالص نقدینگی
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
            {formatCurrency(cashFlow.netCashFlow, settings.currency, true)}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">
            موجودی نهایی: {formatCurrency(cashFlow.endingCash, settings.currency)}
          </p>
        </div>
      </div>

      {/* Visual Inflow/Outflow Comparison Bars */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
          مقایسه نسبت ورود و خروج نقدینگی در این بازه
        </h3>
        <CashFlowChart
          inflow={cashFlow.cashInflow}
          outflow={cashFlow.cashOutflow}
          net={cashFlow.netCashFlow}
          currency={settings.currency}
        />
      </div>

      {/* Inflow Breakdown & Outflow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-sm text-[#2a1a12] dark:text-[#f8f2ed]">
              منابع ورود وجه نقد (درآمدها)
            </h4>
          </div>

          {cashFlow.inflowBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">ورود وجه نقدی ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {cashFlow.inflowBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-xs p-2 rounded-xl bg-neutral-50 dark:bg-[#2d1e17]">
                  <span className="font-medium text-[#2a1a12] dark:text-[#f8f2ed]">{item.category}</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(item.amount, settings.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <ArrowDownLeft className="w-5 h-5 text-rose-600" />
            <h4 className="font-bold text-sm text-[#2a1a12] dark:text-[#f8f2ed]">
              موارد خروج وجه نقد (مخارج)
            </h4>
          </div>

          {cashFlow.outflowBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">خروج وجه نقدی ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {cashFlow.outflowBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-xs p-2 rounded-xl bg-neutral-50 dark:bg-[#2d1e17]">
                  <span className="font-medium text-[#2a1a12] dark:text-[#f8f2ed]">{item.category}</span>
                  <span className="font-bold text-rose-600">{formatCurrency(item.amount, settings.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
