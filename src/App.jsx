import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout       from './components/Layout';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics    from './pages/Analytics';
import Budget       from './pages/Budget';
import Chat         from './pages/Chat';
import Login        from './pages/Login';
import Settings     from './pages/Settings';

import Landing      from './pages/Landing';

function ProtectedRoute({ children }) {
  const { user, isDemo } = useAuth();
  if (!user && !isDemo) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user, isDemo } = useAuth();
  return (user || isDemo) ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard"    element={<Dashboard />}    />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics"    element={<Analytics />}    />
            <Route path="budget"       element={<Budget />}       />
            <Route path="chat"         element={<Chat />}         />
            <Route path="settings"     element={<Settings />}     />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
