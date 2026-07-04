import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <Header />
        <main
          className="flex-1 overflow-y-auto w-full"
          style={{ 
            padding: isChat ? 0 : '16px',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
          }}
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
