import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TelegramLogo, CheckCircle, Warning, Spinner, Trash, PencilSimple, SignOut } from '@phosphor-icons/react';

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
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your integrations and account.</p>
      </div>

      <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 shadow-sm max-w-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <TelegramLogo size={24} weight="duotone" />
          </div>
          <div>
            <h2 className="text-[15px] font-medium text-zinc-100">Telegram Integration</h2>
            <p className="text-[13px] text-zinc-500">Log expenses securely from Telegram.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[13px]">
            <Warning size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {msg && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[13px]">
            <CheckCircle size={18} />
            {msg}
          </div>
        )}

        {currentPhone && !isEditing ? (
          <div className="bg-black border border-white/[0.04] p-5 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[12px] font-medium text-blue-400 uppercase tracking-wider">Active</p>
              </div>
              <p className="text-zinc-200 font-mono text-lg">{currentPhone}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2.5 bg-white/[0.03] border border-white/[0.04] text-zinc-400 rounded-lg hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
                title="Edit ID"
              >
                <PencilSimple size={16} weight="bold" />
              </button>
              <button 
                onClick={handleRemove} 
                className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                title="Remove Integration"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-zinc-400 mb-2">
                Telegram Chat ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-black border border-white/[0.08] rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-zinc-700 text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-2 text-[12px] text-zinc-500">
                Send <b>/start</b> to <a href="https://t.me/DompetDashBot" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@DompetDashBot</a> to get your Chat ID.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !phone}
                className="bg-zinc-100 hover:bg-white text-black font-medium py-2.5 px-6 rounded-lg text-[14px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                {loading ? <Spinner className="animate-spin" /> : 'Save Integration'}
              </button>
              
              {currentPhone && isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPhone(currentPhone);
                    setError(null);
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-medium py-2.5 px-6 rounded-lg text-[14px] transition-all flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 shadow-sm max-w-xl">
        <h2 className="text-[15px] font-medium text-zinc-100 mb-4">Account Actions</h2>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 transition-all font-medium text-[14px]"
        >
          <SignOut size={18} weight="bold" />
          Log out of Dompet
        </button>
      </div>
    </div>
  );
}
