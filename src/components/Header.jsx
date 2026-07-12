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
        <div className="flex items-center gap-2 md:gap-3 flex-shrink min-w-0 pr-2">
          <h1 className="text-[14px] font-semibold tracking-wide truncate"
            style={{ color: 'var(--text-primary)' }}>
            {page.title}
          </h1>
          <div className="w-[1px] h-3 hidden sm:block" style={{ background: 'var(--border-strong)' }} />
          <span className="text-[12px] font-medium hidden sm:block truncate" style={{ color: 'var(--text-muted)' }}>
            {page.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Theme toggle */}
          <button
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl border border-transparent transition-all duration-200 hover:bg-[var(--bg-elevated)]"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun size={20} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <Moon size={20} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
          
          {/* Search button */}
          <button
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl border border-transparent transition-all duration-200 hover:bg-[var(--bg-elevated)]"
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={20} style={{ color: 'var(--text-muted)' }} />
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

          <div className="w-[1px] h-5 mx-1 md:mx-2 hidden sm:block" style={{ background: 'var(--border-strong)' }} />

          {/* Avatar */}
          <Link 
            to="/settings"
            className="w-9 h-9 md:w-10 md:h-10 ml-1 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)', 
              borderColor: 'var(--border)', 
              boxShadow: '0 0 12px rgba(16,185,129,0.2)' 
            }}
          >
            <span className="text-[12px] font-bold text-white tracking-wider">JD</span>
          </Link>
        </div>
      </header>

      {/* Search panel */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
