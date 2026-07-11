const express = require('express');
const db      = require('../db');
const { parse: parseMessage } = require('../lib/parser');

const router = express.Router();
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8935944571:AAG3nTb1eOhMYFZZv3KyRGy6dYi9qsREEO4';

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
  } catch (err) {
    console.error('Failed to send Telegram msg:', err);
  }
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Look up user by telegram chat ID
    const { rows: profileRows } = await db.query('SELECT user_id FROM profiles WHERE phone_number = $1', [chatId]);
    
    if (profileRows.length === 0) {
      if (text === '/start') {
        await sendTelegramMessage(chatId, `👋 *Welcome to Dompet Expense Tracker!*\n\nTo link this bot to your account, please copy the ID below and paste it into the Telegram Integration section in your Dompet Settings page.\n\nYour Telegram ID: \`${chatId}\``);
      } else {
        await sendTelegramMessage(chatId, `❌ This chat is not linked to any Dompet account.\n\nPlease log in to Dompet, go to Settings, and link your account using this ID: \`${chatId}\``);
      }
      return res.sendStatus(200);
    }
    
    const userId = profileRows[0].user_id;

    if (text === '/start') {
       await sendTelegramMessage(chatId, '✅ Your account is fully linked! You can now send me expenses like "Makan 50k" or "Gaji 5jt"!');
       return res.sendStatus(200);
    }

    const txData = await parseMessage(text);
    let replyMessage = '';
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

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

      const allTimeRes = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE user_id = $1
      `, [userId]);
      const allTime = allTimeRes.rows[0];
      const balance = Number(allTime.total_income) - Number(allTime.total_expenses);

      await db.query(`
        INSERT INTO notifications (type, title, body, user_id)
        VALUES ('success', 'New Telegram Transaction', $1, $2)
      `, [`Logged ${formatter.format(created.amount)} for ${created.category}`, userId]);

      replyMessage = `✅ Logged ${created.type === 'income' ? '+' : '-'}${formatter.format(created.amount)} for ${created.category}\n` +
                     `💰 Current Balance: ${formatter.format(balance)}`;
    }

    await sendTelegramMessage(chatId, replyMessage);

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook Error:', err);
    res.sendStatus(200);
  }
});

module.exports = router;
