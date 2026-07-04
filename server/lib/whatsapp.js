'use strict';

const twilio = require('twilio');

/**
 * Send a WhatsApp reply via Twilio.
 * @param {string} to   - recipient e.g. "whatsapp:+628123456789"
 * @param {string} body - message text
 */
async function sendReply(to, body) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    throw new Error(
      `Missing Twilio env vars. Got: SID=${sid ? 'ok' : 'MISSING'}, TOKEN=${token ? 'ok' : 'MISSING'}, FROM=${from ? 'ok' : 'MISSING'}`
    );
  }

  const client = twilio(sid, token);
  return client.messages.create({ from, to, body });
}

module.exports = { sendReply };
