import { NavLink } from 'react-router-dom';
import {
  ChartPieSlice,
  ListBullets,
  ChartBar,
  WhatsappLogo,
  Wallet,
  SquaresFour,
  Receipt
} from '@phosphor-icons/react';

export default function Sidebar() {
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
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${isActive ? 'active-nav' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'}`}>
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
          <WhatsappLogo size={20} weight="duotone" /> WhatsApp
        </NavLink>
      </nav>

      {/* Connect CTA */}
      <div className="px-3 pb-4">
        <div
          className="rounded-[10px] p-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            Connect WhatsApp
          </p>
          <p className="text-[11px] mb-2.5" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Log expenses by chat.
          </p>
          <a
            href="/chat"
            className="btn-accent w-full justify-center text-[12px] py-1.5"
            style={{ borderRadius: '6px' }}
          >
            <WhatsappLogo size={13} weight="fill" />
            Open Chat
          </a>
        </div>
      </div>
    </aside>
  );
}
