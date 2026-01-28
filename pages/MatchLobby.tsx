
import React, { useState, useEffect, useRef } from 'react';
import { Vibe, LobbyConfig } from '../types';
import { Loader2, Mic, Crown, Lock, Settings, Users, Search, ArrowLeft, RefreshCw, Radar, Signal, Globe, Play, Swords, Terminal, Target, Zap, Shield, Cpu } from 'lucide-react';
import { api } from '../services/api';

interface MatchLobbyProps {
  onCancel: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onMatchFound: (lobbyId?: string, config?: LobbyConfig) => void;
  onCreateLobby: (config: LobbyConfig, lobbyId?: string) => void;
}

const CS2_GAME = {
  id: 'cs2',
  name: 'Counter-Strike 2',
  color: 'from-[#ffb800] to-orange-600',
  icon: 'https://cdn.worldvectorlogo.com/logos/csgo-4.svg',
  maxLimit: 5
};

const MatchLobby: React.FC<MatchLobbyProps> = ({ onCancel, isPremium, onUpgrade, onMatchFound, onCreateLobby }) => {
  const [selectedVibe, setSelectedVibe] = useState<Vibe>(Vibe.TRYHARD);
  const [activeTab, setActiveTab] = useState<'find' | 'create'>('find');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [foundLobbies, setFoundLobbies] = useState<any[]>([]);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState(false);
  const [timer, setTimer] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);

  const [lobbyConfig, setLobbyConfig] = useState<LobbyConfig>({
    title: '',
    minScore: 50,
    micRequired: true,
    vibe: Vibe.TRYHARD,
    game: 'CS2',
    maxPlayers: 5
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const fetchLobbies = async () => {
    setIsLoadingLobbies(true);
    try {
      const lobbies = await api.getOpenLobbies('CS2', null);
      setFoundLobbies(lobbies);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLobbies(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    let queueSubscription: any;

    if (searchStatus === 'searching') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
        if (timer % 5 === 0) api.attemptMatchmaking('CS2', selectedVibe);
        if (timer % 3 === 0) api.getQueueStats().then(setPlayersInQueue);
      }, 1000);

      const setupListener = async () => {
        const user = await api.checkSession();
        if (user) {
          queueSubscription = api.subscribeToMatchFound(user.id, (matchId) => {
            setSearchStatus('found');
          });
        }
      };
      setupListener();
    }
    return () => {
      clearInterval(interval);
      if (queueSubscription) queueSubscription();
    };
  }, [searchStatus]);

  const handleStartSearch = async () => {
    const user = await api.checkSession();
    if (!user) return;
    const success = await api.joinQueue(user.id, 'CS2', selectedVibe);
    if (success) setSearchStatus('searching');
  };

  const handleCreateLobby = async () => {
    if (!lobbyConfig.title) return alert("Dê um nome para a sala.");
    const user = await api.checkSession();
    if (user) {
      const finalConfig = { ...lobbyConfig, game: 'CS2' };
      const lobbyId = await api.createLobby(finalConfig, user);
      if (lobbyId) onCreateLobby(finalConfig, lobbyId);
    }
  };

  const handleJoinLobby = async (lobby: any) => {
    const user = await api.checkSession();
    if (!user) return;
    const success = await api.joinLobby(lobby.id, user);
    if (success) {
      onMatchFound(lobby.id, {
        title: lobby.title,
        game: 'CS2',
        vibe: lobby.vibe,
        minScore: lobby.min_score,
        micRequired: lobby.mic_required,
        maxPlayers: lobby.max_players
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (searchStatus === 'found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500 noise-bg">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#00ff88]/20 blur-[100px] rounded-full animate-pulse"></div>
          <div className="w-40 h-40 bg-[#121417] rounded-sm flex items-center justify-center relative z-10 border-4 border-[#00ff88] shadow-[0_0_50px_rgba(0,255,136,0.2)]">
            <Users size={64} className="text-[#00ff88]" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00ff88] text-black font-mono font-black text-[10px] uppercase tracking-widest rounded-sm">
            READY_FOR_DEPLOY
          </div>
        </div>
        <h2 className="text-4xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">SQUAD_IDENTIFICADO!</h2>
        <p className="text-slate-500 mb-12 text-lg font-mono font-bold uppercase tracking-widest">Sincronizando frequências de rádio...</p>
        <button
          onClick={() => onMatchFound()}
          className="px-16 py-6 bg-[#00ff88] hover:bg-[#22ff99] text-black font-tactical font-black text-2xl uppercase italic tracking-widest rounded-sm shadow-[0_10px_40px_rgba(0,255,136,0.2)] active:scale-95 transition-all"
        >
          ACEITAR_OPERACAO
        </button>
      </div>
    );
  }

  if (searchStatus === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700 relative overflow-hidden rounded-3xl border border-white/5 bg-[#121417]/30 p-12 noise-bg grid-bg scanline">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#ffb800]/5 rounded-full animate-[ping_4s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#ffb800]/10 rounded-full animate-[ping_6s_linear_infinite]"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-[#1c1f24] rounded-sm flex items-center justify-center border border-white/10 mx-auto mb-8 shadow-2xl relative">
            <Radar size={32} className="text-[#ffb800] animate-pulse" />
            <div className="absolute inset-0 border-2 border-[#ffb800]/20 rounded-sm animate-ping"></div>
          </div>
          <h2 className="text-3xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">Buscando_Operadores</h2>
          <div className="flex justify-center gap-3 mb-12">
            <span className="px-4 py-1.5 bg-black/40 rounded-sm text-[10px] text-[#ffb800] border border-[#ffb800]/20 font-mono font-black uppercase tracking-widest">{selectedVibe}</span>
            <span className="px-4 py-1.5 bg-black/40 rounded-sm text-[10px] text-slate-500 border border-white/5 font-mono font-black uppercase tracking-widest">LATAM_HUB</span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-[#181b1f] p-6 rounded-sm border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><Clock size={32} /></div>
              <div className="text-[10px] text-slate-600 uppercase font-mono font-black tracking-widest mb-2">TEMPO_ATIVA</div>
              <div className="text-3xl font-mono font-black text-white">{formatTime(timer)}</div>
            </div>
            <div className="bg-[#181b1f] p-6 rounded-sm border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><Users size={32} /></div>
              <div className="text-[10px] text-slate-600 uppercase font-mono font-black tracking-widest mb-2">AGENTES_NA_FILA</div>
              <div className="text-3xl font-mono font-black text-[#ffb800]">{playersInQueue || 'IDLE'}</div>
            </div>
          </div>

          <button
            onClick={() => { api.leaveQueue('me'); setSearchStatus('idle'); }}
            className="text-slate-600 hover:text-red-400 text-[10px] font-mono font-black uppercase tracking-[0.3em] transition-colors"
          >
            ABORTAR_PROCESSO
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'create') {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 noise-bg">
        <div className="flex items-center gap-6 mb-10">
          <button onClick={() => setActiveTab('find')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-all"><ArrowLeft className="text-white" /></button>
          <div>
            <h1 className="text-3xl font-tactical font-black text-white uppercase italic tracking-tighter">Configurar_Operação</h1>
            <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Protocolo de Criação de Lobby Personalizado</p>
          </div>
        </div>

        {!isPremium ? (
          <div className="tactical-panel bg-[#121417] rounded-3xl p-12 text-center border-[#ffb800]/20">
            <Crown className="w-20 h-20 text-[#ffb800] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,184,0,0.3)]" />
            <h2 className="text-2xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">RECURSO_RESTRITO</h2>
            <p className="text-slate-500 mb-10 font-mono font-bold text-xs leading-relaxed uppercase tracking-widest">Apenas operadores com nível de acesso Premium podem estabelecer servidores de comando.</p>
            <button onClick={onUpgrade} className="px-12 py-5 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest rounded-sm shadow-xl active:scale-95 transition-all">
              EFETUAR_UPGRADE_AGORA
            </button>
          </div>
        ) : (
          <div className="tactical-panel bg-[#121417] rounded-sm p-10 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1">TITULO_DA_SESSAO</label>
              <input
                value={lobbyConfig.title}
                onChange={e => setLobbyConfig({ ...lobbyConfig, title: e.target.value })}
                className="w-full bg-black/40 border border-white/5 rounded-sm p-5 text-white focus:border-[#ffb800]/50 outline-none font-mono text-sm transition-all"
                placeholder="EX: DUST2_TACTICAL_ONLY"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1">VIBE_DO_PROTOCOLO</label>
                <select
                  value={lobbyConfig.vibe}
                  onChange={e => setLobbyConfig({ ...lobbyConfig, vibe: e.target.value as Vibe })}
                  className="w-full bg-black/40 border border-white/5 rounded-sm p-5 text-white font-mono text-sm focus:border-[#ffb800]/50 outline-none"
                >
                  <option value={Vibe.TRYHARD}>Tryhard</option>
                  <option value={Vibe.CHILL}>Chill</option>
                  <option value={Vibe.LEARNING}>Learning</option>
                  <option value={Vibe.PRACTICE}>Treino (Execs)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1">SCORE_MINIMO_REQUERIDO</label>
                <input
                  type="number"
                  value={lobbyConfig.minScore}
                  onChange={e => setLobbyConfig({ ...lobbyConfig, minScore: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-white/5 rounded-sm p-5 text-white font-mono text-sm focus:border-[#ffb800]/50 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-5 bg-black/40 border border-[#ffb800]/10 p-6 rounded-sm">
              <div className="p-3 bg-[#ffb800]/10 text-[#ffb800] rounded-sm border border-[#ffb800]/20">
                <Mic size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-tactical font-black text-sm text-white uppercase italic tracking-tighter">COMUNICAÇÃO_VOZ_OBRIGATÓRIA</h3>
                <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest mt-1">Sincronização automática com servidor Discord</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={lobbyConfig.micRequired} onChange={e => setLobbyConfig({ ...lobbyConfig, micRequired: e.target.checked })} />
                <div className="w-14 h-7 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffb800] peer-checked:after:bg-black"></div>
              </label>
            </div>
            <button onClick={handleCreateLobby} className="w-full py-5 bg-[#ffb800] hover:bg-[#ffc933] text-black font-tactical font-black uppercase italic tracking-widest rounded-sm mt-6 shadow-2xl active:scale-95 transition-all">
              ESTABELECER_LOBBY
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onCancel} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-all text-white"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#1c1f24] rounded-sm p-3 border border-white/5 flex items-center justify-center relative group">
            <img src={CS2_GAME.icon} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
              <span className="text-[7px] font-mono font-black text-white/40 uppercase tracking-widest">TACTICAL_G</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-tactical font-black text-white uppercase italic tracking-tighter leading-none mb-1">Counter-Strike <span className="text-[#ffb800]">2</span></h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-mono font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-sm">
                <Signal size={10} /> LATENCY_STABLE
              </span>
              <span className="text-[9px] font-mono font-black text-slate-700 uppercase tracking-widest">ESTADO: PRONTO_PARA_COMBATE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT PANEL: QUICK MATCH */}
        <div className="lg:col-span-4 space-y-8">
          <div className="tactical-panel bg-[#121417] rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Radar size={120} /></div>

            <h2 className="text-xl font-tactical font-black text-white mb-8 flex items-center gap-3 uppercase italic tracking-tighter">
              <Swords className="text-[#ffb800]" size={20} />
              Busca_Rápida
            </h2>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block border-b border-white/5 pb-2">DEFINIR_VIBE</label>
                <div className="grid grid-cols-1 gap-2">
                  {[Vibe.TRYHARD, Vibe.CHILL, Vibe.LEARNING, Vibe.PRACTICE].map(vibe => (
                    <button
                      key={vibe}
                      onClick={() => setSelectedVibe(vibe)}
                      className={`px-4 py-3 rounded-sm text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all border ${selectedVibe === vibe
                        ? 'bg-[#ffb800] border-[#ffb800] text-black shadow-[0_4px_15px_rgba(255,184,0,0.2)]'
                        : 'bg-black/20 border-white/5 text-slate-600 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 rounded-sm p-4 flex items-center justify-between border border-white/5">
                <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest flex items-center gap-3"><Globe size={14} /> HUB_GEOGRAFICO</span>
                <span className="text-[10px] font-mono font-black text-green-500 uppercase tracking-widest">SA_BRASIL</span>
              </div>

              <button
                onClick={handleStartSearch}
                className="w-full py-5 bg-[#ffb800] hover:bg-[#ffc933] text-black font-tactical font-black uppercase italic tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95"
              >
                <Play fill="currentColor" size={16} />
                ENGATAR_NA_FILA
              </button>
            </div>
          </div>

          <div className="tactical-panel bg-gradient-to-br from-[#ffb800]/10 to-transparent border border-[#ffb800]/20 rounded-2xl p-8 group cursor-pointer" onClick={() => setActiveTab('create')}>
            <h2 className="text-lg font-tactical font-black text-white mb-3 flex items-center gap-3 uppercase italic tracking-tighter">
              <Crown className="text-[#ffb800]" size={20} />
              Protocolo_Capitão
            </h2>
            <p className="text-[10px] font-mono font-bold text-slate-500 mb-6 uppercase tracking-widest leading-relaxed">Assuma o comando. Estabeleça lobbies sob medida e selecione sua guarnição.</p>
            <div className="w-full py-3 bg-white/5 border border-white/10 hover:border-[#ffb800]/50 text-white font-mono font-black text-[10px] uppercase tracking-widest text-center transition-all">
              CRIAR_SALA_RESTRITA
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LOBBY BROWSER */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-sm"><Users size={20} className="text-[#ffb800]" /></div>
              <div>
                <h2 className="text-xl font-tactical font-black text-white uppercase italic tracking-tighter">Sinais_Operacionais</h2>
                <p className="text-[9px] font-mono font-black text-slate-700 uppercase tracking-[0.2em]">Lobbies ativos no setor selecionado</p>
              </div>
            </div>
            <button onClick={fetchLobbies} className="p-3 bg-white/5 hover:bg-white/10 rounded-sm text-slate-500 hover:text-white transition-all border border-white/5">
              <RefreshCw size={18} className={isLoadingLobbies ? 'animate-spin text-[#ffb800]' : ''} />
            </button>
          </div>

          {isLoadingLobbies ? (
            <div className="text-center py-32 bg-[#121417]/30 rounded-3xl border border-white/5">
              <div className="w-16 h-16 border-4 border-white/5 border-t-[#ffb800] rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em]">Sincronizando_Banco_Dados...</p>
            </div>
          ) : foundLobbies.length === 0 ? (
            <div className="tactical-panel bg-[#121417] rounded-3xl p-20 text-center border-dashed border-white/10">
              <Shield size={48} className="text-slate-800 mx-auto mb-8 opacity-20" />
              <h3 className="text-xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">SETOR_EM_SILENCIO</h3>
              <p className="text-slate-600 mb-10 font-mono font-bold text-xs uppercase tracking-widest">Nenhuma frequência ativa identificada com os filtros atuais.</p>
              <button onClick={() => setActiveTab('create')} className="text-[#ffb800] font-mono font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                ESTABELECER_PRIMEIRA_SALA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foundLobbies
                .filter(lobby => lobby.vibe === selectedVibe)
                .map((lobby: any) => (
                  <div key={lobby.id} className="tactical-panel bg-[#181b1f] p-8 rounded-sm hover:border-[#ffb800]/40 transition-all group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 p-2 opacity-[0.02] pointer-events-none transition-transform group-hover:scale-110"><Target size={120} /></div>

                    <div className="flex justify-between items-start mb-8">
                      <div className="max-w-[70%]">
                        <h3 className="text-base font-tactical font-black text-white mb-2 uppercase italic tracking-tighter line-clamp-1 group-hover:text-[#ffb800] transition-colors">{lobby.title || 'OPERACAO_ANONIMA'}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest ${lobby.vibe === Vibe.TRYHARD ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                            lobby.vibe === Vibe.CHILL ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                              lobby.vibe === Vibe.PRACTICE ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' :
                                'border-[#ffb800]/30 text-[#ffb800] bg-[#ffb800]/5'
                            }`}>
                            {lobby.vibe}
                          </span>
                          {lobby.min_score > 0 && <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-black/40 border border-white/5 text-slate-500 uppercase tracking-widest">MIN_SCORE: {lobby.min_score}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white bg-black/60 px-3 py-1.5 rounded-sm border border-white/5">
                        <Users size={12} className="text-[#ffb800]" />
                        <span className="text-xs font-mono font-black">{lobby.players?.length}/{lobby.max_players}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                      <div className="flex -space-x-2">
                        {lobby.players?.slice(0, 4).map((p: any, i: number) => (
                          <img key={i} src={p.avatar} className="w-9 h-9 rounded-sm border-2 border-[#181b1f] object-cover ring-1 ring-white/10" alt="Av" />
                        ))}
                        {(lobby.players?.length > 4) && (
                          <div className="w-9 h-9 rounded-sm border-2 border-[#181b1f] bg-[#121417] flex items-center justify-center text-[9px] text-[#ffb800] font-mono font-black ring-1 ring-white/10">
                            +{lobby.players.length - 4}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleJoinLobby(lobby)}
                        className="px-6 py-2.5 bg-white/5 hover:bg-[#ffb800] hover:text-black text-white font-mono font-black text-[10px] uppercase tracking-widest rounded-sm border border-white/10 transition-all active:scale-95"
                      >
                        ENGATAR
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchLobby;
