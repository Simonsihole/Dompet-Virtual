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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/transactions',       transactionsRouter);
app.use('/api/balance',            balanceRouter);
app.use('/api/analytics',          analyticsRouter);
app.use('/api/webhook/whatsapp',   webhookRouter);
app.use('/api/notifications',      notificationsRouter);
app.use('/api/budgets',            budgetsRouter);

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
    console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook/whatsapp`);
  });
}

module.exports = app;
