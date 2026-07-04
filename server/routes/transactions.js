const express = require('express');
const { z }   = require('zod');
const db      = require('../db');

const router = express.Router();

// ── Validation schema ────────────────────────────────────────────────────────
const TransactionSchema = z.object({
  type:        z.enum(['income', 'expense']),
  amount:      z.number().int().positive(),
  category:    z.string().min(1).max(50).default('Other'),
  description: z.string().min(1).max(255),
  source:      z.enum(['manual', 'whatsapp']).default('manual'),
});

// ── GET /api/transactions ────────────────────────────────────────────────────
// Query params: type, category, from (date), to (date), search, limit, offset
router.get('/', (req, res) => {
  try {
    const { type, category, from, to, search, limit = 50, offset = 0 } = req.query;

    let sql    = 'SELECT * FROM transactions WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as n FROM transactions WHERE 1=1';
    const params = [];

    if (type)     { sql += ' AND type = ?';                   countSql += ' AND type = ?';       params.push(type); }
    if (category) { sql += ' AND category = ?';               countSql += ' AND category = ?';   params.push(category); }
    if (from)     { sql += ' AND created_at >= ?';            countSql += ' AND created_at >= ?'; params.push(from); }
    if (to)       { sql += ' AND created_at <= ?';            countSql += ' AND created_at <= ?'; params.push(to + 'T23:59:59Z'); }
    
    if (search) {
      sql += ' AND (description LIKE ? OR category LIKE ? OR CAST(amount AS TEXT) LIKE ?)';
      countSql += ' AND (description LIKE ? OR category LIKE ? OR CAST(amount AS TEXT) LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const rowsParams = [...params, Number(limit), Number(offset)];

    const rows  = db.prepare(sql).all(...rowsParams);
    const total = db.prepare(countSql).get(...params).n;

    res.json({ data: rows, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/transactions/:id ────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/transactions ───────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const parsed = TransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { type, amount, category, description, source } = parsed.data;
    const result = db.prepare(`
      INSERT INTO transactions (type, amount, category, description, source)
      VALUES (?, ?, ?, ?, ?)
    `).run(type, amount, category, description, source);

    const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);

    // Budget check logic
    if (type === 'expense') {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const budget = db.prepare('SELECT * FROM budgets WHERE category = ? AND month = ? AND year = ?').get(category, month, year);
      if (budget) {
        const start = new Date(year, month - 1, 1).toISOString();
        const end   = new Date(year, month, 0, 23, 59, 59).toISOString();
        const spent = db.prepare(`
          SELECT SUM(amount) as total FROM transactions
          WHERE type = 'expense' AND category = ? AND created_at >= ? AND created_at <= ?
        `).get(category, start, end).total || 0;
        
        const usage = spent / budget.monthly_limit;
        if (usage >= 0.8) {
          const isOver = usage >= 1;
          const notifType = isOver ? 'danger' : 'warning';
          const title = isOver ? `${category} budget exceeded` : `${category} budget at ${Math.round(usage * 100)}%`;
          
          db.prepare(`
            INSERT INTO notifications (type, title, body)
            VALUES (?, ?, ?)
          `).run(notifType, title, `Spent Rp ${(spent/1000).toFixed(0)}rb of Rp ${(budget.monthly_limit/1000).toFixed(0)}rb`);
        }
      }
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/transactions/:id ─────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Transaction not found' });

    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ deleted: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/transactions (last one — for "hapus terakhir" command) ────────
router.delete('/last/one', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1').get();
    if (!row) return res.status(404).json({ error: 'No transactions to delete' });

    db.prepare('DELETE FROM transactions WHERE id = ?').run(row.id);
    res.json({ deleted: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
