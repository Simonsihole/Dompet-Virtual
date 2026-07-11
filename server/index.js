'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');

const transactionsRouter   = require('./routes/transactions');
const balanceRouter        = require('./routes/balance');
const analyticsRouter      = require('./routes/analytics');
const webhookRouter        = require('./routes/webhook');
const notificationsRouter  = require('./routes/notifications');
const budgetsRouter        = require('./routes/budgets');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { requireAuth } = require('./lib/auth');

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/webhook/telegram',   webhookRouter);

app.use('/api/transactions',       requireAuth, transactionsRouter);
app.use('/api/balance',            requireAuth, balanceRouter);
app.use('/api/analytics',          requireAuth, analyticsRouter);
app.use('/api/chat',               requireAuth, require('./routes/chat'));
app.use('/api/notifications',      requireAuth, notificationsRouter);
app.use('/api/budgets',            requireAuth, budgetsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook/telegram`);
  });
}

module.exports = app;
