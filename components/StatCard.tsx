import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  /** تأخير الحركة (0–5) للتتابع */
  staggerIndex?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend, staggerIndex }) => {
  const staggerClass = staggerIndex != null ? `stagger-${Math.min(staggerIndex + 1, 6)}` : '';
  return (
    <div className={`glass-card interactive-card btn-press p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl min-w-0 animate-fade-in-up group ${staggerClass} touch-manipulation`}>
      <div className="flex justify-between items-start">
        <div className={`p-2.5 sm:p-3 rounded-xl md:rounded-2xl min-h-[44px] min-w-[44px] flex items-center justify-center ${color} shadow-lg transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="text-white shrink-0" size={22} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3 md:mt-4">
        <p className="text-slate-500 text-xs sm:text-sm font-medium">{label}</p>
        <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800 mt-0.5 md:mt-1 break-words">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
