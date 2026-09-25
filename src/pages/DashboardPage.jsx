import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalali,
  getTodayJalaliString,
  PERSIAN_MONTHS,
  toPersianNumber,
  formatFullPersianDate
} from '../utils/jalali';
import {
  calculateSummary,
  filterTransactionsByDate,
  filterTransactionsByMonth,
  calculateYearlyMonthlyData,
  calculateCategoryBreakdown
} from '../services/financialCalculations';
import { formatCurrency, PRIORITY_CONFIG } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import { IncomeExpenseBarChart, CategoryDonutChart } from '../components/common/Charts';
import EmptyState from '../components/common/EmptyState';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle2,
  Clock,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  Calendar,
  ChevronLeft,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const {
    tasks,
    accounts,
    transactions,
    totalBalance,
    settings,
    toggleTaskComplete,
    openTaskModal,
    openTransactionModal,
    openTransferModal,
    openPdfReportModal
  } = useApp();

  const today = getTodayJalali();
  const todayStr = getTodayJalaliString();

  // Tasks today
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasks = useMemo(() => {
    return todayTasks.filter(t => t.completed);
  }, [todayTasks]);

  const pendingTodayTasks = useMemo(() => {
    return todayTasks.filter(t => !t.completed);
  }, [todayTasks]);

  // Today financial summary
  const todayTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions, todayStr, todayStr);
  }, [transactions, todayStr]);

  const todaySummary = useMemo(() => {
    return calculateSummary(todayTransactions);
  }, [todayTransactions]);

  // Current Month financial summary
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, today.jy, today.jm);
  }, [transactions, today.jy, today.jm]);

  const currentMonthSummary = useMemo(() => {
    return calculateSummary(currentMonthTransactions);
  }, [currentMonthTransactions]);

  // Yearly monthly comparison data for chart
  const yearlyChartData = useMemo(() => {
    return calculateYearlyMonthlyData(transactions, today.jy);
  }, [transactions, today.jy]);

  // Current month expense category breakdown
  const currentMonthExpenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(currentMonthTransactions, 'expense');
  }, [currentMonthTransactions]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Welcome & Jalali Date Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b0764] via-[#581c87] to-[#291811] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fbbf24] text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatFullPersianDate()}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              درود، {settings.userName || 'کاربر گرامی'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl">
              خلاصه وضعیت مالی و برنامه‌ریزی کارهای امروز شما در یک نگاه هوشمند.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openTaskModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white text-[#581c87] hover:bg-neutral-100 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#7e22ce]" />
              <span>کار جدید</span>
            </button>

            <button
              type="button"
              onClick={() => openTransactionModal('expense')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>هزینه جدید</span>
            </button>

            <button
              type="button"
              onClick={() => openTransactionModal('income')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>درآمد جدید</span>
            </button>

            <button
              type="button"
              onClick={() => openTransferModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>تراکنش جدید</span>
            </button>

            <button
              type="button"
              onClick={() => openPdfReportModal('full')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-[#fbbf24]" />
              <span>گزارش مالی</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#fbbf24]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-20 w-80 h-80 rounded-full bg-[#7e22ce]/20 blur-3xl pointer-events-none" />
      </div>

      {/* Row 1: Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Current Balance */}
        <StatCard
          title="موجودی کل حساب‌ها"
          value={formatCurrency(totalBalance, settings.currency)}
          subvalue={`${toPersianNumber(accounts.length)} حساب و کیف پول فعال`}
          icon={Wallet}
          color="purple"
        />

        {/* Current Month Income */}
        <StatCard
          title={`درآمد ماه جاری (${PERSIAN_MONTHS[today.jm - 1]})`}
          value={formatCurrency(currentMonthSummary.totalIncome, settings.currency)}
          subvalue={`امروز: ${formatCurrency(todaySummary.totalIncome, settings.currency)}`}
          icon={TrendingUp}
          color="emerald"
        />

        {/* Current Month Expense */}
        <StatCard
          title={`هزینه ماه جاری (${PERSIAN_MONTHS[today.jm - 1]})`}
          value={formatCurrency(currentMonthSummary.totalExpense, settings.currency)}
          subvalue={`امروز: ${formatCurrency(todaySummary.totalExpense, settings.currency)}`}
          icon={TrendingDown}
          color="rose"
        />

        {/* Current Month Profit/Loss */}
        <StatCard
          title={`سود / زیان ماه جاری`}
          value={formatCurrency(currentMonthSummary.netProfitLoss, settings.currency, true)}
          subvalue={
            currentMonthSummary.netProfitLoss > 0
              ? 'وضعیت مالی: سوددهی مطلوب'
              : currentMonthSummary.netProfitLoss < 0
              ? 'وضعیت مالی: پیشی گرفتن هزینه‌ها'
              : 'وضعیت مالی: سربه‌سر'
          }
          icon={Scale}
          color={currentMonthSummary.netProfitLoss >= 0 ? 'gold' : 'rose'}
        />
      </div>

      {/* Row 2: Today's Tasks Progress & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7c695c] dark:text-[#a89587] font-semibold">تعداد کارهای امروز</span>
            <div className="text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
              {toPersianNumber(todayTasks.length)} <span className="text-xs font-normal text-neutral-500">مورد</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#7e22ce] dark:text-[#c084fc] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7c695c] dark:text-[#a89587] font-semibold">کارهای انجام‌شده</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {toPersianNumber(completedTodayTasks.length)} <span className="text-xs font-normal text-neutral-500">مورد</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#251711] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7c695c] dark:text-[#a89587] font-semibold">کارهای باقی‌مانده</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {toPersianNumber(pendingTodayTasks.length)} <span className="text-xs font-normal text-neutral-500">مورد</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 3: Charts (Income vs Expense 12 Months + Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                مقایسه ماهانه درآمد و هزینه
              </h3>
              <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                گردش مالی سال {toPersianNumber(today.jy)} به تفکیک ۱۲ ماه شمسی
              </p>
            </div>
            <Link
              to="/reports/profit-loss"
              className="text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24] hover:underline flex items-center gap-1"
            >
              <span>جزئیات سود و زیان</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <IncomeExpenseBarChart data={yearlyChartData} currency={settings.currency} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                  دسته‌بندی هزینه‌ها
                </h3>
                <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                  سهم هر گروه از مخارج در ماه {PERSIAN_MONTHS[today.jm - 1]}
                </p>
              </div>
            </div>

            <CategoryDonutChart
              items={currentMonthExpenseBreakdown.items}
              currency={settings.currency}
              emptyMessage="هنوز هزینه‌ای در این ماه ثبت نشده است"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#f0eae3] dark:border-[#38261e] text-center">
            <Link
              to="/reports"
              className="text-xs font-semibold text-[#581c87] dark:text-[#d8b4fe] hover:underline"
            >
              مشاهده تمامی گزارش‌های مالی ماهانه ←
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Today Tasks & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7e22ce]" />
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                کارهای امروز ({toPersianNumber(todayTasks.length)})
              </h3>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24] hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه کارها</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              title="برای امروز کاری ثبت نشده است"
              description="با افزودن کارهای روزانه، زمان و اولویت‌های کاری خود را به سادگی مدیریت کنید."
              actionLabel="افزودن کار امروز"
              onAction={() => openTaskModal()}
            />
          ) : (
            <div className="space-y-2.5">
              {todayTasks.slice(0, 5).map((task) => {
                const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-neutral-50/70 dark:bg-[#1d120d]/70 border-[#eee5dc] dark:border-[#38261e] opacity-70'
                        : 'bg-white dark:bg-[#2a1b14] border-[#e8dfd7] dark:border-[#402a1e] hover:border-[#7e22ce]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded text-[#7e22ce] focus:ring-[#7e22ce] accent-[#7e22ce] cursor-pointer"
                      />
                      <div>
                        <div
                          className={`text-xs sm:text-sm font-bold ${
                            task.completed
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-[#2a1a12] dark:text-[#f8f2ed]'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8d7c71] dark:text-[#9e8b7f]">
                          <span>ساعت: {toPersianNumber(task.time)}</span>
                          <span>•</span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${pConfig.badgeClass}`}
                    >
                      {pConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                آخرین تراکنش‌های مالی
              </h3>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24] hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه تراکنش‌ها</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="هنوز هیچ تراکنش مالی ثبت نشده است"
              description="اولین هزینه یا درآمد خود را ثبت کنید تا محاسبات مالی و نمودارها فعال شوند."
              actionLabel="ثبت تراکنش جدید"
              onAction={() => openTransactionModal('expense')}
            />
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#2a1b14] border border-[#e8dfd7] dark:border-[#402a1e] hover:border-[#ca8a04]/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : isTransfer
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] truncate max-w-[180px] sm:max-w-xs">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8d7c71] dark:text-[#9e8b7f]">
                          <span>{toPersianNumber(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-extrabold text-xs sm:text-sm">
                      <span
                        className={
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {isIncome ? '+ ' : isTransfer ? '⇄ ' : '- '}
                        {formatCurrency(tx.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
