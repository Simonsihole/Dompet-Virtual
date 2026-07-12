import { Link } from 'react-router-dom';
import { ForkKnife, Car, ShoppingBag, Receipt, FilmSlate, CurrencyDollar, Package, ArrowUpRight } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const categoryConfig = {
  Food:          { Icon: ForkKnife,      color: '#E17A5F', bg: 'rgba(225,122,95,0.12)' },
  Transport:     { Icon: Car,            color: '#5C90A6', bg: 'rgba(92,144,166,0.12)' },
  Shopping:      { Icon: ShoppingBag,    color: '#D4A373', bg: 'rgba(212,163,115,0.12)' },
  Bills:         { Icon: Receipt,        color: '#8E7B9D', bg: 'rgba(142,123,157,0.12)' },
  Entertainment: { Icon: FilmSlate,      color: '#E098B1', bg: 'rgba(224,152,177,0.12)' },
  Salary:        { Icon: CurrencyDollar, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  Other:         { Icon: Package,        color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
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
  const isIncome = tx.type === 'income';

  return (
    <div className="flex items-center gap-4 px-3 py-3 transition-colors duration-200 hover:bg-[var(--accent-muted)] rounded-xl group border border-transparent hover:border-[var(--border-strong)]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105" 
           style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
        <Icon size={18} weight="duotone" style={{ color: cfg.color }} />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-[14px] font-medium truncate transition-colors duration-200" 
           style={{ color: 'var(--text-primary)' }}>
          {tx.description}
        </p>
        <p className="text-[12px] mt-0.5 tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {tx.category} · {time}
        </p>
      </div>
      
      <div className="flex-shrink-0 text-right pl-4">
        <p className="text-[15px] font-mono tracking-tight"
          style={{ color: isIncome ? 'var(--accent)' : 'var(--text-primary)' }}>
          {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
        </p>
      </div>
    </div>
  );
}

export default function TransactionList({ limit, hideHeader = false }) {
  const { data, loading } = useApi(() => api.getTransactions({ limit: limit ?? 50 }));
  const transactions = data?.data ?? [];
  const grouped      = groupByDate(transactions);

  if (loading) {
    return (
      <div className="card animate-pulse" style={{ height: '300px', background: 'var(--bg-elevated)' }} />
    );
  }

  const content = (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Recent Activity
          </p>
          {limit && (
            <Link to="/transactions" className="text-[12px] font-semibold flex items-center gap-1.5 transition-colors hover:text-emerald-400" 
                  style={{ color: 'var(--accent)' }}>
              View all <ArrowUpRight size={12} weight="bold" />
            </Link>
          )}
        </div>
      )}

      {transactions.length === 0 ? (
        <p className="text-[13px] py-10 text-center" style={{ color: 'var(--text-muted)' }}>
          No transactions yet. Send a Telegram message to log one!
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-3 px-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
                  {relativeDate(date)}
                </p>
                <div className="h-[1px] flex-1" style={{ background: 'var(--border-strong)' }} />
              </div>
              <div className="space-y-0.5">
                {items.map((tx) => <TxRow key={tx.id} tx={tx} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (hideHeader) return <div className="py-2">{content}</div>;

  return (
    <div className="rounded-3xl p-6 shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {content}
    </div>
  );
}
