
import React from 'react';
import { CheckCircle, ArrowRight, User, ShieldCheck, Coins, Camera, ListTodo, ShoppingBag, Swords } from 'lucide-react';

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

  // MINI MODE: If user is on step 2, always show checklist unless on a page that needs full attention
  // Only show mini if we are actively doing tasks
  if (step === 2) {
      const remaining = [!tasks?.avatar, !tasks?.shop, !tasks?.match].filter(Boolean).length;
      
      return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-900 border border-blue-500 rounded-xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-in slide-in-from-right duration-500">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                    <ListTodo className="text-blue-400" size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white text-lg flex justify-between">
                       Missões Iniciais
                       <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">{3 - remaining}/3</span>
                    </h3>
                    
                    <div className="mt-3 space-y-2">
                        <button onClick={() => onNavigate('profile')} className={`w-full flex items-center justify-between text-sm p-2 rounded ${tasks?.avatar ? 'text-green-400 bg-green-900/10 line-through decoration-green-500' : 'text-slate-300 hover:bg-slate-800'}`}>
                           <span className="flex items-center gap-2"><Camera size={14}/> Mudar Avatar</span>
                           {tasks?.avatar && <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => onNavigate('shop')} className={`w-full flex items-center justify-between text-sm p-2 rounded ${tasks?.shop ? 'text-green-400 bg-green-900/10 line-through decoration-green-500' : 'text-slate-300 hover:bg-slate-800'}`}>
                           <span className="flex items-center gap-2"><ShoppingBag size={14}/> Visitar Loja</span>
                           {tasks?.shop && <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => onNavigate('match')} className={`w-full flex items-center justify-between text-sm p-2 rounded ${tasks?.match ? 'text-green-400 bg-green-900/10 line-through decoration-green-500' : 'text-slate-300 hover:bg-slate-800'}`}>
                           <span className="flex items-center gap-2"><Swords size={14}/> Ver Jogar Agora</span>
                           {tasks?.match && <CheckCircle size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // FULLSCREEN MODES FOR WELCOME AND REWARD
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-brand-purple/50 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-800">
           <div 
             className="h-full bg-brand-purple transition-all duration-500" 
             style={{ width: step === 1 ? '10%' : step === 3 ? '100%' : '50%' }}
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
                 Começar Missões <ArrowRight size={18} />
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
