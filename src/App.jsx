import { useMemo, useState, useEffect } from 'react';
import { Wallet, PiggyBank, TrendingUp, Target, LayoutGrid, List, BarChart3, Sparkles, ArrowUpRight, Plus } from 'lucide-react';
import { transactions as initialTransactions, categories, paymentModes, types } from './data/transactions';
import {
  formatCurrency, getTotalStats, getCategoryBreakdown, getTypeBreakdown,
  getPaymentModeBreakdown, getMonthlyTrends, getTopExpenses, getSavingsRate, getCategoryInfo
} from './utils/helpers';
import { StatCard, MetricCard } from './components/ui/StatCards';
import { CategoryDoughnutChart, TypeDoughnutChart, MonthlyTrendChart, MonthlyBarChart, PaymentModeChart, SavingsProgressChart } from './components/charts/Charts';
import { TransactionTable } from './components/transactions/TransactionTable';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { CategoryBreakdown } from './components/dashboard/CategoryBreakdown';
import { Insights } from './components/dashboard/Insights';

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stats = useMemo(() => getTotalStats(transactions), [transactions]);
  const categoryData = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
  const typeData = useMemo(() => getTypeBreakdown(transactions), [transactions]);
  const paymentData = useMemo(() => getPaymentModeBreakdown(transactions), [transactions]);
  const monthlyTrends = useMemo(() => getMonthlyTrends(transactions), [transactions]);
  const savingsRate = useMemo(() => getSavingsRate(transactions), [transactions]);
  const topExpenses = useMemo(() => getTopExpenses(transactions, 5), [transactions]);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    try {
      localStorage.setItem('finance-tracker-transactions', JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  const handleAddTransaction = (newTxn) => {
    setTransactions(prev => [{ ...newTxn, id: Date.now() }, ...prev]);
  };

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50/50">
      <Header stats={stats} savingsRate={savingsRate} monthLabel={monthLabel} onAdd={() => setIsAddModalOpen(true)} />

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-dark-100">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-2 overflow-x-auto scrollbar-hide">
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

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {activeTab === 'overview' && <Overview stats={stats} categoryData={categoryData} typeData={typeData} paymentData={paymentData} monthlyTrends={monthlyTrends} savingsRate={savingsRate} transactions={transactions} topExpenses={topExpenses} monthLabel={monthLabel} savingsData={{ saved: stats.totalSaved, spent: stats.totalSpent }} />}
        {activeTab === 'analytics' && <Analytics categoryData={categoryData} typeData={typeData} paymentData={paymentData} monthlyTrends={monthlyTrends} stats={stats} />}
        {activeTab === 'transactions' && <Transactions transactions={transactions} categories={categories} paymentModes={paymentModes} types={types} />}
      </main>

      <footer className="border-t border-dark-100 py-8 mt-8">
        <p className="text-center text-sm text-dark-400">
          Crafted with care for your financial journey · {formatCurrency(stats.totalSaved)} saved so far
        </p>
      </footer>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
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

      <div className="relative max-w-[1400px] mx-auto px-6 py-14">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="animate-slide-up">
              <p className="text-primary-200/90 font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Your Financial Dashboard
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 text-balance">
                Track your wealth, build your future
              </h1>
              <p className="text-primary-100/90 max-w-xl text-lg">
                {monthLabel} · Watch your savings grow while keeping your spending in check.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-[320px] animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-primary-200/80 text-sm">Total Saved</p>
                <p className="text-3xl font-bold text-white mt-1 tabular-nums">{formatCurrency(stats.totalSaved)}</p>
                <p className="text-primary-200/60 text-xs mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                  <span style={{ fontSize: '0.75rem' }}>{savingsRate.toFixed(1)}% savings rate</span>
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-primary-200/80 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-white mt-1 tabular-nums">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-primary-200/60 text-xs mt-1">{stats.totalTransactions} transactions</p>
              </div>
            </div>

            <button
              onClick={onAdd}
              className="btn-primary bg-white text-primary-700 hover:bg-primary-50 shadow-xl shadow-primary-500/30 text-base px-6 py-3 flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center gap-4 card-hover">
      <span className={`${color} p-3 rounded-xl flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-primary-200/80 text-xs">{label}</p>
        <p className="text-white font-semibold mt-0.5 tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

function Overview({ stats, categoryData, typeData, paymentData, monthlyTrends, savingsRate, transactions, topExpenses, monthLabel, savingsData }) {
  const wantsPct = useMemo(() => {
    const wants = transactions.filter(t => t.type === 'Want').reduce((s, t) => s + t.amount, 0);
    const spent = stats.totalSpent;
    return spent > 0 ? (wants / spent) * 100 : 0;
  }, [transactions, stats]);

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-xl font-semibold text-dark-900 mb-4">This Month at a Glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Spent" value={formatCurrency(stats.totalSpent)} icon={Wallet} iconColor="red" />
          <StatCard title="Total Saved" value={formatCurrency(stats.totalSaved)} icon={PiggyBank} iconColor="primary" />
          <StatCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={Target} iconColor="green" />
          <StatCard title="Avg. Transaction" value={formatCurrency(stats.avgTransaction)} icon={TrendingUp} iconColor="blue" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryDoughnutChart data={categoryData} title="Spending by Category" />
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
        <h2 className="text-xl font-semibold text-dark-900 mb-4">Personalized Insights</h2>
        <Insights transactions={transactions} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-dark-900 mb-4">Recent Activity</h2>
        <div className="card p-4">
          <div className="space-y-3">
            {topExpenses.map((t, i) => {
              const cat = getCategoryInfo(t.category);
              return (
                <div key={i} className="flex items-center justify-between py-2 hover:bg-dark-50 rounded-xl px-3 -mx-3 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-dark-900 truncate">{t.description}</p>
                    <p className="text-xs text-dark-500">{t.date} · {t.category}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-dark-900">{formatCurrency(t.amount)}</span>
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
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

function Transactions({ transactions, categories, paymentModes, types }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-900">All Transactions</h2>
          <p className="text-sm text-dark-500">{transactions.length} transactions recorded</p>
        </div>
      </div>
      <TransactionTable transactions={transactions} categories={categories} paymentModes={paymentModes} types={types} />
    </div>
  );
}

export default App;