import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalali,
  formatJalaliString,
  PERSIAN_MONTHS,
  toPersianNumber
} from '../utils/jalali';
import { calculateBalanceSheet } from '../services/financialCalculations';
import { formatCurrency, ACCOUNT_TYPE_CONFIG } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import {
  Scale,
  Printer,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function BalanceSheetPage() {
  const { accounts, transactions, settings, openPdfReportModal } = useApp();

  const today = getTodayJalali();
  const [selectedMonth, setSelectedMonth] = useState(today.jm);
  const [selectedYear, setSelectedYear] = useState(today.jy);

  // Month date range
  const startDate = formatJalaliString(selectedYear, selectedMonth, 1);
  const maxDay = selectedMonth <= 6 ? 31 : selectedMonth <= 11 ? 30 : 29;
  const endDate = formatJalaliString(selectedYear, selectedMonth, maxDay);

  const balanceSheet = useMemo(() => {
    return calculateBalanceSheet(accounts, transactions, startDate, endDate);
  }, [accounts, transactions, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            گزارش تراز مالی و گردش حساب‌ها
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            بررسی موجودی ابتدای دوره، درآمدها، هزینه‌ها، نقل و انتقالات و مانده نهایی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed]"
          >
            {PERSIAN_MONTHS.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                ماه {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed]"
          >
            {[today.jy - 1, today.jy, today.jy + 1].map((y) => (
              <option key={y} value={y}>
                سال {toPersianNumber(y)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => openPdfReportModal('balance', selectedMonth, selectedYear)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 hover:scale-[1.02] active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ PDF ترازنامه</span>
          </button>
        </div>
      </div>

      {/* 5-Step Equation Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Opening Balance */}
        <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              ۱. موجودی اول دوره
            </span>
            <div className="text-base sm:text-lg font-black text-purple-950 dark:text-purple-100 mt-1">
              {formatCurrency(balanceSheet.openingBalance, settings.currency)}
            </div>
          </div>
          <span className="text-[10px] text-purple-600/80 mt-2 font-mono">{toPersianNumber(startDate)}</span>
        </div>

        {/* 2. Total Incomes (+) */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              ۲. مجموع درآمد (+)
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100 mt-1">
              + {formatCurrency(balanceSheet.totalIncome, settings.currency)}
            </div>
          </div>
          <span className="text-[10px] text-emerald-600/80 mt-2">افزایش دارایی</span>
        </div>

        {/* 3. Total Expenses (-) */}
        <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              ۳. مجموع هزینه (-)
            </span>
            <div className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 mt-1">
              - {formatCurrency(balanceSheet.totalExpense, settings.currency)}
            </div>
          </div>
          <span className="text-[10px] text-rose-600/80 mt-2">کاهش دارایی</span>
        </div>

        {/* 4. Total Transfers (⇄) */}
        <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              ۴. حجم جابجایی‌ها
            </span>
            <div className="text-base sm:text-lg font-black text-indigo-950 dark:text-indigo-100 mt-1">
              {formatCurrency(balanceSheet.totalTransfers, settings.currency)}
            </div>
          </div>
          <span className="text-[10px] text-indigo-600/80 mt-2">بدون تغییر در تراز کل</span>
        </div>

        {/* 5. Closing Balance (=) */}
        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              ۵. موجودی پایان دوره (=)
            </span>
            <div className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-100 mt-1">
              {formatCurrency(balanceSheet.closingBalance, settings.currency)}
            </div>
          </div>
          <span className="text-[10px] text-amber-600/80 mt-2 font-mono">{toPersianNumber(endDate)}</span>
        </div>
      </div>

      {/* Account Balances Breakdown Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
        <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-1">
          تفکیک وضعیت و موجودی حساب‌ها
        </h3>
        <p className="text-xs text-[#7c695c] dark:text-[#a89587] mb-4">
          صورت مانده دارایی در هر یک از حساب‌ها و کیف‌های پول
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#f0eae3] dark:border-[#38261e] text-[#7c695c] dark:text-[#a89587] font-bold">
                <th className="py-2.5 px-3">نام حساب</th>
                <th className="py-2.5 px-3">نوع حساب</th>
                <th className="py-2.5 px-3">موجودی اولیه</th>
                <th className="py-2.5 px-3">مجموع دریافتی</th>
                <th className="py-2.5 px-3">مجموع پرداختی</th>
                <th className="py-2.5 px-3 text-left">موجودی فعلی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9] dark:divide-[#332117]">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-[#faf6f2] dark:hover:bg-[#2d1e17]/50">
                  <td className="py-3 px-3 font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                    {acc.name}
                  </td>
                  <td className="py-3 px-3 text-[#7c695c] dark:text-[#a89587]">
                    {ACCOUNT_TYPE_CONFIG[acc.type]?.label || 'حساب'}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(acc.initialBalance, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-emerald-600 font-semibold">
                    {formatCurrency(acc.totalIncome, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-rose-600 font-semibold">
                    {formatCurrency(acc.totalExpense, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-left font-black text-[#2a1a12] dark:text-[#f8f2ed]">
                    {formatCurrency(acc.currentBalance, settings.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#7e22ce] font-black text-xs sm:text-sm bg-[#faf6f2] dark:bg-[#291811]">
                <td className="py-3 px-3" colSpan={5}>
                  جمع کل موجودی دارایی‌ها:
                </td>
                <td className="py-3 px-3 text-left text-base text-[#7e22ce] dark:text-[#fbbf24]">
                  {formatCurrency(
                    accounts.reduce((s, a) => s + (a.currentBalance || 0), 0),
                    settings.currency
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
