import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout       from './components/Layout';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics    from './pages/Analytics';
import Budget       from './pages/Budget';
import Chat         from './pages/Chat';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index               element={<Dashboard />}    />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics"    element={<Analytics />}    />
          <Route path="budget"       element={<Budget />}       />
          <Route path="chat"         element={<Chat />}         />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
