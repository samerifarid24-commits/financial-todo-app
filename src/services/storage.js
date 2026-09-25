/**
 * Local persistent data layer (localStorage)
 * Complete offline persistence with export/import backup validation.
 */

const STORAGE_KEY = 'touska_financial_todo_db_v1';

export const DEFAULT_TASK_CATEGORIES = [
  { id: 'tc_work', name: 'کاری و شغلی', color: '#7e22ce' },
  { id: 'tc_personal', name: 'شخصی و خانه', color: '#2563eb' },
  { id: 'tc_finance', name: 'مالی و اداری', color: '#d97706' },
  { id: 'tc_shopping', name: 'خرید و مایحتاج', color: '#059669' },
  { id: 'tc_health', name: 'سلامت و ورزش', color: '#e11d48' },
  { id: 'tc_learning', name: 'آموزش و مطالعه', color: '#0891b2' },
];

export const DEFAULT_FINANCE_CATEGORIES = [
  // Income
  { id: 'fc_salary', name: 'حقوق و دستمزد', type: 'income', color: '#10b981' },
  { id: 'fc_business', name: 'درآمد کسب‌وکار', type: 'income', color: '#059669' },
  { id: 'fc_freelance', name: 'پروژه و فریلنسری', type: 'income', color: '#14b8a6' },
  { id: 'fc_investment', name: 'سود سرمایه‌گذاری', type: 'income', color: '#6366f1' },
  { id: 'fc_income_other', name: 'سایر درآمدها', type: 'income', color: '#8b5cf6' },
  // Expense
  { id: 'fc_food', name: 'خوراک و رستوران', type: 'expense', color: '#f43f5e' },
  { id: 'fc_housing', name: 'مسکن و اجاره', type: 'expense', color: '#e11d48' },
  { id: 'fc_transport', name: 'حمل‌ونقل و خودرو', type: 'expense', color: '#ea580c' },
  { id: 'fc_bills', name: 'قبوض و شارژ ساختمان', type: 'expense', color: '#d97706' },
  { id: 'fc_shopping', name: 'خرید پوشاک و لوازم', type: 'expense', color: '#ca8a04' },
  { id: 'fc_health', name: 'درمان و دارو', type: 'expense', color: '#dc2626' },
  { id: 'fc_leisure', name: 'تفریح و سفر', type: 'expense', color: '#9333ea' },
  { id: 'fc_education', name: 'آموزش و کتاب', type: 'expense', color: '#0284c7' },
  { id: 'fc_expense_other', name: 'متفرقه و سایر', type: 'expense', color: '#64748b' },
];

export function getInitialSeedData() {
  return {
    version: '1.0.0',
    settings: {
      currency: 'IRT', // IRT (تومان) or IRR (ریال)
      theme: 'light', // light or dark
      userName: '',
      userEmail: '',
      notificationsEnabled: true,
      soundEnabled: true,
      defaultAccountId: 'acc_wallet'
    },
    accounts: [
      {
        id: 'acc_wallet',
        name: 'کیف پول نقدی',
        type: 'cash',
        accountNumber: 'نقدی همراه',
        initialBalance: 0,
        color: '#d97706'
      },
      {
        id: 'acc_bank_default',
        name: 'حساب بانکی اصلی',
        type: 'bank',
        accountNumber: '',
        initialBalance: 0,
        color: '#7e22ce'
      },
      {
        id: 'acc_card_default',
        name: 'کارت بانکی',
        type: 'card',
        accountNumber: '',
        initialBalance: 0,
        color: '#dc2626'
      }
    ],
    taskCategories: DEFAULT_TASK_CATEGORIES,
    financeCategories: DEFAULT_FINANCE_CATEGORIES,
    tasks: [],
    transactions: []
  };
}

/**
 * Loads data from localStorage or seeds it
 */
export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.accounts || !parsed.transactions) {
      const initial = getInitialSeedData();
      saveAppData(initial);
      return initial;
    }

    // Check if the stored data is the previous mock/sample dataset (contains mock tx_1 or task_1)
    const hasMockTransactions = Array.isArray(parsed.transactions) &&
      parsed.transactions.some(t => t.id === 'tx_1' || t.id === 'tx_7');
    const hasMockTasks = Array.isArray(parsed.tasks) &&
      parsed.tasks.some(t => t.id === 'task_1');

    if (hasMockTransactions || hasMockTasks) {
      const initial = getInitialSeedData();
      saveAppData(initial);
      return initial;
    }

    return parsed;
  } catch (err) {
    console.error('Error loading app data from storage:', err);
    return getInitialSeedData();
  }
}

/**
 * Saves current data to localStorage
 */
export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Validates a backup JSON before restoring
 */
export function validateBackupData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'فایل پشتیبان نامعتبر است (فرمت JSON نیست).' };
  }
  if (!Array.isArray(data.tasks)) {
    return { valid: false, message: 'بخش کارهای روزانه در فایل پشتیبان یافت نشد.' };
  }
  if (!Array.isArray(data.accounts)) {
    return { valid: false, message: 'بخش حساب‌های مالی در فایل پشتیبان یافت نشد.' };
  }
  if (!Array.isArray(data.transactions)) {
    return { valid: false, message: 'بخش تراکنش‌های مالی در فایل پشتیبان یافت نشد.' };
  }
  return { valid: true };
}
