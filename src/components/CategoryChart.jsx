import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="px-3 py-2 text-[13px]"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
        <p className="font-mono" style={{ color: 'var(--text-muted)' }}>{formatRupiah(d.value)}</p>
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
      <p className="label mb-4">By Category</p>
      <div className="flex gap-6 flex-1">
        <div style={{ width: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {categories.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
          {categories.map((cat) => {
            const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
            return (
              <div key={cat.name} className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-[12px] flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{cat.name}</span>
                <span className="text-[12px] font-mono flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
