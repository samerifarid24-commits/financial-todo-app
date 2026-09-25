import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { playChime, requestNotificationPermission } from '../services/notifications';
import {
  Settings,
  User,
  Coins,
  Calendar,
  Bell,
  Volume2,
  Moon,
  Sun,
  Shield,
  Tag,
  Plus,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    financeCategories,
    taskCategories,
    addFinanceCategory,
    addTaskCategory
  } = useApp();

  const [userName, setUserName] = useState(settings.userName || '');
  const [userEmail, setUserEmail] = useState(settings.userEmail || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Category States
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatDomain, setNewCatDomain] = useState('finance'); // 'finance' | 'task'

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim(),
      userEmail: userEmail.trim()
    });
    setSavedSuccess(true);
    playChime('success');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCurrencyChange = (curr) => {
    updateSettings({ currency: curr });
    playChime('success');
  };

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
  };

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const res = await requestNotificationPermission();
      if (res === 'granted' || res === 'unsupported') {
        updateSettings({ notificationsEnabled: true });
        playChime('reminder');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (newCatDomain === 'finance') {
      addFinanceCategory({
        name: newCatName.trim(),
        type: newCatType,
        color: newCatType === 'income' ? '#10b981' : '#f43f5e'
      });
    } else {
      addTaskCategory({
        name: newCatName.trim(),
        color: '#7e22ce'
      });
    }

    setNewCatName('');
    playChime('success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
          تنظیمات و سفارشی‌سازی
        </h1>
        <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
          پیکربندی هویت، واحد پولی، اعلان‌ها، پوسته‌ها و دسته‌بندی‌های شخصی
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تنظیمات با موفقیت ذخیره گردید.</span>
        </div>
      )}

      {/* User Profile Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
          <User className="w-5 h-5 text-[#7e22ce] dark:text-[#fbbf24]" />
          <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
            اطلاعات کاربری و گزارش‌ها
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5c493d] dark:text-[#d3c4b9] mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="مثال: علی حسینی"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5c493d] dark:text-[#d3c4b9] mb-1.5">
                پست الکترونیک (جهت درج در سربرگ PDF)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 font-mono text-left dir-ltr"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition active:scale-95"
            >
              ذخیره اطلاعات کاربر
            </button>
          </div>
        </form>
      </div>

      {/* Currency & Calendar Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Currency selection */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <Coins className="w-5 h-5 text-[#d97706]" />
            <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
              انتخاب واحد پول پیش‌فرض
            </h2>
          </div>

          <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
            تمام ارقام و نمودارها بر اساس واحد پولی انتخابی نمایش داده می‌شوند.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleCurrencyChange('IRT')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                settings.currency === 'IRT'
                  ? 'border-[#7e22ce] bg-[#7e22ce]/10 text-[#7e22ce] dark:border-[#fbbf24] dark:bg-[#fbbf24]/10 dark:text-[#fbbf24] font-black shadow-sm'
                  : 'border-[#e8dfd7] dark:border-[#422e23] text-[#7c695c] hover:bg-neutral-50 dark:hover:bg-[#2d1e17]'
              }`}
            >
              <div className="text-base font-black">تومان</div>
              <div className="text-[11px] opacity-80 mt-0.5">رایج و استاندارد</div>
            </button>

            <button
              type="button"
              onClick={() => handleCurrencyChange('IRR')}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                settings.currency === 'IRR'
                  ? 'border-[#7e22ce] bg-[#7e22ce]/10 text-[#7e22ce] dark:border-[#fbbf24] dark:bg-[#fbbf24]/10 dark:text-[#fbbf24] font-black shadow-sm'
                  : 'border-[#e8dfd7] dark:border-[#422e23] text-[#7c695c] hover:bg-neutral-50 dark:hover:bg-[#2d1e17]'
              }`}
            >
              <div className="text-base font-black">ریال</div>
              <div className="text-[11px] opacity-80 mt-0.5">رسمی بانکی</div>
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <Sun className="w-5 h-5 text-[#ca8a04]" />
            <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
              پوسته و حالت نمایش
            </h2>
          </div>

          <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
            تنظیم ظاهر تاریک (دارک مود) با رنگ‌بندی لوکس قهوه‌ای و بنفش یا روشن.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                settings.theme !== 'dark'
                  ? 'border-[#7e22ce] bg-[#7e22ce]/10 text-[#7e22ce] font-black shadow-sm'
                  : 'border-[#e8dfd7] dark:border-[#422e23] text-[#7c695c] hover:bg-neutral-50 dark:hover:bg-[#2d1e17]'
              }`}
            >
              <Sun className="w-5 h-5 text-[#d97706]" />
              <div className="text-xs font-bold">حالت روشن</div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                settings.theme === 'dark'
                  ? 'border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24] font-black shadow-sm'
                  : 'border-[#e8dfd7] dark:border-[#422e23] text-[#7c695c] hover:bg-neutral-50 dark:hover:bg-[#2d1e17]'
              }`}
            >
              <Moon className="w-5 h-5 text-[#c084fc]" />
              <div className="text-xs font-bold">حالت تاریک</div>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Audio Chime */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
          <Bell className="w-5 h-5 text-[#7e22ce] dark:text-[#fbbf24]" />
          <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
            اعلان‌ها و جلوه‌های صوتی
          </h2>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf6f2] dark:bg-[#2b1b13]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
              اعلان‌های یادآوری مرورگر
            </h4>
            <p className="text-[11px] text-[#7c695c] dark:text-[#a89587]">
              نمایش پیام یادآوری کارهای دارای زنگ هنگام سررسید
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              settings.notificationsEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {settings.notificationsEnabled ? 'فعال' : 'غیرفعال'}
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf6f2] dark:bg-[#2b1b13]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
              صدای آکورد پیانو هنگام ثبت تراکنش یا تکمیل کار
            </h4>
            <p className="text-[11px] text-[#7c695c] dark:text-[#a89587]">
              جلوه صوتی گوش‌نواز ساخته‌شده با Web Audio API
            </p>
          </div>
          <button
            type="button"
            onClick={() => playChime('success')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7e22ce] dark:text-[#c084fc] text-xs font-bold hover:bg-purple-200 transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تست صدا</span>
          </button>
        </div>
      </div>

      {/* Category Management */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
          <Tag className="w-5 h-5 text-[#d97706]" />
          <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
            مدیریت و افزودن دسته‌بندی‌های دلخواه
          </h2>
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="نام دسته‌بندی جدید..."
            className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-xs focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
          />

          <select
            value={newCatDomain}
            onChange={(e) => setNewCatDomain(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-xs font-semibold"
          >
            <option value="finance">دسته‌بندی مالی</option>
            <option value="task">دسته‌بندی وظایف (کارها)</option>
          </select>

          {newCatDomain === 'finance' && (
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#e8dfd7] dark:border-[#422e23] bg-white dark:bg-[#2c1e18] text-[#2a1a12] dark:text-[#f8f2ed] text-xs font-semibold"
            >
              <option value="expense">هزینه</option>
              <option value="income">درآمد</option>
            </select>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7e22ce] hover:bg-[#6b21a8] text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن دسته‌بندی</span>
          </button>
        </form>

        {/* Categories Chips */}
        <div className="space-y-3 pt-2">
          <div>
            <h4 className="text-xs font-bold text-[#4a362a] dark:text-[#d3c4b9] mb-2">
              دسته‌بندی‌های مالی فعلی:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {financeCategories.map((c) => (
                <span
                  key={c.id}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#faf6f2] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#3d2920] text-[#4a362a] dark:text-[#e4d6cc] flex items-center gap-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      c.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{c.name}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#4a362a] dark:text-[#d3c4b9] mb-2">
              دسته‌بندی‌های کارهای روزانه:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {taskCategories.map((c) => (
                <span
                  key={c.id}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#faf6f2] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#3d2920] text-[#4a362a] dark:text-[#e4d6cc]"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#f0eae3] dark:border-[#38261e]">
          <Info className="w-5 h-5 text-[#7e22ce] dark:text-[#fbbf24]" />
          <h2 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
            درباره سامانه مدیریت مالی توسکا
          </h2>
        </div>

        <p className="text-xs text-[#7c695c] dark:text-[#a89587] leading-relaxed">
          نرم‌افزار جامع مدیریت مالی و برنامه‌ریزی کارهای روزانه توسکا به صورت اختصاصی با تکنولوژی روز React.js و معماری ذخیره‌سازی محلی (Local Persistence) طراحی شده است. تمام محاسبات، ثبت اسناد و تولید گزارش‌های حسابداری به صورت صددرصد مستقل و آفلاین انجام می‌پذیرد و حریم خصوصی داده‌های مالی شما کاملاً محفوظ است.
        </p>
      </div>
    </div>
  );
}
