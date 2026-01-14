
import React from 'react';
import { CheckCircle, ArrowRight, User, ShieldCheck, Coins, Camera } from 'lucide-react';

interface OnboardingTourProps {
  step: number;
  onNext: () => void;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ step, onNext, onNavigate, currentPage }) => {
  if (step === 0) return null;

  // MINI MODE: If user is on step 2 AND already on profile page, allow interaction
  if (step === 2 && currentPage === 'profile') {
      return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-900 border border-blue-500 rounded-xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-in slide-in-from-right duration-500">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full animate-pulse">
                    <Camera className="text-blue-400" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Missão Ativa</h3>
                    <p className="text-slate-400 text-sm mb-2">Clique na sua foto de perfil para alterá-la.</p>
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Aguardando Ação...</div>
                </div>
            </div>
        </div>
      );
  }

  // DEFAULT FULLSCREEN MODE
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-brand-purple/50 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-800">
           <div 
             className="h-full bg-brand-purple transition-all duration-500" 
             style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
           ></div>
        </div>

        <div className="p-8 text-center">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-brand-purple" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-4 font-display">Bem-vindo à CarryMe</h2>
               <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                 Esta não é apenas mais uma plataforma de matchmaking. Aqui, sua <strong>reputação</strong> vale mais que seu elo.
               </p>
               <button 
                 onClick={onNext}
                 className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
               >
                 Começar <ArrowRight size={18} />
               </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
               <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User size={40} className="text-blue-400" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2 font-display">Sua Primeira Missão</h2>
               <p className="text-slate-400 text-sm mb-6">
                 Complete seu perfil para ganhar credibilidade.
               </p>
               
               <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-8 text-left flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                     1
                  </div>
                  <div>
                     <h3 className="font-bold text-white">Personalize seu Avatar</h3>
                     <p className="text-xs text-slate-400">Vá ao perfil e mude sua foto.</p>
                  </div>
               </div>

               <button 
                 onClick={() => onNavigate('profile')}
                 className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
               >
                 Ir para Perfil
               </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in duration-500">
               <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                  <div className="w-full h-full bg-slate-950 rounded-full border-4 border-yellow-500 flex items-center justify-center relative z-10">
                     <Coins size={40} className="text-yellow-500" />
                  </div>
               </div>
               
               <h2 className="text-3xl font-bold text-white mb-2 font-display">Missão Cumprida!</h2>
               <p className="text-yellow-400 font-bold text-lg mb-6">+500 CarryCoins Adicionados</p>
               
               <p className="text-slate-400 text-sm mb-8">
                 Agora você tem saldo para usar na loja ou contratar seu primeiro Sherpa. Mantenha o nível alto!
               </p>

               <button 
                 onClick={onNext}
                 className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle size={18} /> Resgatar e Explorar
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
