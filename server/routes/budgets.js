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
router.get('/usage', async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const year  = parseInt(req.query.year, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1).toISOString();
    const end   = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { rows: budgets } = await db.query('SELECT * FROM budgets WHERE month = $1 AND year = $2', [month, year]);
    
    if (budgets.length === 0) {
      return res.json([]);
    }

    const { rows: spending } = await db.query(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense' AND created_at >= $1 AND created_at <= $2
      GROUP BY category
    `, [start, end]);

    const spendingMap = Object.fromEntries(spending.map(s => [s.category, Number(s.total)]));

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
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM budgets ORDER BY year DESC, month DESC, category ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/budgets ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const parsed = BudgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { category, monthly_limit, month, year } = parsed.data;

    const { rows } = await db.query(`
      INSERT INTO budgets (category, monthly_limit, month, year)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category, monthly_limit, month, year]);

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Budget already exists for this category and month' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/budgets/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const parsed = BudgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { category, monthly_limit, month, year } = parsed.data;
    
    const { rows, rowCount } = await db.query(`
      UPDATE budgets 
      SET category = $1, monthly_limit = $2, month = $3, year = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [category, monthly_limit, month, year, req.params.id]);

    if (rowCount === 0) return res.status(404).json({ error: 'Budget not found' });

    res.json(rows[0]);
  } catch (err) {
    if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Budget already exists for this category and month' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/budgets/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows, rowCount } = await db.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Budget not found' });

    res.json({ deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
