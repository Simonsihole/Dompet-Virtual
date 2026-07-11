import { NavLink } from 'react-router-dom';
import {
  ChartPieSlice,
  ListBullets,
  ChartBar,
  TelegramLogo,
  Wallet,
  SquaresFour,
  Receipt,
  Gear,
  SignOut
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { signOut, isDemo } = useAuth();
  return (
    <aside
      className="w-56 min-h-screen hidden md:flex flex-col flex-shrink-0"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Wordmark */}
      <div
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)' }}
        >
          <Wallet size={14} weight="fill" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Dompet
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>via WhatsApp</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <SquaresFour size={20} weight="duotone" /> Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <Receipt size={20} weight="duotone" /> Transactions
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <ChartPieSlice size={20} weight="duotone" /> Analytics
        </NavLink>
        <NavLink to="/budget" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <Wallet size={20} weight="duotone" /> Budget
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <TelegramLogo size={20} weight="duotone" /> Telegram
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
          <Gear size={20} weight="duotone" /> Settings
        </NavLink>
      </nav>

      {/* User Actions */}
      <div className="px-3 pb-4">
        <div
          className="rounded-[10px] p-3 flex flex-col gap-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Account
          </p>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-[12px] py-1.5 px-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 font-medium"
          >
            <SignOut size={14} weight="bold" />
            {isDemo ? 'Exit Demo' : 'Sign out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
