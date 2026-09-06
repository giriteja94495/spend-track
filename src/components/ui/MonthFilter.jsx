import { CalendarDays } from 'lucide-react';

export const MonthFilter = ({ months, value, onChange, totalCount, filteredCount }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-dark-200 shadow-sm">
        <CalendarDays className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium text-dark-700 tabular-nums">
          {totalCount > 0 ? `${filteredCount}/${totalCount}` : '0'} txns
        </span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            value === 'all'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white text-dark-600 border border-dark-200 hover:border-primary-400'
          }`}
        >
          All Time
        </button>
        {months.map((m) => {
          const [y, mo] = m.split('-');
          const label = new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                value === m
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white text-dark-600 border border-dark-200 hover:border-primary-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};