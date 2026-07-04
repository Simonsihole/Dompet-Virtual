import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Package } from '@phosphor-icons/react';
import { ForkKnife, Car, ShoppingBag, Receipt, FilmSlate, CurrencyDollar } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const categoryConfig = {
  Food:          { Icon: ForkKnife,      color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  Transport:     { Icon: Car,            color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  Shopping:      { Icon: ShoppingBag,    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  Bills:         { Icon: Receipt,        color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  Entertainment: { Icon: FilmSlate,      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  Salary:        { Icon: CurrencyDollar, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  Other:         { Icon: Package,        color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Other'];

const inputStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  padding: '7px 12px',
  outline: 'none',
};

export default function Transactions() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [type,     setType]     = useState('All');

  const params = {
    limit: 100,
    ...(category !== 'All' ? { category } : {}),
    ...(type !== 'All'     ? { type: type.toLowerCase() } : {}),
  };

  const { data, loading } = useApi(() => api.getTransactions(params), [category, type]);
  const allRows = data?.data ?? [];

  // Client-side search filter
  const filtered = search
    ? allRows.filter((tx) => tx.description.toLowerCase().includes(search.toLowerCase()))
    : allRows;

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const header = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filtered.map(tx => [
      new Date(tx.created_at).toLocaleDateString('id-ID'),
      tx.type,
      tx.category,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1100px] space-y-4">

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between p-3 rounded-[12px]"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <div className="relative flex-1 min-w-44 max-w-sm">
            <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '30px', width: '100%' }} />
          </div>
          <div className="flex items-center gap-2">
            <FunnelSimple size={13} style={{ color: 'var(--text-muted)' }} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c} style={{ background: '#18181b' }}>{c}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              {['All', 'Income', 'Expense'].map((t) => <option key={t} style={{ background: '#18181b' }}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-[12px] py-1.5 px-3">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[18px] overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-[1fr_130px_100px_130px] px-5 py-2.5"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {['Description', 'Category', 'Date', 'Amount'].map((h, i) => (
            <span key={h} className="label" style={{ textAlign: i === 3 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Package size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-[13px]">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const cfg = categoryConfig[tx.category] ?? categoryConfig.Other;
            const { Icon } = cfg;
            const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
            return (
              <div key={tx.id}
                className="grid grid-cols-[1fr_130px_100px_130px] px-5 py-3 items-center transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                    <Icon size={13} weight="bold" style={{ color: cfg.color }} />
                  </div>
                  <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</span>
                </div>
                <div>
                  <span className="pill text-[11px]" style={{ background: cfg.bg, color: cfg.color }}>{tx.category}</span>
                </div>
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
                <p className="text-[13px] font-mono font-semibold text-right"
                  style={{ color: tx.type === 'income' ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-right" style={{ color: 'var(--text-subtle)' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
