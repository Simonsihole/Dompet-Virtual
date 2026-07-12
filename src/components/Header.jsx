import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MagnifyingGlass, Sun, Moon } from '@phosphor-icons/react';
import SearchPanel from './SearchPanel';
import NotificationsDropdown, { NotificationBell } from './NotificationsDropdown';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/':             { title: 'Overview',     subtitle: 'July 2026' },
  '/transactions': { title: 'Transactions', subtitle: 'All activity' },
  '/analytics':    { title: 'Analytics',    subtitle: 'Spending insights' },
  '/budget':       { title: 'Budget',       subtitle: 'Monthly limits' },
  '/chat':         { title: 'Telegram',     subtitle: 'Linked: @DompetDashBot' },
  '/settings':     { title: 'Settings',     subtitle: 'Preferences & Account' },
};

export default function Header() {
  const { pathname } = useLocation();
  const page = pageTitles[pathname] ?? { title: 'Dashboard', subtitle: '' };
  
  const { isDark, toggleTheme } = useTheme();

  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]    = useState(false);

  const { data: notifData } = useApi(() => api.getNotifications());
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <>
      <header
        className="h-[68px] px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
        style={{ background: 'var(--bg-canvas)', opacity: 0.98, borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-semibold tracking-wide"
            style={{ color: 'var(--text-primary)' }}>
            {page.title}
          </h1>
          <div className="w-[1px] h-3" style={{ background: 'var(--border-strong)' }} />
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {page.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            className="p-2 rounded-xl border border-transparent transition-all duration-200 hover:bg-[var(--bg-elevated)]"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun size={18} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <Moon size={18} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
          
          {/* Search button */}
          <button
            className="p-2 rounded-xl border border-transparent transition-all duration-200 hover:bg-[var(--bg-elevated)]"
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={18} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Notifications bell */}
          <div className="relative">
            <NotificationBell
              unread={unreadCount}
              onClick={() => setNotifOpen((v) => !v)}
            />
            <NotificationsDropdown
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="w-[1px] h-4 mx-2" style={{ background: 'var(--border-strong)' }} />

          {/* Avatar */}
          <Link 
            to="/settings"
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)', 
              borderColor: 'var(--border)', 
              boxShadow: '0 0 12px rgba(16,185,129,0.3)' 
            }}
          >
            <span className="text-[11px] font-bold text-white tracking-wider">JD</span>
          </Link>
        </div>
      </header>

      {/* Search panel */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
