import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import PersianDatePicker from '../common/PersianDatePicker';
import { useApp } from '../../context/AppContext';
import { getTodayJalaliString } from '../../utils/jalali';
import { PRIORITY_CONFIG } from '../../utils/formatters';
import { Bell, Clock, Tag, Flag, AlignRight } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, editItem = null }) {
  const { addTask, updateTask, taskCategories } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayJalaliString());
  const [time, setTime] = useState('۱۲:۰۰');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [reminder, setReminder] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setDescription(editItem.description || '');
      setDate(editItem.date || getTodayJalaliString());
      setTime(editItem.time || '۱۲:۰۰');
      setPriority(editItem.priority || 'medium');
      setCategory(editItem.category || (taskCategories[0]?.name || 'کاری و شغلی'));
      setReminder(!!editItem.reminder);
    } else {
      setTitle('');
      setDescription('');
      setDate(getTodayJalaliString());
      setTime('۱۲:۰۰');
      setPriority('medium');
      setCategory(taskCategories[0]?.name || 'کاری و شغلی');
      setReminder(false);
    }
    setErrors({});
  }, [editItem, isOpen, taskCategories]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'لطفاً عنوان کار را وارد کنید.';
    }
    if (!date) {
      errs.date = 'لطفاً تاریخ انجام کار را انتخاب کنید.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      priority,
      category: category || taskCategories[0]?.name || 'عمومی',
      reminder
    };

    if (editItem) {
      updateTask(editItem.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'ویرایش کار' : 'افزودن کار جدید'}
      subtitle="برنامه‌ریزی دقیق کارهای روزانه به تقویم شمسی"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            عنوان کار <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: پیگیری تراز مالی ماهانه، جلسه کاری..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 focus:border-[#7e22ce]"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        {/* Date and Time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PersianDatePicker
            label="تاریخ انجام"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            error={errors.date}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              ساعت انجام
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: ۱۴:۳۰"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
              />
              <Clock className="w-4 h-4 absolute left-3 top-3 text-[#8d7c71]" />
            </div>
          </div>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              دسته‌بندی کار
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              {taskCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
              اولویت
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['low', 'medium', 'high'].map((pKey) => {
                const conf = PRIORITY_CONFIG[pKey];
                const active = priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setPriority(pKey)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      active
                        ? 'border-[#7e22ce] bg-[#7e22ce]/10 text-[#7e22ce] dark:border-[#fbbf24] dark:bg-[#fbbf24]/10 dark:text-[#fbbf24]'
                        : 'border-[#e8dfd7] dark:border-[#422e23] text-[#7c695c] hover:bg-neutral-50 dark:hover:bg-[#2d1e17]'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#4a362a] dark:text-[#d3c4b9] mb-1.5">
            توضیحات تکمیلی
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="یادداشت‌ها و جزئیات مربوط به این کار..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />
        </div>

        {/* Reminder Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#fbf8f5] dark:bg-[#2d1e17] border border-[#f0eae3] dark:border-[#38261e]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#d97706]" />
            <span className="text-xs sm:text-sm font-medium text-[#3b281d] dark:text-[#e4d6cc]">
              فعال‌سازی یادآوری مرورگر
            </span>
          </div>
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="w-4 h-4 rounded text-[#7e22ce] focus:ring-[#7e22ce] accent-[#7e22ce] cursor-pointer"
          />
        </div>

        {/* Submit button */}
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
            {editItem ? 'ذخیره تغییرات' : 'افزودن کار'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
