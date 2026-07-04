'use strict';

const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE is_read = 0
    `).get().count;

    // Format for frontend
    const formatted = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      time: n.created_at,
      unread: n.is_read === 0
    }));

    res.json({
      notifications: formatted,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/notifications/:id/read ───────────────────────────────────────────
router.put('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/notifications/read-all ───────────────────────────────────────────
router.put('/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
