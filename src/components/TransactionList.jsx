import { Link } from 'react-router-dom';
import { ForkKnife, Car, ShoppingBag, Receipt, FilmSlate, CurrencyDollar, Package, ArrowUpRight } from '@phosphor-icons/react';
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

function groupByDate(transactions) {
  return transactions.reduce((acc, tx) => {
    const day = tx.created_at?.slice(0, 10) ?? 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {});
}

function relativeDate(dateStr) {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function TxRow({ tx }) {
  const cfg = categoryConfig[tx.category] ?? categoryConfig.Other;
  const { Icon } = cfg;
  const time = tx.created_at ? new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
        <Icon size={14} weight="bold" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.category} · {time}</p>
      </div>
      <p className="text-[13px] font-mono font-semibold flex-shrink-0"
        style={{ color: tx.type === 'income' ? 'var(--accent)' : 'var(--text-primary)' }}>
        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
      </p>
    </div>
  );
}

export default function TransactionList({ limit }) {
  const { data, loading } = useApi(() => api.getTransactions({ limit: limit ?? 50 }));
  const transactions = data?.data ?? [];
  const grouped      = groupByDate(transactions);

  if (loading) {
    return (
      <div className="card animate-pulse" style={{ height: '200px', background: 'var(--bg-elevated)' }} />
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="label">Recent Activity</p>
        {limit && (
          <Link to="/transactions" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View all <ArrowUpRight size={11} weight="bold" />
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="text-[13px] py-6 text-center" style={{ color: 'var(--text-muted)' }}>
          No transactions yet. Send a WhatsApp message to log one!
        </p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[10px] font-semibold uppercase tracking-widest py-2" style={{ color: 'var(--text-subtle)' }}>
              {relativeDate(date)}
            </p>
            {items.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </div>
        ))
      )}
    </div>
  );
}
