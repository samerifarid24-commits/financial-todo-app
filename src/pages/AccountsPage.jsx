import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, ACCOUNT_TYPE_CONFIG } from '../utils/formatters';
import { toPersianNumber } from '../utils/jalali';
import EmptyState from '../components/common/EmptyState';
import {
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  Briefcase,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    totalBalance,
    settings,
    openAccountModal,
    openTransferModal,
    openConfirmDialog,
    deleteAccount
  } = useApp();

  const [expandedAccountId, setExpandedAccountId] = useState(accounts[0]?.id || null);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'cash':
        return Wallet;
      case 'card':
        return CreditCard;
      case 'savings':
        return PiggyBank;
      case 'business':
        return Briefcase;
      case 'bank':
      default:
        return Landmark;
    }
  };

  const handleDeleteWithConfirm = (acc) => {
    openConfirmDialog({
      title: 'حذف حساب مالی',
      message: `آیا از حذف حساب "${acc.name}" با موجودی ${formatCurrency(acc.currentBalance, settings.currency)} اطمینان دارید؟`,
      confirmText: 'بله، حذف شود',
      onConfirm: () => deleteAccount(acc.id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            حساب‌ها و کیف‌های پول
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            مدیریت حساب‌های بانکی، کارت‌ها، پس‌انداز و جابجایی وجه
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => openTransferModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>انتقال بین حساب‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => openAccountModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>حساب جدید</span>
          </button>
        </div>
      </div>

      {/* Total Balance Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#291811] via-[#382016] to-[#1c0f0a] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#4d2d1e]">
        <div>
          <span className="text-xs font-semibold text-[#fbbf24]">مجموع نقدینگی و دارایی خالص</span>
          <div className="text-2xl sm:text-4xl font-black tracking-tight mt-1 text-white">
            {formatCurrency(totalBalance, settings.currency)}
          </div>
          <p className="text-xs text-[#b8a698] mt-1">
            مجموع موجودی لحظه‌ای {toPersianNumber(accounts.length)} حساب متصل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openTransferModal()}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white backdrop-blur-sm border border-white/20 transition"
          >
            انتقال سریع وجه
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          title="هیچ حسابی ثبت نشده است"
          description="با ایجاد اولین حساب بانکی یا کیف پول، موجودی اولیه و تراکنش‌های خود را ثبت نمایید."
          actionLabel="ایجاد حساب جدید"
          onAction={() => openAccountModal()}
          icon={Wallet}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const isExpanded = expandedAccountId === acc.id;

            // Transactions belonging to this account
            const accTransactions = transactions.filter(
              tx => tx.accountId === acc.id || tx.destinationAccountId === acc.id
            );

            return (
              <div
                key={acc.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4 hover:border-[#ca8a04]/40 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: `${acc.color}15`, color: acc.color }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-current"
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                        {acc.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#8d7c71] mt-0.5">
                        <span>{ACCOUNT_TYPE_CONFIG[acc.type]?.label || 'حساب'}</span>
                        {acc.accountNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{toPersianNumber(acc.accountNumber)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openAccountModal(acc)}
                      className="p-1.5 rounded-xl text-[#8d7c71] hover:text-[#7e22ce] hover:bg-[#f7f2ed] dark:hover:bg-[#342016] transition"
                      title="ویرایش حساب"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteWithConfirm(acc)}
                        className="p-1.5 rounded-xl text-[#8d7c71] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="حذف حساب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Current Balance */}
                <div className="p-4 rounded-2xl bg-[#faf6f2] dark:bg-[#2c1d15] border border-[#eee4db] dark:border-[#3b271d] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#7c695c] dark:text-[#a89587]">
                    موجودی فعلی حساب:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
                    {formatCurrency(acc.currentBalance, settings.currency)}
                  </span>
                </div>

                {/* Inflow vs Outflow */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>کل واریزی‌ها</span>
                    </div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(acc.totalIncome, settings.currency)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>کل برداشت‌ها</span>
                    </div>
                    <span className="font-bold text-rose-800 dark:text-rose-300">
                      {formatCurrency(acc.totalExpense, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Collapsible History Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedAccountId(isExpanded ? null : acc.id)}
                    className="w-full flex items-center justify-between pt-2 text-xs font-bold text-[#7e22ce] dark:text-[#fbbf24] hover:underline"
                  >
                    <span>
                      تاریخچه تراکنش‌های این حساب ({toPersianNumber(accTransactions.length)} تراکنش)
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Transaction List */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#f0eae3] dark:border-[#38261e] space-y-2 max-h-56 overflow-y-auto pr-1">
                      {accTransactions.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-3 text-center">
                          تراکنشی برای این حساب ثبت نشده است.
                        </p>
                      ) : (
                        accTransactions.slice(0, 8).map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-[#2b1b13] text-xs"
                          >
                            <div>
                              <div className="font-semibold text-[#2a1a12] dark:text-[#f8f2ed] truncate max-w-[150px]">
                                {tx.description}
                              </div>
                              <span className="text-[10px] text-[#8d7c71]">{toPersianNumber(tx.date)}</span>
                            </div>
                            <span
                              className={`font-bold ${
                                tx.type === 'income'
                                  ? 'text-emerald-600'
                                  : tx.type === 'transfer'
                                  ? 'text-indigo-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {formatCurrency(tx.amount, settings.currency)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
