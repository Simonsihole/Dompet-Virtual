import { useState, useEffect } from 'react';
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [usageData, budgetsData] = await Promise.all([
        api.getBudgetUsage(),
        api.getBudgets()
      ]);
      setUsage(usageData);
      setBudgets(budgetsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const payload = {
        category,
        monthly_limit: parseInt(limit, 10),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      };

      if (editingId) {
        await api.updateBudget(editingId, payload);
      } else {
        await api.createBudget(payload);
      }
      
      setIsOpen(false);
      setEditingId(null);
      setLimit('');
      fetchBudgets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (b) => {
    setEditingId(b.id);
    setCategory(b.category);
    setLimit(b.monthly_limit.toString());
    setIsOpen(true);
  };

  if (loading) {
    return <div className="p-6">Loading budgets...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Budgets</h2>
        <button 
          onClick={() => { setIsOpen(true); setEditingId(null); setLimit(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Budget
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Budget' : 'Create Budget'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg outline-none text-sm"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Limit (Rp)</label>
              <input 
                type="number" 
                required
                min="1"
                value={limit} 
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full p-2 rounded-lg outline-none text-sm"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Save</button>
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {usage.length === 0 && !isOpen && (
          <div className="text-center p-8 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No budgets set for this month.</p>
          </div>
        )}

        {usage.map((u) => {
          // Color logic
          let color = '#22c55e'; // Green < 70%
          if (u.percentage >= 70 && u.percentage <= 80) color = '#fbbf24'; // Yellow 70-80%
          if (u.percentage > 80) color = '#f87171'; // Red > 80%

          return (
            <div key={u.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.category}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(u)} className="p-1 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                    <PencilSimple size={14} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="p-1 hover:opacity-80" style={{ color: '#f87171' }}>
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Rp {formatRupiah(u.spent)}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                    / Rp {formatRupiah(u.monthly_limit)}
                  </span>
                </div>
                <span className="text-xs font-medium" style={{ color }}>
                  {u.percentage}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${Math.min(u.percentage, 100)}%`, background: color }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
