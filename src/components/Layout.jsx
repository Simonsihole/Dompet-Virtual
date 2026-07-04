import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: isChat ? 0 : '24px' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
