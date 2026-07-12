import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';
import TransactionList from '../components/TransactionList';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';

function StatBlock({ label, value, color }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
        <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <span className="text-[18px] md:text-[22px] font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="w-full rounded-2xl animate-pulse"
      style={{ height: '300px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} />
  );
}

export default function Dashboard() {
  const { data: balance, loading } = useApi(() => api.getBalance());

  const current     = balance?.current     ?? 0;
  const income      = balance?.income      ?? 0;
  const expenses    = balance?.expenses    ?? 0;
  const savings     = balance?.savings     ?? 0;
  const savingsRate = balance?.savingsRate ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      
      {/* Editorial Hero Block */}
      {loading ? <Skeleton /> : (
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 40px -12px rgba(0,0,0,0.5)'
          }}>
          
          {/* Subtle Ambient Glows instead of generic linear gradients */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10 flex-1">
            <p className="text-[12px] font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3" style={{ color: 'var(--accent)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Net Worth
            </p>
            
            <h1 className="text-[52px] md:text-[88px] leading-[0.9] font-mono tracking-tighter"
              style={{ color: 'var(--text-primary)' }}>
              {formatRupiah(current)}
            </h1>
          </div>

          <div className="relative z-10 mt-16 md:mt-24 pt-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
            style={{ borderTop: '1px solid var(--border-strong)' }}>
            <StatBlock label="Income"   value={`+${formatRupiah(income)}`}   color="#10B981" />
            <StatBlock label="Expenses" value={`-${formatRupiah(expenses)}`}  color="#EF4444" />
            <StatBlock label="Saved"    value={formatRupiah(savings)}        color="#3B82F6" />
            <StatBlock label="Rate"     value={`${savingsRate}%`}            color="var(--amber)" />
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-lg"><MonthlyChart /></div>
        <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-lg"><CategoryChart /></div>
      </div>

      {/* Transactions */}
      <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="p-6 md:p-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        </div>
        <div className="p-2">
          <TransactionList limit={5} />
        </div>
      </div>
    </div>
  );
}
