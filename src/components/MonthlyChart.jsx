import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-4 py-3 text-[12px] min-w-[150px] backdrop-blur-md"
        style={{ 
          background: 'rgba(10, 10, 10, 0.7)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)' 
        }}>
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <div className="space-y-1.5">
          {payload.map((p) => (
            <p key={p.dataKey} className="font-mono flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill === 'url(#colorIncome)' ? '#34d399' : '#f87171' }} />
                <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{formatRupiah(p.value)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const fmtY = (v) => {
  if (v >= 1000000) return `${v / 1000000}M`;
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
    <div className="card h-full flex flex-col">
      <div className="mb-6">
        <p className="label">Cash Flow</p>
        <p className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">Income vs Expenses over time</p>
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="25%" barGap={6}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            
            <Bar dataKey="income" name="Income" fill="url(#colorIncome)" barSize={10} radius={[4, 4, 0, 0]} animationDuration={1200} minPointSize={4}>
              {chartData.map((_, i) => <Cell key={i} opacity={i === LAST ? 1 : 0.6} />)}
            </Bar>
            
            <Bar dataKey="expenses" name="Expenses" fill="url(#colorExpenses)" barSize={10} radius={[4, 4, 0, 0]} animationDuration={1200} minPointSize={4}>
              {chartData.map((_, i) => <Cell key={i} opacity={i === LAST ? 1 : 0.6} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
