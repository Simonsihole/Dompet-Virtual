'use strict';

const express = require('express');
const { z }   = require('zod');
const db      = require('../db');

const router = express.Router();

const TransactionSchema = z.object({
  type:        z.enum(['income', 'expense']),
  amount:      z.number().int().positive(),
  category:    z.string().min(1),
  description: z.string().min(1),
  source:      z.enum(['manual', 'whatsapp']).default('manual'),
});

// ── GET /api/transactions ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId   = req.user.sub;
    const limit    = parseInt(req.query.limit, 10) || 50;
    const category = req.query.category;
    const type     = req.query.type;
    const search   = req.query.search;
    
    let sql = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type) {
      sql += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const { rows } = await db.query(sql, params);

    res.json({
      data: rows,
      count: rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/transactions ───────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.sub;
    const parsed = TransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { type, amount, category, description, source } = parsed.data;
    const { rows: inserted } = await db.query(`
      INSERT INTO transactions (type, amount, category, description, source, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [type, amount, category, description, source, userId]);

    const created = inserted[0];

    // Budget check logic
    if (type === 'expense') {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const { rows: budgets } = await db.query('SELECT * FROM budgets WHERE category = $1 AND month = $2 AND year = $3 AND user_id = $4', [category, month, year, userId]);
      const budget = budgets[0];
      
      if (budget) {
        const start = new Date(year, month - 1, 1).toISOString();
        const end   = new Date(year, month, 0, 23, 59, 59).toISOString();
        const { rows: spendResult } = await db.query(`
          SELECT SUM(amount) as total FROM transactions
          WHERE type = 'expense' AND category = $1 AND created_at >= $2 AND created_at <= $3 AND user_id = $4
        `, [category, start, end, userId]);
        
        const spent = Number(spendResult[0].total) || 0;
        const usage = spent / budget.monthly_limit;
        
        if (usage >= 0.8) {
          const isOver = usage >= 1;
          const notifType = isOver ? 'danger' : 'warning';
          const title = isOver ? `${category} budget exceeded` : `${category} budget at ${Math.round(usage * 100)}%`;
          
          await db.query(`
            INSERT INTO notifications (type, title, body, user_id)
            VALUES ($1, $2, $3, $4)
          `, [notifType, title, `Spent Rp ${(spent/1000).toFixed(0)}rb of Rp ${(budget.monthly_limit/1000).toFixed(0)}rb`, userId]);
        }
      }
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
