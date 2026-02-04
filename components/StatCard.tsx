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
    <div className={`glass-card interactive-card btn-press p-6 rounded-2xl min-w-0 animate-fade-in-up group ${staggerClass}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color} shadow-lg transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-medium text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
