import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TelegramLogo, CheckCircle, Warning, Spinner, Trash, PencilSimple, SignOut, ShieldCheck, WhatsappLogo, EnvelopeSimple } from '@phosphor-icons/react';

export default function Settings() {
  const { user, isDemo, signOut } = useAuth();
  const [phone, setPhone] = useState('');
  const [currentPhone, setCurrentPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isDemo);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setCurrentPhone('123456789');
      setPhone('123456789');
      return;
    }
    
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('user_id', user.id)
          .single();
          
        if (data && data.phone_number) {
          let p = data.phone_number;
          if (p.startsWith('whatsapp:+')) p = p.replace('whatsapp:+', '');
          setCurrentPhone(p);
          setPhone(p);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchProfile();
  }, [user, isDemo]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setError('Saving integrations is disabled in Demo Mode.');
      return;
    }

    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const cleanPhone = phone.trim();
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, phone_number: cleanPhone }, { onConflict: 'user_id' });

      if (error) throw error;
      setMsg('Telegram ID linked successfully!');
      setCurrentPhone(cleanPhone);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save Telegram ID');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isDemo) {
      setError('Removing integrations is disabled in Demo Mode.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove your Telegram integration?')) return;
    
    setLoading(true);
    setMsg(null);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      setCurrentPhone(null);
      setPhone('');
      setMsg('Telegram integration removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Preferences</h1>
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Manage your account and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Integrations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Telegram Block */}
          <div className="rounded-3xl p-8 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <TelegramLogo size={24} weight="duotone" className="text-blue-400" />
              </div>
              <div className="pt-1">
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>Telegram Integration</h2>
                <p className="text-[13px] mt-1 max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Log expenses seamlessly from Telegram. Our bot parses natural language amounts and categories automatically.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border" style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.15)', color: '#f87171' }}>
                <Warning size={18} className="mt-0.5 flex-shrink-0" />
                <p className="text-[13px]">{error}</p>
              </div>
            )}

            {msg && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <p className="text-[13px]">{msg}</p>
              </div>
            )}

            {currentPhone && !isEditing ? (
              <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Connection</p>
                  </div>
                  <p className="font-mono text-[16px]" style={{ color: 'var(--text-primary)' }}>{currentPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditing(true)} className="p-2.5 rounded-lg border border-transparent transition-all hover:bg-[var(--accent-muted)] hover:border-[var(--border-strong)]" title="Edit">
                    <PencilSimple size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={handleRemove} className="p-2.5 rounded-lg border border-transparent transition-all hover:bg-red-500/10 hover:border-red-500/20 text-red-400" title="Disconnect">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-[12px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full px-4 py-3 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-mono text-[14px]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <p className="mt-3 text-[12px] leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
                    Send <b>/start</b> to <a href="https://t.me/DompetDashBot" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@DompetDashBot</a> to receive your unique Chat ID.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={loading || !phone} className="px-5 py-2.5 rounded-lg font-medium text-[13px] transition-all" style={{ background: 'var(--accent)', color: '#fff' }}>
                    {loading ? <Spinner className="animate-spin" /> : 'Connect Account'}
                  </button>
                  {currentPhone && isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setPhone(currentPhone); setError(null); }} className="px-5 py-2.5 rounded-lg font-medium text-[13px] transition-all hover:bg-[var(--accent-muted)]" style={{ color: 'var(--text-primary)' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Connected Services (Placeholder space filler) */}
          <div className="rounded-3xl p-8 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-[14px] font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Other Services</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl opacity-60 grayscale" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <WhatsappLogo size={20} className="text-green-500" />
                  <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>WhatsApp (Legacy)</span>
                </div>
                <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Deprecated</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Account Details */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase mb-6" style={{ color: 'var(--text-muted)' }}>Account Details</h2>
            
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-medium mb-1 uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>Email Address</p>
                <div className="flex items-center gap-2">
                  <EnvelopeSimple size={14} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email ?? 'demo@dompet.app'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-[11px] font-medium mb-1 uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>Plan</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Pro Tier</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-medium text-[13px] group"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <SignOut size={16} className="transition-colors group-hover:text-red-400" />
                <span className="group-hover:text-red-400 transition-colors">Log out</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
