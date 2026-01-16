
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Users, Gamepad2, GraduationCap, ChevronRight, Star, Loader2, PlayCircle } from 'lucide-react';
import { api } from '../services/api';

interface LandingPageProps {
  onGetStarted: () => void;
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
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden selection:bg-brand-cyan selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-60"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#020202]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-display font-bold text-2xl shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              C
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Carry<span className="text-brand-cyan">Me</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block"
            >
              Login
            </button>
            <button 
              onClick={onGetStarted}
              className="group relative px-6 py-2.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
              <span className="relative flex items-center gap-2">Criar Conta <ChevronRight size={14}/></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-brand-cyan text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-brand-cyan/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            Matchmaking v2.0
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Jogue Sem <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-accent to-brand-cyan animate-gradient-x">Toxicidade</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-light">
            A primeira plataforma onde sua <strong className="text-white">reputação</strong> define seu time. Encontre jogadores verificados e suba de elo com respeito.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-brand-purple hover:bg-brand-purple/90 text-white text-lg font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center gap-3 transform hover:scale-105 hover:-translate-y-1"
            >
              <Gamepad2 className="fill-current" />
              Encontrar Partida
            </button>
            <button 
              onClick={scrollToFeatures}
              className="px-8 py-4 glass-button text-white text-lg font-medium rounded-xl transition-all hover:bg-white/10 flex items-center gap-2"
            >
              <PlayCircle size={20} />
              Como Funciona
            </button>
          </div>

          {/* Stats Bar (Glass) */}
          <div className="mt-20 glass-panel rounded-2xl p-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 backdrop-blur-2xl">
             <div className="text-center">
                <div className="text-3xl font-display font-bold text-white mb-1">
                  {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : formatNumber(stats.users)}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Jogadores</div>
             </div>
             <div className="text-center border-l border-white/5">
                <div className="text-3xl font-display font-bold text-white mb-1">
                   {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : formatNumber(stats.matches)}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Partidas</div>
             </div>
             <div className="text-center border-l border-white/5">
                <div className="text-3xl font-display font-bold text-white mb-1">
                   {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : stats.sherpas}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Mentores</div>
             </div>
             <div className="text-center border-l border-white/5">
                <div className="text-3xl font-display font-bold text-brand-cyan mb-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                   {loadingStats ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mx-auto"></div> : '4.9'}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Qualidade</div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
             <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">O Ecossistema <span className="text-brand-purple">CarryMe</span></h2>
                <p className="text-slate-400 max-w-xl text-lg">Tecnologia e psicologia aplicadas para criar a melhor experiência competitiva.</p>
             </div>
             <div className="w-32 h-1 bg-gradient-to-r from-brand-purple to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group border-t border-white/10">
              <div className="w-16 h-16 bg-brand-purple/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-brand-purple/30">
                <ShieldCheck className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Reputação Real</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Nosso algoritmo analisa reports e elogios para criar um Score de comportamento único. Jogadores tóxicos são isolados automaticamente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group border-t border-white/10">
              <div className="w-16 h-16 bg-brand-cyan/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-brand-cyan/30">
                <Users className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vibe Matchmaking</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Não misture objetivos. Selecione <strong>Tryhard</strong> para subir de elo ou <strong>Chill</strong> para se divertir sem pressão.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group border-t border-white/10">
              <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-brand-accent/30">
                <GraduationCap className="w-8 h-8 text-brand-accent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sherpa Market</h3>
              <p className="text-slate-400 leading-relaxed font-light">
                O marketplace de conhecimento. Contrate jogadores de alto nível para analisar suas partidas e te ensinar a carregar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lobby Visual */}
      <div className="py-20 relative overflow-hidden bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1 order-2 md:order-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold mb-6 border border-green-500/20">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Lobby Ativo
             </div>
             <h2 className="text-4xl font-bold mb-6">Pré-Visualização de Squad</h2>
             <p className="text-slate-400 text-lg mb-8 font-light">
               Diferente da fila solo, aqui você vê quem entra. Analise o perfil, as badges e o histórico antes de aceitar a partida.
             </p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                   <div className="bg-white/10 p-2 rounded-lg"><Zap size={20}/></div>
                   <span className="font-medium">Sem Trolls</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                   <div className="bg-white/10 p-2 rounded-lg"><Gamepad2 size={20}/></div>
                   <span className="font-medium">Voice Chat</span>
                </div>
             </div>
           </div>
           
           {/* Card 3D Effect */}
           <div className="flex-1 relative order-1 md:order-2 perspective-1000">
              <div className="absolute inset-0 bg-brand-purple blur-[100px] opacity-20"></div>
              <div className="glass-panel rounded-2xl p-6 relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-700 shadow-2xl border-t border-white/20">
                 <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h3 className="font-bold text-white text-lg">Ranked Flex</h3>
                        <span className="text-xs text-brand-cyan uppercase tracking-wider">Tryhard Vibe</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded font-mono">4/5</span>
                 </div>
                 <div className="space-y-3">
                    {[1,2,3,4].map((i) => (
                       <div key={i} className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/5 hover:border-brand-purple/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+55}`} alt="avatar" />
                          </div>
                          <div className="flex-1">
                             <div className="h-2 w-20 bg-white/20 rounded mb-2"></div>
                             <div className="h-1.5 w-10 bg-white/10 rounded"></div>
                          </div>
                          <div className="text-green-400 text-xs font-bold tracking-wider">READY</div>
                       </div>
                    ))}
                    <div className="flex items-center justify-center p-4 border border-dashed border-white/20 rounded-xl text-slate-500 bg-white/[0.02]">
                       <div className="animate-pulse flex items-center gap-2 text-sm">
                           <Loader2 className="animate-spin" size={14} /> Aguardando...
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 text-center text-slate-600 text-sm border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-50 hover:opacity-100 transition-opacity">
               <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-bold text-xs">O</div>
               <span className="font-bold">Outfy &copy; 2026</span>
            </div>
            <div className="flex gap-6">
                <button onClick={onViewTerms} className="hover:text-white transition-colors">Termos</button>
                <button onClick={onViewPrivacy} className="hover:text-white transition-colors">Privacidade</button>
                <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
