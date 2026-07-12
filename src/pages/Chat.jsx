import { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt, TelegramLogo } from '@phosphor-icons/react';
import { api } from '../lib/api';

const initialMessages = [
  {
    id: 1, from: 'bot',
    text: 'Halo! Saya DompetBot. Saya bisa bantu catat pengeluaran dan pemasukan kamu dari sini atau langsung dari Telegram.',
    time: '09:00',
  },
  {
    id: 2, from: 'bot',
    text: 'Coba ketik:\n"beli kopi 35rb"\n"gaji masuk 10jt"\n"bantuan"',
    time: '09:00',
  },
  {
    id: 3, from: 'user',
    text: 'beli kopi 35rb',
    time: '10:15',
  },
  {
    id: 4, from: 'bot',
    text: '✅ Dicatat!\n\nKategori: Food\nJumlah: Rp 35.000\nSisa budget Food: Rp 465.000',
    time: '10:15',
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
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'user', text, time: now },
    ]);
    
    setInput('');
    setLoading(true);

    try {
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
    <div className="flex justify-center pb-20 pt-6">
      <div
        className="w-full max-w-[500px] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative"
        style={{ height: 'calc(100vh - 180px)', minHeight: '600px', background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}
      >
        
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-10"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <TelegramLogo size={20} weight="duotone" className="text-blue-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2px] border-[var(--bg-card)]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>DompetBot</p>
              <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Online</p>
            </div>
          </div>

          <a 
            href="https://t.me/DompetDashBot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-transparent transition-all hover:bg-white/5"
            title="Open in Telegram"
          >
            <TelegramLogo size={20} style={{ color: 'var(--text-muted)' }} />
          </a>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-5 py-6 space-y-4"
          style={{ background: 'var(--bg-canvas)' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div
                  className="px-4 py-3 text-[14px] whitespace-pre-line leading-relaxed shadow-sm"
                  style={{
                    borderRadius: msg.from === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    background: msg.from === 'user'
                      ? 'var(--accent-muted)'
                      : 'var(--bg-elevated)',
                    border: '1px solid',
                    borderColor: msg.from === 'user'
                      ? 'var(--border-strong)'
                      : 'var(--border)',
                    color: msg.from === 'user' ? 'var(--accent)' : 'var(--text-primary)',
                    fontFamily: msg.from === 'bot' && msg.text.includes('Rp') ? 'var(--font-mono)' : 'inherit',
                  }}
                >
                  {msg.text}
                </div>
                <span 
                  className={`text-[10px] font-mono tracking-wide px-1 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-subtle)' }}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-[18px_18px_18px_4px] flex items-center gap-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-end gap-3 px-4 py-4 flex-shrink-0 z-10"
          style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
        >
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="e.g. beli makan 50rb..."
              className="w-full resize-none text-[14px] outline-none px-4 py-3.5 pr-12 rounded-2xl transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
            style={{
              background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              opacity: input.trim() ? 1 : 0.5,
              cursor: input.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <PaperPlaneTilt
              size={20}
              weight={input.trim() ? "fill" : "duotone"}
              style={{ color: input.trim() ? '#fff' : 'var(--text-muted)' }}
            />
          </button>
        </form>
      </div>
    </div>
  );
}
