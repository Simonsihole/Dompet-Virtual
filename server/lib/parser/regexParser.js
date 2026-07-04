'use strict';

const CATEGORY_KEYWORDS = {
  Food: [
    'makan','minum','kopi','nasi','ayam','warung','resto','restaurant','lunch','dinner',
    'breakfast','sarapan','snack','jajan','bakso','mie','soto','pizza','burger','cafe',
    'kafe','minuman','makanan','sate','gado','pecel','martabak','bubur','indomie',
    'starbucks','kfc','mcdonald','gopek','warteg','kantin','boba','milk tea',
  ],
  Transport: [
    'grab','gojek','bensin','bbm','parkir','tol','busway','ojek','taxi','transjakarta',
    'commuter','kereta','bus','motor','mobil','isi bensin','pertalite',
    'pertamax','solar','tiket','pesawat','kapal','gocar','grabcar','maxim',
  ],
  Shopping: [
    'shopee','tokopedia','lazada','baju','sepatu','celana','mall','toko','belanja',
    'jaket','tas','dompet','jam','aksesoris','hadiah','kado','amazon','tiktok shop',
    'blibli','bukalapak','pakaian','beli',
  ],
  Bills: [
    'listrik','pln','air','pdam','wifi','internet','token','tagihan','iuran',
    'cicilan','asuransi','bpjs','langganan','sewa','kontrakan','kos','angsuran',
    'pinjaman','kredit',
  ],
  Entertainment: [
    'netflix','spotify','youtube','game','steam','bioskop','nonton','konser',
    'main','hiburan','karaoke','bowling','gym','fitness','olahraga','disney',
    'hbo','prime video','vidio',
  ],
  Salary: [
    'gaji','salary','bonus','thr','freelance','proyek','project','honor','upah',
    'pendapatan','pemasukan','transfer masuk','terima uang','dapat uang',
  ],
};

const INTENT_PATTERNS = {
  query_balance: [ /saldo/i, /balance/i, /berapa (uang|duit|tabungan)/i, /cek saldo/i ],
  query_today:   [ /hari ini/i, /today/i, /pengeluaran hari/i ],
  query_month:   [ /bulan ini/i, /this month/i, /rekap/i, /laporan/i, /ringkasan/i, /summary/i ],
  delete_last:   [ /hapus (terakhir|tadi|barusan)/i, /batal/i, /undo/i, /delete last/i ],
  help:          [ /bantuan/i, /help/i, /cara pakai/i, /bisa apa/i, /contoh/i ],
};

const INCOME_KEYWORDS = [
  'gaji','salary','bonus','thr','freelance','dapat','terima','masuk',
  'transfer masuk','pendapatan','pemasukan','income',
];

function parseAmount(text) {
  const t       = text.toLowerCase();
  const pattern = /(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta|m|miliar)?/gi;
  let match;
  let best = null;

  while ((match = pattern.exec(t)) !== null) {
    const rawNum = match[1].replace(',', '.');
    let num      = 0;

    if (rawNum.includes('.')) {
      const parts = rawNum.split('.');
      if (parts[parts.length - 1].length === 3) {
        num = parseInt(rawNum.replace(/\./g, ''), 10);
      } else {
        num = parseFloat(rawNum);
      }
    } else {
      num = parseFloat(rawNum);
    }

    const unit = (match[2] || '').toLowerCase();
    if (['rb', 'ribu', 'k'].includes(unit)) num *= 1000;
    if (['jt', 'juta'].includes(unit))       num *= 1_000_000;
    if (['m', 'miliar'].includes(unit))       num *= 1_000_000_000;

    if (num > 0 && (!best || num > best)) best = num;
  }

  return best ? Math.round(best) : null;
}

function detectCategory(text, type) {
  if (type === 'income') return 'Salary';
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === 'Salary') continue;
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return 'Other';
}

function detectIntent(text) {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) return intent;
  }
  return null;
}

function isIncome(text) {
  const lower = text.toLowerCase();
  return INCOME_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseWithRegex(rawText) {
  const text   = rawText.trim();
  const amount = parseAmount(text);

  const queryIntent = detectIntent(text);
  if (queryIntent) return { intent: queryIntent };

  if (amount) {
    const type     = isIncome(text) ? 'income' : 'expense';
    const category = detectCategory(text, type);
    return {
      intent:      type === 'income' ? 'log_income' : 'log_expense',
      type, amount, category,
      description: text.length > 100 ? text.slice(0, 100) : text,
    };
  }

  return { intent: 'unknown' };
}

module.exports = { parseWithRegex, parseAmount, detectCategory };
