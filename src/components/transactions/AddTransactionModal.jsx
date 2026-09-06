import { useEffect, useState } from 'react';
import { X, Plus, Calendar, FileText, Tag, Wallet, Save } from 'lucide-react';

const formattedToInput = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split(' ');
  if (parts.length < 4) return '';
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const day = days[parts[0]];
  const dayNum = parts[1].replace(',', '').padStart(2, '0');
  const month = months[parts[2]];
  const year = parts[3];
  if (day === undefined || !month) return '';
  return `${year}-${month}-${dayNum}`;
};

const toFormattedDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  const date = new Date(y, m - 1, d);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
};

export const AddTransactionModal = ({ isOpen, onClose, onAdd, onUpdate, editingTransaction, categories, paymentModes, types }) => {
  const isEditing = !!editingTransaction;

  const [form, setForm] = useState({
    date: '',
    description: '',
    category: categories[0]?.id || '',
    amount: '',
    paymentMode: 'UPI',
    type: 'Need',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setForm({
          date: formattedToInput(editingTransaction.date),
          description: editingTransaction.description,
          category: editingTransaction.category,
          amount: String(editingTransaction.amount),
          paymentMode: editingTransaction.paymentMode,
          type: editingTransaction.type,
          notes: editingTransaction.notes || '',
        });
      } else {
        setForm({ date: '', description: '', category: categories[0]?.id || '', amount: '', paymentMode: 'UPI', type: 'Need', notes: '' });
      }
      setError('');
    }
  }, [isOpen, editingTransaction, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.description || !form.amount) {
      setError('Date, Description and Amount are required');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const payload = {
      date: toFormattedDate(form.date),
      description: form.description.trim(),
      category: form.category,
      amount,
      paymentMode: form.paymentMode,
      type: form.type,
      notes: form.notes.trim() || '',
    };
    if (isEditing && onUpdate) {
      await onUpdate(editingTransaction.id, payload);
    } else {
      await onAdd(payload);
    }
    onClose();
  };

  const inputClass = "input w-full";
  const labelClass = "block text-sm font-medium text-dark-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <span className="bg-primary-100 text-primary-700 p-2.5 rounded-xl">
              {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-dark-900">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <p className="text-xs text-dark-500">{isEditing ? 'Update the transaction details' : 'Record a new expense, saving or spend'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-100 transition-colors text-dark-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-dark-400" /> Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={inputClass}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <FileText className="w-3.5 h-3.5 inline mr-1 text-dark-400" /> Description *
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="e.g. Coffee with friends"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Tag className="w-3.5 h-3.5 inline mr-1 text-dark-400" /> Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <Wallet className="w-3.5 h-3.5 inline mr-1 text-dark-400" /> Payment Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMode: mode.id })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.paymentMode === mode.id
                      ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/25'
                      : 'bg-white text-dark-600 border-dark-200 hover:border-primary-400'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="Optional note about this transaction"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};