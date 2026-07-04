import { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt, WhatsappLogo } from '@phosphor-icons/react';

const initialMessages = [
  {
    id: 1, from: 'bot',
    text: 'Hi! Kirim pesan untuk catat pengeluaran atau pemasukan. Contoh: "beli kopi 35rb" atau "gaji 5jt".',
    time: '08:00',
  },
  { id: 2, from: 'user', text: 'beli kopi 35rb',                        time: '08:01' },
  { id: 3, from: 'bot',  text: 'Tercatat\nKopi  Rp 35,000\nKategori: Food\nSaldo: Rp 4,285,000', time: '08:01' },
  { id: 4, from: 'user', text: 'grab ke kantor 25000',                   time: '08:15' },
  { id: 5, from: 'bot',  text: 'Tercatat\nGrab  Rp 25,000\nKategori: Transport\nSaldo: Rp 4,260,000', time: '08:15' },
  { id: 6, from: 'user', text: 'berapa pengeluaran hari ini?',            time: '12:00' },
  {
    id: 7, from: 'bot',
    text: 'Pengeluaran hari ini:\n\nFood      Rp 35,000\nTransport  Rp 25,000\n\nTotal  Rp 60,000',
    time: '12:00',
  },
];

function botReply(input) {
  const lower = input.toLowerCase();
  const amt   = input.match(/(\d[\d.,]*)\s*(rb|ribu|k|jt|juta)?/i);

  if (lower.includes('berapa') || lower.includes('saldo')) {
    return 'Saldo kamu:\n\nBalance    Rp 4,250,000\nIncome     Rp 7,500,000\nExpenses   Rp 3,250,000';
  }
  if (lower.includes('hari ini') || lower.includes('today')) {
    return 'Hari ini:\n\nFood       Rp 80,000\nTransport  Rp 25,000\n\nTotal      Rp 105,000';
  }
  if (lower.includes('bantuan') || lower.includes('help')) {
    return 'Bisa bantu:\n\n"beli nasi 25rb"       catat pengeluaran\n"terima gaji 5jt"     catat pemasukan\n"berapa saldo?"        cek saldo\n"pengeluaran hari ini" ringkasan harian';
  }
  if (amt) {
    let amount = parseFloat(amt[1].replace(',', ''));
    const unit = (amt[2] || '').toLowerCase();
    if (['rb', 'ribu', 'k'].includes(unit)) amount *= 1000;
    if (['jt', 'juta'].includes(unit))      amount *= 1000000;
    const fmt = new Intl.NumberFormat('id-ID').format;
    return `Tercatat\nPengeluaran  Rp ${fmt(amount)}\nKategori: Other\nSaldo: Rp ${fmt(4250000 - amount)}`;
  }
  return 'Tidak dimengerti. Coba ketik "bantuan".';
}

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input,    setInput]    = useState('');
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(),     from: 'user', text: input.trim(), time: now },
      { id: Date.now() + 1, from: 'bot',  text: botReply(input.trim()), time: now },
    ]);
    setInput('');
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <WhatsappLogo size={15} weight="fill" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>ExpenseBot</p>
          <p className="text-[11px]" style={{ color: 'var(--accent)' }}>Online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
        style={{ background: 'var(--bg)' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[72%] px-3.5 py-2.5 text-[13px] whitespace-pre-line leading-relaxed"
              style={{
                borderRadius: msg.from === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.from === 'user'
                  ? 'rgba(34,197,94,0.18)'
                  : 'var(--bg-card)',
                border: '1px solid',
                borderColor: msg.from === 'user'
                  ? 'rgba(34,197,94,0.25)'
                  : 'var(--border)',
                color: 'var(--text-primary)',
                fontFamily: msg.from === 'bot' ? 'Geist Mono, monospace' : 'Geist, sans-serif',
                fontSize: msg.from === 'bot' ? '12px' : '13px',
              }}
            >
              {msg.text}
              <p
                className="text-right mt-1"
                style={{ fontSize: '10px', color: 'var(--text-subtle)' }}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder='Coba "beli makan 50rb" atau "bantuan"'
          className="flex-1 resize-none text-[13px] bg-transparent outline-none"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Geist, sans-serif',
            lineHeight: '1.5',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <PaperPlaneTilt
            size={14}
            weight="fill"
            style={{ color: input.trim() ? '#fff' : 'var(--text-muted)' }}
          />
        </button>
      </div>
    </div>
  );
}
