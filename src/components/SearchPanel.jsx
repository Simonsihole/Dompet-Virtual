import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, X, ForkKnife, Car, ShoppingBag, Receipt, FilmSlate, CurrencyDollar, Package } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { formatRupiah } from '../data/mockData';

const categoryIcons = {
  Food:          { Icon: ForkKnife,      color: '#E17A5F', bg: 'rgba(225,122,95,0.12)' },
  Transport:     { Icon: Car,            color: '#5C90A6', bg: 'rgba(92,144,166,0.12)' },
  Shopping:      { Icon: ShoppingBag,    color: '#D4A373', bg: 'rgba(212,163,115,0.12)' },
  Bills:         { Icon: Receipt,        color: '#8E7B9D', bg: 'rgba(142,123,157,0.12)' },
  Entertainment: { Icon: FilmSlate,      color: '#E098B1', bg: 'rgba(224,152,177,0.12)' },
  Salary:        { Icon: CurrencyDollar, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  Other:         { Icon: Package,        color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
};

export default function SearchPanel({ open, onClose }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef  = useRef(null);
  const navigate  = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getTransactions({ limit: 8, search: query });
        setResults(res.data);
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
        style={{ padding: '0 16px' }}
      >
        <div
          className="rounded-[16px] overflow-hidden"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <MagnifyingGlass size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>

          {/* Results */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {loading && (
              <p className="text-[13px] px-4 py-3" style={{ color: 'var(--text-muted)' }}>Searching...</p>
            )}

            {!loading && query && results.length === 0 && (
              <p className="text-[13px] px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No results for "{query}"
              </p>
            )}

            {!loading && results.map((tx) => {
              const cfg = categoryIcons[tx.category] ?? categoryIcons.Other;
              const { Icon } = cfg;
              const date = tx.created_at
                ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                : '';
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => { navigate('/transactions'); onClose(); }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                    <Icon size={13} weight="bold" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {tx.description}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {tx.category} · {date}
                    </p>
                  </div>
                  <p className="text-[13px] font-mono font-semibold flex-shrink-0"
                    style={{ color: tx.type === 'income' ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                </div>
              );
            })}

            {!query && (
              <div className="px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-subtle)' }}>
                  Tips
                </p>
                {['Search by description', 'Search by category (Food, Transport...)', 'Press Esc to close'].map((tip) => (
                  <p key={tip} className="text-[12px] py-0.5" style={{ color: 'var(--text-muted)' }}>
                    {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
