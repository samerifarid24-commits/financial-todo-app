import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  BadgeDollarSign,
  ArrowLeftRight,
  Wallet,
  FileBarChart2,
  TrendingUp,
  Scale,
  Activity,
  Database,
  Settings,
  X,
  Sparkles
} from 'lucide-react';
import { toPersianNumber } from '../../utils/jalali';
import { useApp } from '../../context/AppContext';

export const NAV_ITEMS = [
  { path: '/', label: 'خانه', icon: Home },
  { path: '/tasks', label: 'کارها', icon: CheckSquare, badgeKey: 'tasksToday' },
  { path: '/finance', label: 'مالی', icon: BadgeDollarSign },
  { path: '/transactions', label: 'تراکنش‌ها', icon: ArrowLeftRight },
  { path: '/accounts', label: 'حساب‌ها', icon: Wallet },
  { path: '/reports', label: 'گزارش‌ها', icon: FileBarChart2 },
  { path: '/reports/profit-loss', label: 'سود و زیان', icon: TrendingUp },
  { path: '/reports/balance', label: 'تراز مالی', icon: Scale },
  { path: '/reports/cash-flow', label: 'جریان نقدی', icon: Activity },
  { path: '/backup', label: 'پشتیبان‌گیری', icon: Database },
  { path: '/settings', label: 'تنظیمات', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { tasks } = useApp();

  // Count uncompleted tasks
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#140b07]/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-64 sm:w-72 bg-gradient-to-b from-[#291811] via-[#21130d] to-[#170c08] text-[#f5eee8] flex flex-col border-l border-[#40271c] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#40271c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7e22ce] via-[#9333ea] to-[#d97706] p-0.5 shadow-lg shadow-purple-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#20110a] rounded-[14px] flex items-center justify-center text-[#fbbf24]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                توســکا
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#d97706]/20 text-[#fbbf24] font-semibold border border-[#d97706]/30">
                  حسابدار هوشمند
                </span>
              </h2>
              <p className="text-[11px] text-[#a89587]">مدیریت جامع کارها و مالی</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a89587] hover:text-white hover:bg-[#382015] lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/' || item.path === '/reports'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white shadow-lg shadow-purple-950/40 border border-purple-500/30'
                      : 'text-[#ccbcaf] hover:text-white hover:bg-[#382015]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#fbbf24]' : 'text-[#a89587]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badgeKey === 'tasksToday' && pendingTasksCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d97706] text-white">
                        {toPersianNumber(pendingTasksCount)}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / User Preview */}
        <div className="p-4 border-t border-[#40271c] bg-[#1d0f09]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7e22ce]/30 border border-[#7e22ce]/50 text-[#fbbf24] flex items-center justify-center font-bold text-sm">
              ت
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-white truncate">
                نسخه آفلاین ۱.۰
              </div>
              <div className="text-[11px] text-[#9c897c] truncate">
                امن و ذخیره روی مرورگر
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
