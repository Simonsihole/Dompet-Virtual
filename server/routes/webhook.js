const express = require('express');
const db      = require('../db');
const { parse: parseWhatsAppMessage } = require('../lib/parser');

const router = express.Router();

// ── POST /api/webhook/whatsapp ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { Body, From } = req.body;
    
    if (!Body) {
      return res.status(400).send('No message body');
    }

    const txData = await parseWhatsAppMessage(Body);
    let replyMessage = '';

    if (!txData) {
      replyMessage = "Sorry, I couldn't understand that format. Try: 'Makan 25rb' or 'Gaji 5jt'";
      
      // Log notification for parsing failure
      await db.query(`
        INSERT INTO notifications (type, title, body)
        VALUES ('warning', 'Failed to parse WhatsApp message', $1)
      `, [`"${Body}" from ${From}`]);
    } else {
      const { rows } = await db.query(`
        INSERT INTO transactions (type, amount, category, description, source)
        VALUES ($1, $2, $3, $4, 'whatsapp')
        RETURNING *
      `, [txData.type, txData.amount, txData.category, txData.description]);
      
      const created = rows[0];

      // Get updated balance
      const allTimeRes = await db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
      `);
      const allTime = allTimeRes.rows[0];
      const balance = Number(allTime.total_income) - Number(allTime.total_expenses);

      // Create notification
      const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
      await db.query(`
        INSERT INTO notifications (type, title, body)
        VALUES ('success', 'New WhatsApp Transaction', $1)
      `, [`Logged ${formatter.format(created.amount)} for ${created.category}`]);

      replyMessage = `✅ Logged ${created.type === 'income' ? '+' : '-'}${formatter.format(created.amount)} for ${created.category}\n` +
                     `💰 Current Balance: ${formatter.format(balance)}`;
    }

    // Twilio TwiML response
    res.setHeader('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>${replyMessage}</Message>
      </Response>
    `);
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
