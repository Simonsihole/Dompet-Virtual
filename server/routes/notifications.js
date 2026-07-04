const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.sub;
    const { rows } = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.user.sub;
    const { rows, rowCount } = await db.query(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [req.params.id, userId]);

    if (rowCount === 0) return res.status(404).json({ error: 'Notification not found or unauthorized' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user.sub;
    await db.query('UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
