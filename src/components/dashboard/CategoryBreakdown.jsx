import { Heart, Home, Target, Coffee, TrendingUp, Key, PiggyBank, Repeat, Utensils, ShoppingBasket, Car, Zap, HeartPulse, GraduationCap, Film, ShoppingBag, Plane, Scissors, ShieldCheck, Users, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const iconMap = { Heart, Home, Target, Coffee, TrendingUp, Key, PiggyBank, Repeat, Utensils, ShoppingBasket, Car, Zap, HeartPulse, GraduationCap, Film, ShoppingBag, Plane, Scissors, ShieldCheck, Users, MoreHorizontal };

const colorMap = {
  primary: 'bg-primary-100 text-primary-700',
  pink: 'bg-pink-100 text-pink-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
};

const barColors = {
  primary: 'bg-primary-500',
  pink: 'bg-pink-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
};

export const CategoryBreakdown = ({ data, categories, title = 'Category Breakdown' }) => {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-900">{title}</h3>
        <span className="text-sm text-dark-500">{data.length} categories</span>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => {
          const cat = categories.find(c => c.id === item.category);
          const Icon = iconMap[cat?.icon] || Repeat;
          const percentage = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <div key={item.category}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`${colorMap[cat?.color] || colorMap.primary} p-1.5 rounded-lg flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-medium text-dark-700 flex-1">{item.category}</span>
                <span className="text-sm font-semibold text-dark-900 tabular-nums">{formatCurrency(item.total)}</span>
                <span className="text-xs text-dark-400 w-10 text-right">{percentage.toFixed(0)}%</span>
              </div>
              <div className="ml-8 h-2 bg-dark-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColors[cat?.color] || barColors.primary} transition-all duration-1000`}
                  style={{ width: `${(item.total / maxValue) * 100}%` }}
                />
              </div>
              <p className="ml-8 mt-1 text-xs text-dark-400">{item.count} transactions</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};