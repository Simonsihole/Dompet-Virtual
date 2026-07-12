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

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => 
        `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 ${
          isActive 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} weight={isActive ? "fill" : "regular"} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { signOut, isDemo } = useAuth();
  
  return (
    <aside
      className="w-[260px] min-h-screen hidden md:flex flex-col flex-shrink-0"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3 px-6 py-6 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent-muted)', border: '1px solid var(--border)' }}
        >
          <Wallet size={16} weight="fill" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dompet
          </span>
          <span className="text-[11px] font-mono tracking-wide" style={{ color: 'var(--text-muted)' }}>
            via Telegram
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5">
        <NavItem to="/dashboard" icon={SquaresFour} label="Dashboard" end />
        <NavItem to="/transactions" icon={Receipt} label="Transactions" />
        <NavItem to="/analytics" icon={ChartPieSlice} label="Analytics" />
        <NavItem to="/budget" icon={Wallet} label="Budget" />
        <NavItem to="/chat" icon={TelegramLogo} label="Telegram" />
        <NavItem to="/settings" icon={Gear} label="Settings" />
      </nav>

      {/* User Actions */}
      <div className="px-4 pb-6 mt-6 border-t border-white/5 pt-6">
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            Account
          </p>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 text-[13px] py-2 px-3 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 font-medium"
          >
            <SignOut size={16} weight="bold" />
            {isDemo ? 'Exit Demo' : 'Sign out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
