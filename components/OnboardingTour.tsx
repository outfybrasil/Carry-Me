
import React from 'react';
import { CheckCircle, ArrowRight, User, ShieldCheck, Coins, Camera, ListTodo, ShoppingBag, Swords, Terminal, Target } from 'lucide-react';

interface OnboardingTourProps {
  step: number;
  onNext: () => void;
  onNavigate: (page: string) => void;
  currentPage?: string;
  tasks?: {
    avatar: boolean;
    shop: boolean;
    match: boolean;
  };
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ step, onNext, onNavigate, currentPage, tasks }) => {
  if (step === 0) return null;

  if (step === 2) {
    const remaining = [!tasks?.avatar, !tasks?.shop, !tasks?.match].filter(Boolean).length;

    return (
      <div className="fixed bottom-10 right-10 z-[100] max-w-sm w-full bg-[#121417] border border-[#ffb800]/50 rounded-sm p-8 shadow-2xl animate-in slide-in-from-right-10 duration-700 noise-bg cursor-default">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-tactical font-black text-white text-lg uppercase italic tracking-tighter flex items-center gap-4">
              <Terminal size={18} className="text-[#ffb800]" /> OBJETIVOS_ATIVOS
            </h3>
            <span className="font-mono font-black text-[#ffb800] text-xs bg-[#ffb800]/10 px-2 py-0.5 rounded-sm">{3 - remaining}/3</span>
          </div>

          <div className="space-y-4">
            {[
              { id: 'profile', label: 'ACT_MOD_AVATAR', done: tasks?.avatar, icon: Camera },
              { id: 'shop', label: 'SCAN_MERCADO', done: tasks?.shop, icon: ShoppingBag },
              { id: 'match', label: 'DEPLOY_RADAR', done: tasks?.match, icon: Swords }
            ].map(task => (
              <button
                key={task.id}
                onClick={() => onNavigate(task.id)}
                className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all font-mono font-black text-[10px] uppercase tracking-widest ${task.done
                  ? 'bg-green-500/5 border-green-500/20 text-green-500/40 line-through'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:border-[#ffb800]/30 hover:text-white'}`}
              >
                <span className="flex items-center gap-4">
                  <task.icon size={14} className={task.done ? 'text-green-500/20' : 'text-[#ffb800]'} />
                  {task.label}
                </span>
                {task.done && <CheckCircle size={14} />}
              </button>
            ))}
          </div>
          <div className="pt-2 text-[8px] font-mono font-bold text-slate-800 uppercase tracking-widest">SISTEMA_DE_SINALIZACAO_HUD_A1</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-xl w-full bg-[#121417] border border-white/10 rounded-sm shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 noise-bg grid-bg scanline">

        <div className="h-1.5 w-full bg-white/5">
          <div
            className="h-full bg-[#ffb800] transition-all duration-1000 shadow-[0_0_15px_#ffb800]"
            style={{ width: step === 1 ? '10%' : step === 3 ? '100%' : '50%' }}
          ></div>
        </div>

        <div className="p-12 text-center">

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-[#ffb800]/10 rounded-sm flex items-center justify-center mx-auto mb-10 border border-[#ffb800]/20 shadow-2xl">
                <ShieldCheck size={48} className="text-[#ffb800]" />
              </div>
              <h2 className="text-4xl font-tactical font-black text-white mb-6 uppercase italic tracking-tighter">BEM-VINDO_AO_TERMINAL</h2>
              <p className="text-slate-600 font-mono font-bold text-sm mb-12 leading-relaxed uppercase tracking-widest">
                ESTE NÃO É APENAS MAIS UM CORE DE MATCHMAKING. AQUI, SUA <strong className="text-white">REPUTACAO</strong> É SEU ATRIBUTO MAIS CRÍTICO.
              </p>
              <button
                onClick={onNext}
                className="w-full py-5 bg-[#ffb800] text-black font-tactical font-black text-xl uppercase italic tracking-widest hover:bg-[#ffc933] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
              >
                INICIAR_CALIBRACAO <ArrowRight size={22} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in duration-700 flex flex-col items-center">
              <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 bg-[#ffb800] blur-3xl opacity-10 rounded-full animate-pulse"></div>
                <div className="w-full h-full bg-black/60 rounded-sm border-2 border-[#ffb800] flex items-center justify-center relative z-10 shadow-2xl">
                  <Coins size={48} className="text-[#ffb800] drop-shadow-[0_0_15px_#ffb800]" />
                </div>
              </div>

              <h2 className="text-4xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">PROTOCOLO_CONCLUIDO</h2>
              <p className="text-[#ffb800] font-mono font-black text-lg mb-8 uppercase tracking-[0.2em] animate-pulse">+500_CREDITOS_SINCRIZADOS</p>

              <p className="text-slate-700 font-mono font-bold text-xs mb-12 uppercase tracking-widest max-w-sm leading-relaxed">
                SALDO DISPONIBILIZADO PARA AQUISIÇÃO DE MODS OU CONTRATAÇÃO DE SHERPAS. MANTENHA O ALTO_NIVEL.
              </p>

              <button
                onClick={onNext}
                className="w-full py-5 bg-[#ffb800] text-black font-tactical font-black text-xl uppercase italic tracking-widest hover:bg-[#ffc933] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
              >
                <CheckCircle size={22} /> ACESSAR_ECOSSISTEMA
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
