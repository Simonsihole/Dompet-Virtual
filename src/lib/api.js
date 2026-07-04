import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

async function request(path, options = {}) {
  const isDemo = sessionStorage.getItem('demo_mode') === 'true';

  if (isDemo) {
    // Artificial delay for realism
    await new Promise(r => setTimeout(r, 400));
    
    if (path.includes('/api/balance')) {
      return { current: 24500000, income: 32000000, expenses: 7500000, savings: 24500000, savingsRate: 77 };
    }
    if (path.includes('/api/analytics/monthly')) {
      return [
        { month: 'Jan', income: 28000000, expenses: 9000000 },
        { month: 'Feb', income: 31000000, expenses: 8500000 },
        { month: 'Mar', income: 32000000, expenses: 7500000 }
      ];
    }
    if (path.includes('/api/analytics/categories')) {
      return [
        { name: 'Food', value: 3500000, color: '#22c55e' },
        { name: 'Transport', value: 1200000, color: '#60a5fa' },
        { name: 'Shopping', value: 2800000, color: '#fbbf24' }
      ];
    }
    if (path.includes('/api/transactions')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { id: Math.random(), ...body, created_at: new Date().toISOString() };
      }
      return { 
        data: [
          { id: 1, type: 'expense', amount: 150000, category: 'Food', description: 'Dinner with friends', source: 'whatsapp', created_at: new Date().toISOString() },
          { id: 2, type: 'expense', amount: 500000, category: 'Shopping', description: 'New shoes', source: 'manual', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, type: 'income', amount: 32000000, category: 'Salary', description: 'Monthly Salary', source: 'manual', created_at: new Date(Date.now() - 86400000 * 3).toISOString() }
        ], 
        count: 3 
      };
    }
    if (path.includes('/api/budgets/usage')) {
      return [
        { id: 1, category: 'Food', monthly_limit: 5000000, spent: 3500000, percentage: 70 },
        { id: 2, category: 'Shopping', monthly_limit: 4000000, spent: 2800000, percentage: 70 }
      ];
    }
    if (path.includes('/api/budgets')) {
      return [];
    }
    if (path.includes('/api/notifications')) {
      return [];
    }
    if (path.includes('/api/chat')) {
      return { reply: "✅ Logged - Rp 150.000 for Food (Demo Mode)" };
    }
    return {};
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Balance
  getBalance: ()                    => request('/api/balance'),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/transactions${qs ? '?' + qs : ''}`);
  },
  createTransaction: (body)         => request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
  deleteTransaction: (id)           => request(`/api/transactions/${id}`, { method: 'DELETE' }),
  deleteLastTransaction: ()         => request('/api/transactions/last/one', { method: 'DELETE' }),

  // Chat
  sendChat: (text)                  => request('/api/chat', { method: 'POST', body: JSON.stringify({ text }) }),

  // Analytics
  getMonthly:    ()                 => request('/api/analytics/monthly'),
  getCategories: ()                 => request('/api/analytics/categories'),

  // Notifications
  getNotifications: ()              => request('/api/notifications'),
  markNotificationRead: (id)        => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: ()      => request('/api/notifications/read-all', { method: 'PUT' }),

  // Budgets
  getBudgetUsage: ()                => request('/api/budgets/usage'),
  getBudgets: ()                    => request('/api/budgets'),
  createBudget: (body)              => request('/api/budgets', { method: 'POST', body: JSON.stringify(body) }),
  updateBudget: (id, body)          => request(`/api/budgets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBudget: (id)                => request(`/api/budgets/${id}`, { method: 'DELETE' }),
};
