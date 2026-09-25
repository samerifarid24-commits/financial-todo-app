import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import PersianDatePicker from '../common/PersianDatePicker';
import { useApp } from '../../context/AppContext';
import { getTodayJalaliString, toEnglishNumber, toPersianNumber } from '../../utils/jalali';
import { formatCurrency } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Clock, PlusCircle } from 'lucide-react';

export default function TransactionModal({
  isOpen,
  onClose,
  defaultType = 'expense',
  editItem = null
}) {
  const {
    addTransaction,
    updateTransaction,
    accounts,
    financeCategories,
    addFinanceCategory,
    settings
  } = useApp();

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayJalaliString());
  const [time, setTime] = useState('۱۲:۰۰');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  // New category inline creation
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Categories filtered by type
  const availableCategories = financeCategories.filter(c => c.type === type);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type || 'expense');
      setAmount(String(editItem.amount || ''));
      setDate(editItem.date || getTodayJalaliString());
      setTime(editItem.time || '۱۲:۰۰');
      setDescription(editItem.description || '');
      setCategory(editItem.category || '');
      setAccountId(editItem.accountId || (accounts[0]?.id || ''));
      setNote(editItem.note || '');
    } else {
      setType(defaultType);
      setAmount('');
      setDate(getTodayJalaliString());
      setTime('۱۲:۰۰');
      setDescription('');
      setCategory(availableCategories[0]?.name || '');
      setAccountId(accounts[0]?.id || '');
      setNote('');
    }
    setErrors({});
    setIsAddingCategory(false);
  }, [editItem, isOpen, defaultType, accounts]);

  // Adjust default category when type switches
  const handleTypeChange = (newType) => {
    setType(newType);
    const firstCat = financeCategories.find(c => c.type === newType);
    if (firstCat) setCategory(firstCat.name);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    const clean = toEnglishNumber(val).replace(/,/g, '').replace(/\s/g, '');
    if (clean === '' || /^\d*$/.test(clean)) {
      setAmount(clean);
    }
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addFinanceCategory({
      name: newCategoryName.trim(),
      type,
      color: type === 'income' ? '#10b981' : '#f43f5e'
    });
    setCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const validate = () => {
    const errs = {};
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'لطفاً مبلغ معتبر و بزرگتر از صفر وارد کنید.';
    }
    if (!description.trim()) {
      errs.description = 'لطفاً شرح تراکنش را وارد کنید.';
    }
    if (!accountId) {
      errs.accountId = 'لطفاً حساب مورد نظر را انتخاب کنید.';
    }
    if (!category) {
      errs.category = 'لطفاً دسته‌بندی را مشخص کنید.';
    }
    if (!date) {
      errs.date = 'لطفاً تاریخ را وارد کنید.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      amount: Number(amount),
      date,
      time,
      description: description.trim(),
      category,
      accountId,
      note: note.trim()
    };

    if (editItem) {
      updateTransaction(editItem.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  const isIncome = type === 'income';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'ویرایش تراکنش مالی' : isIncome ? 'ثبت درآمد جدید' : 'ثبت هزینه جدید'}
      subtitle="مدیریت دقیق دخل و خرج با احتساب خودکار موجودی حساب‌ها"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle (Only if not in edit mode or when user wants to switch) */}
        {!editItem && (
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#f5ede4] dark:bg-[#34241b]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-[#7c695c] dark:text-[#a89587] hover:text-[#2a1a12]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>هزینه (پرداخت)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[#7c695c] dark:text-[#a89587] hover:text-[#2a1a12]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>درآمد (واریز)</span>
            </button>
          </div>
        )}

        {/* Amount Input with Live Formatted Persian Currency Preview */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            مبلغ تراکنش ({settings.currency === 'IRR' ? 'ریال' : 'تومان'}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={amount}
              onChange={handleAmountChange}
              placeholder="مثال: ۱۲۵۰۰۰۰ یا 1250000"
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            شرح تراکنش <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isIncome ? 'مثال: واریز حقوق، دریافتی پروژه...' : 'مثال: خرید مواد غذایی، اجاره خانه...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
          {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
        </div>

        {/* Account and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              {isIncome ? 'واریز به حساب' : 'برداشت از حساب'} <span className="text-rose-500">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (موجودی: {formatCurrency(acc.currentBalance, settings.currency)})
                </option>
              ))}
            </select>
            {errors.accountId && <p className="mt-1 text-xs text-rose-500">{errors.accountId}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9]">
                دسته‌بندی <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] text-[#7e22ce] dark:text-[#fbbf24] hover:underline flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>دسته‌بندی جدید</span>
              </button>
            </div>

            {isAddingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="نام دسته جدید..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#7e22ce] text-xs bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-2.5 py-2 rounded-xl bg-[#7e22ce] text-white text-xs font-semibold"
                >
                  ثبت
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PersianDatePicker
            label="تاریخ تراکنش"
            value={date}
            onChange={(d) => setDate(d)}
            error={errors.date}
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
                placeholder="مثال: ۱۶:۳۰"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
              />
              <Clock className="w-4 h-4 absolute left-3 top-3 text-[#8d7c71]" />
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            یادداشت اختیاری
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="شماره پیگیری، فاکتور یا توضیحات اضافی..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
        </div>

        {/* Actions */}
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
            className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-95 ${
              isIncome
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-700/20'
            }`}
          >
            {editItem ? 'ذخیره تغییرات' : isIncome ? 'ثبت درآمد' : 'ثبت هزینه'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
