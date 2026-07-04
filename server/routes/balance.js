const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/balance ─────────────────────────────────────────────────────────
// Returns current balance, this-month income, this-month expenses, savings rate
router.get('/', async (req, res) => {
  try {
    // Current month bounds (UTC)
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const userId = req.user.sub;
    
    // All-time totals for running balance
    const allTimeRes = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
      WHERE user_id = $1
    `, [userId]);
    const allTime = allTimeRes.rows[0];

    // This month
    const thisMonthRes = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
      WHERE created_at >= $1 AND created_at <= $2 AND user_id = $3
    `, [monthStart, monthEnd, userId]);
    const thisMonth = thisMonthRes.rows[0];

    const totalIncome = Number(allTime.total_income);
    const totalExpenses = Number(allTime.total_expenses);
    const mIncome = Number(thisMonth.income);
    const mExpenses = Number(thisMonth.expenses);

    const current     = totalIncome - totalExpenses;
    const savingsRate = mIncome > 0
      ? Math.round(((mIncome - mExpenses) / mIncome) * 100)
      : 0;

    res.json({
      current,
      income:      mIncome,
      expenses:    mExpenses,
      savings:     mIncome - mExpenses,
      savingsRate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
