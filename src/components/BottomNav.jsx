import { NavLink } from 'react-router-dom';
import {
  SquaresFour,
  Receipt,
  ChartPieSlice,
  Wallet,
  TelegramLogo,
  Gear
} from '@phosphor-icons/react';

export default function BottomNav() {
  const links = [
    { to: '/dashboard', end: true, icon: SquaresFour, label: 'Dash' },
    { to: '/transactions', end: false, icon: Receipt, label: 'Trans' },
    { to: '/analytics', end: false, icon: ChartPieSlice, label: 'Stats' },
    { to: '/budget', end: false, icon: Wallet, label: 'Budget' },
    { to: '/chat', end: false, icon: TelegramLogo, label: 'Telegram' },
    { to: '/settings', end: false, icon: Gear, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 py-3 border-t backdrop-blur-xl"
      style={{
        background: 'var(--bg-canvas)',
        opacity: 0.98,
        borderColor: 'var(--border)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}>
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-[var(--accent)] bg-[var(--bg-elevated)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <link.icon size={22} weight="duotone" />
            <span className="text-[9px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
