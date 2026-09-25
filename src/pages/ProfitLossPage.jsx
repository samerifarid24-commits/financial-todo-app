import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalali,
  PERSIAN_MONTHS,
  toPersianNumber
} from '../utils/jalali';
import {
  filterTransactionsByMonth,
  calculateSummary,
  calculateCategoryBreakdown,
  calculateYearlyMonthlyData
} from '../services/financialCalculations';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Printer,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProfitLossPage() {
  const { transactions, settings, openPdfReportModal } = useApp();

  const today = getTodayJalali();
  const [selectedMonth, setSelectedMonth] = useState(today.jm);
  const [selectedYear, setSelectedYear] = useState(today.jy);

  // Month 1
  const periodTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedYear, selectedMonth);
  }, [transactions, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    return calculateSummary(periodTransactions);
  }, [periodTransactions]);

  const incomeBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(periodTransactions, 'income');
  }, [periodTransactions]);

  const expenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(periodTransactions, 'expense');
  }, [periodTransactions]);

  // Yearly 12 months for comparison table
  const yearlyMonths = useMemo(() => {
    return calculateYearlyMonthlyData(transactions, selectedYear);
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            صورت سود و زیان (P&L)
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            محاسبه دقیق سود خالص، زیان یا نقطه سربه‌سر دوره‌ای بر پایه تراکنش‌های ثبت‌شده
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
            onClick={() => openPdfReportModal('profit-loss', selectedMonth, selectedYear)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 hover:scale-[1.02] active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ PDF سود و زیان</span>
          </button>
        </div>
      </div>

      {/* Status Highlight Banner */}
      <div
        className={`p-6 rounded-3xl border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          summary.netProfitLoss > 0
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-300 dark:border-emerald-800'
            : summary.netProfitLoss < 0
            ? 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30 border-rose-300 dark:border-rose-800'
            : 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 border-amber-300 dark:border-amber-800'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              summary.netProfitLoss > 0
                ? 'bg-emerald-600 text-white'
                : summary.netProfitLoss < 0
                ? 'bg-rose-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {summary.netProfitLoss > 0 ? (
              <TrendingUp className="w-7 h-7" />
            ) : summary.netProfitLoss < 0 ? (
              <TrendingDown className="w-7 h-7" />
            ) : (
              <Scale className="w-7 h-7" />
            )}
          </div>
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                summary.netProfitLoss > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : summary.netProfitLoss < 0
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              وضعیت تراز ماه {PERSIAN_MONTHS[selectedMonth - 1]}:{' '}
              {summary.netProfitLoss > 0 ? 'سود خالص' : summary.netProfitLoss < 0 ? 'زیان خالص' : 'سربه‌سر'}
            </span>
            <div
              className={`text-2xl sm:text-3xl font-black mt-1 ${
                summary.netProfitLoss > 0
                  ? 'text-emerald-950 dark:text-emerald-200'
                  : summary.netProfitLoss < 0
                  ? 'text-rose-950 dark:text-rose-200'
                  : 'text-amber-950 dark:text-amber-200'
              }`}
            >
              {formatCurrency(summary.netProfitLoss, settings.currency, true)}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#523e32] dark:text-[#c4b3a5] text-left sm:text-right space-y-1">
          <div>
            کل درآمدها: <span className="font-bold text-emerald-600">{formatCurrency(summary.totalIncome, settings.currency)}</span>
          </div>
          <div>
            کل هزینه‌ها: <span className="font-bold text-rose-600">{formatCurrency(summary.totalExpense, settings.currency)}</span>
          </div>
          <div>
            فرمول: سود خالص = کل درآمد - کل هزینه
          </div>
        </div>
      </div>

      {/* Detailed Side-by-Side Incomes and Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Items */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-[#2a1a12] dark:text-[#f8f2ed]">
                منابع درآمدی این ماه
              </h3>
            </div>
            <span className="font-extrabold text-sm text-emerald-600">
              {formatCurrency(summary.totalIncome, settings.currency)}
            </span>
          </div>

          {incomeBreakdown.items.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">هیچ درآمدی در این ماه ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {incomeBreakdown.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-xs"
                >
                  <span className="font-medium text-[#2a1a12] dark:text-[#f8f2ed]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#8d7c71]">{toPersianNumber(item.percentage)}٪</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Items */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-base text-[#2a1a12] dark:text-[#f8f2ed]">
                هزینه‌ها و مصارف این ماه
              </h3>
            </div>
            <span className="font-extrabold text-sm text-rose-600">
              {formatCurrency(summary.totalExpense, settings.currency)}
            </span>
          </div>

          {expenseBreakdown.items.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">هیچ هزینه‌ای در این ماه ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {expenseBreakdown.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 text-xs"
                >
                  <span className="font-medium text-[#2a1a12] dark:text-[#f8f2ed]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#8d7c71]">{toPersianNumber(item.percentage)}٪</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table Across All 12 Months */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
        <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-1">
          جدول مقایسه‌ای سود و زیان ۱۲ ماه سال {toPersianNumber(selectedYear)}
        </h3>
        <p className="text-xs text-[#7c695c] dark:text-[#a89587] mb-4">
          بررسی سودآوری و تراز دخل و خرج ماه به ماه
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#f0eae3] dark:border-[#38261e] text-[#7c695c] dark:text-[#a89587] font-bold">
                <th className="py-2.5 px-3">ماه</th>
                <th className="py-2.5 px-3">مجموع درآمد</th>
                <th className="py-2.5 px-3">مجموع هزینه</th>
                <th className="py-2.5 px-3">سود / زیان خالص</th>
                <th className="py-2.5 px-3 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9] dark:divide-[#332117]">
              {yearlyMonths.map((m) => {
                const isProfitable = m.net > 0;
                const isLoss = m.net < 0;
                return (
                  <tr key={m.monthIndex} className="hover:bg-[#faf6f2] dark:hover:bg-[#2d1e17]/50">
                    <td className="py-3 px-3 font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                      {m.monthName}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">
                      {formatCurrency(m.income, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-rose-600 font-semibold">
                      {formatCurrency(m.expense, settings.currency)}
                    </td>
                    <td className={`py-3 px-3 font-extrabold ${isProfitable ? 'text-emerald-600' : isLoss ? 'text-rose-600' : 'text-neutral-500'}`}>
                      {formatCurrency(m.net, settings.currency, true)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          isProfitable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : isLoss
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {isProfitable ? 'سودده' : isLoss ? 'زیان‌ده' : 'سربه‌سر'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
