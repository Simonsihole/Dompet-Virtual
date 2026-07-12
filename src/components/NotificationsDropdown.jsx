import { useEffect, useRef } from 'react';
import { Bell, X, Warning, CheckCircle, Info, XCircle } from '@phosphor-icons/react';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';

const typeConfig = {
  warning: { Icon: Warning,     color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  danger:  { Icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  success: { Icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  info:    { Icon: Info,        color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
};

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export default function NotificationsDropdown({ open, onClose }) {
  const panelRef = useRef(null);
  const { data, loading, mutate } = useApi(() => api.getNotifications(), [open]);

  const notifications = data?.notifications ?? [];
  const unread        = data?.unreadCount   ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-10 z-50 w-80 rounded-[16px] overflow-hidden"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</p>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer hover:opacity-80" 
                  style={{ background: 'var(--accent)', color: '#fff' }}
                  onClick={handleMarkAllRead}
                  title="Mark all as read">
              {unread}
            </span>
          )}
        </div>
        <button onClick={onClose}>
          <X size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {loading && (
          <p className="text-[13px] px-4 py-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-4 py-8 text-center">
            <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No notifications</p>
          </div>
        )}

        {!loading && notifications.map((n) => {
          const cfg = typeConfig[n.type] ?? typeConfig.info;
          const { Icon } = cfg;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.unread ? 'cursor-pointer' : ''}`}
              onClick={() => n.unread && handleMarkRead(n.id)}
              style={{
                borderBottom: '1px solid var(--border)',
                background: n.unread ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                <Icon size={13} weight="fill" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {n.title}
                  {n.unread && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 mb-0.5" style={{ background: 'var(--accent)' }} />
                  )}
                </p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-subtle)' }}>{timeAgo(n.time)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bell button with unread badge — exported separately for use in Header
export function NotificationBell({ onClick, unread }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl border border-transparent transition-all duration-200 hover:bg-[var(--bg-elevated)] relative"
    >
      <Bell size={18} style={{ color: 'var(--text-muted)' }} />
      {unread > 0 && (
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-[var(--bg-card)]"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </button>
  );
}
