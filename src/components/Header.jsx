import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MagnifyingGlass, User } from '@phosphor-icons/react';
import SearchPanel from './SearchPanel';
import NotificationsDropdown, { NotificationBell } from './NotificationsDropdown';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';

const pageTitles = {
  '/':             { title: 'Dashboard',    subtitle: 'July 2026' },
  '/transactions': { title: 'Transactions', subtitle: 'All activity' },
  '/analytics':    { title: 'Analytics',    subtitle: 'Spending insights' },
  '/budget':       { title: 'Budget',       subtitle: 'Monthly limits' },
  '/chat':         { title: 'WhatsApp Bot', subtitle: 'Linked: +62 812 xxx xxxx' },
};

export default function Header() {
  const { pathname } = useLocation();
  const page = pageTitles[pathname] ?? { title: 'Dompet', subtitle: '' };

  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]    = useState(false);

  const { data: notifData } = useApi(() => api.getNotifications());
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <>
      <header
        className="h-14 px-6 flex items-center justify-between"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {page.title}
          </h1>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            / {page.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Search button */}
          <button
            className="btn-ghost px-2 py-2 border-0 bg-transparent"
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={15} style={{ color: 'var(--text-muted)' }} />
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

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center ml-1 border"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <User size={14} weight="duotone" />
          </div>
        </div>
      </header>

      {/* Search panel */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
