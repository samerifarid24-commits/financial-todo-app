import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { ACCOUNT_TYPE_CONFIG, formatCurrency } from '../../utils/formatters';

export default function AccountModal({ isOpen, onClose, editItem = null }) {
  const { addAccount, updateAccount, settings } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#7e22ce');
  const [errors, setErrors] = useState({});

  const colorOptions = [
    '#7e22ce', '#d97706', '#059669', '#dc2626', '#2563eb',
    '#4f46e5', '#0891b2', '#0d9488', '#ea580c', '#523321'
  ];

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setType(editItem.type || 'bank');
      setAccountNumber(editItem.accountNumber || '');
      setInitialBalance(String(editItem.initialBalance ?? ''));
      setColor(editItem.color || '#7e22ce');
    } else {
      setName('');
      setType('bank');
      setAccountNumber('');
      setInitialBalance('0');
      setColor('#7e22ce');
    }
    setErrors({});
  }, [editItem, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'نام حساب الزامی است.';
    }
    const balanceNum = Number(initialBalance);
    if (isNaN(balanceNum)) {
      errs.initialBalance = 'موجودی اولیه باید عدد باشد.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      type,
      accountNumber: accountNumber.trim(),
      initialBalance: Number(initialBalance) || 0,
      color
    };

    if (editItem) {
      updateAccount(editItem.id, payload);
    } else {
      addAccount(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'ویرایش حساب / کیف پول' : 'افزودن حساب جدید'}
      subtitle="حساب‌های بانکی، کارت‌ها، کیف پول نقدی یا صندوق‌های پس‌انداز"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            نام حساب یا کارت <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: بانک ملت - کارت روزمره، کیف پول نقدی..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
        </div>

        {/* Type & Initial Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              نوع حساب
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              موجودی اولیه ({settings.currency === 'IRR' ? 'ریال' : 'تومان'})
            </label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="۰"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 font-bold"
            />
            {initialBalance && Number(initialBalance) > 0 && (
              <p className="mt-1 text-[11px] text-[#d97706] font-semibold">
                معادل: {formatCurrency(initialBalance, settings.currency)}
              </p>
            )}
            {errors.initialBalance && <p className="mt-1 text-xs text-rose-500">{errors.initialBalance}</p>}
          </div>
        </div>

        {/* Account / Card / Shaba Number */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            شماره حساب، کارت یا شبا (اختیاری)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="مثال: ۶۰۳۷-۹۹۱۸-****-**** یا IR..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 font-mono text-left dir-ltr"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-2">
            رنگ شاخص حساب
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-xl transition-all ${
                  color === c ? 'scale-110 ring-2 ring-offset-2 ring-[#7e22ce]' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/15 transition-all hover:scale-[1.02] active:scale-95"
          >
            {editItem ? 'ذخیره تغییرات' : 'ایجاد حساب'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
