'use strict';

async function parseWithAI(rawText) {
  const { default: OpenAI } = await import('openai').catch(() => {
    throw new Error('openai package not installed. Run: npm install openai');
  });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are a financial transaction parser for an Indonesian expense tracker.
Extract structured data from WhatsApp messages.

Return ONLY valid JSON in one of these formats:

For logging expense/income:
{"intent":"log_expense","type":"expense","amount":50000,"category":"Food","description":"original message"}
{"intent":"log_income","type":"income","amount":5000000,"category":"Salary","description":"original message"}

For queries:
{"intent":"query_balance"}
{"intent":"query_today"}
{"intent":"query_month"}
{"intent":"delete_last"}
{"intent":"help"}
{"intent":"unknown"}

Categories: Food, Transport, Shopping, Bills, Entertainment, Salary, Other
Amount is always in IDR integer (50rb=50000, 5jt=5000000).
Detect intent and category from natural language, including Indonesian slang.`;

  const response = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: rawText }],
    temperature: 0,
    max_tokens:  150,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '{}';
  return JSON.parse(raw);
}

module.exports = { parseWithAI };
