
import React, { useEffect, useState, useMemo } from 'react';
import { Swords, Clock, AlertTriangle, Target, Trophy, TrendingUp, Activity, CheckCircle2, Lightbulb, Crosshair } from 'lucide-react';
import { api } from '../services/api';
import { Player, Match } from '../types';
import { CS_TIPS, GameTip } from '../constants/tips';

interface DashboardProps {
  onFindMatch: () => void;
  onVote: () => void;
}

// MISSION POOL (Backup grande para rotação diária)
const MISSION_POOL = [
  { id: 'm1', title: 'Aquecimento', desc: 'Jogue 1 partida hoje', target: 1, type: 'play', reward: '50 Coins' },
  { id: 'm2', title: 'Maratona', desc: 'Jogue 3 partidas hoje', target: 3, type: 'play', reward: '100 Coins' },
  { id: 'm3', title: 'Viciado', desc: 'Jogue 5 partidas hoje', target: 5, type: 'play', reward: 'Rare Box' },
  { id: 'm4', title: 'Vitorioso', desc: 'Vença 1 partida hoje', target: 1, type: 'win', reward: '50 Coins' },
  { id: 'm5', title: 'Dominante', desc: 'Vença 3 partidas hoje', target: 3, type: 'win', reward: '150 Coins' },
  { id: 'm6', title: 'Tryhard', desc: 'Jogue 1 partida Tryhard', target: 1, type: 'play_tryhard', reward: '50 Coins' },
  { id: 'm7', title: 'Chill Vibes', desc: 'Jogue 1 partida Chill', target: 1, type: 'play_chill', reward: '50 Coins' },
  { id: 'm8', title: 'Veterano', desc: 'Jogue 2 partidas hoje', target: 2, type: 'play', reward: '75 Coins' },
  { id: 'm9', title: 'Imparável', desc: 'Vença 2 partidas hoje', target: 2, type: 'win', reward: '100 Coins' },
  { id: 'm10', title: 'Fim de Semana', desc: 'Jogue 4 partidas', target: 4, type: 'play', reward: '120 Coins' },
  { id: 'm11', title: 'Competitivo', desc: 'Jogue 2 partidas Tryhard', target: 2, type: 'play_tryhard', reward: '100 Coins' },
  { id: 'm12', title: 'Aprendiz', desc: 'Jogue 1 partida Learning', target: 1, type: 'play_learning', reward: '50 Coins' },
  { id: 'm13', title: 'Persistente', desc: 'Jogue 3 partidas Chill', target: 3, type: 'play_chill', reward: '100 Coins' },
];

const Dashboard: React.FC<DashboardProps> = ({ onFindMatch, onVote }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [dailyTip, setDailyTip] = useState<GameTip | null>(null);

  useEffect(() => {
    const load = async () => {
      const u = await api.checkSession();
      if (u) {
        setUser(u);
        const matches = await api.getRecentMatches(u.id);
        setRecentMatches(matches);
      }
      setLoadingMatches(false);

      // Pick a random tip
      const randomTip = CS_TIPS[Math.floor(Math.random() * CS_TIPS.length)];
      setDailyTip(randomTip);
    };
    load();
  }, []);

  const pendingVotes = recentMatches.filter(m => m.pendingVote);

  // --- DAILY MISSIONS LOGIC ---
  const todayStr = new Date().toLocaleDateString();

  // Seleciona 3 missões baseadas na data (Seed) para que mudem todo dia mas sejam iguais para todos
  const dailyMissions = useMemo(() => {
    const seed = todayStr.split('/').reduce((acc, val) => acc + parseInt(val), 0);
    const shuffled = [...MISSION_POOL].sort((a, b) => {
      const valA = (a.id.charCodeAt(1) + seed) % 100;
      const valB = (b.id.charCodeAt(1) + seed) % 100;
      return valA - valB;
    });
    return shuffled.slice(0, 3);
  }, [todayStr]);

  // Calcula progresso baseado no histórico recente (carregado da API)
  const getMissionProgress = (mission: typeof MISSION_POOL[0]) => {
    if (!user) return { current: 0, completed: false };

    const todaysMatches = recentMatches.filter(m => m.date === todayStr);
    let current = 0;

    if (mission.type === 'play') current = todaysMatches.length;
    else if (mission.type === 'win') current = todaysMatches.filter(m => m.result === 'VICTORY').length;
    else if (mission.type === 'play_tryhard') current = todaysMatches.filter(m => m.vibe === 'Tryhard').length;
    else if (mission.type === 'play_chill') current = todaysMatches.filter(m => m.vibe === 'Chill').length;
    else if (mission.type === 'play_learning') current = todaysMatches.filter(m => m.vibe === 'Learning').length;

    return { current, completed: current >= mission.target };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-blue-800/30 p-6 md:p-8 shadow-2xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* CS2 Background Logo Element */}
        <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12 pointer-events-none transition-transform group-hover:rotate-6 duration-700">
          <img
            src="https://cdn.worldvectorlogo.com/logos/csgo-4.svg"
            className="w-[300px] h-[300px] object-contain filter grayscale brightness-200"
            alt="CS2 Logo"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Activity size={12} /> Status: Online
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-bold uppercase tracking-wider">
                <Crosshair size={12} /> CS2 Ready
              </div>
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
              <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Trophy size={12} /> Winrate</div>
              <div className="text-xl md:text-2xl font-bold text-green-400">52%</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><TrendingUp size={12} /> Partidas</div>
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
                      {[1, 2, 3, 4].map((i) => (
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
              {dailyMissions.map(mission => {
                const { current, completed } = getMissionProgress(mission);
                const progressPercent = Math.min((current / mission.target) * 100, 100);

                return (
                  <div key={mission.id} className="bg-black/40 rounded-xl p-4 border border-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-sm font-medium block ${completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{mission.title}</span>
                        <span className="text-[10px] text-slate-500">{mission.desc}</span>
                      </div>
                      {completed
                        ? <CheckCircle2 size={16} className="text-green-500" />
                        : <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">{mission.reward}</span>
                      }
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 mt-1">
                      {current}/{mission.target}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Tips Widget */}
          {dailyTip && (
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-lg hover:shadow-purple-900/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Lightbulb size={14} className="animate-pulse" />
                  Dica: {dailyTip.category}
                </div>

                <h3 className="font-bold text-white text-lg mb-2">{dailyTip.title}</h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {dailyTip.content}
                </p>

                <div className="w-full h-px bg-purple-500/20 mb-3"></div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Dica #{dailyTip.id.split('-')[1]}</span>
                  <button className="text-white text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all hover:text-purple-300">
                    Ver Mais <TrendingUp size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
