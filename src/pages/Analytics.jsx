import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

export default function Analytics() {
  const { data: cats,     loading: lcats } = useApi(() => api.getCategories());
  const { data: balance,  loading: lbal  } = useApi(() => api.getBalance());

  const categories = cats ?? [];
  const total      = categories.reduce((s, d) => s + d.value, 0);
  const sorted     = [...categories].sort((a, b) => b.value - a.value);
  const topCat     = sorted[0];

  return (
    <div className="max-w-[1100px] space-y-4">

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total spent',
            value: lcats ? '...' : formatRupiah(total),
            sub: 'This month',
          },
          {
            label: 'Top category',
            value: lcats ? '...' : (topCat?.name ?? 'None'),
            sub: lcats ? '' : formatRupiah(topCat?.value ?? 0),
          },
          {
            label: 'Savings rate',
            value: lbal ? '...' : `${balance?.savingsRate ?? 0}%`,
            sub: lbal ? '' : `${formatRupiah(balance?.savings ?? 0)} saved`,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-[12px] p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="label mb-1.5">{label}</p>
            <p className="text-[20px] font-bold font-mono leading-none"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {value}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3"><MonthlyChart /></div>
        <div className="col-span-2"><CategoryChart /></div>
      </div>

      {/* Breakdown */}
      <div className="rounded-[18px] p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="label mb-4">Spending Breakdown</p>
        {lcats ? (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((cat) => {
              const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-mono" style={{ color: 'var(--text-muted)' }}>{formatRupiah(cat.value)}</span>
                      <span className="text-[11px] font-mono w-8 text-right" style={{ color: cat.color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
