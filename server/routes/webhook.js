'use strict';

const express  = require('express');
const db       = require('../db');
const { parse }      = require('../lib/parser');
const { sendReply }  = require('../lib/whatsapp');

const router = express.Router();

// Format rupiah for replies
function fmt(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

// Get current balance (all-time income - expenses)
function getBalance() {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END),0) as inc,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp
    FROM transactions
  `).get();
  return row.inc - row.exp;
}

// Get this month date bounds (ISO)
function thisMonthBounds() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  return { start, end };
}

// ── POST /api/webhook/whatsapp ────────────────────────────────────────────────
// Twilio sends form-encoded body: { Body, From, To, ... }
router.post('/', express.urlencoded({ extended: false }), async (req, res) => {
  // Always respond 200 fast to Twilio (it retries on timeout)
  res.sendStatus(200);

  const rawText = (req.body.Body || '').trim();
  const from    = req.body.From; // "whatsapp:+628xxx"

  if (!rawText || !from) return;

  try {
    const parsed = await parse(rawText);
    let replyText = '';

    // ── Handle each intent ─────────────────────────────────────────────────
    switch (parsed.intent) {

      case 'log_expense':
      case 'log_income': {
        const result = db.prepare(`
          INSERT INTO transactions (type, amount, category, description, source)
          VALUES (?, ?, ?, ?, 'whatsapp')
        `).run(parsed.type, parsed.amount, parsed.category, parsed.description);

        const sign = parsed.type === 'income' ? '+' : '-';
        db.prepare(`
          INSERT INTO notifications (type, title, body)
          VALUES ('info', 'WhatsApp: ' || ?, ?)
        `).run(parsed.description, `${sign}Rp ${(parsed.amount / 1000).toFixed(0)}rb logged via WhatsApp`);

        const balance = getBalance();
        replyText =
          `Tercatat!\n` +
          `${sign}${fmt(parsed.amount)} (${parsed.category})\n` +
          `${parsed.description}\n\n` +
          `Saldo: ${fmt(balance)}`;
        break;
      }

      case 'query_balance': {
        const { start, end } = thisMonthBounds();
        const month = db.prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END),0) as inc,
            COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp
          FROM transactions WHERE created_at >= ? AND created_at <= ?
        `).get(start, end);

        replyText =
          `Saldo kamu:\n\n` +
          `Balance    ${fmt(getBalance())}\n` +
          `Income     ${fmt(month.inc)}\n` +
          `Expenses   ${fmt(month.exp)}\n` +
          `Sisa       ${fmt(month.inc - month.exp)}`;
        break;
      }

      case 'query_today': {
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

        const rows = db.prepare(`
          SELECT category, SUM(amount) as total
          FROM transactions
          WHERE type='expense' AND created_at >= ? AND created_at <= ?
          GROUP BY category ORDER BY total DESC
        `).all(todayStart.toISOString(), todayEnd.toISOString());

        if (rows.length === 0) {
          replyText = 'Belum ada pengeluaran hari ini.';
        } else {
          const total = rows.reduce((s, r) => s + r.total, 0);
          const lines = rows.map((r) => `${r.category.padEnd(12)} ${fmt(r.total)}`).join('\n');
          replyText = `Pengeluaran hari ini:\n\n${lines}\n\nTotal  ${fmt(total)}`;
        }
        break;
      }

      case 'query_month': {
        const { start, end } = thisMonthBounds();
        const month = db.prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END),0) as inc,
            COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp
          FROM transactions WHERE created_at >= ? AND created_at <= ?
        `).get(start, end);

        const monthName = new Date().toLocaleDateString('id-ID', { month: 'long' });
        replyText =
          `Ringkasan ${monthName}:\n\n` +
          `Income     ${fmt(month.inc)}\n` +
          `Expenses   ${fmt(month.exp)}\n` +
          `Sisa       ${fmt(month.inc - month.exp)}`;
        break;
      }

      case 'delete_last': {
        const last = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1').get();
        if (!last) {
          replyText = 'Tidak ada transaksi untuk dihapus.';
        } else {
          db.prepare('DELETE FROM transactions WHERE id = ?').run(last.id);
          const balance = getBalance();
          replyText =
            `Dihapus:\n` +
            `${last.description} (${fmt(last.amount)})\n\n` +
            `Saldo kembali: ${fmt(balance)}`;
        }
        break;
      }

      case 'help':
        replyText =
          `Yang bisa saya bantu:\n\n` +
          `"beli nasi 25rb"        catat pengeluaran\n` +
          `"terima gaji 5jt"       catat pemasukan\n` +
          `"berapa saldo?"         cek saldo\n` +
          `"pengeluaran hari ini"  ringkasan harian\n` +
          `"bulan ini berapa?"     ringkasan bulanan\n` +
          `"hapus terakhir"        batalkan input terakhir`;
        break;

      default:
        replyText =
          `Tidak dimengerti.\n\nCoba: "beli makan 25rb" atau ketik "bantuan" untuk melihat perintah.`;
    }

    await sendReply(from, replyText);
  } catch (err) {
    console.error('[webhook] error:', err.message);
    try {
      await sendReply(from, 'Terjadi error. Coba lagi ya!');
    } catch (_) { /* ignore secondary errors */ }
  }
});

module.exports = router;
