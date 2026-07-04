const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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
