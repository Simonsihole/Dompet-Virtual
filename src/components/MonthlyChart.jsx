import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2.5 text-[12px] min-w-[140px]"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
        <p className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="font-mono flex justify-between gap-3" style={{ color: p.fill }}>
            <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
            <span>{formatRupiah(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const fmtY = (v) => {
  if (v >= 1000000) return `${v / 1000000}jt`;
  if (v >= 1000)    return `${v / 1000}k`;
  return v;
};

export default function MonthlyChart() {
  const { data, loading } = useApi(() => api.getMonthly());
  const chartData = data ?? [];
  const LAST = chartData.length - 1;

  if (loading) {
    return (
      <div className="card animate-pulse"
        style={{ height: '248px', background: 'var(--bg-elevated)' }} />
    );
  }

  return (
    <div className="card">
      <p className="label mb-4">Income vs Expenses</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="35%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="income" name="Income" fill="var(--accent)" radius={[3, 3, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} opacity={i === LAST ? 1 : 0.45} />)}
          </Bar>
          <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[3, 3, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} opacity={i === LAST ? 1 : 0.45} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
