import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const categoryConfig = {
  Food:          { color: '#E17A5F' },
  Transport:     { color: '#5C90A6' },
  Shopping:      { color: '#D4A373' },
  Bills:         { color: '#8E7B9D' },
  Entertainment: { color: '#E098B1' },
  Salary:        { color: '#10B981' },
  Other:         { color: '#94A3B8' },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-3xl p-6 shadow-sm relative overflow-hidden group"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/4 transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
      <p className="text-[12px] font-bold tracking-[0.1em] uppercase mb-2 text-zinc-500">{label}</p>
      <p className="text-[28px] font-bold font-mono tracking-tighter"
        style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function Analytics() {
  const { data: cats,     loading: lcats } = useApi(() => api.getCategories());
  const { data: balance,  loading: lbal  } = useApi(() => api.getBalance());

  const categories = cats ?? [];
  const total      = categories.reduce((s, d) => s + d.value, 0);
  const sorted     = [...categories].sort((a, b) => b.value - a.value);
  const topCat     = sorted[0];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      
      {/* Summary strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Spent"
          value={lcats ? '...' : formatRupiah(total)}
          sub="This month"
        />
        <StatCard 
          label="Top Category"
          value={lcats ? '...' : (topCat?.name ?? 'None')}
          sub={lcats ? '' : formatRupiah(topCat?.value ?? 0)}
        />
        <StatCard 
          label="Savings Rate"
          value={lbal ? '...' : `${balance?.savingsRate ?? 0}%`}
          sub={lbal ? '' : `${formatRupiah(balance?.savings ?? 0)} saved`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-lg"><MonthlyChart /></div>
        <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-lg"><CategoryChart /></div>
      </div>

      {/* Breakdown */}
      <div className="rounded-3xl p-8 shadow-lg"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[12px] font-bold tracking-[0.15em] uppercase mb-8" style={{ color: 'var(--text-muted)' }}>
          Spending Breakdown
        </p>
        
        {lcats ? (
          <div className="animate-pulse h-32 bg-white/5 rounded-xl" />
        ) : (
          <div className="space-y-6">
            {sorted.map((cat) => {
              const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
              const barColor = categoryConfig[cat.name]?.color ?? categoryConfig.Other.color;
              
              return (
                <div key={cat.name} className="group">
                  <div className="flex items-end justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: barColor, boxShadow: `0 0 8px ${barColor}80` }} />
                      <span className="text-[14px] font-medium transition-colors group-hover:text-white" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-[14px] font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {formatRupiah(cat.value)}
                      </span>
                      <span className="text-[12px] font-mono w-9 text-right font-semibold" style={{ color: barColor }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Track */}
                  <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    {/* Progress Bar Fill */}
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" 
                         style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 10px ${barColor}80` }} />
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
