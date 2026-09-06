import { ArrowDownLeft, ArrowUpRight, Scale, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export function CreditDebitSummary({ summary }) {
  const { credit, debit, creditCount, debitCount, netFlow, creditShare, debitShare } = summary;
  const inBalance = netFlow >= 0;

  return (
    <section className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-600" />
            Credit vs Debit
          </h3>
          <p className="text-sm text-dark-500 mt-0.5">Money in vs money out for this period</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${inBalance ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          Net {inBalance ? 'Surplus' : 'Deficit'}: {formatCurrency(Math.abs(netFlow))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-dark-600 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg"><ArrowDownLeft className="w-4 h-4" /></span>
              Credit (Money in)
            </p>
            <span className="text-xs text-dark-500">{creditCount} txns</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-3 tabular-nums">{formatCurrency(credit)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-dark-600 flex items-center gap-2">
              <span className="bg-rose-100 text-rose-700 p-1.5 rounded-lg"><ArrowUpRight className="w-4 h-4" /></span>
              Debit (Money out)
            </p>
            <span className="text-xs text-dark-500">{debitCount} txns</span>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-3 tabular-nums">{formatCurrency(debit)}</p>
        </div>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden bg-dark-100">
        <div className="bg-emerald-500 transition-all" style={{ width: `${creditShare}%` }} />
        <div className="bg-rose-500 transition-all" style={{ width: `${debitShare}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-dark-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          {creditShare.toFixed(0)}% credit
        </span>
        <span className="flex items-center gap-1.5">
          {debitShare.toFixed(0)}% debit
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
        </span>
      </div>

      {debit > 0 && (
        <p className="mt-4 text-sm text-dark-500 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-dark-400" />
          {credit > 0
            ? `Spent ${(debit / credit).toFixed(2)}x what you earned in this period.`
            : 'You spent money with no credit/income recorded in this period.'}
        </p>
      )}
    </section>
  );
}