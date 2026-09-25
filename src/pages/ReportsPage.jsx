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
import { IncomeExpenseBarChart, CategoryDonutChart } from '../components/common/Charts';
import {
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Activity,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportsPage() {
  const { transactions, accounts, settings, openPdfReportModal } = useApp();

  const today = getTodayJalali();
  const [selectedMonth, setSelectedMonth] = useState(today.jm);
  const [selectedYear, setSelectedYear] = useState(today.jy);

  // Month transactions
  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedYear, selectedMonth);
  }, [transactions, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    return calculateSummary(monthTransactions);
  }, [monthTransactions]);

  const expenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthTransactions, 'expense');
  }, [monthTransactions]);

  const incomeBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthTransactions, 'income');
  }, [monthTransactions]);

  const yearlyChartData = useMemo(() => {
    return calculateYearlyMonthlyData(transactions, selectedYear);
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            مرکز تحلیل و گزارش‌های مالی
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            داشبورد تحلیلی ماهانه و دسترسی سریع به انواع صورت‌های مالی
          </p>
        </div>

        {/* Date Selector & PDF Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] shadow-sm"
          >
            {PERSIAN_MONTHS.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] shadow-sm"
          >
            {[today.jy - 1, today.jy, today.jy + 1].map((y) => (
              <option key={y} value={y}>
                {toPersianNumber(y)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => openPdfReportModal('full', selectedMonth, selectedYear)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ PDF گزارش مالی</span>
          </button>
        </div>
      </div>

      {/* Direct Report Hub Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/reports/profit-loss"
          className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm hover:border-[#7e22ce] hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24]">صورت سود و زیان</span>
            <ChevronLeft className="w-4 h-4 text-[#8d7c71] group-hover:-translate-x-1 transition-transform" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#2a1a12] dark:text-[#f8f2ed]">
            گزارش سود و زیان دوره‌ای
          </h3>
          <p className="text-xs text-[#8d7c71] mt-1">
            مقایسه درآمدها و مخارج و محاسبه حاشیه سود ماهانه
          </p>
        </Link>

        <Link
          to="/reports/balance"
          className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm hover:border-[#7e22ce] hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#d97706] dark:text-[#fbbf24]">ترازنامه مالی</span>
            <ChevronLeft className="w-4 h-4 text-[#8d7c71] group-hover:-translate-x-1 transition-transform" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#2a1a12] dark:text-[#f8f2ed]">
            گزارش تراز و موجودی
          </h3>
          <p className="text-xs text-[#8d7c71] mt-1">
            موجودی ابتدای دوره، گردش بدهکار/بستانکار و مانده نهایی
          </p>
        </Link>

        <Link
          to="/reports/cash-flow"
          className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm hover:border-[#7e22ce] hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">جریان نقدینگی</span>
            <ChevronLeft className="w-4 h-4 text-[#8d7c71] group-hover:-translate-x-1 transition-transform" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#2a1a12] dark:text-[#f8f2ed]">
            گزارش جریان نقدی
          </h3>
          <p className="text-xs text-[#8d7c71] mt-1">
            ورود و خروج وجه نقد بر حسب روز، هفته یا بازه دلخواه
          </p>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`مجموع درآمد (${PERSIAN_MONTHS[selectedMonth - 1]})`}
          value={formatCurrency(summary.totalIncome, settings.currency)}
          subvalue={`${toPersianNumber(incomeBreakdown.items.length)} ردیف واریزی`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title={`مجموع هزینه (${PERSIAN_MONTHS[selectedMonth - 1]})`}
          value={formatCurrency(summary.totalExpense, settings.currency)}
          subvalue={`${toPersianNumber(expenseBreakdown.items.length)} ردیف پرداختی`}
          icon={TrendingDown}
          color="rose"
        />

        <StatCard
          title="سود / زیان خالص"
          value={formatCurrency(summary.netProfitLoss, settings.currency, true)}
          subvalue={
            summary.netProfitLoss > 0
              ? 'سوددهی مثبت'
              : summary.netProfitLoss < 0
              ? 'کسری بودجه دوره'
              : 'سربه‌سر'
          }
          icon={Scale}
          color={summary.netProfitLoss >= 0 ? 'gold' : 'rose'}
        />

        <StatCard
          title="تعداد تراکنش‌های ماه"
          value={`${toPersianNumber(monthTransactions.length)} تراکنش`}
          subvalue={`${toPersianNumber(summary.totalTransfers ? 1 : 0)} انتقال بین حساب‌ها`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Yearly Bar Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
              روند ۱۲ ماهه درآمد و هزینه در سال {toPersianNumber(selectedYear)}
            </h3>
            <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
              مقایسه بصری جریان مالی در تمام ماه‌های تقویم خورشیدی
            </p>
          </div>
          <button
            type="button"
            onClick={() => openPdfReportModal('monthly')}
            className="text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24] hover:underline flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>خروجی PDF صورتحساب</span>
          </button>
        </div>

        <IncomeExpenseBarChart data={yearlyChartData} currency={settings.currency} />
      </div>

      {/* Category breakdown details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-1">
            سهم دسته‌بندی هزینه‌ها ({PERSIAN_MONTHS[selectedMonth - 1]})
          </h3>
          <p className="text-xs text-[#7c695c] dark:text-[#a89587] mb-4">
            مجموع هزینه: {formatCurrency(summary.totalExpense, settings.currency)}
          </p>

          <CategoryDonutChart
            items={expenseBreakdown.items}
            currency={settings.currency}
            emptyMessage="هزینه‌ای ثبت نشده است"
          />
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-1">
            سهم منابع درآمدی ({PERSIAN_MONTHS[selectedMonth - 1]})
          </h3>
          <p className="text-xs text-[#7c695c] dark:text-[#a89587] mb-4">
            مجموع درآمد: {formatCurrency(summary.totalIncome, settings.currency)}
          </p>

          <CategoryDonutChart
            items={incomeBreakdown.items}
            currency={settings.currency}
            emptyMessage="درآمدی ثبت نشده است"
          />
        </div>
      </div>
    </div>
  );
}
