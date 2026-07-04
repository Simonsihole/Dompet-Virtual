const express = require('express');
const db      = require('../db');

const router = express.Router();

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── GET /api/analytics/monthly ───────────────────────────────────────────────
// Last 6 months income vs expenses
router.get('/monthly', async (req, res) => {
  try {
    const results = [];
    const now     = new Date();

    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { rows } = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE created_at >= $1 AND created_at <= $2
      `, [start, end]);

      const row = rows[0];

      results.push({
        month:    MONTH_NAMES[d.getMonth()],
        income:   Number(row.income),
        expenses: Number(row.expenses),
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/categories ───────────────────────────────────────────
// This month spending by category
router.get('/categories', async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const COLORS = {
      Food:          '#22c55e',
      Transport:     '#60a5fa',
      Shopping:      '#fbbf24',
      Bills:         '#f87171',
      Entertainment: '#a78bfa',
      Other:         '#9ca3af',
    };

    const { rows } = await db.query(`
      SELECT category, SUM(amount) as value
      FROM transactions
      WHERE type = 'expense' AND created_at >= $1 AND created_at <= $2
      GROUP BY category
      ORDER BY value DESC
    `, [monthStart, monthEnd]);

    const data = rows.map((r) => ({
      name:  r.category,
      value: Number(r.value),
      color: COLORS[r.category] ?? '#9ca3af',
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
