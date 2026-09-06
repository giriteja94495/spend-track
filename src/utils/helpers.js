import { categories, paymentModes, types } from '../data/transactions';

export const parseDate = (dateStr) => {
  const [day, date, month, year] = dateStr.split(' ');
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  const dayNum = parseInt(date.replace(',', ''), 10);
  const monthNum = monthMap[month];
  const yearNum = parseInt(year, 10);
  return new Date(yearNum, monthNum, dayNum);
};

export const formatCurrency = (amount) => {
  const isWhole = Math.round(amount) === amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(amount);
};

export const getAvailableMonths = (transactions) => {
  const seen = {};
  transactions.forEach(t => {
    const d = parseDate(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    seen[key] = true;
  });
  return Object.keys(seen).sort((a, b) => b.localeCompare(a));
};

export const monthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const filterByMonth = (transactions, monthKey) => {
  if (!monthKey || monthKey === 'all') return transactions;
  return transactions.filter(t => {
    const d = parseDate(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
  });
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getCategoryInfo = (categoryId) => {
  return categories.find(c => c.id === categoryId) || { name: categoryId, color: 'gray', icon: 'Circle' };
};

export const getPaymentModeInfo = (modeId) => {
  return paymentModes.find(m => m.id === modeId) || { name: modeId, color: 'gray', icon: 'Circle' };
};

export const getTypeInfo = (typeId) => {
  return types.find(t => t.id === typeId) || { name: typeId, color: 'gray' };
};

export const getTransactionsByMonth = (transactions) => {
  const monthly = {};
  transactions.forEach(t => {
    const date = parseDate(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push({ ...t, parsedDate: date });
  });
  return monthly;
};

export const getCategoryBreakdown = (transactions, type = null) => {
  const filtered = type ? transactions.filter(t => t.type === type) : transactions;
  const breakdown = {};
  filtered.forEach(t => {
    if (!breakdown[t.category]) {
      breakdown[t.category] = { total: 0, count: 0, transactions: [] };
    }
    breakdown[t.category].total += t.amount;
    breakdown[t.category].count += 1;
    breakdown[t.category].transactions.push(t);
  });
  return Object.entries(breakdown)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);
};

export const getTypeBreakdown = (transactions) => {
  const breakdown = {};
  transactions.forEach(t => {
    if (!breakdown[t.type]) breakdown[t.type] = 0;
    breakdown[t.type] += t.amount;
  });
  return breakdown;
};

export const getPaymentModeBreakdown = (transactions) => {
  const breakdown = {};
  transactions.forEach(t => {
    if (!breakdown[t.paymentMode]) breakdown[t.paymentMode] = 0;
    breakdown[t.paymentMode] += t.amount;
  });
  return Object.entries(breakdown)
    .map(([mode, total]) => ({ mode, total }))
    .sort((a, b) => b.total - a.total);
};

export const getMonthlyTrends = (transactions) => {
  const monthly = getTransactionsByMonth(transactions);
  return Object.entries(monthly)
    .map(([month, txns]) => {
      const needs = txns.filter(t => t.type === 'Need').reduce((sum, t) => sum + t.amount, 0);
      const wants = txns.filter(t => t.type === 'Want').reduce((sum, t) => sum + t.amount, 0);
      const savings = txns.filter(t => t.type === 'Saving').reduce((sum, t) => sum + t.amount, 0);
      const debt = txns.filter(t => t.type === 'Debt Payment').reduce((sum, t) => sum + t.amount, 0);
      const income = txns.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
      const total = needs + wants + savings + debt;
      return { month, needs, wants, savings, debt, income, total, count: txns.length };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getTotalStats = (transactions) => {
  const totalSpent = transactions
    .filter(t => t.type !== 'Saving' && t.type !== 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSaved = transactions
    .filter(t => t.type === 'Saving')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const avgTransaction = totalTransactions > 0 ? (totalSpent + totalSaved) / totalTransactions : 0;

  return {
    totalSpent,
    totalSaved,
    totalIncome,
    totalTransactions,
    avgTransaction,
    netFlow: totalIncome + totalSaved - totalSpent,
  };
};

export const getTopExpenses = (transactions, limit = 10) => {
  return transactions
    .filter(t => t.type !== 'Saving' && t.type !== 'Income')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

export const getCreditDebitSummary = (transactions) => {
  let credit = 0;
  let debit = 0;
  let creditCount = 0;
  let debitCount = 0;
  transactions.forEach(t => {
    if (t.type === 'Income') {
      credit += t.amount;
      creditCount += 1;
    } else {
      debit += t.amount;
      debitCount += 1;
    }
  });
  const total = credit + debit;
  return {
    credit,
    debit,
    creditCount,
    debitCount,
    netFlow: credit - debit,
    creditShare: total > 0 ? (credit / total) * 100 : 0,
    debitShare: total > 0 ? (debit / total) * 100 : 0,
  };
};

export const getSavingsRate = (transactions) => {
  const stats = getTotalStats(transactions);
  const total = stats.totalSpent + stats.totalSaved;
  return total > 0 ? (stats.totalSaved / total) * 100 : 0;
};

export const filterTransactions = (transactions, filters) => {
  return transactions.filter(t => {
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.paymentMode && filters.paymentMode !== 'all' && t.paymentMode !== filters.paymentMode) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const desc = t.description.toLowerCase();
      const notes = t.notes.toLowerCase();
      const cat = t.category.toLowerCase();
      if (!desc.includes(search) && !notes.includes(search) && !cat.includes(search)) return false;
    }
    if (filters.dateFrom) {
      const txnDate = parseDate(t.date);
      const fromDate = new Date(filters.dateFrom);
      if (txnDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const txnDate = parseDate(t.date);
      const toDate = new Date(filters.dateTo);
      if (txnDate > toDate) return false;
    }
    if (filters.minAmount && t.amount < filters.minAmount) return false;
    if (filters.maxAmount && t.amount > filters.maxAmount) return false;
    return true;
  });
};

export const sortTransactions = (transactions, sortBy, sortOrder = 'desc') => {
  return [...transactions].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'date':
        aVal = parseDate(a.date).getTime();
        bVal = parseDate(b.date).getTime();
        break;
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'category':
        aVal = a.category;
        bVal = b.category;
        break;
      case 'type':
        aVal = a.type;
        bVal = b.type;
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};