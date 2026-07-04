'use strict';

const express = require('express');
const { z }   = require('zod');
const db      = require('../db');

const router = express.Router();

const BudgetSchema = z.object({
  category:      z.string().min(1).max(50),
  monthly_limit: z.number().int().positive(),
  month:         z.number().int().min(1).max(12),
  year:          z.number().int().min(2000),
});

// ── GET /api/budgets/usage ───────────────────────────────────────────────────
// Returns budget progress for a given month/year (defaults to current)
router.get('/usage', (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const year  = parseInt(req.query.year, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1).toISOString();
    const end   = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Get all budgets for this month/year
    const budgets = db.prepare('SELECT * FROM budgets WHERE month = ? AND year = ?').all(month, year);
    
    if (budgets.length === 0) {
      return res.json([]);
    }

    // Get spending per category for this month
    const spending = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense' AND created_at >= ? AND created_at <= ?
      GROUP BY category
    `).all(start, end);

    const spendingMap = Object.fromEntries(spending.map(s => [s.category, s.total]));

    const usage = budgets.map(b => {
      const spent = spendingMap[b.category] || 0;
      return {
        id: b.id,
        category: b.category,
        monthly_limit: b.monthly_limit,
        spent: spent,
        percentage: Math.round((spent / b.monthly_limit) * 100),
      };
    });

    res.json(usage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/budgets ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM budgets ORDER BY year DESC, month DESC, category ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/budgets ────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const parsed = BudgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { category, monthly_limit, month, year } = parsed.data;

    const result = db.prepare(`
      INSERT INTO budgets (category, monthly_limit, month, year)
      VALUES (?, ?, ?, ?)
    `).run(category, monthly_limit, month, year);

    const created = db.prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Budget already exists for this category and month' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/budgets/:id ─────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const parsed = BudgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { category, monthly_limit, month, year } = parsed.data;
    
    const result = db.prepare(`
      UPDATE budgets 
      SET category = ?, monthly_limit = ?, month = ?, year = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      WHERE id = ?
    `).run(category, monthly_limit, month, year, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: 'Budget not found' });

    const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Budget already exists for this category and month' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/budgets/:id ──────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Budget not found' });

    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    res.json({ deleted: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
