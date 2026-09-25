import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  Moon,
  Sun,
  Search,
  Calendar,
  Clock,
  User,
  Bell
} from 'lucide-react';
import { formatFullPersianDate, toPersianNumber } from '../../utils/jalali';
import { useApp } from '../../context/AppContext';

export default function Header({ onOpenSidebar }) {
  const {
    openTaskModal,
    openTransactionModal,
    openTransferModal,
    openPdfReportModal,
    globalSearch,
    setGlobalSearch,
    settings,
    updateSettings
  } = useApp();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(toPersianNumber(`${h}:${m}:${s}`));
      setCurrentDateStr(formatFullPersianDate());
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#20120a]/85 backdrop-blur-md border-b border-[#e8dfd7] dark:border-[#3d271e] transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Right side: Mobile Menu Button & Date/Time Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="p-2 rounded-xl text-[#4a3528] dark:text-[#d5c7bc] hover:bg-[#f5efe9] dark:hover:bg-[#342016] lg:hidden transition"
              title="منو"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Jalali Date & Clock Badge */}
            <div className="hidden sm:flex items-center gap-3 py-1.5 px-3 rounded-2xl bg-[#faf6f2] dark:bg-[#2b1b13] border border-[#eee5dc] dark:border-[#40291e] text-xs">
              <div className="flex items-center gap-1.5 text-[#581c87] dark:text-[#d8b4fe] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#7e22ce] dark:text-[#fbbf24]" />
                <span>{currentDateStr}</span>
              </div>
              <span className="text-[#c8b7aa] dark:text-[#604233]">•</span>
              <div className="flex items-center gap-1.5 text-[#7c695c] dark:text-[#c4b3a5] font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="flex-1 max-w-xs md:max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="جستجو در کارها، تراکنش‌ها و حساب‌ها..."
                className="w-full pr-9 pl-4 py-2 rounded-xl text-xs bg-[#f7f2ed] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] placeholder-[#8d7c71] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30 transition"
              />
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#8d7c71]" />
            </div>
          </div>

          {/* Left side: Quick Action Buttons & Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Actions Dropdown / Group */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* New Task */}
              <button
                type="button"
                onClick={() => openTaskModal()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white text-xs font-bold shadow-sm shadow-purple-900/15 hover:from-[#6b21a8] hover:to-[#4c1d95] transition hover:scale-[1.02] active:scale-95"
                title="افزودن کار جدید"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">کار جدید</span>
              </button>

              {/* New Expense */}
              <button
                type="button"
                onClick={() => openTransactionModal('expense')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-bold hover:bg-rose-100 transition"
                title="ثبت هزینه جدید"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">هزینه جدید</span>
              </button>

              {/* New Income */}
              <button
                type="button"
                onClick={() => openTransactionModal('income')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold hover:bg-emerald-100 transition"
                title="ثبت درآمد جدید"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">درآمد جدید</span>
              </button>

              {/* PDF Report */}
              <button
                type="button"
                onClick={() => openPdfReportModal('full')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f7f2ed] dark:bg-[#342016] text-[#4a362a] dark:text-[#e4d6cc] border border-[#e8dfd7] dark:border-[#473024] text-xs font-bold hover:border-[#ca8a04] transition"
                title="مشاهده و صدور گزارش مالی"
              >
                <FileText className="w-3.5 h-3.5 text-[#ca8a04]" />
                <span>گزارش مالی</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[#e8dfd7] dark:bg-[#3d271e] mx-1" />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#7c695c] dark:text-[#c4b3a5] hover:bg-[#f7f2ed] dark:hover:bg-[#342016] transition"
              title={settings.theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#fbbf24]" />
              ) : (
                <Moon className="w-4 h-4 text-[#7e22ce]" />
              )}
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pr-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7e22ce] to-[#d97706] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {settings.userName ? settings.userName.charAt(0) : 'ع'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar below header */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="جستجو در کارها و مالی..."
              className="w-full pr-8 pl-3 py-1.5 rounded-xl text-xs bg-[#f7f2ed] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] placeholder-[#8d7c71] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2 text-[#8d7c71]" />
          </div>
        </div>
      </div>
    </header>
  );
}
