import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatRupiah } from '../data/mockData';
import TransactionList from '../components/TransactionList';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import { TrendDown, PiggyBank } from '@phosphor-icons/react';

function StatCard({ label, amount, icon: Icon, color, sub }) {
  return (
    <div className="rounded-lg p-4 flex flex-col gap-2"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <div className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={13} weight="bold" style={{ color }} />
        </div>
      </div>
      <p className="text-[22px] font-bold font-mono leading-none"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {formatRupiah(amount ?? 0)}
      </p>
      {sub && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function Skeleton({ h = '168px' }) {
  return (
    <div className="rounded-[18px] animate-pulse"
      style={{ height: h, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} />
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
    <div className="max-w-[1100px] space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance hero */}
        {loading ? <Skeleton h="168px" /> : (
          <div className="md:col-span-2 rounded-[18px] p-6 relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #0f2e1a 0%, #0a1f12 60%, #0a0a0b 100%)',
              border: '1px solid rgba(34,197,94,0.2)', minHeight: '168px',
            }}>
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
            <div className="relative z-10">
              <p className="label" style={{ color: 'rgba(34,197,94,0.7)' }}>Current Balance</p>
              <p className="text-[32px] md:text-[40px] font-bold font-mono leading-none mt-2"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                {formatRupiah(current)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 relative z-10 mt-6 md:mt-0">
              {[
                { label: 'Income',   value: `+${formatRupiah(income)}`,   color: 'rgba(34,197,94,0.6)',   text: 'var(--accent)' },
                { label: 'Expenses', value: `-${formatRupiah(expenses)}`,  color: 'rgba(248,113,113,0.6)', text: '#f87171' },
                { label: 'Saved',    value: `${savingsRate}%`,             color: 'rgba(255,255,255,0.4)', text: 'var(--text-primary)' },
              ].map(({ label, value, color, text }, i) => (
                <div key={label} className="flex items-center gap-5">
                  {i > 0 && <div className="hidden md:block" style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)' }} />}
                  <div>
                    <p className="text-[10px] font-medium mb-0.5" style={{ color }}>{label}</p>
                    <p className="text-[14px] font-mono font-semibold" style={{ color: text }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right stat cards */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <><Skeleton h="75px" /><Skeleton h="75px" /></>
          ) : (
            <>
              <StatCard label="Total Expenses" amount={expenses} icon={TrendDown}  color="#f87171"           sub="This month" />
              <StatCard label="Net Saved"       amount={savings}  icon={PiggyBank}  color="var(--accent)"    sub={`${savingsRate}% savings rate`} />
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3"><MonthlyChart /></div>
        <div className="lg:col-span-2"><CategoryChart /></div>
      </div>

      {/* Recent transactions */}
      <TransactionList limit={5} />
    </div>
  );
}
