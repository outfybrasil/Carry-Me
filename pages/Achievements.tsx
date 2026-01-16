import React, { useState } from 'react';
import { Trophy, Gamepad2, Swords, Heart, ShieldCheck, GraduationCap, Check, Coins, Crown, Star } from 'lucide-react';
import { Player, Achievement } from '../types';
import { api } from '../services/api';

// LISTA EXPANDIDA DE CONQUISTAS
const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'ach1', title: 'Primeiros Passos', description: 'Jogue sua primeira partida.', icon: 'Gamepad2', targetValue: 1, reward: 50, statKey: 'matchesPlayed' },
  { id: 'ach2', title: 'Veterano', description: 'Complete 50 partidas.', icon: 'Swords', targetValue: 50, reward: 500, statKey: 'matchesPlayed' },
  { id: 'ach3', title: 'Lenda Viva', description: 'Complete 100 partidas.', icon: 'Trophy', targetValue: 100, reward: 1000, statKey: 'matchesPlayed' },
  { id: 'ach4', title: 'MVP', description: 'Seja o jogador mais valioso.', icon: 'Crown', targetValue: 1, reward: 100, statKey: 'mvps' },
  { id: 'ach5', title: 'Carry', description: 'Conquiste 10 MVPs.', icon: 'Crown', targetValue: 10, reward: 1000, statKey: 'mvps' },
  { id: 'ach6', title: 'Amigável', description: 'Receba 5 elogios.', icon: 'Heart', targetValue: 5, reward: 200, statKey: 'commendations' },
  { id: 'ach7', title: 'Ídolo', description: 'Receba 20 elogios.', icon: 'Heart', targetValue: 20, reward: 800, statKey: 'commendations' },
  { id: 'ach8', title: 'Mentor', description: 'Realize 1 sessão como Sherpa.', icon: 'GraduationCap', targetValue: 1, reward: 300, statKey: 'sherpaSessions' },
  { id: 'ach9', title: 'Mestre', description: 'Realize 5 sessões como Sherpa.', icon: 'GraduationCap', targetValue: 5, reward: 1500, statKey: 'sherpaSessions' },
  { id: 'ach10', title: 'Exemplar', description: 'Mantenha comportamento perfeito por 5 jogos.', icon: 'ShieldCheck', targetValue: 5, reward: 250, statKey: 'perfectBehaviorStreak' },
  { id: 'ach11', title: 'Santo', description: 'Mantenha comportamento perfeito por 20 jogos.', icon: 'ShieldCheck', targetValue: 20, reward: 1000, statKey: 'perfectBehaviorStreak' },
  { id: 'ach12', title: 'Imortal', description: 'Jogue 500 partidas.', icon: 'Star', targetValue: 500, reward: 5000, statKey: 'matchesPlayed' },
];

interface AchievementsProps {
  user: Player;
  onUpdateUser: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ user, onUpdateUser }) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2': return <Gamepad2 size={24} />;
      case 'Swords': return <Swords size={24} />;
      case 'Heart': return <Heart size={24} />;
      case 'ShieldCheck': return <ShieldCheck size={24} />;
      case 'GraduationCap': return <GraduationCap size={24} />;
      case 'Crown': return <Crown size={24} />;
      case 'Star': return <Star size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const handleClaim = async (achievement: Achievement) => {
    setClaimingId(achievement.id);
    const success = await api.claimAchievement(user.id, achievement.id, achievement.reward);
    
    if (success) {
      await onUpdateUser();
      // Sound effect is handled by global click listener in App.tsx, 
      // but we could add a specific coin sound here if we had more audio assets.
    }
    setClaimingId(null);
  };

  const totalProgress = ACHIEVEMENTS_LIST.reduce((acc, ach) => {
     if (user.claimedAchievements.includes(ach.id)) return acc + 100;
     const current = user.stats[ach.statKey] || 0;
     const percent = Math.min((current / ach.targetValue) * 100, 100);
     return acc + percent;
  }, 0) / ACHIEVEMENTS_LIST.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-900/40 to-slate-900 border border-yellow-500/20 p-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                 <Trophy className="text-yellow-500" size={32} /> Galeria de Troféus
               </h1>
               <p className="text-slate-400 max-w-xl">
                 Complete desafios para provar seu valor e ganhe CarryCoins para gastar na loja.
               </p>
            </div>
            <div className="text-right">
               <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Progresso Total</div>
               <div className="text-4xl font-bold text-yellow-500">{Math.floor(totalProgress)}%</div>
            </div>
         </div>
         
         <div className="w-full h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-yellow-500 transition-all duration-1000 ease-out" style={{ width: `${totalProgress}%` }}></div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS_LIST.map((ach) => {
          const current = user.stats[ach.statKey] || 0;
          const progress = Math.min((current / ach.targetValue) * 100, 100);
          const isCompleted = current >= ach.targetValue;
          const isClaimed = user.claimedAchievements.includes(ach.id);
          
          return (
            <div 
              key={ach.id} 
              className={`relative bg-slate-900 border rounded-2xl p-6 transition-all duration-300 ${
                 isClaimed 
                  ? 'border-yellow-500/30 bg-yellow-900/5 opacity-80 hover:opacity-100' 
                  : isCompleted 
                    ? 'border-yellow-500 shadow-lg shadow-yellow-500/20 transform hover:-translate-y-1' 
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isClaimed && (
                 <div className="absolute top-4 right-4 text-yellow-500 bg-yellow-500/10 p-1.5 rounded-full">
                    <Check size={16} strokeWidth={3} />
                 </div>
              )}

              <div className="mb-6">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isCompleted || isClaimed ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-600'
                 }`}>
                    {getIcon(ach.icon)}
                 </div>
                 <h3 className="text-lg font-bold text-white mb-1">{ach.title}</h3>
                 <p className="text-sm text-slate-400 h-10">{ach.description}</p>
              </div>

              <div className="mb-4">
                 <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className={isCompleted ? 'text-yellow-500' : 'text-slate-500'}>Progresso</span>
                    <span className="text-slate-300">{current} / {ach.targetValue}</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                       className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-yellow-500' : 'bg-slate-700'}`} 
                       style={{ width: `${progress}%` }}
                    ></div>
                 </div>
              </div>

              {isClaimed ? (
                 <button disabled className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-default text-sm">
                    Recompensa Resgatada
                 </button>
              ) : isCompleted ? (
                 <button 
                   onClick={() => handleClaim(ach)}
                   disabled={!!claimingId}
                   className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 animate-pulse"
                 >
                    {claimingId === ach.id ? 'Resgatando...' : (
                      <>
                        <Coins size={16} /> Resgatar {ach.reward} Coins
                      </>
                    )}
                 </button>
              ) : (
                 <div className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-600 font-bold text-sm bg-slate-950 rounded-xl border border-slate-800">
                    <Coins size={14} /> +{ach.reward} Coins
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
