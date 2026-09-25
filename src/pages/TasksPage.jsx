import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getTodayJalaliString,
  toPersianNumber,
  formatFullPersianDate
} from '../utils/jalali';
import { PRIORITY_CONFIG } from '../utils/formatters';
import PersianDatePicker from '../components/common/PersianDatePicker';
import EmptyState from '../components/common/EmptyState';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  CheckSquare,
  AlertCircle,
  Tag,
  ArrowUpDown,
  Bell
} from 'lucide-react';

export default function TasksPage() {
  const {
    tasks,
    taskCategories,
    toggleTaskComplete,
    deleteTask,
    openTaskModal,
    openConfirmDialog,
    globalSearch
  } = useApp();

  const todayStr = getTodayJalaliString();

  // Tab: 'all' | 'today' | 'upcoming' | 'completed'
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'priority' | 'date'

  // Sync with globalSearch if present
  const effectiveSearch = (search || globalSearch || '').trim().toLowerCase();

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab filtering
        if (activeTab === 'today') {
          if (task.date !== todayStr) return false;
        } else if (activeTab === 'upcoming') {
          if (task.date <= todayStr || task.completed) return false;
        } else if (activeTab === 'completed') {
          if (!task.completed) return false;
        }

        // Text search
        if (effectiveSearch) {
          const matchTitle = (task.title || '').toLowerCase().includes(effectiveSearch);
          const matchDesc = (task.description || '').toLowerCase().includes(effectiveSearch);
          const matchCat = (task.category || '').toLowerCase().includes(effectiveSearch);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && task.category !== filterCategory) {
          return false;
        }

        // Date filter
        if (filterDate && task.date !== filterDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weight = { high: 3, medium: 2, low: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        } else if (sortBy === 'time') {
          return (a.time || '').localeCompare(b.time || '');
        } else if (sortBy === 'date') {
          return (a.date || '').localeCompare(b.date || '');
        }
        return 0;
      });
  }, [tasks, activeTab, effectiveSearch, filterPriority, filterCategory, filterDate, sortBy, todayStr]);

  const handleDeleteWithConfirm = (task) => {
    openConfirmDialog({
      title: 'حذف کار',
      message: `آیا از حذف کار "${task.title}" اطمینان دارید؟`,
      confirmText: 'بله، حذف شود',
      onConfirm: () => deleteTask(task.id)
    });
  };

  const clearFilters = () => {
    setSearch('');
    setFilterPriority('all');
    setFilterCategory('all');
    setFilterDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
            مدیریت کارهای روزانه
          </h1>
          <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
            برنامه‌ریزی، زمان‌بندی و پیگیری وظایف با تقویم خورشیدی
          </p>
        </div>

        <button
          type="button"
          onClick={() => openTaskModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition-all hover:scale-[1.02] active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن کار جدید</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#ede3d8] dark:bg-[#2d1c14] overflow-x-auto text-xs sm:text-sm font-semibold">
        {[
          { key: 'all', label: 'همه کارها', count: tasks.length },
          { key: 'today', label: 'کارهای امروز', count: tasks.filter(t => t.date === todayStr).length },
          { key: 'upcoming', label: 'کارهای آینده', count: tasks.filter(t => t.date > todayStr && !t.completed).length },
          { key: 'completed', label: 'تکمیل‌شده', count: tasks.filter(t => t.completed).length }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-[#22130c] text-[#7e22ce] dark:text-[#fbbf24] shadow-sm font-bold'
                : 'text-[#6c594c] dark:text-[#a89587] hover:text-[#2a1a12] dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key
                  ? 'bg-[#7e22ce]/10 text-[#7e22ce] dark:bg-[#fbbf24]/20 dark:text-[#fbbf24]'
                  : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              {toPersianNumber(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان و توضیحات..."
              className="w-full pr-8 pl-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#8d7c71]" />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="high">زیاد</option>
              <option value="medium">متوسط</option>
              <option value="low">کم</option>
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
              {taskCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f8f3ee] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#40291e] text-[#2a1a12] dark:text-[#f8f2ed] focus:outline-none focus:ring-2 focus:ring-[#7e22ce]/30"
            >
              <option value="time">مرتب‌سازی: ساعت انجام</option>
              <option value="priority">مرتب‌سازی: اولویت کار</option>
              <option value="date">مرتب‌سازی: تاریخ انجام</option>
            </select>
          </div>

          {/* Clear button */}
          {(search || filterPriority !== 'all' || filterCategory !== 'all' || filterDate) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline py-2"
            >
              پاکسازی فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="کاری یافت نشد"
          description="با تغییر فیلترها یا افزودن یک کار جدید، برنامه‌ریزی روزانه خود را تکمیل کنید."
          actionLabel="افزودن کار جدید"
          onAction={() => openTaskModal()}
          icon={CheckSquare}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-neutral-50/80 dark:bg-[#1f130d]/80 border-[#e8dfd7] dark:border-[#38261e] opacity-75'
                    : 'bg-white dark:bg-[#241712] border-[#e8dfd7] dark:border-[#3d2920] shadow-sm hover:border-[#7e22ce]/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left (RTL Right): Checkbox + Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 p-1 rounded-xl transition-all ${
                        task.completed
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'text-[#8d7c71] hover:text-[#7e22ce] hover:bg-[#f7f2ed] dark:hover:bg-[#342016]'
                      }`}
                      title={task.completed ? 'علامت به عنوان انجام‌نشده' : 'علامت به عنوان انجام‌شده'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-600/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm sm:text-base font-bold transition-all ${
                            task.completed
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-[#2a1a12] dark:text-[#f8f2ed]'
                          }`}
                        >
                          {task.title}
                        </h3>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${pConfig.badgeClass}`}
                        >
                          اولویت {pConfig.label}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#f7f2ed] dark:bg-[#332219] text-[#7c695c] dark:text-[#c4b3a5] border border-[#e8dfd7] dark:border-[#422e23]">
                          {task.category}
                        </span>

                        {task.reminder && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#d97706] font-medium">
                            <Bell className="w-3 h-3" />
                            <span>دارای یادآوری</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#7c695c] dark:text-[#a89587] leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Date & Time badges */}
                      <div className="flex items-center gap-3 text-xs text-[#8d7c71] dark:text-[#9e8b7f] pt-1">
                        <div className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#7e22ce] dark:text-[#fbbf24]" />
                          <span>{toPersianNumber(task.date)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                          <span>ساعت {toPersianNumber(task.time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openTaskModal(task)}
                      className="p-1.5 rounded-xl text-[#8d7c71] hover:text-[#7e22ce] hover:bg-[#f7f2ed] dark:hover:bg-[#342016] transition"
                      title="ویرایش کار"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWithConfirm(task)}
                      className="p-1.5 rounded-xl text-[#8d7c71] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="حذف کار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
