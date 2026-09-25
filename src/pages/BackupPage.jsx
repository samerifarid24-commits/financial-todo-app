import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { toPersianNumber } from '../utils/jalali';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';

export default function BackupPage() {
  const {
    tasks,
    accounts,
    transactions,
    exportAllData,
    exportFinancialData,
    exportTasksData,
    restoreData,
    resetToFactoryDefaults,
    openConfirmDialog
  } = useApp();

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        // Show confirm dialog
        openConfirmDialog({
          title: 'تأیید بازیابی فایل پشتیبان',
          message: `فایل "${file.name}" با موفقیت تحلیل شد. با تأیید این عملیات، داده‌های فعلی جایگزین اطلاعات فایل پشتیبان خواهند شد. آیا ادامه می‌دهید؟`,
          confirmText: 'بله، بازیابی شود',
          type: 'warning',
          onConfirm: () => {
            try {
              restoreData(json);
              setImportStatus({
                type: 'success',
                message: 'اطلاعات با موفقیت کامل بازیابی شد.'
              });
            } catch (err) {
              setImportStatus({
                type: 'error',
                message: err.message || 'خطا در بازیابی اطلاعات.'
              });
            }
          }
        });
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'فایل انتخابی نامعتبر است یا ساختار JSON درستی ندارد.'
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleResetDefaultsWithConfirm = () => {
    openConfirmDialog({
      title: 'بازنشانی اطلاعات به حالت اولیه',
      message: 'آیا مایلید تمام تراکنش‌ها و کارهای ثبت‌شده پاک شده و برنامه به حالت خام اولیه بازنشانی شود؟',
      confirmText: 'بله، بازنشانی و پاکسازی شود',
      type: 'danger',
      onConfirm: () => {
        resetToFactoryDefaults();
        setImportStatus({
          type: 'success',
          message: 'برنامه به حالت خام اولیه با موفقیت بازنشانی شد.'
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#2a1a12] dark:text-[#f8f2ed]">
          پشتیبان‌گیری و بازیابی اطلاعات
        </h1>
        <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] mt-1">
          خروجی گرفتن از تمام اطلاعات به فرمت استاندارد JSON، دانلود نسخه پشتیبان و بازیابی امن
        </p>
      </div>

      {/* Status banner */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportStatus(null)}
            className="text-xs underline hover:opacity-80"
          >
            بستن
          </button>
        </div>
      )}

      {/* Current Data Statistics */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm">
        <h3 className="text-sm font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-3">
          وضعیت کنونی اطلاعات ذخیره‌شده روی حافظه مرورگر:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
            <span className="text-purple-800 dark:text-purple-300 font-semibold">تعداد وظایف و کارها:</span>
            <span className="font-bold text-sm text-purple-950 dark:text-purple-100">{toPersianNumber(tasks.length)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <span className="text-amber-800 dark:text-amber-300 font-semibold">تعداد حساب‌های مالی:</span>
            <span className="font-bold text-sm text-amber-950 dark:text-amber-100">{toPersianNumber(accounts.length)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold">تعداد تراکنش‌های مالی:</span>
            <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">{toPersianNumber(transactions.length)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Export vs Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7e22ce] dark:bg-purple-950/50 dark:text-[#c084fc] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                خروجی گرفتن و دانلود نسخه پشتیبان
              </h3>
              <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                ذخیره اطلاعات در قالب فایل JSON استاندارد
              </p>
            </div>
          </div>

          <p className="text-xs text-[#6e5b4f] dark:text-[#a89587] leading-relaxed">
            شما می‌توانید در هر لحظه یک نسخه پشتیبان کامل یا تفکیک‌شده از اطلاعات خود دریافت و روی رایانه یا گوشی خود ذخیره کنید.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={exportAllData}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#fbbf24]" />
                <span>دانلود پشتیبان کامل (همه کارها، حساب‌ها و تراکنش‌ها)</span>
              </div>
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={exportFinancialData}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#faf6f2] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#402a1e] text-[#2a1a12] dark:text-[#f8f2ed] hover:border-[#ca8a04] text-xs sm:text-sm font-bold transition"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#d97706]" />
                <span>دانلود پشتیبان امور مالی (تراکنش‌ها و حساب‌ها)</span>
              </div>
              <Download className="w-4 h-4 text-[#8d7c71]" />
            </button>

            <button
              type="button"
              onClick={exportTasksData}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#faf6f2] dark:bg-[#2b1b13] border border-[#e8dfd7] dark:border-[#402a1e] text-[#2a1a12] dark:text-[#f8f2ed] hover:border-[#7e22ce] text-xs sm:text-sm font-bold transition"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#7e22ce]" />
                <span>دانلود پشتیبان کارهای روزانه (Tasks)</span>
              </div>
              <Download className="w-4 h-4 text-[#8d7c71]" />
            </button>
          </div>
        </div>

        {/* Import & Restore Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f0eae3] dark:border-[#38261e]">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#d97706] dark:bg-amber-950/50 dark:text-[#fbbf24] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                ورود و بازیابی فایل پشتیبان
              </h3>
              <p className="text-xs text-[#7c695c] dark:text-[#a89587]">
                بازگرداندن اطلاعات قبلی از فایل JSON
              </p>
            </div>
          </div>

          <p className="text-xs text-[#6e5b4f] dark:text-[#a89587] leading-relaxed">
            فایل پشتیبان معتبر با پسوند <code className="text-[#7e22ce] font-mono">.json</code> را انتخاب کنید. سیستم قبل از جایگزینی داده‌ها، صحت ساختار فایل را بررسی خواهد کرد.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-dashed border-[#7e22ce]/40 hover:border-[#7e22ce] bg-[#fbf8f5] dark:bg-[#2d1e17] text-[#7e22ce] dark:text-[#fbbf24] font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-95"
          >
            <Upload className="w-5 h-5" />
            <span>انتخاب فایل پشتیبان (.json) برای بازیابی</span>
          </button>

          {/* Reset Factory Seed */}
          <div className="pt-4 border-t border-[#f0eae3] dark:border-[#38261e]">
            <button
              type="button"
              onClick={handleResetDefaultsWithConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 text-xs font-bold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>بازنشانی و پاکسازی کامل داده‌ها (شروع تازه)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
