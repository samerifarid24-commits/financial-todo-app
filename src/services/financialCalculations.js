/**
 * Centralized Financial Calculation Engine
 * Pure functions for all accounting, balances, cash flow, profit/loss and analytics.
 */

/**
 * Calculates current real balances for all accounts based on initial balances + transactions
 */
export function calculateAccountBalances(accounts = [], transactions = []) {
  const balanceMap = {};
  const incomeMap = {};
  const expenseMap = {};

  // Initialize with initial balances
  accounts.forEach(acc => {
    balanceMap[acc.id] = Number(acc.initialBalance) || 0;
    incomeMap[acc.id] = 0;
    expenseMap[acc.id] = 0;
  });

  // Replay transactions in chronological order
  transactions.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      if (balanceMap[tx.accountId] !== undefined) {
        balanceMap[tx.accountId] += amount;
        incomeMap[tx.accountId] += amount;
      }
    } else if (tx.type === 'expense') {
      if (balanceMap[tx.accountId] !== undefined) {
        balanceMap[tx.accountId] -= amount;
        expenseMap[tx.accountId] += amount;
      }
    } else if (tx.type === 'transfer') {
      // Deduct from source account
      if (balanceMap[tx.accountId] !== undefined) {
        balanceMap[tx.accountId] -= amount;
      }
      // Add to destination account
      if (balanceMap[tx.destinationAccountId] !== undefined) {
        balanceMap[tx.destinationAccountId] += amount;
      }
    }
  });

  return accounts.map(acc => ({
    ...acc,
    currentBalance: balanceMap[acc.id] !== undefined ? balanceMap[acc.id] : (Number(acc.initialBalance) || 0),
    totalIncome: incomeMap[acc.id] || 0,
    totalExpense: expenseMap[acc.id] || 0,
  }));
}

/**
 * Total balance across all accounts
 */
export function calculateTotalBalance(accounts = [], transactions = []) {
  const calculated = calculateAccountBalances(accounts, transactions);
  return calculated.reduce((sum, acc) => sum + acc.currentBalance, 0);
}

/**
 * Calculates total income, expense, and profit/loss for a list of transactions
 */
export function calculateSummary(transactions = []) {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfers = 0;

  transactions.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amount;
    } else if (tx.type === 'expense') {
      totalExpense += amount;
    } else if (tx.type === 'transfer') {
      totalTransfers += amount;
    }
  });

  const netProfitLoss = totalIncome - totalExpense;
  let status = 'breakeven'; // 'profit' | 'loss' | 'breakeven'
  if (netProfitLoss > 0) status = 'profit';
  else if (netProfitLoss < 0) status = 'loss';

  // Cash flow metrics
  const cashInflow = totalIncome;
  const cashOutflow = totalExpense;
  const netCashFlow = cashInflow - cashOutflow;

  return {
    totalIncome,
    totalExpense,
    netProfitLoss,
    status,
    totalTransfers,
    cashInflow,
    cashOutflow,
    netCashFlow,
    transactionCount: transactions.length
  };
}

/**
 * Filters transactions by Jalali date range (inclusive strings "YYYY/MM/DD")
 */
export function filterTransactionsByDate(transactions = [], startDate, endDate) {
  return transactions.filter(tx => {
    if (!tx.date) return false;
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    return true;
  });
}

/**
 * Filters transactions for a specific Jalali year and month
 * month is 1-12
 */
export function filterTransactionsByMonth(transactions = [], year, month) {
  const mStr = String(month).padStart(2, '0');
  const prefix = `${year}/${mStr}`;
  return transactions.filter(tx => tx.date && tx.date.startsWith(prefix));
}

/**
 * Monthly analytics for a given Jalali year (12 months: فروردین to اسفند)
 */
export function calculateYearlyMonthlyData(transactions = [], year) {
  const monthsData = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i + 1,
    monthName: [
      'فروردین', 'اردیبهشت', 'خرداد',
      'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر',
      'دی', 'بهمن', 'اسفند'
    ][i],
    income: 0,
    expense: 0,
    net: 0,
  }));

  transactions.forEach(tx => {
    if (!tx.date) return;
    const parts = tx.date.split('/');
    if (parts.length >= 2 && parseInt(parts[0], 10) === year) {
      const mIdx = parseInt(parts[1], 10) - 1;
      const amount = Number(tx.amount) || 0;
      if (mIdx >= 0 && mIdx < 12) {
        if (tx.type === 'income') {
          monthsData[mIdx].income += amount;
        } else if (tx.type === 'expense') {
          monthsData[mIdx].expense += amount;
        }
      }
    }
  });

  monthsData.forEach(item => {
    item.net = item.income - item.expense;
  });

  return monthsData;
}

/**
 * Category breakdown (pie/donut data) with totals and percentages
 */
export function calculateCategoryBreakdown(transactions = [], type = 'expense') {
  const filtered = transactions.filter(tx => tx.type === type);
  const totalAmount = filtered.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const group = {};
  filtered.forEach(tx => {
    const cat = tx.category || 'متفرقه';
    group[cat] = (group[cat] || 0) + (Number(tx.amount) || 0);
  });

  const items = Object.entries(group).map(([category, amount]) => {
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    return {
      category,
      amount,
      percentage
    };
  });

  // Sort descending
  items.sort((a, b) => b.amount - a.amount);
  return { items, totalAmount };
}

/**
 * Calculates Balance Sheet for a given date range
 */
export function calculateBalanceSheet(accounts = [], transactions = [], startDate, endDate) {
  // Opening balance is total initial balances + all transactions BEFORE startDate
  let openingBalance = accounts.reduce((sum, a) => sum + (Number(a.initialBalance) || 0), 0);
  
  if (startDate) {
    const priorTransactions = transactions.filter(tx => tx.date && tx.date < startDate);
    priorTransactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') openingBalance += amount;
      else if (tx.type === 'expense') openingBalance -= amount;
      // transfers between accounts do not change total net worth across all accounts
    });
  }

  // In-period transactions
  const periodTransactions = filterTransactionsByDate(transactions, startDate, endDate);
  const periodSummary = calculateSummary(periodTransactions);

  const closingBalance = openingBalance + periodSummary.totalIncome - periodSummary.totalExpense;

  return {
    startDate,
    endDate,
    openingBalance,
    totalIncome: periodSummary.totalIncome,
    totalExpense: periodSummary.totalExpense,
    totalTransfers: periodSummary.totalTransfers,
    netChange: periodSummary.netProfitLoss,
    closingBalance,
    transactionCount: periodTransactions.length
  };
}

/**
 * Calculates Cash Flow Statement for a given period
 */
export function calculateCashFlowStatement(accounts = [], transactions = [], startDate, endDate) {
  const balanceSheet = calculateBalanceSheet(accounts, transactions, startDate, endDate);
  const periodTransactions = filterTransactionsByDate(transactions, startDate, endDate);
  
  const inflowItems = [];
  const outflowItems = [];

  const incomeBreakdown = calculateCategoryBreakdown(periodTransactions, 'income');
  const expenseBreakdown = calculateCategoryBreakdown(periodTransactions, 'expense');

  return {
    initialCash: balanceSheet.openingBalance,
    cashInflow: balanceSheet.totalIncome,
    cashOutflow: balanceSheet.totalExpense,
    netCashFlow: balanceSheet.totalIncome - balanceSheet.totalExpense,
    endingCash: balanceSheet.closingBalance,
    inflowBreakdown: incomeBreakdown.items,
    outflowBreakdown: expenseBreakdown.items
  };
}
