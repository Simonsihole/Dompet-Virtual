'use strict';

const { parseWithRegex, parseAmount, detectCategory } = require('./regexParser');
const { parseWithAI } = require('./aiParser');

// ─────────────────────────────────────────────────────────────────────────────
// PARSER MODE SWITCH
// Set PARSER_MODE=regex (default) or PARSER_MODE=ai in .env
// When PARSER_MODE=ai, also set OPENAI_API_KEY=sk-...
// ─────────────────────────────────────────────────────────────────────────────

const MODE = (process.env.PARSER_MODE || 'regex').toLowerCase();

async function parse(rawText) {
  if (!rawText || typeof rawText !== 'string') return { intent: 'unknown' };

  try {
    if (MODE === 'ai') {
      console.log('[parser] using AI mode');
      return await parseWithAI(rawText);
    }
    return parseWithRegex(rawText);
  } catch (err) {
    console.error('[parser] error, falling back to regex:', err.message);
    return parseWithRegex(rawText);
  }
}

module.exports = { parse, parseAmount, detectCategory };
