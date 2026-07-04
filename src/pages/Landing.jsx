import { Link, useNavigate } from 'react-router-dom';
import { Wallet, WhatsappLogo, ChartPieSlice, ShieldCheck, ArrowRight, Play } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { startDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    startDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navbar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-md">
            <Wallet size={16} weight="fill" className="text-zinc-300" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Dompet</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={handleDemo} className="text-[13px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
            Live Demo
          </button>
          <Link to="/login" className="text-[13px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
            Sign in
          </Link>
          <Link to="/login" className="text-[13px] font-medium bg-zinc-100 text-black px-4 py-2 rounded-md hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-zinc-300 mb-8 uppercase tracking-widest backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Now native on WhatsApp
            </div>
            
            <h1 className="text-[40px] md:text-[72px] font-medium tracking-[-0.04em] mb-6 max-w-4xl mx-auto leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              Track your wealth at the <br className="hidden md:block"/> speed of thought.
            </h1>
            
            <p className="text-[15px] md:text-[17px] text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
              No bloated apps, no friction. Just send a chat message like <span className="text-zinc-200 font-medium">"Makan 50k"</span> and our intelligent engine handles the rest.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/login" className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-black font-medium px-8 py-3.5 rounded-lg text-[14px] transition-all group w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Start Tracking Free
                <ArrowRight weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button onClick={handleDemo} className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium px-8 py-3.5 rounded-lg text-[14px] transition-all w-full sm:w-auto">
                <Play weight="fill" />
                Preview Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="px-6 py-24 bg-[#050505] border-t border-white/[0.04] relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-2xl font-medium tracking-tight mb-2">Engineered for speed.</h2>
              <p className="text-zinc-500 text-sm">Everything you need to manage finances, stripped of complexity.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.04] p-8 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-16">
                  <WhatsappLogo size={20} weight="duotone" className="text-zinc-300" />
                </div>
                <h3 className="text-[15px] font-medium mb-2 text-zinc-100">WhatsApp Native</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  Log your daily spending seamlessly without leaving the chat app you already use every day.
                </p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/[0.04] p-8 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-16">
                  <ChartPieSlice size={20} weight="duotone" className="text-zinc-300" />
                </div>
                <h3 className="text-[15px] font-medium mb-2 text-zinc-100">Absolute Clarity</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  Log in to the web dashboard for a bird's-eye view of your financial health with interactive, zero-lag charts.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.04] p-8 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-16">
                  <ShieldCheck size={20} weight="duotone" className="text-zinc-300" />
                </div>
                <h3 className="text-[15px] font-medium mb-2 text-zinc-100">Private by Design</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  Enterprise-grade multi-tenant architecture ensures your financial data is isolated and strictly yours.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.04] flex items-center justify-between text-zinc-600 text-[11px] font-medium uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Dompet.</p>
        <p>Built with precision.</p>
      </footer>
    </div>
  );
}
