import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  getTodayJalali,
  formatJalaliString,
  PERSIAN_MONTHS,
  toPersianNumber,
  formatFullPersianDate
} from '../../utils/jalali';
import {
  filterTransactionsByMonth,
  calculateSummary,
  calculateBalanceSheet,
  calculateCashFlowStatement
} from '../../services/financialCalculations';
import { generatePdfFromElement, generateDirectPdfReport } from '../../services/pdfGenerator';
import {
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function PdfReportModal({
  isOpen,
  onClose,
  reportType = 'full',
  initialMonth = null,
  initialYear = null
}) {
  const { transactions, accounts, settings } = useApp();

  const today = getTodayJalali();
  const [selectedType, setSelectedType] = useState(reportType || 'full');
  const [selectedYear, setSelectedYear] = useState(initialYear || today.jy);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || today.jm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setSelectedType(reportType || 'full');
      if (initialMonth) setSelectedMonth(initialMonth);
      if (initialYear) setSelectedYear(initialYear);
      setSuccessMessage('');
      setErrorMessage('');
      setIsGenerating(false);
    }
  }, [isOpen, reportType, initialMonth, initialYear]);

  // Calculate month boundaries in Jalali
  const mStart = formatJalaliString(selectedYear, selectedMonth, 1);
  const mEnd = formatJalaliString(
    selectedYear,
    selectedMonth,
    selectedMonth <= 6 ? 31 : selectedMonth <= 11 ? 30 : 29
  );

  // Filter transactions for this report period
  const rawPeriodTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedYear, selectedMonth);
  }, [transactions, selectedYear, selectedMonth]);

  // Filter according to selectedType
  const displayedTransactions = useMemo(() => {
    if (selectedType === 'income') {
      return rawPeriodTransactions.filter(t => t.type === 'income');
    }
    if (selectedType === 'expense') {
      return rawPeriodTransactions.filter(t => t.type === 'expense');
    }
    return rawPeriodTransactions;
  }, [rawPeriodTransactions, selectedType]);

  // Financial calculations based on real data
  const summary = useMemo(() => {
    return calculateSummary(rawPeriodTransactions);
  }, [rawPeriodTransactions]);

  const balanceSheet = useMemo(() => {
    return calculateBalanceSheet(accounts, transactions, mStart, mEnd);
  }, [accounts, transactions, mStart, mEnd]);

  const cashFlow = useMemo(() => {
    return calculateCashFlowStatement(accounts, transactions, mStart, mEnd);
  }, [accounts, transactions, mStart, mEnd]);

  const reportTitles = {
    full: 'گزارش جامع مالی و حسابداری شخصی',
    monthly: 'صورتحساب ماهانه دوره',
    'profit-loss': 'صورت سود و زیان دوره‌ای (P&L)',
    balance: 'گزارش ترازنامه و گردش حساب‌ها',
    'cash-flow': 'گزارش تحلیل جریان نقدی (Cash Flow)',
    income: 'گزارش تفصیلی درآمدهای دوره',
    expense: 'گزارش تفصیلی هزینه‌های دوره'
  };

  const currentTitle = reportTitles[selectedType] || 'گزارش مالی';
  const currencyUnit = settings.currency === 'IRR' ? 'ریال' : 'تومان';

  const getAccountName = (accId) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'حساب نامشخص';
  };

  // Real PDF Generation & Download
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setSuccessMessage('');
    setErrorMessage('');

    const fileName = 'financial-report.pdf';

    try {
      const reportElement = document.getElementById('printable-report-content');
      let downloaded = false;

      if (reportElement) {
        try {
          await generatePdfFromElement(reportElement, fileName);
          downloaded = true;
        } catch (domErr) {
          console.warn('[PDF] DOM-based generator failed, trying canvas fallback:', domErr);
        }
      }

      if (!downloaded) {
        // Fallback directly creates PDF using pure Canvas 2D
        await generateDirectPdfReport({
          title: currentTitle,
          periodText: `${PERSIAN_MONTHS[selectedMonth - 1]} ${toPersianNumber(selectedYear)}`,
          userName: settings.userName || 'کاربر گرامی',
          currencyUnit,
          totalIncome: summary.totalIncome,
          totalExpense: summary.totalExpense,
          netProfitLoss: summary.netProfitLoss,
          openingBalance: balanceSheet.openingBalance,
          closingBalance: balanceSheet.closingBalance,
          transactions: displayedTransactions
        }, fileName);
      }

      setSuccessMessage(`فایل PDF «${fileName}» با موفقیت تولید شد و دانلود آن آغاز گردید.`);
    } catch (error) {
      console.error('[PDF Error] Could not generate or download PDF:', error);
      setErrorMessage(`خطا در تولید PDF: ${error?.message || 'مشکلی در فرآیند تولید رخ داد'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser Print
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="صدور و پیش‌نمایش گزارش PDF"
      subtitle="تولید فایل رسمی PDF با محاسبات دقیق و دانلود مستقیم در مرورگر"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Controls Bar - will hide in print */}
        <div className="no-print p-4 rounded-2xl bg-[#f8f3ee] dark:bg-[#2d1e16] border border-[#e8dfd7] dark:border-[#3d2a20] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#7c695c] dark:text-[#a89587] mb-1">
                  نوع گزارش
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#d8cdbf] dark:border-[#422e23] bg-white dark:bg-[#20140e] text-[#2a1a12] dark:text-white font-medium"
                >
                  <option value="full">گزارش جامع مالی</option>
                  <option value="monthly">صورتحساب ماهانه</option>
                  <option value="profit-loss">گزارش سود و زیان</option>
                  <option value="balance">گزارش تراز مالی</option>
                  <option value="cash-flow">گزارش جریان نقدی</option>
                  <option value="income">گزارش درآمدها</option>
                  <option value="expense">گزارش هزینه‌ها</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7c695c] dark:text-[#a89587] mb-1">
                  ماه
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[#d8cdbf] dark:border-[#422e23] bg-white dark:bg-[#20140e] text-[#2a1a12] dark:text-white font-medium"
                >
                  {PERSIAN_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7c695c] dark:text-[#a89587] mb-1">
                  سال
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[#d8cdbf] dark:border-[#422e23] bg-white dark:bg-[#20140e] text-[#2a1a12] dark:text-white font-medium"
                >
                  {[today.jy - 1, today.jy, today.jy + 1].map((y) => (
                    <option key={y} value={y}>
                      {toPersianNumber(y)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons: Primary «چاپ PDF» + Secondary Print */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-900/15 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                title="تولید واقعی و دانلود مستقیم فایل PDF"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال تولید PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>چاپ PDF (دانلود مستقیم)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBrowserPrint}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#d8cdbf] dark:border-[#422e23] text-xs font-semibold text-[#4a362a] dark:text-[#e4d6cc] hover:bg-white dark:hover:bg-[#241712] transition"
                title="چاپ از طریق مرورگر سیستم"
              >
                <Printer className="w-4 h-4 text-[#8d7c71]" />
                <span className="hidden sm:inline">پیش‌نمایش پرینت</span>
              </button>
            </div>
          </div>

          {/* Success banner if file downloaded */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error banner if failed */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Printable Paper Document Container */}
        <div
          id="printable-report-content"
          className="print-container bg-white text-[#1a120c] p-6 sm:p-8 rounded-2xl border border-[#e5dcd2] shadow-md mx-auto space-y-6"
          style={{
            fontFamily: 'Vazirmatn, Tahoma, sans-serif',
            direction: 'rtl',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            width: '100%',
            maxWidth: '820px'
          }}
        >
          {/* Header */}
          <div
            className="pb-4 flex items-center justify-between"
            style={{ borderBottom: '2px solid #7e22ce' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#d97706'
                  }}
                />
                <h1 className="text-xl sm:text-2xl font-black" style={{ color: '#3b0764' }}>
                  سامانه مدیریت مالی توسکا
                </h1>
              </div>
              <p className="text-sm font-bold mt-1" style={{ color: '#581c87' }}>{currentTitle}</p>
            </div>
            <div className="text-left text-xs space-y-1" style={{ color: '#4b5563' }}>
              <div>
                دوره:{' '}
                <span className="font-bold" style={{ color: '#111827' }}>
                  {PERSIAN_MONTHS[selectedMonth - 1]} {toPersianNumber(selectedYear)}
                </span>
              </div>
              <div>
                تاریخ صدور:{' '}
                <span className="font-bold" style={{ color: '#111827' }}>
                  {formatFullPersianDate()}
                </span>
              </div>
              <div>
                کاربر:{' '}
                <span className="font-bold" style={{ color: '#111827' }}>
                  {settings.userName || 'کاربر گرامی'}
                </span>
              </div>
              <div>
                واحد پول:{' '}
                <span className="font-bold" style={{ color: '#111827' }}>{currencyUnit}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {/* Opening Balance */}
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#5b21b6'
              }}
            >
              <span className="text-[11px] font-semibold block mb-1">
                موجودی اول دوره
              </span>
              <span className="text-sm sm:text-base font-extrabold block" style={{ color: '#3b0764' }} dir="rtl">
                {toPersianNumber(Number(balanceSheet.openingBalance || 0).toLocaleString('en-US'))}{' '}
                <span className="text-[11px] font-normal">{currencyUnit}</span>
              </span>
            </div>

            {/* Total Income */}
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46'
              }}
            >
              <span className="text-[11px] font-semibold block mb-1">
                مجموع درآمدها
              </span>
              <span className="text-sm sm:text-base font-extrabold block" style={{ color: '#047857' }} dir="rtl">
                + {toPersianNumber(Number(summary.totalIncome || 0).toLocaleString('en-US'))}{' '}
                <span className="text-[11px] font-normal">{currencyUnit}</span>
              </span>
            </div>

            {/* Total Expense */}
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#9f1239'
              }}
            >
              <span className="text-[11px] font-semibold block mb-1">
                مجموع هزینه‌ها
              </span>
              <span className="text-sm sm:text-base font-extrabold block" style={{ color: '#be123c' }} dir="rtl">
                - {toPersianNumber(Number(summary.totalExpense || 0).toLocaleString('en-US'))}{' '}
                <span className="text-[11px] font-normal">{currencyUnit}</span>
              </span>
            </div>

            {/* Net Profit / Loss */}
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: summary.netProfitLoss >= 0 ? '#fef3c7' : '#fff1f2',
                border: summary.netProfitLoss >= 0 ? '1px solid #fde68a' : '1px solid #fecdd3',
                color: summary.netProfitLoss >= 0 ? '#92400e' : '#9f1239'
              }}
            >
              <span className="text-[11px] font-semibold block mb-1">
                {summary.netProfitLoss >= 0 ? 'تراز مالی (سود خالص)' : 'تراز مالی (زیان دوره)'}
              </span>
              <span className="text-sm sm:text-base font-extrabold block" dir="rtl">
                {summary.netProfitLoss >= 0 ? '+ ' : '- '}
                {toPersianNumber(Number(Math.abs(summary.netProfitLoss || 0)).toLocaleString('en-US'))}{' '}
                <span className="text-[11px] font-normal">{currencyUnit}</span>
              </span>
            </div>
          </div>

          {/* Cash Flow and Balance Statement section */}
          <div
            className="p-4 rounded-xl space-y-2 text-xs"
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}
          >
            <h4 className="font-bold mb-2" style={{ color: '#3b0764' }}>خلاصه ترازنامه و گردش نقدینگی:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <div
                className="flex justify-between items-center py-0.5"
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <span style={{ color: '#4b5563' }}>ورود وجه نقد (درآمد دوره):</span>
                <span className="font-bold" style={{ color: '#047857' }}>
                  {toPersianNumber(Number(cashFlow.cashInflow || 0).toLocaleString('en-US'))} {currencyUnit}
                </span>
              </div>
              <div
                className="flex justify-between items-center py-0.5"
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <span style={{ color: '#4b5563' }}>خروج وجه نقد (هزینه دوره):</span>
                <span className="font-bold" style={{ color: '#be123c' }}>
                  {toPersianNumber(Number(cashFlow.cashOutflow || 0).toLocaleString('en-US'))} {currencyUnit}
                </span>
              </div>
              <div
                className="flex justify-between items-center py-0.5"
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <span style={{ color: '#4b5563' }}>جریان نقدی خالص دوره:</span>
                <span className="font-bold" style={{ color: '#5b21b6' }}>
                  {cashFlow.netCashFlow >= 0 ? '+ ' : '- '}
                  {toPersianNumber(Number(Math.abs(cashFlow.netCashFlow || 0)).toLocaleString('en-US'))} {currencyUnit}
                </span>
              </div>
              <div
                className="flex justify-between items-center py-0.5"
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <span style={{ color: '#4b5563' }}>موجودی پایان دوره:</span>
                <span className="font-bold" style={{ color: '#111827' }}>
                  {toPersianNumber(Number(balanceSheet.closingBalance || 0).toLocaleString('en-US'))} {currencyUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold" style={{ color: '#1f2937' }}>
                فهرست تراکنش‌های دوره ({toPersianNumber(displayedTransactions.length)} تراکنش):
              </h4>
              <span className="text-[11px] font-medium" style={{ color: '#6b7280' }}>
                بازه: {toPersianNumber(mStart)} تا {toPersianNumber(mEnd)}
              </span>
            </div>

            {displayedTransactions.length === 0 ? (
              <div
                className="p-6 rounded-xl text-center text-xs"
                style={{
                  border: '1px dashed #d1d5db',
                  color: '#6b7280'
                }}
              >
                هیچ تراکنش مالی در این ماه ثبت نشده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderBottom: '1px solid #d1d5db'
                      }}
                      className="font-bold"
                    >
                      <th className="py-2.5 px-2 w-10 text-center">ردیف</th>
                      <th className="py-2.5 px-2.5 w-24">تاریخ</th>
                      <th className="py-2.5 px-2.5">شرح تراکنش</th>
                      <th className="py-2.5 px-2.5 w-28">دسته‌بندی</th>
                      <th className="py-2.5 px-2.5 w-32">حساب</th>
                      <th className="py-2.5 px-2 w-20 text-center">نوع</th>
                      <th className="py-2.5 px-3 w-36 text-left">مبلغ ({currencyUnit})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTransactions.map((tx, idx) => {
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      return (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                          }}
                        >
                          <td className="py-2 px-2 text-center" style={{ color: '#6b7280' }}>
                            {toPersianNumber(idx + 1)}
                          </td>
                          <td className="py-2 px-2.5 font-medium whitespace-nowrap">
                            {toPersianNumber(tx.date)}
                          </td>
                          <td className="py-2 px-2.5 font-semibold" style={{ color: '#111827' }}>
                            <div>{tx.description}</div>
                            {tx.note && (
                              <div className="text-[10px] font-normal" style={{ color: '#6b7280' }}>{tx.note}</div>
                            )}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap" style={{ color: '#374151' }}>
                            {tx.category}
                          </td>
                          <td className="py-2 px-2.5 text-[11px] whitespace-nowrap" style={{ color: '#4b5563' }}>
                            {isTransfer ? (
                              <span>
                                {getAccountName(tx.accountId)} ← {getAccountName(tx.destinationAccountId)}
                              </span>
                            ) : (
                              <span>{getAccountName(tx.accountId)}</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                backgroundColor: isIncome ? '#ecfdf5' : isTransfer ? '#eef2ff' : '#fff1f2',
                                color: isIncome ? '#065f46' : isTransfer ? '#3730a3' : '#9f1239'
                              }}
                            >
                              {isIncome ? 'درآمد' : isTransfer ? 'انتقال' : 'هزینه'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-extrabold text-left whitespace-nowrap" dir="ltr">
                            <span
                              style={{
                                color: isIncome ? '#047857' : isTransfer ? '#4338ca' : '#be123c'
                              }}
                            >
                              {isIncome ? '+' : isTransfer ? '⇄' : '-'}
                              {' '}
                              {toPersianNumber(Number(tx.amount || 0).toLocaleString('en-US'))}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer & Signature */}
          <div
            className="pt-6 flex items-center justify-between text-[11px]"
            style={{
              borderTop: '1px solid #e5e7eb',
              color: '#6b7280'
            }}
          >
            <div>تولید شده توسط سامانه حسابداری شخصی و مدیریت مالی توسکا • سند رسمی</div>
            <div>امضا و مهر تایید مالی: ___________________</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
