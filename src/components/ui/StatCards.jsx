'use client';

import { TrendingUp, TrendingDown, Target, Wallet, CreditCard, PiggyBank } from 'lucide-react';

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  iconColor = 'primary',
  trend = 'neutral',
  className = '',
  children 
}) => {
  const iconColors = {
    primary: 'bg-primary-100 text-primary-600',
    pink: 'bg-pink-100 text-pink-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-dark-500',
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: null,
  };

  return (
    <div className={`card group ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-dark-900 tabular-nums">{value}</p>
          {children && <div className="mt-2">{children}</div>}
        </div>
        <div className={`${iconColors[iconColor]} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
      {change !== undefined && (() => {
        const TrendIcon = trendIcons[trend];
        return (
        <div className="mt-4 flex items-center gap-1.5">
          {TrendIcon && <TrendIcon className={`w-4 h-4 ${trendColors[trend]}`} />}
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-sm text-dark-500">{changeLabel}</span>
        </div>
        );
      })()}
    </div>
  );
};

export const MetricCard = ({ label, value, subtitle, icon: Icon, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    pink: 'bg-pink-50 text-pink-700 border-pink-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        {Icon && <Icon className="w-5 h-5" />}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-dark-900 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-dark-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export const InsightCard = ({ title, description, icon: Icon, color = 'primary', action }) => {
  const colors = {
    primary: 'bg-primary-50 border-primary-200 text-primary-800',
    pink: 'bg-pink-50 border-pink-200 text-pink-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} flex items-start gap-4 transition-all duration-300 hover:shadow-xl`}>
      <div className={`p-3 rounded-xl ${colors[color].replace('50', '100').replace('800', '600')} flex-shrink-0`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-dark-900 mb-1">{title}</h4>
        <p className="text-sm text-dark-600 leading-relaxed">{description}</p>
      </div>
      {action && (
        <button className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">
          {action.label}
        </button>
      )}
    </div>
  );
};