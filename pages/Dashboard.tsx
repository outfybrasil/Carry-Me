
import React, { useEffect, useState } from 'react';
import { Swords, Clock, AlertTriangle, Target, Trophy, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Player, Match } from '../types';

interface DashboardProps {
  onFindMatch: () => void;
  onVote: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onFindMatch, onVote }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const load = async () => {
        const u = await api.checkSession();
        if (u) {
            setUser(u);
            const matches = await api.getRecentMatches(u.id);
            setRecentMatches(matches);
        }
        setLoadingMatches(false);
    };
    load();
  }, []);

  const pendingVotes = recentMatches.filter(m => m.pendingVote);

  // REAL Dynamic Missions based on stats
  const missions = user ? [
    { 
        id: 1, 
        title: 'Jogar 3 Partidas', 
        progress: user.stats.matchesPlayed % 3, 
        total: 3, 
        reward: '50 Coins', 
        completed: (user.stats.matchesPlayed > 0 && user.stats.matchesPlayed % 3 === 0)
    },
    { 
        id: 2, 
        title: 'Receber 2 Elogios', 
        progress: Math.min(user.stats.commendations, 2), 
        total: 2, 
        reward: '100 XP', 
        completed: user.stats.commendations >= 2 
    },
    { 
        id: 3, 
        title: 'Conquistar 1 MVP', 
        progress: Math.min(user.stats.mvps, 1), 
        total: 1, 
        reward: 'Rare Box', 
        completed: user.stats.mvps >= 1 
    },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-blue-800/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Activity size={12} /> Status: Online
             </div>
             <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white leading-tight">
               Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">QG de Comando</span>
             </h1>
             <p className="text-slate-400 mb-8 text-base md:text-lg font-light">
               Sua reputação abre portas. Mantenha o nível alto para desbloquear lobbies exclusivos.
             </p>
             <div className="flex gap-4 justify-center md:justify-start">
                <button 
                  onClick={onFindMatch}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none w-full md:w-auto"
                >
                  <Swords className="mr-2 group-hover:rotate-12 transition-transform" />
                  Jogar Agora
                </button>
             </div>
          </div>
          
          {/* Quick Stats Cards for Visual Interest */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Trophy size={12}/> Winrate</div>
                <div className="text-xl md:text-2xl font-bold text-green-400">52%</div>
             </div>
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><TrendingUp size={12}/> Partidas</div>
                <div className="text-xl md:text-2xl font-bold text-blue-400">{user?.stats.matchesPlayed || 0}</div>
             </div>
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl col-span-2">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2">Comportamento Recente</div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[100%]"></div>
                </div>
                <div className="text-right text-xs text-emerald-400 mt-1 font-bold">Excelente (100%)</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-8">
           {/* Pending Actions */}
            {pendingVotes.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500/20 rounded-full text-orange-500">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-200">Votação Pendente</h3>
                    <p className="text-sm text-orange-200/70">Avalie seus companheiros da última partida para manter a comunidade limpa.</p>
                  </div>
                </div>
                <button 
                  onClick={onVote}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-orange-600/20 w-full md:w-auto"
                >
                  Avaliar Agora
                </button>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <Clock className="mr-2 text-slate-400" size={20} />
                Histórico de Partidas
              </h2>
              {loadingMatches ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex justify-center text-slate-500">
                      Carregando histórico...
                  </div>
              ) : recentMatches.length > 0 ? (
                <div className="grid gap-4">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full ${match.result === 'VICTORY' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{match.game}</h3>
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                              ${match.vibe === 'Tryhard' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 
                                match.vibe === 'Chill' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'}`}>
                              {match.vibe}
                            </span>
                            <span>•</span>
                            <span>{match.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Mock teammates for history since we don't have full participant data in MVP history yet */}
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
                        ))}
                      </div>

                      <div className="text-right font-bold">
                        {match.result === 'VICTORY' ? <span className="text-green-400 bg-green-400/10 px-3 py-1 rounded-lg">VITÓRIA</span> : <span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-lg">DERROTA</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500">
                   <p>Nenhuma partida recente encontrada.</p>
                   <button onClick={onFindMatch} className="text-blue-400 hover:text-blue-300 text-sm font-bold mt-2">Jogar minha primeira partida</button>
                </div>
              )}
            </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
           {/* Daily Missions */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                   <Target className="text-red-400" size={20} /> Missões Diárias
                </h3>
                <span className="text-xs text-slate-500">Reseta em 12h</span>
              </div>
              
              <div className="space-y-4">
                 {missions.map(mission => (
                    <div key={mission.id} className="bg-black/40 rounded-xl p-4 border border-slate-800/50">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-medium ${mission.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                             {mission.title}
                          </span>
                          {mission.completed 
                             ? <CheckCircle2 size={16} className="text-green-500" />
                             : <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">{mission.reward}</span>
                          }
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${mission.completed ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{width: `${Math.min((mission.progress / mission.total) * 100, 100)}%`}}
                          ></div>
                       </div>
                       <div className="text-right text-[10px] text-slate-500 mt-1">
                          {mission.progress}/{mission.total}
                       </div>
                    </div>
                 ))}
                 {missions.length === 0 && <div className="text-slate-500 text-sm text-center">Carregando missões...</div>}
              </div>
           </div>
           
           {/* Banner Ad / Tip */}
           <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-bold text-white relative z-10 mb-2">Dica Pro</h3>
              <p className="text-sm text-slate-300 relative z-10 mb-4">
                 Jogadores que usam o chat de voz têm 35% mais chances de vitória.
              </p>
              <div className="text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                 Saiba Mais <TrendingUp size={14}/>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
