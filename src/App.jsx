import { useMemo, useState, useEffect, useCallback } from 'react';
import { Wallet, PiggyBank, TrendingUp, Target, LayoutGrid, List, BarChart3, Sparkles, ArrowUpRight, Plus } from 'lucide-react';
import { categories, paymentModes, types } from './data/transactions';
import {
  formatCurrency, getTotalStats, getCategoryBreakdown, getTypeBreakdown,
  getPaymentModeBreakdown, getMonthlyTrends, getTopExpenses, getSavingsRate,
  getCategoryInfo, getAvailableMonths, monthLabel as monthLabelFromKey, filterByMonth, getCreditDebitSummary
} from './utils/helpers';
import { StatCard, MetricCard } from './components/ui/StatCards';
import { CategoryDoughnutChart, TypeDoughnutChart, MonthlyTrendChart, MonthlyBarChart, PaymentModeChart, SavingsProgressChart } from './components/charts/Charts';
import { TransactionTable } from './components/transactions/TransactionTable';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { CategoryBreakdown } from './components/dashboard/CategoryBreakdown';
import { Insights } from './components/dashboard/Insights';
import { CreditDebitSummary } from './components/dashboard/CreditDebitSummary';
import { MonthFilter } from './components/ui/MonthFilter';

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const loadTransactions = useCallback(async () => {
    const data = await api('/api/transactions');
    setTransactions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const filtered = useMemo(() => filterByMonth(transactions, selectedMonth), [transactions, selectedMonth]);

  const stats = useMemo(() => getTotalStats(filtered), [filtered]);
  const categoryData = useMemo(() => getCategoryBreakdown(filtered), [filtered]);
  const typeData = useMemo(() => getTypeBreakdown(filtered), [filtered]);
  const paymentData = useMemo(() => getPaymentModeBreakdown(filtered), [filtered]);
  const monthlyTrends = useMemo(() => getMonthlyTrends(transactions), [transactions]);
  const savingsRate = useMemo(() => getSavingsRate(filtered), [filtered]);
  const topExpenses = useMemo(() => getTopExpenses(filtered, 5), [filtered]);
  const creditDebit = useMemo(() => getCreditDebitSummary(filtered), [filtered]);

  const headerMonthLabel = selectedMonth === 'all'
    ? 'All time'
    : monthLabelFromKey(selectedMonth);

  const handleAddTransaction = async (payload) => {
    const created = await api('/api/transactions', { method: 'POST', body: JSON.stringify(payload) });
    if (created) setTransactions((prev) => [created, ...prev]);
  };

  const handleUpdateTransaction = async (id, payload) => {
    const updated = await api(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (updated) setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDeleteTransaction = async (txn) => {
    if (!window.confirm(`Delete "${txn.description}" (${formatCurrency(txn.amount)})?`)) return;
    const res = await api(`/api/transactions/${txn.id}`, { method: 'DELETE' });
    if (res) setTransactions((prev) => prev.filter((t) => t.id !== txn.id));
  };

  const openAdd = () => { setEditingTransaction(null); setIsAddModalOpen(true); };
  const openEdit = (txn) => { setEditingTransaction(txn); setIsAddModalOpen(true); };
  const closeModal = () => { setIsAddModalOpen(false); setEditingTransaction(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50/50">
      <Header stats={stats} savingsRate={savingsRate} monthLabel={headerMonthLabel} onAdd={openAdd} />

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-dark-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'transactions', label: 'Transactions', icon: List },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 sticky top-[49px] z-30 bg-white/70 backdrop-blur-xl border-b border-dark-100 pt-3 pb-3">
        <MonthFilter
          months={months}
          value={selectedMonth}
          onChange={setSelectedMonth}
          totalCount={transactions.length}
          filteredCount={filtered.length}
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 animate-pulse-soft flex items-center justify-center">
              <span className="text-lg text-white">₹</span>
            </div>
            <p className="text-sm text-dark-500">Loading your finances...</p>
          </div>
        ) : activeTab === 'overview' ? (
          <Overview stats={stats} categoryData={categoryData} typeData={typeData} paymentData={paymentData} savingsRate={savingsRate} transactions={filtered} topExpenses={topExpenses} monthLabel={headerMonthLabel} savingsData={{ saved: stats.totalSaved, spent: stats.totalSpent }} creditDebit={creditDebit} />
        ) : activeTab === 'analytics' ? (
          <Analytics categoryData={categoryData} typeData={typeData} paymentData={paymentData} monthlyTrends={monthlyTrends} stats={stats} />
        ) : (
          <Transactions transactions={filtered} categories={categories} paymentModes={paymentModes} types={types} onEdit={openEdit} onDelete={handleDeleteTransaction} onAdd={openAdd} />
        )}
      </main>

      <footer className="border-t border-dark-100 py-8 mt-8">
        <p className="text-center text-sm text-dark-400">
          Crafted with care for your financial journey · {formatCurrency(stats.totalSaved)} saved so far
        </p>
      </footer>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onAdd={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        paymentModes={paymentModes}
        types={types}
      />
    </div>
  );
}

function Header({ stats, savingsRate, monthLabel, onAdd }) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="animate-slide-up min-w-0">
              <p className="text-primary-200/90 font-medium mb-2 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" />
                Your Financial Dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 text-balance">
                Track your wealth, build your future
              </h1>
              <p className="text-primary-100/90 max-w-xl text-base sm:text-lg">
                {monthLabel} · Watch your savings grow while keeping your spending in check.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 min-w-[140px] sm:min-w-[170px]">
                  <p className="text-primary-200/80 text-xs sm:text-sm">Total Saved</p>
                  <p className="text-xl sm:text-3xl font-bold text-white mt-1 tabular-nums truncate">{formatCurrency(stats.totalSaved)}</p>
                  <p className="text-primary-200/60 text-xs mt-1 flex items-center gap-1 truncate">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                    <span className="truncate">{savingsRate.toFixed(1)}% savings rate</span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 min-w-[140px] sm:min-w-[170px]">
                  <p className="text-primary-200/80 text-xs sm:text-sm">Total Spent</p>
                  <p className="text-xl sm:text-3xl font-bold text-white mt-1 tabular-nums truncate">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-primary-200/60 text-xs mt-1 truncate">{stats.totalTransactions} transactions</p>
                </div>
              </div>

              <button
                onClick={onAdd}
                className="btn-primary bg-white text-primary-700 hover:bg-primary-50 shadow-xl shadow-primary-500/30 text-base px-6 py-3 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatMiniCard
              icon={PiggyBank}
              label="All-Time Savings"
              value={formatCurrency(stats.totalSaved)}
              color="bg-emerald-200/20 text-emerald-100"
            />
            <StatMiniCard
              icon={Wallet}
              label="All-Time Spending"
              value={formatCurrency(stats.totalSpent)}
              color="bg-rose-200/20 text-rose-100"
            />
            <StatMiniCard
              icon={Target}
              label="Transactions"
              value={String(stats.totalTransactions)}
              color="bg-blue-200/20 text-blue-100"
            />
            <StatMiniCard
              icon={TrendingUp}
              label="Avg per Transaction"
              value={formatCurrency(stats.avgTransaction)}
              color="bg-amber-200/20 text-amber-100"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatMiniCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/10 flex items-center gap-3 sm:gap-4 card-hover">
      <span className={`${color} p-2.5 sm:p-3 rounded-xl flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-primary-200/80 text-[11px] sm:text-xs truncate">{label}</p>
        <p className="text-white font-semibold mt-0.5 tabular-nums text-sm sm:text-base truncate">{value}</p>
      </div>
    </div>
  );
}

function Overview({ stats, categoryData, typeData, savingsRate, transactions, topExpenses, monthLabel, savingsData, creditDebit }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-dark-900 mb-4">{monthLabel} at a Glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Spent" value={formatCurrency(stats.totalSpent)} icon={Wallet} iconColor="red" />
          <StatCard title="Total Saved" value={formatCurrency(stats.totalSaved)} icon={PiggyBank} iconColor="primary" />
          <StatCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={Target} iconColor="green" />
          <StatCard title="Avg. Transaction" value={formatCurrency(stats.avgTransaction)} icon={TrendingUp} iconColor="blue" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CreditDebitSummary summary={creditDebit} />
        </div>
        <SavingsProgressChart saved={savingsData.saved} spent={savingsData.spent} title="Savings vs Spending" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown data={categoryData} categories={categories} title="Category Breakdown" />
        <div className="space-y-6">
          <TypeDoughnutChart data={typeData} title="Need vs Want vs Save" />
        </div>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-dark-900 mb-4">Personalized Insights</h2>
        <Insights transactions={transactions} />
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-dark-900 mb-4">Recent Activity</h2>
        <div className="card p-4">
          <div className="space-y-3">
            {topExpenses.map((t, i) => {
              return (
                <div key={i} className="flex items-center justify-between py-2 hover:bg-dark-50 rounded-xl px-3 -mx-3 transition-colors">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium text-dark-900 truncate">{t.description}</p>
                    <p className="text-xs text-dark-500 truncate">{t.date} · {t.category}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-dark-900 whitespace-nowrap">{formatCurrency(t.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Analytics({ categoryData, typeData, paymentData, monthlyTrends, stats }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Spent" value={formatCurrency(stats.totalSpent)} icon={Wallet} color="red" />
        <MetricCard label="Saved" value={formatCurrency(stats.totalSaved)} icon={PiggyBank} color="green" />
        <MetricCard label="Transactions" value={stats.totalTransactions} icon={Target} color="blue" />
        <MetricCard label="Net Flow" value={formatCurrency(stats.netFlow)} icon={TrendingUp} color="purple" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart data={monthlyTrends} title="Monthly Spending Trends" />
        <MonthlyBarChart data={monthlyTrends} title="Monthly Breakdown (Stacked)" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryDoughnutChart data={categoryData} title="Category Distribution" />
        <div className="space-y-6 lg:col-span-1">
          <TypeDoughnutChart data={typeData} title="Type Distribution" />
        </div>
        <PaymentModeChart data={paymentData} title="Payment Modes" />
      </section>
    </div>
  );
}

function Transactions({ transactions, categories, paymentModes, types, onEdit, onDelete, onAdd }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-dark-900">All Transactions</h2>
          <p className="text-sm text-dark-500">{transactions.length} transactions recorded</p>
        </div>
        <button onClick={onAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>
      <TransactionTable transactions={transactions} categories={categories} paymentModes={paymentModes} types={types} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export default App;