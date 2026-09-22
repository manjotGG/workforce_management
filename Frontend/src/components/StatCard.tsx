import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  badgeText?: string;
  badgeColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  badgeText,
  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}) => {
  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
      {/* Background Accent Glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl ${gradient}`}></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>

        <div className={`p-3.5 rounded-2xl ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
