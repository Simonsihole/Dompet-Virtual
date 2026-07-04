import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ShieldCheck, Spinner, ArrowLeft } from '@phosphor-icons/react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp({ email, password });
        if (error) throw error;
        setMsg('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Top Nav (Minimal) */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-[13px] font-medium">
          <ArrowLeft size={14} weight="bold" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 opacity-50">
          <Wallet size={16} weight="fill" className="text-zinc-300" />
          <span className="font-semibold text-[14px] tracking-tight">Dompet</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[360px]">
          
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight mb-2 text-zinc-100">
              {isLogin ? 'Sign in to Dompet' : 'Create your account'}
            </h1>
            <p className="text-[14px] text-zinc-500">
              {isLogin ? 'Enter your details below to continue.' : 'Start tracking expenses seamlessly.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-[13px]">
                {error}
              </div>
            )}
            
            {msg && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-lg text-[13px]">
                {msg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl focus:border-white/20 focus:bg-white/[0.04] outline-none transition-all placeholder:text-zinc-700 text-[14px]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl focus:border-white/20 focus:bg-white/[0.04] outline-none transition-all placeholder:text-zinc-700 text-[14px]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-zinc-100 hover:bg-white text-black font-medium py-3 px-4 rounded-xl text-[14px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {loading ? <Spinner className="animate-spin" /> : <ShieldCheck weight="fill" />}
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-[13px] text-zinc-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMsg(null);
                }}
                className="text-zinc-300 hover:text-white font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
