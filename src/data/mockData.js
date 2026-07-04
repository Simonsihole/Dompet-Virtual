// Mock data for the expense tracker

export const mockBalance = {
  current: 4250000,
  income: 7500000,
  expenses: 3250000,
  currency: 'IDR',
};

export const mockTransactions = [
  { id: 1, type: 'expense', amount: 45000,  category: 'Food',          description: 'Lunch nasi padang',     date: '2026-07-04', time: '12:30' },
  { id: 2, type: 'expense', amount: 25000,  category: 'Transport',     description: 'Grab ke kantor',         date: '2026-07-04', time: '08:15' },
  { id: 3, type: 'income',  amount: 7500000,category: 'Salary',        description: 'Gaji Juli',              date: '2026-07-03', time: '09:00' },
  { id: 4, type: 'expense', amount: 120000, category: 'Shopping',      description: 'Beli baju di Uniqlo',    date: '2026-07-03', time: '15:45' },
  { id: 5, type: 'expense', amount: 35000,  category: 'Food',          description: 'Kopi di Starbucks',      date: '2026-07-03', time: '10:00' },
  { id: 6, type: 'expense', amount: 200000, category: 'Bills',         description: 'Listrik bulan Juli',     date: '2026-07-02', time: '11:00' },
  { id: 7, type: 'expense', amount: 50000,  category: 'Entertainment', description: 'Netflix monthly',        date: '2026-07-02', time: '08:00' },
  { id: 8, type: 'expense', amount: 80000,  category: 'Food',          description: 'Dinner di warung',       date: '2026-07-01', time: '19:30' },
  { id: 9, type: 'expense', amount: 15000,  category: 'Transport',     description: 'Parkir mall',            date: '2026-07-01', time: '14:00' },
  { id: 10,type: 'expense', amount: 500000, category: 'Shopping',      description: 'Sepatu baru',            date: '2026-06-30', time: '16:00' },
];

export const mockCategoryData = [
  { name: 'Food',          value: 160000, color: '#22c55e' },
  { name: 'Transport',     value: 40000,  color: '#3b82f6' },
  { name: 'Shopping',      value: 620000, color: '#f59e0b' },
  { name: 'Bills',         value: 200000, color: '#ef4444' },
  { name: 'Entertainment', value: 50000,  color: '#8b5cf6' },
  { name: 'Other',         value: 180000, color: '#6b7280' },
];

export const mockMonthlyData = [
  { month: 'Feb', income: 7500000, expenses: 2800000 },
  { month: 'Mar', income: 7500000, expenses: 3100000 },
  { month: 'Apr', income: 8000000, expenses: 2600000 },
  { month: 'May', income: 7500000, expenses: 3400000 },
  { month: 'Jun', income: 7500000, expenses: 2950000 },
  { month: 'Jul', income: 7500000, expenses: 3250000 },
];

export const categoryColors = {
  Food:          { bg: 'bg-green-100',  text: 'text-green-700',  icon: '🍽️' },
  Transport:     { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: '🚗' },
  Shopping:      { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🛍️' },
  Bills:         { bg: 'bg-red-100',    text: 'text-red-700',    icon: '📄' },
  Entertainment: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🎬' },
  Salary:        { bg: 'bg-emerald-100',text: 'text-emerald-700',icon: '💰' },
  Other:         { bg: 'bg-gray-100',   text: 'text-gray-700',   icon: '📦' },
};

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
