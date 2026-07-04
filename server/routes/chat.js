const express = require('express');
const db      = require('../db');
const { parse: parseWhatsAppMessage } = require('../lib/parser');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const txData = await parseWhatsAppMessage(text);
    let replyMessage = '';
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

    const userId = req.user.sub;

    if (!txData || txData.intent === 'unknown') {
      replyMessage = "Sorry, I couldn't understand that format. Try: 'Makan 25rb' or 'Gaji 5jt'";
    } else if (txData.intent === 'help') {
      replyMessage = '🤖 *ExpenseBot Help*\n\n' +
                     '📝 *Log Expense*: "Makan KFC 50k"\n' +
                     '💰 *Log Income*: "Gaji masuk 5jt"\n' +
                     '⚖️ *Check Balance*: "Saldo" atau "Berapa saldo"\n' +
                     '📅 *Today*: "Pengeluaran hari ini"\n' +
                     '📊 *This Month*: "Bulan ini"\n' +
                     '🗑️ *Undo*: "Hapus terakhir"\n' +
                     '❓ *Help*: "Bantuan"';
    } else if (txData.intent === 'query_balance') {
      const allTimeRes = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE user_id = $1
      `, [userId]);
      const all = allTimeRes.rows[0];
      const bal = Number(all.total_income) - Number(all.total_expenses);
      replyMessage = `💳 *Current Balance*\nTotal: ${formatter.format(bal)}\n\nIncome: ${formatter.format(all.total_income)}\nExpenses: ${formatter.format(all.total_expenses)}`;
    } else if (txData.intent === 'query_today') {
      const today = new Date().toISOString().split('T')[0];
      const res = await db.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE type = 'expense' AND created_at::text LIKE $1 AND user_id = $2
      `, [today + '%', userId]);
      replyMessage = `📅 *Today's Expenses*\nYou have spent ${formatter.format(res.rows[0].total)} today.`;
    } else if (txData.intent === 'query_month') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const res = await db.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE type = 'expense' AND created_at >= $1 AND created_at <= $2 AND user_id = $3
      `, [monthStart, monthEnd, userId]);
      replyMessage = `📊 *This Month's Expenses*\nYou have spent ${formatter.format(res.rows[0].total)} this month.`;
    } else if (txData.intent === 'delete_last') {
      const res = await db.query(`
        DELETE FROM transactions 
        WHERE id = (SELECT id FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1) AND user_id = $1
        RETURNING *
      `, [userId]);
      if (res.rowCount > 0) {
        replyMessage = `🗑️ Deleted last transaction: ${res.rows[0].category} (${formatter.format(res.rows[0].amount)})`;
      } else {
        replyMessage = `No transactions found to delete.`;
      }
    } else if (txData.intent === 'log_expense' || txData.intent === 'log_income') {
      let query, params;
      if (txData.date) {
        query = `
          INSERT INTO transactions (type, amount, category, description, source, created_at, user_id)
          VALUES ($1, $2, $3, $4, 'whatsapp', $5, $6)
          RETURNING *
        `;
        params = [txData.type, txData.amount, txData.category, txData.description, txData.date, userId];
      } else {
        query = `
          INSERT INTO transactions (type, amount, category, description, source, user_id)
          VALUES ($1, $2, $3, $4, 'whatsapp', $5)
          RETURNING *
        `;
        params = [txData.type, txData.amount, txData.category, txData.description, userId];
      }
      
      const { rows } = await db.query(query, params);
      
      const created = rows[0];

      // Get updated balance
      const allTimeRes = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE user_id = $1
      `, [userId]);
      const allTime = allTimeRes.rows[0];
      const balance = Number(allTime.total_income) - Number(allTime.total_expenses);

      replyMessage = `✅ Logged ${created.type === 'income' ? '+' : '-'}${formatter.format(created.amount)} for ${created.category}\n` +
                     `💰 Current Balance: ${formatter.format(balance)}`;
    }

    res.json({ reply: replyMessage });
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
