import { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt, WhatsappLogo } from '@phosphor-icons/react';
import { api } from '../lib/api';

const initialMessages = [
  {
    id: 1, from: 'bot',
    text: 'Hi! Kirim pesan untuk catat pengeluaran atau pemasukan. Contoh: "beli kopi 35rb" atau "bantuan".',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  }
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'user', text, time: now },
    ]);
    
    setInput('');
    setLoading(true);

    try {
      // Call backend brain
      const res = await api.sendChat(text);
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), from: 'bot', text: res.reply, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), from: 'bot', text: "❌ Connection error. Is the server running?", time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
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

        <a 
          href="https://wa.me/14155238886" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors rounded-full text-[12px] font-medium flex items-center gap-1.5 border border-[#25D366]/20"
        >
          <WhatsappLogo size={14} weight="fill" />
          <span className="hidden sm:inline">Open in WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
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
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder='Coba "beli makan 50rb" atau "bantuan"'
          className="flex-1 resize-none text-[13px] outline-none px-3 py-2.5 rounded-lg transition-colors focus:border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'Geist, sans-serif',
            lineHeight: '1.5',
          }}
        />
        <button
          type="submit"
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
      </form>
    </div>
  );
}
