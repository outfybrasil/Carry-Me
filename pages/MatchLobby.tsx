
import React, { useState, useEffect, useRef } from 'react';
import { Vibe, LobbyConfig } from '../types';
import { Loader2, Mic, Crown, Lock, Settings, Users, Search, ArrowLeft, RefreshCw, Radar, Signal, Globe, Play } from 'lucide-react';
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
  color: 'from-orange-600 to-yellow-500',
  icon: 'https://cdn.worldvectorlogo.com/logos/csgo-4.svg',
  maxLimit: 5
};

const MatchLobby: React.FC<MatchLobbyProps> = ({ onCancel, isPremium, onUpgrade, onMatchFound, onCreateLobby }) => {
  // State
  const [selectedVibe, setSelectedVibe] = useState<Vibe>(Vibe.TRYHARD);
  const [activeTab, setActiveTab] = useState<'find' | 'create'>('find'); // Keep tab state for Create Mode override
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [foundLobbies, setFoundLobbies] = useState<any[]>([]);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState(false);

  // Search Animation State
  const [timer, setTimer] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);

  // Create Lobby State
  const [lobbyConfig, setLobbyConfig] = useState<LobbyConfig>({
    title: '',
    minScore: 50,
    micRequired: true,
    vibe: Vibe.TRYHARD,
    game: 'CS2',
    maxPlayers: 5
  });

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO EFFECTS ---
  const playPing = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playSuccess = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // --- INITIAL DATA FETCH ---
  const fetchLobbies = async () => {
    setIsLoadingLobbies(true);
    try {
      const lobbies = await api.getOpenLobbies('CS2', null); // Fetch all CS2 lobbies
      setFoundLobbies(lobbies);
    } catch (e) {
      console.error("Failed to fetch lobbies", e);
    } finally {
      setIsLoadingLobbies(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    // Poll for lobbies every 10s
    const interval = setInterval(fetchLobbies, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    let interval: any;
    let queueSubscription: any;

    if (searchStatus === 'searching') {
      // Start Timer
      setEstimatedTime(Math.floor(Math.random() * 30) + 15);
      interval = setInterval(() => {
        setTimer(t => t + 1);
        if (timer % 5 === 0) api.attemptMatchmaking('CS2', selectedVibe);
        if (timer % 3 === 0) api.getQueueStats().then(setPlayersInQueue);
        if (timer % 2 === 0) playPing();
      }, 1000);

      // Subscribe
      const setupListener = async () => {
        const user = await api.checkSession();
        if (user) {
          queueSubscription = api.subscribeToMatchFound(user.id, (matchId) => {
            setSearchStatus('found');
            playSuccess();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          });
        }
      };
      setupListener();
    } else {
      setTimer(0);
    }
    return () => {
      clearInterval(interval);
      if (queueSubscription) queueSubscription();
    };
  }, [searchStatus]);


  // --- HANDLERS ---
  const handleStartSearch = async () => {
    const user = await api.checkSession();
    if (!user) return;

    // Join DB Queue
    const success = await api.joinQueue(user.id, 'CS2', selectedVibe);
    if (success) {
      setSearchStatus('searching');
    } else {
      // Simulation Fallback
      setSearchStatus('searching');
      setTimeout(() => {
        setSearchStatus('found');
        playSuccess();
      }, 8000);
    }
  };

  const handleCreateLobby = async () => {
    if (!lobbyConfig.title) return alert("Dê um nome para a sala.");
    const user = await api.checkSession();
    if (user) {
      const finalConfig = { ...lobbyConfig, game: 'CS2' }; // Enforce CS2
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
    } else {
      alert("Sala cheia ou indisponível.");
      fetchLobbies();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDER ---

  // 1. MATCH FOUND OVERLAY
  if (searchStatus === 'found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
          <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center relative z-10 border-4 border-green-500 mx-auto">
            <Users size={56} className="text-green-500" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">Partida Encontrada!</h2>
        <p className="text-slate-300 mb-8 text-lg">Seu squad está pronto.</p>
        <button
          onClick={() => onMatchFound()}
          className="px-12 py-5 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-2xl animate-bounce shadow-xl shadow-green-600/30"
        >
          ACEITAR
        </button>
      </div>
    );
  }

  // 2. SEARCHING OVERLAY
  if (searchStatus === 'searching') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
        {/* Radar Ping Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-[ping_3s_linear_infinite] pointer-events-none"></div>
        </div>

        <div className="relative z-10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Buscando Operadores...</h2>
          <div className="flex justify-center gap-2 mb-8">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">{selectedVibe}</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">Brasil</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 uppercase font-bold">Tempo</div>
              <div className="text-2xl font-mono text-white">{formatTime(timer)}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 uppercase font-bold">Fila</div>
              <div className="text-2xl font-mono text-white">{playersInQueue}</div>
            </div>
          </div>

          <button
            onClick={() => { api.leaveQueue('me'); setSearchStatus('idle'); }}
            className="text-red-400 hover:text-white text-sm hover:underline"
          >
            Cancelar Busca
          </button>
        </div>
      </div>
    );
  }

  // 3. CREATE LOBBY FORM
  if (activeTab === 'create') {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setActiveTab('find')} className="mr-4 p-2 hover:bg-slate-800 rounded-lg"><ArrowLeft className="text-white" /></button>
          <h1 className="text-2xl font-bold text-white">Criar Operação (Lobby)</h1>
        </div>

        {!isPremium ? (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center">
            <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Recurso Premium</h2>
            <p className="text-slate-400 mb-6">Apenas capitães assinantes podem criar lobbies personalizados.</p>
            <button onClick={onUpgrade} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl">
              Virar Premium
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-sm text-slate-400">Nome da Sala</label>
              <input
                value={lobbyConfig.title}
                onChange={e => setLobbyConfig({ ...lobbyConfig, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white mt-1 focus:border-amber-500 outline-none"
                placeholder="Ex: Dust 2 Only - Prata/Ouro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Vibe</label>
                <select
                  value={lobbyConfig.vibe}
                  onChange={e => setLobbyConfig({ ...lobbyConfig, vibe: e.target.value as Vibe })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white mt-1"
                >
                  <option value={Vibe.TRYHARD}>Tryhard</option>
                  <option value={Vibe.CHILL}>Chill</option>
                  <option value={Vibe.LEARNING}>Learning</option>
                  <option value={Vibe.PRACTICE}>Treino (Execs)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Score Mínimo</label>
                <input
                  type="number"
                  value={lobbyConfig.minScore}
                  onChange={e => setLobbyConfig({ ...lobbyConfig, minScore: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <div className="p-2 bg-indigo-500 text-white rounded-lg">
                <Mic size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-indigo-400">Canal de Voz Discord</h3>
                <p className="text-xs text-indigo-300/60">Criar canal temporário automático</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={lobbyConfig.micRequired} onChange={e => setLobbyConfig({ ...lobbyConfig, micRequired: e.target.checked })} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <button onClick={handleCreateLobby} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl mt-4">
              Criar Sala
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. MAIN DASHBOARD (FIND + BROWSE)
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft className="text-white" /></button>
        <div className="flex items-center gap-3">
          <img src={CS2_GAME.icon} className="w-10 h-10 object-contain drop-shadow-md opacity-90" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Counter-Strike 2</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT PANEL: QUICK MATCH (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Radar className="text-blue-500" size={20} />
              Quick Match
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sua Vibe</label>
                <div className="grid grid-cols-3 gap-2">
                  {[Vibe.TRYHARD, Vibe.CHILL, Vibe.LEARNING, Vibe.PRACTICE].map(vibe => (
                    <button
                      key={vibe}
                      onClick={() => setSelectedVibe(vibe)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold transition-colors ${selectedVibe === vibe
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between border border-white/5">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Globe size={14} /> Região</span>
                <span className="text-sm font-bold text-green-400">Brasil (15ms)</span>
              </div>

              <button
                onClick={handleStartSearch}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Play fill="currentColor" size={18} />
                BUSCAR PARTIDA
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Crown className="text-amber-500" size={18} />
              Captain Mode
            </h2>
            <p className="text-sm text-slate-400 mb-4">Crie sua própria sala, defina regras e escolha quem joga com você.</p>
            <button
              onClick={() => setActiveTab('create')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700"
            >
              Criar Sala
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LOBBY BROWSER (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-slate-400" />
              Lobbies Ativos
            </h2>
            <button onClick={fetchLobbies} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={18} className={isLoadingLobbies ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLoadingLobbies ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Carregando operações...</p>
            </div>
          ) : foundLobbies.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nenhum lobby encontrado</h3>
              <p className="text-slate-500 mb-6">Parece que está calmo por aqui. Que tal criar o primeiro?</p>
              <button onClick={() => setActiveTab('create')} className="text-amber-500 font-bold hover:underline">
                Criar Lobby Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foundLobbies
                .filter(lobby => lobby.vibe === selectedVibe)
                .map((lobby: any) => (
                  <div key={lobby.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{lobby.title || 'Sem Título'}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${lobby.vibe === Vibe.TRYHARD ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              lobby.vibe === Vibe.CHILL ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                lobby.vibe === Vibe.PRACTICE ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                  'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                            {lobby.vibe}
                          </span>
                          {lobby.min_score > 0 && <span className="text-xs text-amber-500 font-bold border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/10">{lobby.min_score}+ Score</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-1 rounded-lg">
                        <Users size={14} />
                        <span className="text-sm font-bold text-white">{lobby.players?.length}/{lobby.max_players}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex -space-x-2">
                        {lobby.players?.slice(0, 3).map((p: any, i: number) => (
                          <img key={i} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                        ))}
                        {(lobby.players?.length > 3) && (
                          <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                            +{lobby.players.length - 3}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleJoinLobby(lobby)}
                        className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
                      >
                        Entrar
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
