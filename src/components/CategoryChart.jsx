import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="px-3 py-2.5 text-[13px] backdrop-blur-md"
        style={{ 
          background: 'rgba(10, 10, 10, 0.7)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '10px', 
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)' 
        }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: d.payload.color, boxShadow: `0 0 8px ${d.payload.color}` }} />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
        </div>
        <p className="font-mono text-zinc-400 pl-4">{formatRupiah(d.value)}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart() {
  const { data, loading } = useApi(() => api.getCategories());
  const categories = data ?? [];
  const total      = categories.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <div className="card h-full animate-pulse"
        style={{ minHeight: '200px', background: 'var(--bg-elevated)' }} />
    );
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="mb-4">
        <p className="label">Spending by Category</p>
        <p className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">Breakdown of total expenses</p>
      </div>

      <div className="flex gap-8 flex-1 items-center">
        <div className="relative" style={{ width: 150, height: 150, flexShrink: 0 }}>
          {/* Total Spend Overlay in the center of Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">Total</span>
            <span className="text-[13px] font-mono font-bold text-zinc-100">{formatRupiah(total)}</span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={categories} 
                cx="50%" cy="50%" 
                innerRadius={60} 
                outerRadius={70} 
                paddingAngle={6} 
                cornerRadius={10} 
                dataKey="value" 
                strokeWidth={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {categories.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={entry.color} 
                    opacity={0.85}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center gap-3.5 flex-1 min-w-0">
          {categories.map((cat) => {
            const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
            return (
              <div key={cat.name} className="flex items-center gap-3 min-w-0 group cursor-default">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-150" 
                      style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}60` }} />
                <span className="text-[13px] flex-1 truncate transition-colors duration-300 group-hover:text-zinc-200" 
                      style={{ color: 'var(--text-muted)' }}>{cat.name}</span>
                <span className="text-[12px] font-mono flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
