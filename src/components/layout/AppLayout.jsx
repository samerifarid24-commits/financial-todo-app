import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskModal from '../modals/TaskModal';
import TransactionModal from '../modals/TransactionModal';
import TransferModal from '../modals/TransferModal';
import AccountModal from '../modals/AccountModal';
import PdfReportModal from '../modals/PdfReportModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useApp } from '../../context/AppContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { modalState, closeTaskModal, closeTransactionModal, closeTransferModal, closeAccountModal, closePdfReportModal, closeConfirmDialog } = useApp();

  return (
    <div className="min-h-screen bg-[#faf6f2] dark:bg-[#1a0f0a] text-[#2c1d11] dark:text-[#f3ede8] flex flex-col transition-colors duration-200">
      {/* Sidebar (Desktop fixed right, Mobile collapsible) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (Offset by sidebar width on desktop lg:mr-72) */}
      <div className="lg:mr-72 flex-1 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={modalState.taskModal.isOpen}
        onClose={closeTaskModal}
        editItem={modalState.taskModal.editItem}
      />

      <TransactionModal
        isOpen={modalState.transactionModal.isOpen}
        onClose={closeTransactionModal}
        defaultType={modalState.transactionModal.defaultType}
        editItem={modalState.transactionModal.editItem}
      />

      <TransferModal
        isOpen={modalState.transferModal.isOpen}
        onClose={closeTransferModal}
        editItem={modalState.transferModal.editItem}
      />

      <AccountModal
        isOpen={modalState.accountModal.isOpen}
        onClose={closeAccountModal}
        editItem={modalState.accountModal.editItem}
      />

      <PdfReportModal
        isOpen={modalState.pdfReportModal.isOpen}
        onClose={closePdfReportModal}
        reportType={modalState.pdfReportModal.reportType}
        initialMonth={modalState.pdfReportModal.preselectedMonth}
        initialYear={modalState.pdfReportModal.preselectedYear}
      />

      <ConfirmDialog
        isOpen={modalState.confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={modalState.confirmDialog.onConfirm}
        title={modalState.confirmDialog.title}
        message={modalState.confirmDialog.message}
        type={modalState.confirmDialog.type}
      />
    </div>
  );
}
