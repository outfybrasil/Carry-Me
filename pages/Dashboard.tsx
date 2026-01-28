import React, { useEffect, useState, useMemo } from 'react';
import { Swords, Clock, AlertTriangle, Target, Trophy, TrendingUp, Activity, CheckCircle2, Lightbulb, Crosshair, X, Crown, Lock, Terminal, Cpu, Zap, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { Player, Match } from '../types';
import { CS_TIPS, GameTip } from '../constants/tips';
import { StatsOverview } from '../components/StatsOverview';

interface DashboardProps {
  onFindMatch: () => void;
  onVote: () => void;
  onUpgrade: () => void;
}

// MISSION POOL (Backup grande para rotação diária)
const MISSION_POOL = [
  { id: 'm1', title: 'Caçador de Cabeças', desc: 'Consiga 15 Headshots em uma partida', target: 15, type: 'headshots', reward: '50 Coins' },
  { id: 'm2', title: 'Primeiro Sangue', desc: 'Consiga a primeira kill em 3 rounds', target: 3, type: 'entry_frags', reward: '100 Coins' },
  { id: 'm3', title: 'Mestre da Economia', desc: 'Vença um round de eco completo', target: 1, type: 'eco_win', reward: '75 Coins' },
  { id: 'm4', title: 'Utilidade Máxima', desc: 'Cegue 10 inimigos com flashbangs', target: 10, type: 'blind_enemies', reward: '50 Coins' },
  { id: 'm5', title: 'Clutch King', desc: 'Vença uma situação 1v2 ou superior', target: 1, type: 'clutch_win', reward: '150 Coins' },
  { id: 'm6', title: 'Dano Crítico', desc: 'Cause 500 de ADR em uma partida', target: 500, type: 'damage', reward: '100 Coins' },
  { id: 'm7', title: 'Veterano', desc: 'Jogue 5 partidas competitivas', target: 5, type: 'play_matches', reward: '120 Coins' },
  { id: 'm8', title: 'Estrategista', desc: 'Vença 5 rounds no lado CT', target: 5, type: 'win_rounds_ct', reward: '60 Coins' },
  { id: 'm9', title: 'Invasor', desc: 'Plante a C4 com sucesso 3 vezes', target: 3, type: 'plant_c4', reward: '80 Coins' },
  { id: 'm10', title: 'Defensor', desc: 'Desarme a C4 com sucesso 1 vez', target: 1, type: 'defuse_c4', reward: '100 Coins' },
  { id: 'm11', title: 'Assistente', desc: 'Consiga 10 assistências', target: 10, type: 'assists', reward: '50 Coins' },
  { id: 'm12', title: 'Carregador', desc: 'Seja o MVP da partida', target: 1, type: 'mvp', reward: '150 Coins' },
  { id: 'm13', title: 'Persistente', desc: 'Jogue 3 partidas Chill', target: 3, type: 'play_chill', reward: '100 Coins' },
];

const Dashboard: React.FC<DashboardProps> = ({ onFindMatch, onVote, onUpgrade }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [dailyTip, setDailyTip] = useState<GameTip | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await api.checkSession();
      if (data) {
        setUser(data);
      }
      setLoadingMatches(false);

      // Select daily tip based on date
      const day = new Date().getDate();
      setDailyTip(CS_TIPS[day % CS_TIPS.length]);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      if (!user?.id) return;
      setLoadingMatches(true);
      const { data, error } = await supabase
        .from('match_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setRecentMatches(data.map((m: any) => ({
          id: m.id,
          result: m.result === 'VICTORY' || m.result === 'WIN' ? 'WIN' : 'LOSE',
          map: m.map || 'Unknown',
          date: new Date(m.created_at).toLocaleDateString(),
          kills: m.kills || 0,
          deaths: m.deaths || 0,
          assists: m.assists || 0,
          rating: Number(m.rating) || 0,
          timestamp: m.created_at,
          mode: m.game_mode || 'Ranked'
        })));
      }
      setLoadingMatches(false);
    };
    loadMatches();
  }, [user?.id]);

  // Seleciona 3 missões baseadas no dia para parecer rotação
  const todayStr = new Date().toDateString();
  const dailyMissions = useMemo(() => {
    const seed = todayStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...MISSION_POOL].sort(() => 0.5 - (seed % 10) / 10);
    return shuffled.slice(0, 3);
  }, [todayStr]);

  const categories = ['All', ...new Set(CS_TIPS.map(t => t.category))];
  const filteredTips = selectedCategory === 'All'
    ? CS_TIPS
    : CS_TIPS.filter(t => t.category === selectedCategory);

  // Calcula progresso baseado no histórico recente (carregado da API)
  const getMissionProgress = (mission: typeof MISSION_POOL[0]) => {
    if (!user) return { current: 0, completed: false };
    return {
      current: 0,
      completed: false
    };
  };

  const MatchDetailModal = ({ match, onClose }: { match: Match, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#121417] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1c1f24]">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg flex flex-col items-center justify-center font-mono font-black ${match.result === 'WIN' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <span className="text-xl leading-none">{match.result}</span>
            </div>
            <div>
              <h3 className="text-xl font-tactical font-black text-white uppercase italic tracking-tighter">REGISTRO DE COMBATE</h3>
              <p className="text-[10px] text-[#ffb800] font-mono font-bold uppercase tracking-widest">{match.map} // {match.mode} // {match.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all"><X size={24} /></button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">Kills</p>
              <p className="text-2xl font-mono font-black text-white">{match.kills}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">Deaths</p>
              <p className="text-2xl font-mono font-black text-white">{match.deaths}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">Assists</p>
              <p className="text-2xl font-mono font-black text-white">{match.assists}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-1">Rating</p>
              <p className={`text-2xl font-mono font-black ${match.rating >= 1.2 ? 'text-[#ffb800]' : 'text-slate-300'}`}>{match.rating.toFixed(2)}</p>
            </div>
          </div>

          <h4 className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
            <Shield size={14} className="text-[#ffb800]" /> ESQUADRÃO OPERACIONAL
          </h4>

          <div className="space-y-3">
            {match.teammates && match.teammates.length > 0 ? (
              match.teammates.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={player.avatar} className="w-8 h-8 rounded-sm object-cover border border-white/10" alt="" />
                    <span className="text-sm font-bold text-white">{player.username}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-mono font-black uppercase">REPUTAÇÃO</p>
                      <p className="text-xs font-mono font-black text-[#ffb800]">{player.score}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600 font-mono italic text-center py-4 bg-black/20 rounded-lg">Dados de esquadrão não disponíveis para este registro.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-[#1c1f24] border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest italic">CarryMe Tactical Data Sync // Hash_{match.id.substring(0, 8)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 noise-bg grid-bg">

      {/* HERO SECTION - TACTICAL COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#121417] shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffb800]/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#ffb800]/5 rounded-full blur-[100px] group-hover:bg-[#ffb800]/10 transition-all duration-1000"></div>

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffb800]/20 border border-[#ffb800]/30 text-[#ffb800] text-[10px] font-mono font-black uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-[#ffb800] rounded-full animate-pulse"></span>
              SISTEMA DE COMBATE ATIVO
            </div>
            <h1 className="text-4xl md:text-6xl font-tactical font-black text-white italic tracking-tighter leading-none mb-6">
              DOMINE O <span className="text-[#ffb800]">SERVIDOR</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed font-medium">
              Conecte-se com jogadores de elite, analise seu DNA competitivo e suba de rank através do pareamento tático da CarryMe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={onFindMatch}
                className="px-10 py-5 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest rounded-sm hover:bg-[#ffc933] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,184,0,0.2)] active:scale-95 flex items-center justify-center gap-3"
              >
                <Swords size={20} /> INICIAR BUSCA
              </button>
              <button
                onClick={onVote}
                className="px-8 py-5 bg-white/5 border border-white/10 text-white font-tactical font-black uppercase italic tracking-widest rounded-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <Trophy size={18} className="text-[#ffb800]" /> REVISAR AVALIAÇÕES
              </button>
            </div>
          </div>

          {/* Tactical Stats Overlay */}
          <div className="hidden lg:block w-72 h-72 relative">
            <div className="absolute inset-0 border-2 border-[#ffb800]/10 rounded-full animate-rotate-slow"></div>
            <div className="absolute inset-4 border border-white/5 rounded-full"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Terminal size={48} className="text-[#ffb800] mb-4 opacity-50" />
              <span className="text-3xl font-mono font-black text-white">0.92</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Global Efficiency</span>
            </div>
            {/* Decorative Dots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ffb800] rounded-full shadow-[0_0_10px_#ffb800]"></div>
          </div>
        </div>
      </div>

      {user?.advancedStats && (
        <StatsOverview
          stats={user.advancedStats}
          winRate={recentMatches.length > 0 ? (recentMatches.filter(m => m.result === 'WIN').length / recentMatches.length) : 0.52}
          leetifyRating={user.advancedStats.focusAreas?.[0]?.score || "0.00"}
          totalMatches={30}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: HISTORY & TIPS */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent History Module */}
          <div className="tactical-panel rounded-2xl p-6 h-fit bg-[#181b1f]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-[#ffb800]">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-tactical font-black text-white uppercase italic tracking-tight">LOG DE COMBATE</h3>
                  <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Últimos registros sincronizados</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {loadingMatches ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg"></div>)
              ) : recentMatches.length > 0 ? (
                recentMatches.slice(0, 5).map(match => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className="w-full group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-[#ffb800]/30 hover:bg-white/[0.08] transition-all text-left"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono font-black ${match.result === 'WIN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <span className="text-sm">{match.result}</span>
                      </div>
                      <div>
                        <h4 className="font-tactical font-black text-white text-sm uppercase italic tracking-tighter">{match.map}</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">{match.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 md:gap-12">
                      <div className="hidden sm:flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mb-1">K/D</span>
                        <span className="text-sm font-mono font-bold text-white tracking-widest">{match.kills}/{match.deaths}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest block mb-1">RATING</span>
                        <span className={`text-sm font-mono font-black ${match.rating >= 1.2 ? 'text-[#ffb800]' : 'text-slate-300'}`}>{match.rating?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-4 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <Activity size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-600 font-mono font-bold leading-relaxed max-w-xs uppercase tracking-widest">Nenhum registro encontrado. Inicie sua primeira partida para gerar dados.</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Tip Module */}
          {dailyTip && (
            <div className="tactical-panel bg-gradient-to-r from-[#181b1f] to-[#1c1f24] rounded-2xl border border-[#ffb800]/10 p-1 mb-8">
              <div className="bg-[#121417] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-lg flex items-center justify-center text-[#ffb800]">
                    <Lightbulb size={18} />
                  </div>
                  <h3 className="text-sm font-tactical font-bold text-white uppercase italic tracking-widest">DICA DO DIA // {dailyTip.category.toUpperCase()}</h3>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#ffb800] transition-colors">{dailyTip.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-light mb-6">"{dailyTip.content}"</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">UID TOKEN: {dailyTip.id}</span>
                  <button
                    onClick={() => {
                      if (user?.isPremium) setIsTipsModalOpen(true);
                      else onUpgrade();
                    }}
                    className="flex items-center gap-2 group/btn"
                  >
                    {!user?.isPremium && <Crown size={12} className="text-[#ffb800] animate-pulse" />}
                    <span className="text-[10px] font-mono font-black text-white hover:text-[#ffb800] transition-all uppercase tracking-widest flex items-center gap-2">
                      EXPLORAR TÁTICAS <TrendingUp size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MISSIONS & ANALYTICS */}
        <div className="space-y-8">

          {/* Daily Missions Module */}
          <div className="tactical-panel rounded-2xl p-6 bg-[#181b1f] border-l-2 border-l-[#ffb800]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-lg text-[#ffb800]">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-lg font-tactical font-black text-white uppercase italic tracking-tight">DIRETRIZES DIÁRIAS</h3>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Complete p/ coletar recompensas</p>
              </div>
            </div>

            <div className="space-y-6">
              {dailyMissions.map(m => {
                const progValue = getMissionProgress(m);
                const percent = (progValue.current / m.target) * 100;

                return (
                  <div key={m.id} className="relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 group-hover:text-[#ffb800] transition-colors">{m.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-snug">{m.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#ffb800] bg-[#ffb800]/10 px-2 py-0.5 rounded-sm">+{m.reward}</span>
                    </div>

                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-1000 ease-out fill-mode-forwards rounded-full ${progValue.completed ? 'bg-green-500' : 'bg-[#ffb800]'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] font-mono font-bold uppercase tracking-widest">
                      <span className={progValue.completed ? 'text-green-500' : 'text-slate-600'}>{progValue.completed ? 'OBJETIVO SINCRONIZADO' : 'EM PROGRESSO'}</span>
                      <span className="text-slate-500">{progValue.current} / {m.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">O SISTEMA RESETA EM: <span className="text-white">04:22:15</span></p>
            </div>
          </div>

          {/* Activity Quick View */}
          <div className="tactical-panel rounded-2xl p-6 bg-[#181b1f] overflow-hidden">
            <div className="absolute right-0 top-0 p-2 opacity-5"><Shield size={80} /></div>
            <h3 className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">STATUS OPERACIONAL</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">SCORE REPUTAÇÃO</span>
                <span className="text-xs font-mono font-black text-[#ffb800]">{user?.score || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">SESSÕES SHERPA</span>
                <span className="text-xs font-mono font-black text-white">{user?.stats.sherpaSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">TEMPO DE JOGO</span>
                <span className="text-xs font-mono font-black text-white">42h 12m</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tips Explorer Modal */}
      {isTipsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsTipsModalOpen(false)}></div>
          <div className="relative bg-[#121417] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1c1f24]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffb800] text-black rounded-lg flex items-center justify-center font-black italic">T</div>
                <div>
                  <h2 className="text-2xl font-tactical font-black text-white uppercase italic tracking-tight underline decoration-[#ffb800]/50 underline-offset-4">BIBLIOTECA TÁTICA</h2>
                  <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest font-bold mt-1">Sincronizando banco de dados de instrutores CarryMe</p>
                </div>
              </div>
              <button
                onClick={() => setIsTipsModalOpen(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-sm text-slate-500 hover:text-white transition-all border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 bg-[#181b1f] flex gap-2 overflow-x-auto custom-scrollbar shrink-0 border-b border-white/10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-sm text-[10px] font-mono font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-[#ffb800] text-black shadow-[0_0_15px_rgba(255,184,0,0.3)]' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5 hover:border-white/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tips Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f1114]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTips.map(tip => (
                  <div key={tip.id} className="bg-[#181b1f] border border-white/5 p-6 rounded-sm hover:border-[#ffb800]/50 transition-all group relative">
                    <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.03] text-white"><Zap size={32} /></div>
                    <span className="text-[9px] font-mono font-black text-[#ffb800] uppercase tracking-[0.2em] mb-3 block">{tip.category}</span>
                    <h3 className="font-tactical font-black text-white text-lg mb-3 italic tracking-tight group-hover:text-[#ffb800] transition-colors">{tip.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">"{tip.content}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-[#1c1f24] flex justify-center">
              <p className="text-[10px] font-mono text-slate-600 italic text-center uppercase tracking-widest">
                Dicas fornecidas por instrutores verificados da <span className="text-[#ffb800]">OutfyBR</span>. A reprodução não autorizada é proibida.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
};

export default Dashboard;
