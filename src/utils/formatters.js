import { toPersianNumber } from './jalali';

/**
 * Format currency amount with thousands separators and Persian numerals
 * currency: 'IRT' (تومان) or 'IRR' (ریال)
 */
export function formatCurrency(amount, currency = 'IRT', showSign = false) {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formattedAbs = absNum.toLocaleString('en-US');
  const persianNumber = toPersianNumber(formattedAbs);
  const unit = currency === 'IRR' ? 'ریال' : 'تومان';

  if (showSign && num > 0) {
    return `+ ${persianNumber} ${unit}`;
  }
  if (isNegative) {
    return `- ${persianNumber} ${unit}`;
  }

  return `${persianNumber} ${unit}`;
}

/**
 * Breakdown amount into components for perfect RTL layout rendering
 */
export function formatCurrencyParts(amount, currency = 'IRT') {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formattedNumber = toPersianNumber(absNum.toLocaleString('en-US'));
  const unit = currency === 'IRR' ? 'ریال' : 'تومان';
  return {
    rawNumber: num,
    isNegative,
    formattedNumber,
    unit,
    sign: isNegative ? '-' : '+'
  };
}

/**
 * Converts standard time "HH:mm" to Persian numbers, e.g. "۱۴:۳۰"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  return toPersianNumber(timeStr);
}

/**
 * Priority config with labels, colors and badges
 */
export const PRIORITY_CONFIG = {
  high: {
    label: 'زیاد',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    color: '#e11d48'
  },
  medium: {
    label: 'متوسط',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    color: '#d97706'
  },
  low: {
    label: 'کم',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    color: '#059669'
  }
};

/**
 * Transaction type metadata
 */
export const TRANSACTION_TYPE_CONFIG = {
  income: {
    label: 'درآمد',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    color: '#10b981',
    prefix: '+'
  },
  expense: {
    label: 'هزینه',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    color: '#f43f5e',
    prefix: '-'
  },
  transfer: {
    label: 'انتقال بین حساب‌ها',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    color: '#6366f1',
    prefix: '⇄'
  }
};

/**
 * Account types configuration
 */
export const ACCOUNT_TYPE_CONFIG = {
  cash: { label: 'کیف پول نقدی', icon: 'Wallet' },
  bank: { label: 'حساب جاری بانکی', icon: 'Landmark' },
  card: { label: 'کارت بانکی', icon: 'CreditCard' },
  savings: { label: 'حساب پس‌انداز', icon: 'PiggyBank' },
  business: { label: 'حساب کسب‌وکار', icon: 'Briefcase' }
};
