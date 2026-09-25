import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'اطلاعاتی یافت نشد',
  description = 'موردی برای نمایش در این بخش وجود ندارد.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white/60 dark:bg-[#251711]/60 border border-dashed border-[#e6ddd3] dark:border-[#422c22]">
      <div className="w-16 h-16 mb-4 rounded-3xl bg-gradient-to-tr from-[#7e22ce]/10 to-[#ca8a04]/10 dark:from-[#7e22ce]/20 dark:to-[#ca8a04]/20 flex items-center justify-center text-[#7e22ce] dark:text-[#fbbf24]">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#2a1a12] dark:text-[#f8f2ed] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#7c695c] dark:text-[#a89587] max-w-sm mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7e22ce] to-[#581c87] hover:from-[#6b21a8] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
