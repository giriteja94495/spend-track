'use client';

import { useState, useMemo } from 'react';
import { 
  Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, CreditCard, Tag, DollarSign, MoreHorizontal
} from 'lucide-react';
import { formatCurrency, parseDate, getCategoryInfo, getPaymentModeInfo, getTypeInfo } from '../../utils/helpers';
import { filterTransactions, sortTransactions } from '../../utils/helpers';

export const TransactionTable = ({ transactions, categories, paymentModes, types }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, {
      search,
      category: categoryFilter,
      type: typeFilter,
      paymentMode: paymentModeFilter,
    });
  }, [transactions, search, categoryFilter, typeFilter, paymentModeFilter]);

  const sortedTransactions = useMemo(() => {
    return sortTransactions(filteredTransactions, sortBy, sortOrder);
  }, [filteredTransactions, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / rowsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ChevronUp className="w-4 h-4 text-dark-300" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-primary-600" /> : <ChevronDown className="w-4 h-4 text-primary-600" />;
  };

  const categoryOptions = ['all', ...categories.map(c => c.id)];
  const typeOptions = ['all', ...types.map(t => t.id)];
  const paymentModeOptions = ['all', ...paymentModes.map(p => p.id)];

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-dark-50 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </button>
          
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="input w-auto py-1.5 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-dark-50 rounded-xl animate-slide-up">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="input w-auto min-w-[180px]"
          >
            <option value="all">All Categories</option>
            {categoryOptions.filter(c => c !== 'all').map(cat => {
              const info = getCategoryInfo(cat);
              return <option key={cat} value={cat}>{info.name}</option>;
            })}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="input w-auto min-w-[150px]"
          >
            <option value="all">All Types</option>
            {typeOptions.filter(t => t !== 'all').map(type => {
              const info = getTypeInfo(type);
              return <option key={type} value={type}>{info.name}</option>;
            })}
          </select>

          <select
            value={paymentModeFilter}
            onChange={(e) => { setPaymentModeFilter(e.target.value); setCurrentPage(1); }}
            className="input w-auto min-w-[160px]"
          >
            <option value="all">All Payment Modes</option>
            {paymentModeOptions.filter(p => p !== 'all').map(mode => {
              const info = getPaymentModeInfo(mode);
              return <option key={mode} value={mode}>{info.name}</option>;
            })}
          </select>

          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setTypeFilter('all');
              setPaymentModeFilter('all');
              setCurrentPage(1);
            }}
            className="btn-ghost text-sm text-red-600 hover:text-red-700"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-200 bg-dark-50">
              {[
                { key: 'date', label: 'Date', icon: Calendar },
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category', icon: Tag },
                { key: 'type', label: 'Type' },
                { key: 'paymentMode', label: 'Payment', icon: CreditCard },
                { key: 'amount', label: 'Amount', icon: DollarSign, align: 'right' },
              ].map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-dark-500 uppercase tracking-wider text-xs ${col.align || ''} ${col.icon ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.key && handleSort(col.key)}
                  style={{ userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.icon && <col.icon className="w-3.5 h-3.5" />}
                    {col.label}
                    {col.icon && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium text-dark-500 uppercase tracking-wider text-xs">
                <MoreHorizontal className="w-4 h-4 mx-auto text-dark-300" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-dark-500">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-12 h-12 text-dark-300" />
                    <p>No transactions found</p>
                    <p className="text-sm">Try adjusting your filters or search</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((txn, index) => (
                <tr
                  key={`${txn.date}-${txn.description}-${index}`}
                  className={`transition-colors hover:bg-dark-50/50 ${expandedRow === index ? 'bg-primary-50' : ''}`}
                  onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                >
                  <td className="px-4 py-3 text-dark-600 whitespace-nowrap">
                    {txn.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-dark-900">{txn.description}</div>
                    {txn.notes && (
                      <div className="text-xs text-dark-500 truncate max-w-xs mt-0.5">{txn.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${['badge-success', 'badge-warning', 'badge-danger', 'badge-info', 'badge-purple'][categories.findIndex(c => c.id === txn.category) % 5] || 'badge-info'}`}>
                      {txn.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      txn.type === 'Need' ? 'badge-info'
                      : txn.type === 'Want' ? 'badge-warning'
                      : txn.type === 'Saving' ? 'badge-success'
                      : txn.type === 'Income' ? 'badge bg-amber-50 text-amber-700 border-amber-100'
                      : txn.type === 'Debt Payment' ? 'badge-danger'
                      : 'badge-info'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-dark-100 text-dark-700 border-dark-200">
                      {txn.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    <span className={txn.type === 'Saving' ? 'text-primary-600' : txn.type === 'Income' ? 'text-amber-600' : txn.type === 'Want' ? 'text-pink-600' : 'text-dark-900'}>
                      {txn.type === 'Saving' || txn.type === 'Income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoreHorizontal className="w-4 h-4 mx-auto text-dark-300 hover:text-dark-500 transition-colors" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {expandedRow !== null && (
        <div className="animate-slide-up bg-primary-50 border-t border-dark-200">
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <p className="text-sm text-dark-500">Notes</p>
              <p className="text-dark-900">{paginatedTransactions[expandedRow].notes || 'No notes'}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500">Category</p>
              <p className="text-dark-900 font-medium">{paginatedTransactions[expandedRow].category}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500">Payment Mode</p>
              <p className="text-dark-900 font-medium">{paginatedTransactions[expandedRow].paymentMode}</p>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-200">
          <div className="text-sm text-dark-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-ghost p-2 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-dark-600 hover:bg-dark-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-ghost p-2 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};