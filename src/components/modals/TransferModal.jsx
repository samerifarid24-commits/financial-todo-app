import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import PersianDatePicker from '../common/PersianDatePicker';
import { useApp } from '../../context/AppContext';
import { getTodayJalaliString, toEnglishNumber, toPersianNumber } from '../../utils/jalali';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeftRight, Clock } from 'lucide-react';

export default function TransferModal({ isOpen, onClose, editItem = null }) {
  const { addTransaction, updateTransaction, accounts, settings } = useApp();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayJalaliString());
  const [time, setTime] = useState('۱۲:۰۰');
  const [description, setDescription] = useState('انتقال بین حساب‌ها');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setFromAccountId(editItem.accountId || (accounts[0]?.id || ''));
      setToAccountId(editItem.destinationAccountId || (accounts[1]?.id || ''));
      setAmount(String(editItem.amount || ''));
      setDate(editItem.date || getTodayJalaliString());
      setTime(editItem.time || '۱۲:۰۰');
      setDescription(editItem.description || 'انتقال بین حساب‌ها');
      setNote(editItem.note || '');
    } else {
      if (accounts.length >= 2) {
        setFromAccountId(accounts[0].id);
        setToAccountId(accounts[1].id);
      } else if (accounts.length === 1) {
        setFromAccountId(accounts[0].id);
        setToAccountId('');
      }
      setAmount('');
      setDate(getTodayJalaliString());
      setTime('۱۲:۰۰');
      setDescription('انتقال بین حساب‌ها');
      setNote('');
    }
    setErrors({});
  }, [isOpen, accounts, editItem]);

  const sourceAccount = accounts.find(a => a.id === fromAccountId);
  const destAccount = accounts.find(a => a.id === toAccountId);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    const clean = toEnglishNumber(val).replace(/,/g, '').replace(/\s/g, '');
    if (clean === '' || /^\d*$/.test(clean)) {
      setAmount(clean);
    }
  };

  const validate = () => {
    const errs = {};
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'لطفاً مبلغ معتبر و بزرگتر از صفر وارد کنید.';
    }
    if (!fromAccountId) {
      errs.fromAccountId = 'حساب مبدا را مشخص کنید.';
    }
    if (!toAccountId) {
      errs.toAccountId = 'حساب مقصد را مشخص کنید.';
    }
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      errs.toAccountId = 'حساب مبدا و مقصد نمی‌توانند یکسان باشند.';
    }
    
    // Check available balance: if editing the same transfer, add back its original amount
    const availableBalance = sourceAccount 
      ? sourceAccount.currentBalance + (editItem && editItem.accountId === fromAccountId ? Number(editItem.amount) : 0)
      : 0;

    if (sourceAccount && parsedAmount > availableBalance) {
      errs.amount = `موجودی حساب مبدا کافی نیست (موجودی در دسترس: ${formatCurrency(availableBalance, settings.currency)})`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type: 'transfer',
      amount: Number(amount),
      date,
      time,
      description: description.trim() || `انتقال از ${sourceAccount?.name} به ${destAccount?.name}`,
      category: 'انتقال بین حساب‌ها',
      accountId: fromAccountId,
      destinationAccountId: toAccountId,
      note: note.trim()
    };

    if (editItem) {
      updateTransaction(editItem.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'ویرایش انتقال وجه' : 'انتقال وجه بین حساب‌ها'}
      subtitle="جابجایی اعتبار بین کارت‌ها، حساب‌های بانکی و کیف پول"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source and Destination accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              از حساب (مبدا) <span className="text-rose-500">*</span>
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.currentBalance, settings.currency)})
                </option>
              ))}
            </select>
            {errors.fromAccountId && <p className="mt-1 text-xs text-rose-500">{errors.fromAccountId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              به حساب (مقصد) <span className="text-rose-500">*</span>
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name} ({formatCurrency(acc.currentBalance, settings.currency)})
                </option>
              ))}
            </select>
            {errors.toAccountId && <p className="mt-1 text-xs text-rose-500">{errors.toAccountId}</p>}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            مبلغ انتقال ({settings.currency === 'IRR' ? 'ریال' : 'تومان'}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={amount}
              onChange={handleAmountChange}
              placeholder="مثال: ۵۰۰۰۰۰ یا 500000"
              className="w-full px-3.5 py-3 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-base font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            />
          </div>
          {amount && Number(amount) > 0 && (
            <div className="mt-1.5 text-xs font-semibold text-[#d97706] dark:text-[#fbbf24] px-1 flex items-center gap-1.5">
              <span>معادل خوانا:</span>
              <span className="font-extrabold text-sm text-[#2a1a12] dark:text-[#f8f2ed]">
                {toPersianNumber(Number(amount).toLocaleString('en-US'))}
              </span>
              <span>{settings.currency === 'IRR' ? 'ریال' : 'تومان'}</span>
            </div>
          )}
          {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PersianDatePicker
            label="تاریخ انتقال"
            value={date}
            onChange={(d) => setDate(d)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              ساعت
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: ۱۳:۰۰"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
              />
              <Clock className="w-4 h-4 absolute left-3 top-3 text-[#8d7c71]" />
            </div>
          </div>
        </div>

        {/* Description & Note */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            شرح انتقال
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: شارژ کارت روزمره از حساب جاری..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            کد رهگیری یا یادداشت
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="شناسه پرداخت، پایا، کارت به کارت..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0eae3] dark:border-[#38261e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#d8cdbf] dark:border-[#473024] text-xs sm:text-sm font-medium text-[#4a362a] dark:text-[#e4d6cc] hover:bg-[#f7f2ed] dark:hover:bg-[#332117] transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{editItem ? 'ذخیره تغییرات' : 'انتقال وجه'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
