import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأیید عملیات',
  message = 'آیا از انجام این عملیات اطمینان دارید؟ این تغییر قابل بازگشت نیست.',
  confirmText = 'بله، حذف شود',
  cancelText = 'انصراف',
  type = 'danger' // 'danger' | 'warning' | 'info'
}) {
  const isDanger = type === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-center py-2">
        <div
          className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            isDanger
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          }`}
        >
          {isDanger ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>

        <p className="text-sm text-[#4a362a] dark:text-[#d3c4b9] leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#d8cdbf] dark:border-[#473024] text-xs sm:text-sm font-medium text-[#4a362a] dark:text-[#e4d6cc] hover:bg-[#f7f2ed] dark:hover:bg-[#332117] transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
