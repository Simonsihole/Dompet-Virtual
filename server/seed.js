const db = require('./db');

console.log('Seeding database...');

// Clear existing transactions
db.prepare('DELETE FROM transactions').run();
db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run('transactions');

const insert = db.prepare(`
  INSERT INTO transactions (type, amount, category, description, source, created_at)
  VALUES (@type, @amount, @category, @description, @source, @created_at)
`);

const seedData = db.transaction(() => {
  // July 2026
  insert.run({ type: 'income',  amount: 7500000, category: 'Salary',        description: 'Gaji Juli',              source: 'manual',    created_at: '2026-07-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 45000,   category: 'Food',          description: 'Lunch nasi padang',      source: 'whatsapp',  created_at: '2026-07-04T05:30:00Z' });
  insert.run({ type: 'expense', amount: 25000,   category: 'Transport',     description: 'Grab ke kantor',         source: 'whatsapp',  created_at: '2026-07-04T01:15:00Z' });
  insert.run({ type: 'expense', amount: 35000,   category: 'Food',          description: 'Kopi di cafe',           source: 'whatsapp',  created_at: '2026-07-03T03:00:00Z' });
  insert.run({ type: 'expense', amount: 120000,  category: 'Shopping',      description: 'Beli baju',              source: 'whatsapp',  created_at: '2026-07-03T08:45:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik bulan Juli',     source: 'manual',    created_at: '2026-07-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 50000,   category: 'Entertainment', description: 'Netflix monthly',        source: 'manual',    created_at: '2026-07-02T01:00:00Z' });
  insert.run({ type: 'expense', amount: 80000,   category: 'Food',          description: 'Dinner di warung',       source: 'whatsapp',  created_at: '2026-07-01T12:30:00Z' });
  insert.run({ type: 'expense', amount: 15000,   category: 'Transport',     description: 'Parkir mall',            source: 'whatsapp',  created_at: '2026-07-01T07:00:00Z' });
  insert.run({ type: 'expense', amount: 500000,  category: 'Shopping',      description: 'Sepatu baru',            source: 'whatsapp',  created_at: '2026-06-30T09:00:00Z' });

  // June 2026
  insert.run({ type: 'income',  amount: 7500000, category: 'Salary',        description: 'Gaji Juni',              source: 'manual',    created_at: '2026-06-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 350000,  category: 'Shopping',      description: 'Belanja bulanan',        source: 'manual',    created_at: '2026-06-15T06:00:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik Juni',           source: 'manual',    created_at: '2026-06-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 600000,  category: 'Food',          description: 'Makan sekeluarga',       source: 'whatsapp',  created_at: '2026-06-20T11:00:00Z' });
  insert.run({ type: 'expense', amount: 180000,  category: 'Transport',     description: 'Bensin bulan ini',       source: 'whatsapp',  created_at: '2026-06-25T04:00:00Z' });
  insert.run({ type: 'expense', amount: 150000,  category: 'Entertainment', description: 'Nonton konser',          source: 'whatsapp',  created_at: '2026-06-18T13:00:00Z' });
  insert.run({ type: 'expense', amount: 270000,  category: 'Shopping',      description: 'Beli peralatan',         source: 'manual',    created_at: '2026-06-10T07:00:00Z' });

  // May 2026
  insert.run({ type: 'income',  amount: 7500000, category: 'Salary',        description: 'Gaji Mei',               source: 'manual',    created_at: '2026-05-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 420000,  category: 'Food',          description: 'Makan bulan Mei',        source: 'manual',    created_at: '2026-05-15T06:00:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik Mei',            source: 'manual',    created_at: '2026-05-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 850000,  category: 'Shopping',      description: 'Belanja besar',          source: 'manual',    created_at: '2026-05-20T09:00:00Z' });
  insert.run({ type: 'expense', amount: 320000,  category: 'Transport',     description: 'Transport bulan Mei',    source: 'manual',    created_at: '2026-05-25T04:00:00Z' });
  insert.run({ type: 'expense', amount: 110000,  category: 'Entertainment', description: 'Game bulan Mei',         source: 'manual',    created_at: '2026-05-18T13:00:00Z' });

  // Apr 2026
  insert.run({ type: 'income',  amount: 8000000, category: 'Salary',        description: 'Gaji April + bonus',     source: 'manual',    created_at: '2026-04-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 380000,  category: 'Food',          description: 'Makan bulan April',      source: 'manual',    created_at: '2026-04-15T06:00:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik April',          source: 'manual',    created_at: '2026-04-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 490000,  category: 'Shopping',      description: 'Belanja April',          source: 'manual',    created_at: '2026-04-20T09:00:00Z' });
  insert.run({ type: 'expense', amount: 220000,  category: 'Transport',     description: 'Transport April',        source: 'manual',    created_at: '2026-04-25T04:00:00Z' });
  insert.run({ type: 'expense', amount: 310000,  category: 'Entertainment', description: 'Hiburan April',          source: 'manual',    created_at: '2026-04-18T13:00:00Z' });

  // Mar 2026
  insert.run({ type: 'income',  amount: 7500000, category: 'Salary',        description: 'Gaji Maret',             source: 'manual',    created_at: '2026-03-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 450000,  category: 'Food',          description: 'Makan bulan Maret',      source: 'manual',    created_at: '2026-03-15T06:00:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik Maret',          source: 'manual',    created_at: '2026-03-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 710000,  category: 'Shopping',      description: 'Belanja Maret',          source: 'manual',    created_at: '2026-03-20T09:00:00Z' });
  insert.run({ type: 'expense', amount: 290000,  category: 'Transport',     description: 'Transport Maret',        source: 'manual',    created_at: '2026-03-25T04:00:00Z' });
  insert.run({ type: 'expense', amount: 450000,  category: 'Entertainment', description: 'Hiburan Maret',          source: 'manual',    created_at: '2026-03-18T13:00:00Z' });

  // Feb 2026
  insert.run({ type: 'income',  amount: 7500000, category: 'Salary',        description: 'Gaji Februari',          source: 'manual',    created_at: '2026-02-03T09:00:00Z' });
  insert.run({ type: 'expense', amount: 400000,  category: 'Food',          description: 'Makan bulan Feb',        source: 'manual',    created_at: '2026-02-15T06:00:00Z' });
  insert.run({ type: 'expense', amount: 200000,  category: 'Bills',         description: 'Listrik Feb',            source: 'manual',    created_at: '2026-02-02T04:00:00Z' });
  insert.run({ type: 'expense', amount: 580000,  category: 'Shopping',      description: 'Belanja Feb',            source: 'manual',    created_at: '2026-02-20T09:00:00Z' });
  insert.run({ type: 'expense', amount: 250000,  category: 'Transport',     description: 'Transport Feb',          source: 'manual',    created_at: '2026-02-25T04:00:00Z' });
  insert.run({ type: 'expense', amount: 370000,  category: 'Entertainment', description: 'Hiburan Feb',            source: 'manual',    created_at: '2026-02-18T13:00:00Z' });
});

seedData();
console.log('Done! Database seeded with sample transactions.');
