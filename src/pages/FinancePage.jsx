import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalali,
  PERSIAN_MONTHS,
  toPersianNumber
} from '../utils/jalali';
import {
  calculateSummary,
  filterTransactionsByMonth,
  calculateCategoryBreakdown
} from '../services/financialCalculations';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import { CategoryDonutChart } from '../components/common/Charts';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  PieChart,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinancePage() {
  const {
    transactions,
    accounts,
    totalBalance,
    settings,
    openTransactionModal,
    openTransferModal
  } = useApp();

  const today = getTodayJalali();
  const [selectedMonth, setSelectedMonth] = useState(today.jm);
  const [selectedYear, setSelectedYear] = useState(today.jy);

  // Month transactions
  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedYear, selectedMonth);
  }, [transactions, selectedYear, selectedMonth]);

  const monthSummary = useMemo(() => {
    return calculateSummary(monthTransactions);
  }, [monthTransactions]);

  const expenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthTransactions, 'expense');
  }, [monthTransactions]);

  const incomeBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthTransactions, 'income');
  }, [monthTransactions]);

  return (
    <div className="space-y-6">
      {/* Page Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            مدیریت امور مالی و حسابداری
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            بررسی و پایش دقیق جریان‌های مالی، دسته‌بندی‌ها و تراز نقدینگی
          </p>
        </div>

        {/* Month Selector dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 shadow-sm"
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
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 shadow-sm"
          >
            {[today.jy - 1, today.jy, today.jy + 1].map((y) => (
              <option key={y} value={y}>
                سال {toPersianNumber(y)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="موجودی کل نقدینگی"
          value={formatCurrency(totalBalance, settings.currency)}
          subvalue={`${toPersianNumber(accounts.length)} حساب فعال`}
          icon={Wallet}
          color="purple"
        />

        <StatCard
          title={`درآمد ماه (${PERSIAN_MONTHS[selectedMonth - 1]})`}
          value={formatCurrency(monthSummary.totalIncome, settings.currency)}
          subvalue={`${toPersianNumber(incomeBreakdown.items.length)} ردیف درآمدی`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title={`هزینه ماه (${PERSIAN_MONTHS[selectedMonth - 1]})`}
          value={formatCurrency(monthSummary.totalExpense, settings.currency)}
          subvalue={`${toPersianNumber(expenseBreakdown.items.length)} دسته‌بندی هزینه`}
          icon={TrendingDown}
          color="rose"
        />

        <StatCard
          title="سود خالص دوره"
          value={formatCurrency(monthSummary.netProfitLoss, settings.currency, true)}
          subvalue={
            monthSummary.netProfitLoss > 0
              ? 'تراز مثبت'
              : monthSummary.netProfitLoss < 0
              ? 'کسری دوره'
              : 'سربه‌سر'
          }
          icon={Scale}
          color={monthSummary.netProfitLoss >= 0 ? 'gold' : 'rose'}
        />
      </div>

      {/* Quick Action buttons */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
        <span className="text-xs font-bold text-[#7c695c] dark:text-[#a89587] ml-2">
          عملیات سریع مالی:
        </span>
        <button
          type="button"
          onClick={() => openTransactionModal('expense')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>ثبت هزینه جدید</span>
        </button>

        <button
          type="button"
          onClick={() => openTransactionModal('income')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>ثبت درآمد جدید</span>
        </button>

        <button
          type="button"
          onClick={() => openTransferModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>انتقال وجه بین حساب‌ها</span>
        </button>

        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f7f2ed] dark:bg-[#342016] text-[#4a362a] dark:text-[#e4d6cc] text-xs font-bold border border-[#e8dfd7] dark:border-[#473024] hover:border-[#7e22ce] transition mr-auto"
        >
          <span>مشاهده دفتر روزنامه تراکنش‌ها</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Breakdowns: Expenses vs Incomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Category Donut */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                تفکیک هزینه‌های ماه {PERSIAN_MONTHS[selectedMonth - 1]}
              </h3>
              <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                مجموع: {formatCurrency(expenseBreakdown.totalAmount, settings.currency)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <CategoryDonutChart
            items={expenseBreakdown.items}
            currency={settings.currency}
            emptyMessage="هزینه‌ای برای این ماه ثبت نشده است"
          />
        </div>

        {/* Income Category Donut */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                تفکیک درآمدهای ماه {PERSIAN_MONTHS[selectedMonth - 1]}
              </h3>
              <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                مجموع: {formatCurrency(incomeBreakdown.totalAmount, settings.currency)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <CategoryDonutChart
            items={incomeBreakdown.items}
            currency={settings.currency}
            emptyMessage="درآمدی برای این ماه ثبت نشده است"
          />
        </div>
      </div>
    </div>
  );
}
