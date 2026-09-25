import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadAppData, saveAppData, validateBackupData, getInitialSeedData } from '../services/storage';
import { calculateAccountBalances, calculateSummary } from '../services/financialCalculations';
import { playChime, sendBrowserNotification } from '../services/notifications';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Load state from local persistent storage
  const [data, setData] = useState(() => loadAppData());

  // Global UI states for quick actions and modals
  const [modalState, setModalState] = useState({
    taskModal: { isOpen: false, editItem: null },
    transactionModal: { isOpen: false, editItem: null, defaultType: 'expense' },
    accountModal: { isOpen: false, editItem: null },
    transferModal: { isOpen: false, editItem: null },
    pdfReportModal: { isOpen: false, reportType: 'full', preselectedMonth: null },
    confirmDialog: { isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' }
  });

  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');

  // Persist data whenever it changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Sync theme with document element
  useEffect(() => {
    const isDark = data.settings?.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings?.theme]);

  // Dynamic calculation of accounts with real-time balances
  const accountsWithBalances = useMemo(() => {
    return calculateAccountBalances(data.accounts || [], data.transactions || []);
  }, [data.accounts, data.transactions]);

  // Overall financial summary
  const overallSummary = useMemo(() => {
    return calculateSummary(data.transactions || []);
  }, [data.transactions]);

  // Total balance across all accounts
  const totalBalance = useMemo(() => {
    return accountsWithBalances.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  }, [accountsWithBalances]);

  // ---- Task Operations ----
  const addTask = (taskInput) => {
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      completed: false,
      createdAt: new Date().toISOString(),
      ...taskInput
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
    playChime('success');
    return newTask;
  };

  const updateTask = (id, fields) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...fields } : t))
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
    playChime('delete');
  };

  const toggleTaskComplete = (id) => {
    let newlyCompleted = false;
    setData(prev => {
      const updated = prev.tasks.map(t => {
        if (t.id === id) {
          newlyCompleted = !t.completed;
          return { ...t, completed: newlyCompleted };
        }
        return t;
      });
      return { ...prev, tasks: updated };
    });

    if (newlyCompleted) {
      playChime('success');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7e22ce', '#d97706', '#10b981', '#fbbf24']
        });
      } catch {
        // Safe fallback
      }
    }
  };

  // ---- Transaction Operations ----
  const addTransaction = (txInput) => {
    const newTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...txInput,
      amount: Number(txInput.amount) || 0
    };
    setData(prev => {
      const nextData = {
        ...prev,
        transactions: [newTx, ...prev.transactions]
      };
      saveAppData(nextData);
      return nextData;
    });
    playChime('success');
    return newTx;
  };

  const updateTransaction = (id, fields) => {
    setData(prev => {
      const updatedTxs = prev.transactions.map(tx => (
        tx.id === id
          ? {
              ...tx,
              ...fields,
              amount: fields.amount !== undefined ? Number(fields.amount) : tx.amount
            }
          : tx
      ));
      const nextData = { ...prev, transactions: updatedTxs };
      saveAppData(nextData);
      return nextData;
    });
    playChime('success');
  };

  const deleteTransaction = (id) => {
    setData(prev => {
      const updatedTxs = prev.transactions.filter(tx => tx.id !== id);
      const nextData = { ...prev, transactions: updatedTxs };
      saveAppData(nextData);
      return nextData;
    });
    playChime('delete');
  };

  // ---- Account Operations ----
  const addAccount = (accInput) => {
    const newAcc = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      initialBalance: Number(accInput.initialBalance) || 0,
      color: accInput.color || '#7e22ce',
      type: accInput.type || 'bank',
      ...accInput
    };
    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAcc]
    }));
    playChime('success');
    return newAcc;
  };

  const updateAccount = (id, fields) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => (
        a.id === id
          ? { ...a, ...fields, initialBalance: fields.initialBalance !== undefined ? Number(fields.initialBalance) : a.initialBalance }
          : a
      ))
    }));
  };

  const deleteAccount = (id) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id),
      // Clean up orphaned transactions or leave with null
      transactions: prev.transactions.filter(tx => tx.accountId !== id && tx.destinationAccountId !== id)
    }));
    playChime('delete');
  };

  // ---- Categories Operations ----
  const addFinanceCategory = (cat) => {
    const newCat = {
      id: `fc_${Date.now()}`,
      ...cat
    };
    setData(prev => ({
      ...prev,
      financeCategories: [...prev.financeCategories, newCat]
    }));
  };

  const addTaskCategory = (cat) => {
    const newCat = {
      id: `tc_${Date.now()}`,
      ...cat
    };
    setData(prev => ({
      ...prev,
      taskCategories: [...prev.taskCategories, newCat]
    }));
  };

  // ---- Settings Operations ----
  const updateSettings = (fields) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...fields }
    }));
  };

  // ---- Backup & Restore ----
  const exportAllData = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `touska_backup_all_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportFinancialData = () => {
    const exportSubset = {
      version: data.version,
      exportedAt: new Date().toISOString(),
      accounts: data.accounts,
      transactions: data.transactions,
      financeCategories: data.financeCategories,
      settings: data.settings
    };
    const jsonStr = JSON.stringify(exportSubset, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `touska_finance_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTasksData = () => {
    const exportSubset = {
      version: data.version,
      exportedAt: new Date().toISOString(),
      tasks: data.tasks,
      taskCategories: data.taskCategories
    };
    const jsonStr = JSON.stringify(exportSubset, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `touska_tasks_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreData = (importedJson) => {
    const validation = validateBackupData(importedJson);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    setData(importedJson);
    saveAppData(importedJson);
    playChime('success');
    return true;
  };

  const resetToFactoryDefaults = () => {
    const initial = getInitialSeedData();
    setData(initial);
    saveAppData(initial);
    playChime('success');
  };

  // ---- Modal Handlers ----
  const openTaskModal = (editItem = null) => {
    setModalState(prev => ({
      ...prev,
      taskModal: { isOpen: true, editItem }
    }));
  };

  const closeTaskModal = () => {
    setModalState(prev => ({
      ...prev,
      taskModal: { isOpen: false, editItem: null }
    }));
  };

  const openTransactionModal = (type = 'expense', editItem = null) => {
    setModalState(prev => ({
      ...prev,
      transactionModal: { isOpen: true, editItem, defaultType: type }
    }));
  };

  const closeTransactionModal = () => {
    setModalState(prev => ({
      ...prev,
      transactionModal: { isOpen: false, editItem: null, defaultType: 'expense' }
    }));
  };

  const openAccountModal = (editItem = null) => {
    setModalState(prev => ({
      ...prev,
      accountModal: { isOpen: true, editItem }
    }));
  };

  const closeAccountModal = () => {
    setModalState(prev => ({
      ...prev,
      accountModal: { isOpen: false, editItem: null }
    }));
  };

  const openTransferModal = (editItem = null) => {
    setModalState(prev => ({
      ...prev,
      transferModal: { isOpen: true, editItem }
    }));
  };

  const closeTransferModal = () => {
    setModalState(prev => ({
      ...prev,
      transferModal: { isOpen: false, editItem: null }
    }));
  };

  const openPdfReportModal = (reportType = 'full', preselectedMonth = null, preselectedYear = null) => {
    setModalState(prev => ({
      ...prev,
      pdfReportModal: { isOpen: true, reportType, preselectedMonth, preselectedYear }
    }));
  };

  const closePdfReportModal = () => {
    setModalState(prev => ({
      ...prev,
      pdfReportModal: { isOpen: false, reportType: 'full', preselectedMonth: null, preselectedYear: null }
    }));
  };

  const openConfirmDialog = ({ title, message, onConfirm, type = 'danger' }) => {
    setModalState(prev => ({
      ...prev,
      confirmDialog: { isOpen: true, title, message, onConfirm, type }
    }));
  };

  const closeConfirmDialog = () => {
    setModalState(prev => ({
      ...prev,
      confirmDialog: { isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' }
    }));
  };

  return (
    <AppContext.Provider
      value={{
        // State
        tasks: data.tasks || [],
        accounts: accountsWithBalances,
        rawAccounts: data.accounts || [],
        transactions: data.transactions || [],
        taskCategories: data.taskCategories || [],
        financeCategories: data.financeCategories || [],
        settings: data.settings || {},
        overallSummary,
        totalBalance,
        globalSearch,
        setGlobalSearch,

        // Task CRUD
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,

        // Transaction CRUD
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // Account CRUD
        addAccount,
        updateAccount,
        deleteAccount,

        // Categories CRUD
        addFinanceCategory,
        addTaskCategory,

        // Settings & Data management
        updateSettings,
        exportAllData,
        exportFinancialData,
        exportTasksData,
        restoreData,
        resetToFactoryDefaults,

        // Modals
        modalState,
        openTaskModal,
        closeTaskModal,
        openTransactionModal,
        closeTransactionModal,
        openAccountModal,
        closeAccountModal,
        openTransferModal,
        closeTransferModal,
        openPdfReportModal,
        closePdfReportModal,
        openConfirmDialog,
        closeConfirmDialog
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
