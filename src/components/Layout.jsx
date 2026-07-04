import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main
          className={`flex-1 flex flex-col w-full ${isChat ? 'overflow-hidden p-0 pb-[80px] md:pb-0' : 'overflow-y-auto p-4 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-4'}`}
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
