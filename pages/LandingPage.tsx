
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Users, Gamepad2, GraduationCap, ChevronRight, Star, Loader2, PlayCircle, Crosshair, Target, Terminal, Shield, Cpu } from 'lucide-react';
import { api } from '../services/api';

interface LandingPageProps {
  onGetStarted: (view?: 'LOGIN' | 'REGISTER') => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewTerms, onViewPrivacy }) => {
  const [stats, setStats] = useState({
    users: 0,
    matches: 0,
    sherpas: 0,
    satisfaction: 5.0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getLandingStats();
      setStats(data);
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k+';
    }
    return num;
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white overflow-x-hidden selection:bg-[#ffb800] selection:text-black noise-bg grid-bg scanline">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#ffb800]/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0b0d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 bg-[#ffb800] text-black rounded-sm flex items-center justify-center font-tactical font-black text-2xl italic shadow-[0_0_20px_rgba(255,184,0,0.3)] group-hover:scale-110 transition-transform">
              C
            </div>
            <span className="font-tactical font-black text-2xl tracking-tighter uppercase italic">Carry<span className="text-[#ffb800]">Me</span></span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onGetStarted('LOGIN')}
              className="text-[10px] font-mono font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all hidden md:block"
            >
              LOGIN TERMINAL
            </button>
            <button
              onClick={() => onGetStarted('REGISTER')}
              className="px-8 py-3 bg-white/5 border border-white/10 hover:border-[#ffb800]/50 text-white font-tactical font-black text-xs uppercase italic tracking-widest rounded-sm transition-all hover:bg-white/10 flex items-center gap-3"
            >
              CRIAR IDENTIDADE <ChevronRight size={14} className="text-[#ffb800]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-sm bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] text-[10px] font-mono font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb800] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb800]"></span>
            </span>
            SISTEMA DE PAREAMENTO TÁTICO v4.0 // CS2 EXCLUSIVE
          </div>

          <h1 className="text-6xl md:text-9xl font-tactical font-black tracking-tighter mb-10 leading-[0.85] uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            A ELITE DO <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffb800] to-white bg-[length:200%_auto] animate-gradient-x pr-4">SERVIDOR</span>
          </h1>

          <p className="text-base md:text-xl text-slate-500 mb-14 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 font-mono font-bold uppercase tracking-wider">
            A única plataforma onde sua <strong className="text-white">reputação tática</strong> define quem entra no seu esquadrão. Jogue CS2 com operadores de elite, sem toxicidade.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button
              onClick={() => onGetStarted('LOGIN')}
              className="px-12 py-6 bg-[#ffb800] hover:bg-[#ffc933] text-black text-xl font-tactical font-black uppercase italic tracking-widest rounded-sm transition-all shadow-[0_10px_40px_rgba(255,184,0,0.2)] flex items-center gap-4 transform active:scale-95"
            >
              <Gamepad2 size={24} />
              INICIAR OPERAÇÃO
            </button>
            <button
              onClick={scrollToFeatures}
              className="px-10 py-6 bg-white/5 border border-white/10 text-white text-xl font-tactical font-black uppercase italic tracking-widest rounded-sm transition-all hover:bg-white/10 flex items-center gap-3"
            >
              <Terminal size={20} />
              MANUAL TÁTICO
            </button>
          </div>

          {/* Stats Bar (Tactical) */}
          <div className="mt-32 border border-white/5 bg-[#121417]/80 backdrop-blur-md rounded-sm p-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="text-center relative group">
              <div className="absolute -inset-4 bg-[#ffb800]/5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl font-mono font-black text-white mb-2 tracking-tighter">
                {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : formatNumber(stats.users)}
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black font-mono">OPERADORES ATIVOS</div>
            </div>
            <div className="text-center border-l border-white/5 relative group">
              <div className="absolute -inset-4 bg-[#ffb800]/5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl font-mono font-black text-white mb-2 tracking-tighter">
                {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : formatNumber(stats.matches)}
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black font-mono">CONFLITOS SYNC</div>
            </div>
            <div className="text-center border-l border-white/5 relative group">
              <div className="absolute -inset-4 bg-[#ffb800]/5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl font-mono font-black text-white mb-2 tracking-tighter">
                {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : stats.sherpas}
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black font-mono">INSTRUTORES PRO</div>
            </div>
            <div className="text-center border-l border-white/5 relative group">
              <div className="absolute -inset-4 bg-[#ffb800]/5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl font-mono font-black text-[#ffb800] mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,184,0,0.3)]">
                {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : stats.satisfaction.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black font-mono">ÍNDICE DE RESPEITO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-40 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-tactical font-black mb-6 uppercase italic tracking-tighter">PROTOCOLO <span className="text-[#ffb800]">OPERACIONAL</span></h2>
              <p className="text-slate-500 text-lg font-mono font-bold uppercase tracking-widest leading-relaxed">Arquitetura desenvolvida para transformar sua experiência competitiva no CS2.</p>
            </div>
            <div className="w-full md:w-48 h-[1px] bg-gradient-to-r from-[#ffb800] to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#121417] p-10 rounded-sm border border-white/5 hover:border-[#ffb800]/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity"><ShieldCheck size={120} /></div>
              <div className="w-16 h-16 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-sm flex items-center justify-center mb-10 group-hover:bg-[#ffb800] group-hover:text-black transition-all">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-tactical font-black text-white mb-6 uppercase italic tracking-tight group-hover:text-[#ffb800] transition-colors">DNA REPUTAÇÃO</h3>
              <p className="text-slate-500 leading-relaxed font-mono font-bold text-[11px] uppercase tracking-widest">
                Seu comportamento dita seu destino. O Trust Score analisa cada assistência e report, garantindo que você jogue apenas com quem respeita o esporte.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#121417] p-10 rounded-sm border border-white/5 hover:border-[#ffb800]/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity"><Crosshair size={120} /></div>
              <div className="w-16 h-16 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-sm flex items-center justify-center mb-10 group-hover:bg-[#ffb800] group-hover:text-black transition-all">
                <Crosshair size={32} />
              </div>
              <h3 className="text-2xl font-tactical font-black text-white mb-6 uppercase italic tracking-tight group-hover:text-[#ffb800] transition-colors">MÓDULOS DE COMBATE</h3>
              <p className="text-slate-500 leading-relaxed font-mono font-bold text-[11px] uppercase tracking-widest">
                Escolha sua diretriz: <strong>Tryhard</strong> para otimizar ELO, ou <strong>Casual</strong> para networking e chill. O sistema ajusta o pareamento automaticamente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#121417] p-10 rounded-sm border border-white/5 hover:border-[#ffb800]/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity"><Target size={120} /></div>
              <div className="w-16 h-16 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-sm flex items-center justify-center mb-10 group-hover:bg-[#ffb800] group-hover:text-black transition-all">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-tactical font-black text-white mb-6 uppercase italic tracking-tight group-hover:text-[#ffb800] transition-colors">ACADEMIA ELITE</h3>
              <p className="text-slate-500 leading-relaxed font-mono font-bold text-[11px] uppercase tracking-widest">
                Acesso direto a instrutores verificados para análise de demos. Domine lineups e micro-movimentação com mentorias táticas personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lobby Visual */}
      <div className="py-40 relative overflow-hidden bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-24">
          <div className="flex-1 order-2 md:order-1">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-sm text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              SISTEMA OPERACIONAL ATIVO
            </div>
            <h2 className="text-4xl md:text-5xl font-tactical font-black mb-8 uppercase italic tracking-tighter leading-none">DOMÍNIO TOTAL DO <br /> SEU <span className="text-[#ffb800]">LOBBY</span></h2>
            <p className="text-slate-500 text-lg mb-12 font-mono font-bold uppercase tracking-widest leading-relaxed">
              Diferente de filas genéricas, aqui você é o comandante. Visualize a patente real, trust score e o DNA competitivo dos operadores antes de iniciar.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#121417] p-6 rounded-sm border border-white/5 flex items-center gap-4 group hover:border-[#ffb800]/30 transition-all">
                <div className="bg-[#ffb800]/10 p-3 rounded-sm text-[#ffb800] group-hover:bg-[#ffb800] group-hover:text-black transition-all"><Shield size={20} /></div>
                <span className="font-tactical font-black text-xs uppercase italic tracking-widest text-white">ANTI TROLL SHIELD</span>
              </div>
              <div className="bg-[#121417] p-6 rounded-sm border border-white/5 flex items-center gap-4 group hover:border-[#ffb800]/30 transition-all">
                <div className="bg-[#ffb800]/10 p-3 rounded-sm text-[#ffb800] group-hover:bg-[#ffb800] group-hover:text-black transition-all"><Cpu size={20} /></div>
                <span className="font-tactical font-black text-xs uppercase italic tracking-widest text-white">LOW LATENCY SYNC</span>
              </div>
            </div>
          </div>

          {/* Card 3D Effect */}
          <div className="flex-1 relative order-1 md:order-2 perspective-1000">
            <div className="absolute inset-0 bg-[#ffb800]/10 blur-[120px] opacity-20 animate-pulse"></div>
            <div className="bg-[#121417] rounded-sm p-8 relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-1000 shadow-2xl border border-white/10 group">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="font-tactical font-black text-xl text-white uppercase italic tracking-tighter">CENTRAL DE COMANDO</h3>
                  <span className="text-[10px] text-[#ffb800] font-mono font-black uppercase tracking-[0.3em]">MIRAGE // COMPETITIVE DEPLOYMENT</span>
                </div>
                <div className="bg-black/40 px-3 py-1.5 border border-white/5 rounded-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-mono font-bold text-white">4/5 SYNC</span>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-sm border border-white/5 group-hover:border-[#ffb800]/20 transition-all">
                    <div className="relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 99}`} className="w-12 h-12 rounded-sm border border-white/10 grayscale group-hover:grayscale-0 transition-all" alt="avatar" />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#121417] rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-white/10 rounded-sm mb-2 group-hover:bg-[#ffb800]/20 transition-all"></div>
                      <div className="flex gap-1">
                        <div className="h-1 w-8 bg-white/5 rounded-full"></div>
                        <div className="h-1 w-6 bg-[#ffb800]/20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-[#ffb800] text-[9px] font-mono font-black tracking-[0.2em] uppercase border border-[#ffb800]/30 px-3 py-1 rounded-sm bg-[#ffb800]/5">READY</div>
                  </div>
                ))}
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-sm bg-white/[0.01]">
                  <div className="animate-pulse flex items-center gap-3 text-[10px] font-mono font-black text-slate-700 uppercase tracking-[0.3em]">
                    <Loader2 className="animate-spin" size={16} /> AGUARDANDO 5º OPERADOR...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0b0d] py-20 text-center text-slate-700 text-sm border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity group">
            <div className="w-10 h-10 bg-white text-black rounded-sm flex items-center justify-center font-tactical font-black text-2xl italic transition-transform group-hover:rotate-12">C</div>
            <div className="text-left">
              <span className="font-tactical font-black text-white block leading-none text-xl uppercase italic italic tracking-tighter">CARRYME</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-[0.4em] text-slate-600">VIBE OPERATIONS // 2026</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <button onClick={onViewTerms} className="hover:text-[#ffb800] transition-all font-mono font-black uppercase tracking-[0.2em] text-[10px]">TERMOS DE USO</button>
            <button onClick={onViewPrivacy} className="hover:text-[#ffb800] transition-all font-mono font-black uppercase tracking-[0.2em] text-[10px]">PRIVACIDADE</button>
            <div className="hidden md:block h-3 w-[1px] bg-white/10"></div>
            <a href="#" className="hover:text-[#ffb800] transition-all font-mono font-black uppercase tracking-[0.2em] text-[10px]">DISCORD HQ</a>
            <a href="#" className="hover:text-[#ffb800] transition-all font-mono font-black uppercase tracking-[0.2em] text-[10px]">SUPORTE</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
