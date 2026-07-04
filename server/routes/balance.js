const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/balance ─────────────────────────────────────────────────────────
// Returns current balance, this-month income, this-month expenses, savings rate
router.get('/', (req, res) => {
  try {
    // Current month bounds (UTC)
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // All-time totals for running balance
    const allTime = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
    `).get();

    // This month
    const thisMonth = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
      WHERE created_at >= ? AND created_at <= ?
    `).get(monthStart, monthEnd);

    const current     = allTime.total_income - allTime.total_expenses;
    const savingsRate = thisMonth.income > 0
      ? Math.round(((thisMonth.income - thisMonth.expenses) / thisMonth.income) * 100)
      : 0;

    res.json({
      current,
      income:      thisMonth.income,
      expenses:    thisMonth.expenses,
      savings:     thisMonth.income - thisMonth.expenses,
      savingsRate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
