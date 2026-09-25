import React from 'react';
import { toPersianNumber } from '../../utils/jalali';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend, // { type: 'up' | 'down' | 'neutral', text: string }
  color = 'purple', // 'purple' | 'gold' | 'emerald' | 'rose' | 'brown'
  onClick
}) {
  const colorMap = {
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      iconBg: 'bg-purple-600 text-white',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
      glow: 'shadow-purple-500/5'
    },
    gold: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-500 text-white',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
      glow: 'shadow-amber-500/5'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-600 text-white',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
      glow: 'shadow-emerald-500/5'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      iconBg: 'bg-rose-600 text-white',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
      glow: 'shadow-rose-500/5'
    },
    brown: {
      bg: 'bg-[#f7f2ed] dark:bg-[#2d1e17]/50',
      iconBg: 'bg-[#523321] text-[#fbf8f5]',
      border: 'hover:border-[#966b4f] dark:hover:border-[#734b33]',
      glow: 'shadow-orange-500/5'
    }
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-[#241712] border border-[#e8dfd7] dark:border-[#3d2920] shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pl-2">
          <p className="text-xs font-semibold text-[#7c695c] dark:text-[#a89587]">
            {title}
          </p>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2a1a12] dark:text-[#f8f2ed] tracking-tight">
            {value}
          </div>
          {subvalue && (
            <p className="text-xs text-[#8f7e73] dark:text-[#8e7b6f] font-medium">
              {subvalue}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl shrink-0 shadow-sm ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-[#f0eae3] dark:border-[#38261e] flex items-center text-xs">
          <span
            className={`font-semibold ml-1.5 ${
              trend.type === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend.type === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-[#8d7c71]'
            }`}
          >
            {trend.text}
          </span>
          <span className="text-[#8d7c71] dark:text-[#8a776c]">نسبت به دوره قبل</span>
        </div>
      )}
    </div>
  );
}
