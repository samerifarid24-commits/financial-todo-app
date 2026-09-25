import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl'
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#120a07]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div
          className={`relative w-full ${maxWidth} bg-white dark:bg-[#251711] rounded-3xl shadow-2xl border border-[#e8dfd7] dark:border-[#402b21] p-5 sm:p-6 text-right transition-all transform animate-in fade-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#f0eae3] dark:border-[#38261e] mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#2a1a12] dark:text-[#f8f2ed]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#8d7c71] dark:text-[#a89587] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8d7c71] hover:text-[#2a1a12] dark:hover:text-white hover:bg-[#f5efe9] dark:hover:bg-[#38261e] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[75vh] overflow-y-auto pr-1 pl-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
