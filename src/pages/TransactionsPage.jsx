import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { toPersianNumber } from '../utils/jalali';
import { formatCurrency, TRANSACTION_TYPE_CONFIG } from '../utils/formatters';
import PersianDatePicker from '../components/common/PersianDatePicker';
import EmptyState from '../components/common/EmptyState';
import {
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Edit3,
  Calendar,
  Wallet,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    financeCategories,
    settings,
    deleteTransaction,
    openTransactionModal,
    openTransferModal,
    openConfirmDialog,
    globalSearch
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense' | 'transfer'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  const effectiveSearch = (search || globalSearch || '').trim().toLowerCase();

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Text Search
        if (effectiveSearch) {
          const matchDesc = (tx.description || '').toLowerCase().includes(effectiveSearch);
          const matchCat = (tx.category || '').toLowerCase().includes(effectiveSearch);
          const matchNote = (tx.note || '').toLowerCase().includes(effectiveSearch);
          if (!matchDesc && !matchCat && !matchNote) return false;
        }

        // Type
        if (filterType !== 'all' && tx.type !== filterType) {
          return false;
        }

        // Category
        if (filterCategory !== 'all' && tx.category !== filterCategory) {
          return false;
        }

        // Account (source or destination for transfers)
        if (filterAccount !== 'all') {
          if (tx.accountId !== filterAccount && tx.destinationAccountId !== filterAccount) {
            return false;
          }
        }

        // Date range
        if (filterStartDate && tx.date < filterStartDate) {
          return false;
        }
        if (filterEndDate && tx.date > filterEndDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''));
        } else if (sortBy === 'date-asc') {
          return (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
        } else if (sortBy === 'amount-desc') {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        } else if (sortBy === 'amount-asc') {
          return (Number(a.amount) || 0) - (Number(b.amount) || 0);
        }
        return 0;
      });
  }, [
    transactions,
    effectiveSearch,
    filterType,
    filterCategory,
    filterAccount,
    filterStartDate,
    filterEndDate,
    sortBy
  ]);

  const handleDeleteWithConfirm = (tx) => {
    openConfirmDialog({
      title: 'حذف تراکنش مالی',
      message: `آیا از حذف تراکنش "${tx.description}" به مبلغ ${toPersianNumber(Number(tx.amount || 0).toLocaleString('en-US'))} ${settings.currency === 'IRR' ? 'ریال' : 'تومان'} اطمینان دارید؟ موجودی حساب مربوطه خودکار به‌روزرسانی خواهد شد.`,
      confirmText: 'بله، حذف شود',
      onConfirm: () => deleteTransaction(tx.id)
    });
  };

  const getAccountName = (accId) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'حساب نامشخص';
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            دفتر کل تراکنش‌های مالی
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            مشاهده، ثبت، ویرایش، حذف، فیلتر و جستجوی تمام درآمدها، هزینه‌ها و انتقالات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => openTransactionModal('expense')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>ثبت هزینه</span>
          </button>

          <button
            type="button"
            onClick={() => openTransactionModal('income')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>ثبت درآمد</span>
          </button>

          <button
            type="button"
            onClick={() => openTransferModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>انتقال وجه</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در شرح، دسته، یادداشت..."
              className="w-full pr-8 pl-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#8d7c71]" />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="all">همه انواع تراکنش</option>
              <option value="income">فقط درآمدها</option>
              <option value="expense">فقط هزینه‌ها</option>
              <option value="transfer">انتقال بین حساب‌ها</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="all">همه حساب‌ها</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {financeCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type === 'income' ? 'درآمد' : 'هزینه'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range & Sorting row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-[#f0eae3] dark:border-[#38261e] items-center">
          <PersianDatePicker
            placeholder="از تاریخ..."
            value={filterStartDate}
            onChange={(d) => setFilterStartDate(d)}
          />

          <PersianDatePicker
            placeholder="تا تاریخ..."
            value={filterEndDate}
            onChange={(d) => setFilterEndDate(d)}
          />

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="date-desc">مرتب‌سازی: جدیدترین تاریخ</option>
              <option value="date-asc">مرتب‌سازی: قدیمی‌ترین تاریخ</option>
              <option value="amount-desc">مرتب‌سازی: بیشترین مبلغ</option>
              <option value="amount-asc">مرتب‌سازی: کمترین مبلغ</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-[#8d7c71] dark:text-[#a89587]">
              {toPersianNumber(filteredTransactions.length)} تراکنش یافت شد
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              پاکسازی فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="تراکنشی یافت نشد"
          description="با تغییر فیلترها یا ثبت یک تراکنش جدید، امور مالی خود را ثبت و پایش کنید."
          actionLabel="ثبت هزینه جدید"
          onAction={() => openTransactionModal('expense')}
          icon={FileSpreadsheet}
        />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm overflow-hidden">
          {/* Mobile swipe hint */}
          <div className="md:hidden px-4 py-2.5 bg-[#f8f3ee] dark:bg-[#2b1b13] border-b border-[#e8dfd7] dark:border-[#3d2920] flex items-center justify-between text-[11px] text-[#7c695c] dark:text-[#a89587]">
            <span>جهت مشاهده کامل ستون‌ها، جدول را به چپ بکشید</span>
            <span className="font-bold text-xs">←</span>
          </div>

          {/* Fully Responsive RTL Table with smooth horizontal scroll */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-right text-xs sm:text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-[#f0eae3] dark:border-[#38261e] text-[#7c695c] dark:text-[#a89587] font-bold bg-[#faf6f2]/60 dark:bg-[#2b1b13]/50">
                  <th className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap w-28">نوع</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap w-36">تاریخ و ساعت</th>
                  <th className="py-3.5 px-3 text-right min-w-[200px]">شرح تراکنش</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap w-36">دسته‌بندی</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap w-44">حساب</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap w-48">مبلغ</th>
                  <th className="py-3.5 pl-4 pr-3 text-center whitespace-nowrap w-28">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe9] dark:divide-[#332117]">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <tr key={tx.id} className="hover:bg-[#faf6f2] dark:hover:bg-[#2d1e17]/50 transition">
                      {/* Type Badge */}
                      <td className="py-3.5 pr-4 pl-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : isTransfer
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : isTransfer ? (
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                          <span>{isIncome ? 'درآمد' : isTransfer ? 'انتقال' : 'هزینه'}</span>
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 text-[#2a1a12] dark:text-[#f8f2ed] whitespace-nowrap">
                        <div className="font-semibold text-xs sm:text-sm">{toPersianNumber(tx.date)}</div>
                        <div className="text-[11px] text-[#8d7c71]">{toPersianNumber(tx.time)}</div>
                      </td>

                      {/* Description & Note */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#2a1a12] dark:text-[#f8f2ed] break-words">
                          {tx.description}
                        </div>
                        {tx.note && (
                          <div className="text-[11px] text-[#8d7c71] break-words mt-0.5">{tx.note}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f5ede4] dark:bg-[#34241b] text-[#5c493d] dark:text-[#d3c4b9]">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-3 text-xs text-[#4a362a] dark:text-[#d3c4b9] whitespace-nowrap">
                        {isTransfer ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{getAccountName(tx.accountId)}</span>
                            <span className="text-[#8d7c71]">←</span>
                            <span>{getAccountName(tx.destinationAccountId)}</span>
                          </div>
                        ) : (
                          <span className="font-medium">{getAccountName(tx.accountId)}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 font-bold" dir="rtl">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black shrink-0 ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : isTransfer ? '⇄' : '-'}
                          </span>
                          <span
                            className={`text-sm sm:text-base font-extrabold tracking-wide ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isTransfer
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {toPersianNumber(Number(tx.amount || 0).toLocaleString('en-US'))}
                          </span>
                          <span className="text-xs font-normal text-[#7c695c] dark:text-[#a89587]">
                            {settings.currency === 'IRR' ? 'ریال' : 'تومان'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => (isTransfer ? openTransferModal(tx) : openTransactionModal(tx.type, tx))}
                            className="p-1.5 sm:p-2 rounded-xl text-[#8d7c71] hover:text-[#7e22ce] hover:bg-[#f7f2ed] dark:hover:bg-[#332117] transition"
                            title="ویرایش تراکنش"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWithConfirm(tx)}
                            className="p-1.5 sm:p-2 rounded-xl text-[#8d7c71] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="حذف تراکنش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
