
import React, { useState, useEffect, useRef } from 'react';
import { Vibe, LobbyConfig } from '../types';
import { Loader2, Mic, Crown, Lock, Settings, Users, Search, ArrowLeft, XCircle, RefreshCw, Radar, Signal, Globe } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

interface MatchLobbyProps {
  onCancel: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onMatchFound: (lobbyId?: string, config?: LobbyConfig) => void;
  onCreateLobby: (config: LobbyConfig, lobbyId?: string) => void;
}

const GAMES = [
  { id: 'lol', name: 'League of Legends', color: 'from-blue-600 to-blue-400', icon: 'https://img.icons8.com/color/96/league-of-legends.png', maxLimit: 5 },
  { id: 'cs2', name: 'CS2', color: 'from-orange-600 to-yellow-500', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Counter-Strike_2_logo.svg/240px-Counter-Strike_2_logo.svg.png', maxLimit: 5 },
  { id: 'valorant', name: 'Valorant', color: 'from-red-600 to-rose-500', icon: 'https://img.icons8.com/color/96/valorant.png', maxLimit: 5 },
  { id: 'apex', name: 'Apex Legends', color: 'from-red-700 to-orange-600', icon: 'https://www.pngall.com/wp-content/uploads/13/Apex-Legends-Logo-PNG-Cutout.png', maxLimit: 3 },
  { id: 'r6', name: 'Rainbow Six Siege', color: 'from-slate-700 to-slate-500', icon: 'https://img.icons8.com/color/96/rainbow-six-siege.png', maxLimit: 5 }
];

const MatchLobby: React.FC<MatchLobbyProps> = ({ onCancel, isPremium, onUpgrade, onMatchFound, onCreateLobby }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'find' | 'create'>('find');
  const [selectedVibe, setSelectedVibe] = useState<Vibe>(Vibe.TRYHARD);
  
  // Search State Machine
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'expanding' | 'found' | 'failed' | 'browsing'>('idle');
  const [timer, setTimer] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [foundLobbies, setFoundLobbies] = useState<any[]>([]);

  // Host State
  const [lobbyConfig, setLobbyConfig] = useState<LobbyConfig>({
    title: '',
    minScore: 50,
    micRequired: true,
    vibe: Vibe.TRYHARD,
    game: 'League of Legends',
    maxPlayers: 5
  });

  // Sound Effect Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playPing = () => {
      if(!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
  }

  const playSuccess = () => {
      if(!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
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
  }

  // Timer & Queue Logic
  useEffect(() => {
    let interval: any;
    let queueSubscription: any;

    if (searchStatus === 'searching' || searchStatus === 'expanding') {
      
      // Timer interval
      interval = setInterval(() => {
        setTimer(t => t + 1);
        
        // Attempt match creation if acting as "host" (Client-side load balancing)
        if (timer > 5 && timer % 5 === 0) {
            const gameName = GAMES.find(g => g.id === selectedGame)?.name || '';
            api.attemptMatchmaking(gameName, selectedVibe);
        }

        // Fetch real queue size
        api.getQueueStats().then(count => setPlayersInQueue(count));
        
        // Visual ping effect
        if (timer % 2 === 0) playPing();

      }, 1000);

      // --- REALTIME MATCH LISTENER ---
      const setupListener = async () => {
          const user = await api.checkSession();
          if(user) {
              // Listen for match creation where I am a participant
              queueSubscription = api.subscribeToMatchFound(user.id, (matchId) => {
                  setSearchStatus('found');
                  playSuccess();
                  // Vibrate device if mobile
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
        if(queueSubscription) queueSubscription();
    };
  }, [searchStatus, selectedGame, selectedVibe]);

  // Robust Search Logic (Fallback)
  useEffect(() => {
    if (searchStatus === 'searching') {
      // Set initial random estimated time
      const est = Math.floor(Math.random() * 25) + 15;
      setEstimatedTime(est);
      
      const expandTimeout = setTimeout(() => {
          if(searchStatus === 'searching') setSearchStatus('expanding');
      }, 15000); // 15s before expanding search parameters

      return () => {
          clearTimeout(expandTimeout);
      };
    }
  }, [searchStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCreateLobby = async () => {
    if(!lobbyConfig.title) {
        alert("Por favor, dê um nome para sua sala.");
        return;
    }
    
    const user = await api.checkSession();
    if(user) {
        const lobbyId = await api.createLobby(lobbyConfig, user);
        if(lobbyId) onCreateLobby(lobbyConfig, lobbyId);
    }
  };

  const handleGameSelect = (gameId: string, gameName: string, maxPlayers: number) => {
    setSelectedGame(gameId);
    setLobbyConfig(prev => ({ 
        ...prev, 
        game: gameName,
        maxPlayers: maxPlayers
    }));
  };

  const startSearch = async () => {
      setSearchStatus('searching');
      const gameName = GAMES.find(g => g.id === selectedGame)?.name || '';
      
      // Fetch lobbies instead of auto-joining
      const lobbies = await api.getOpenLobbies(gameName, selectedVibe);
      setFoundLobbies(lobbies);
      setSearchStatus('browsing');
  };

  const joinSpecificLobby = async (lobby: any) => {
      const user = await api.checkSession();
      if(!user) return;

      const success = await api.joinLobby(lobby.id, user);
      if (success) {
          const config = {
              title: lobby.title,
              game: lobby.game,
              vibe: lobby.vibe,
              minScore: lobby.min_score,
              micRequired: lobby.mic_required,
              maxPlayers: lobby.max_players
          };
          onMatchFound(lobby.id, config);
      } else {
          alert("Não foi possível entrar na sala (pode estar cheia ou fechada).");
          startSearch(); // Refresh list
      }
  };

  const joinAutoQueue = async () => {
      const user = await api.checkSession();
      if(!user) return;
      const gameName = GAMES.find(g => g.id === selectedGame)?.name || '';
      
      // Join DB Queue
      const success = await api.joinQueue(user.id, gameName, selectedVibe);
      
      if(success) {
          setSearchStatus('searching');
      } else {
          // If DB is missing, run simulation for demo purposes
          setSearchStatus('searching');
          // Simulate a match found after 8 seconds
          setTimeout(() => {
              setSearchStatus('found');
              playSuccess();
          }, 8000);
      }
  }

  const cancelSearch = async () => {
      const user = await api.checkSession();
      if(user) {
          await api.leaveQueue(user.id);
      }
      setSearchStatus('idle');
  };

  // --- STEP 1: GAME SELECTION ---
  if (!selectedGame) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center mb-8">
           <button onClick={onCancel} className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft /></button>
           <h1 className="text-3xl font-bold text-white">Escolha seu Jogo</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
           {GAMES.map((game) => (
             <button
               key={game.id}
               onClick={() => handleGameSelect(game.id, game.name, game.maxLimit)}
               className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
             >
                <div className={`absolute inset-0 bg-gradient-to-b ${game.color} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                   <div className="w-20 h-20 md:w-24 md:h-24 mb-4 md:mb-6 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img src={game.icon} alt={game.name} className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
                   </div>
                   <h3 className="text-lg md:text-xl font-bold text-white text-center group-hover:scale-110 transition-transform">{game.name}</h3>
                   <span className="mt-2 text-xs text-white/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Selecionar</span>
                </div>
             </button>
           ))}
        </div>
      </div>
    );
  }

  // --- STEP 2: LOBBY CONFIG / FIND ---
  const currentGameObj = GAMES.find(g => g.id === selectedGame);
  const maxGameLimit = currentGameObj?.maxLimit || 5;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header with Game Change */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
         <div className="flex items-center gap-4">
             <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <img src={currentGameObj?.icon} className="w-8 h-8 object-contain" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{currentGameObj?.name}</h2>
                <button onClick={() => setSelectedGame(null)} className="text-xs text-slate-400 hover:text-white underline">Trocar Jogo</button>
             </div>
         </div>
         
         {/* Mode Toggle */}
         {searchStatus === 'idle' && (
           <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800">
            <button 
              onClick={() => setActiveTab('find')}
              className={`px-3 md:px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'find' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Encontrar
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-3 md:px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-amber-400'}`}
            >
              <Crown size={14} className="hidden md:block"/>
              <span className="md:hidden">Criar</span>
              <span className="hidden md:inline">Criar (Captain)</span>
            </button>
          </div>
         )}
      </div>

      {searchStatus !== 'idle' ? (
        <div className={`flex flex-col ${searchStatus === 'browsing' ? 'items-stretch justify-start text-left' : 'items-center justify-center text-center'} min-h-[50vh] bg-slate-900/50 rounded-3xl border border-slate-800 transition-all relative overflow-hidden p-6`}>
           
           {/* Dynamic Background for Searching */}
           {(searchStatus === 'searching' || searchStatus === 'expanding') && (
               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] border border-blue-500/10 rounded-full animate-[ping_3s_linear_infinite]"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] border border-blue-500/20 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
               </div>
           )}

           {/* SEARCHING / EXPANDING STATE */}
           {(searchStatus === 'searching' || searchStatus === 'expanding') && (
             <div className="relative z-10 w-full max-w-md">
               <div className="relative mb-8 mx-auto w-24 h-24 md:w-32 md:h-32">
                 <div className={`absolute inset-0 blur-2xl opacity-30 animate-pulse rounded-full ${activeTab === 'create' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                 <div className="relative z-10 w-full h-full bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center">
                    <Radar className={`w-12 h-12 md:w-16 md:h-16 animate-[spin_3s_linear_infinite] ${activeTab === 'create' ? 'text-amber-500' : 'text-blue-500'}`} />
                 </div>
               </div>
               
               <h2 className="text-xl md:text-2xl font-bold text-white mb-2 animate-pulse">
                 {searchStatus === 'expanding' ? "Expandindo Busca..." : "Buscando Aliados..."}
               </h2>
               <p className="text-slate-400 mb-8">{currentGameObj?.name} • {selectedVibe}</p>
               
               <div className="grid grid-cols-2 gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold">Tempo Decorrido</div>
                      <div className="text-lg md:text-xl font-mono text-white">{formatTime(timer)}</div>
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold">Estimado</div>
                      <div className="text-lg md:text-xl font-mono text-slate-400">~{formatTime(estimatedTime)}</div>
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-center gap-1"><Users size={10}/> Fila (Real)</div>
                      <div className="text-lg md:text-xl font-mono text-white">{playersInQueue}</div>
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-center gap-1"><Signal size={10}/> Score Range</div>
                      <div className="text-lg md:text-xl font-mono text-white">{searchStatus === 'expanding' ? '±20' : '±10'}</div>
                  </div>
               </div>
               
               <button 
                onClick={cancelSearch}
                className="text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-6 py-2 rounded-full border border-red-500/20 transition-colors"
               >
                 Cancelar Busca
               </button>
             </div>
           )}

           {/* FOUND STATE */}
           {searchStatus === 'found' && (
             <div className="animate-in zoom-in duration-300 relative z-10">
                <div className="relative mb-8">
                   <div className="absolute inset-0 bg-green-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                   <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center relative z-10 border-4 border-green-500 mx-auto">
                      <Users size={56} className="text-green-500" />
                   </div>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Partida Encontrada!</h2>
                <p className="text-slate-300 mb-8 text-base md:text-lg">Seu squad está pronto.</p>
                
                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={onMatchFound} 
                        className="px-8 py-4 md:px-12 md:py-5 bg-green-600 hover:bg-green-500 text-white font-bold text-lg md:text-xl rounded-2xl animate-bounce shadow-xl shadow-green-600/30 transition-all transform hover:scale-105"
                        >
                        ACEITAR PARTIDA
                    </button>
                    <p className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">Aceitar automaticamente em 10s...</p>
                </div>
             </div>
           )}

           {/* BROWSING STATE (Lobby List) */}
           {searchStatus === 'browsing' && (
             <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Salas Disponíveis</h2>
                    <button onClick={startSearch} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors" title="Atualizar">
                        <RefreshCw size={18} className="text-slate-400" />
                    </button>
                </div>

                {foundLobbies.length > 0 ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {foundLobbies.map((lobby: any) => {
                            const host = lobby.players?.find((p: any) => p.isHost) || lobby.players?.[0];
                            return (
                                <div key={lobby.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:border-blue-500/50 transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={host?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=host'} className="w-12 h-12 rounded-full border border-slate-700" />
                                            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                                                <Crown size={12} className="text-amber-500 fill-amber-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{lobby.title || 'Lobby sem título'}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Users size={12}/> {lobby.players?.length || 1}/{lobby.max_players}</span>
                                                {lobby.mic_required && <span className="flex items-center gap-1 text-slate-400"><Mic size={12}/> Mic On</span>}
                                                {lobby.min_score > 0 && <span className="text-green-400 font-bold">{lobby.min_score}+ Rep</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => joinSpecificLobby(lobby)}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto"
                                    >
                                        Entrar
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                        <Users size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma sala encontrada</h3>
                        <p className="text-slate-400 mb-6">Não há lobbies abertos para {selectedVibe} no momento.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => setActiveTab('create')} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors">
                                Criar Sala
                            </button>
                            <button onClick={joinAutoQueue} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                                Entrar na Fila Automática
                            </button>
                        </div>
                    </div>
                )}
                
                <button onClick={cancelSearch} className="mt-6 text-slate-500 hover:text-white text-sm underline w-full text-center">Voltar</button>
             </div>
           )}
        </div>
      ) : activeTab === 'find' ? (
        // FIND MATCH MODE CONFIG
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Qual a vibe de hoje?</h1>
            <p className="text-slate-400">Isso define quem será colocado no seu time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {[Vibe.TRYHARD, Vibe.CHILL, Vibe.LEARNING].map((vibe) => (
              <button
                key={vibe}
                onClick={() => setSelectedVibe(vibe)}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group hover:-translate-y-1 ${
                  selectedVibe === vibe 
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className={`text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors ${selectedVibe === vibe ? 'text-white' : 'text-slate-300'}`}>{vibe}</div>
                <p className="text-sm text-slate-500 group-hover:text-slate-400">
                  {vibe === Vibe.TRYHARD && "Vitória acima de tudo. Comunicação tática obrigatória."}
                  {vibe === Vibe.CHILL && "Diversão em primeiro lugar. Erros são perdoados."}
                  {vibe === Vibe.LEARNING && "Foco em evoluir. Mentores e novatos bem-vindos."}
                </p>
                {selectedVibe === vibe && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-8 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Globe size={20} className="text-slate-400" />
                <div>
                    <div className="text-sm font-bold text-white">Região: Brasil (BR)</div>
                    <div className="text-xs text-slate-500">Latência estimada: 15ms</div>
                </div>
             </div>
             <div className="text-green-400 text-[10px] md:text-xs font-bold bg-green-400/10 px-2 py-1 rounded">Ótima Conexão</div>
          </div>

          <button 
            onClick={startSearch}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3"
          >
            <Search size={24} />
            Buscar Partida
          </button>
        </div>
      ) : (
        // CREATE LOBBY MODE
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           {!isPremium ? (
             // UPSELL BLOCKER
             <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <Crown className="w-20 h-20 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Captain Mode Bloqueado</h2>
                <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-8">
                  Assuma o controle total do lobby. Filtre por score, chute tóxicos e garanta a comp perfeita.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10 text-left">
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/20">
                      <Settings className="text-amber-400 mb-2" />
                      <h3 className="font-bold text-amber-200">Regras Finas</h3>
                      <p className="text-sm text-slate-400">Defina Score Mínimo para entrar.</p>
                   </div>
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/20">
                      <Lock className="text-amber-400 mb-2" />
                      <h3 className="font-bold text-amber-200">Admin Tools</h3>
                      <p className="text-sm text-slate-400">Poder de kick e ban no lobby.</p>
                   </div>
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/20">
                      <Users className="text-amber-400 mb-2" />
                      <h3 className="font-bold text-amber-200">Slots VIP</h3>
                      <p className="text-sm text-slate-400">Reserve vagas para amigos.</p>
                   </div>
                </div>

                <button 
                  onClick={onUpgrade}
                  className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
                >
                  Desbloquear Premium Agora
                </button>
             </div>
           ) : (
             // PREMIUM CONFIG FORM
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2 pb-4 border-b border-slate-800">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Crown className="text-amber-500" size={20} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Configurar Lobby ({currentGameObj?.name})</h1>
                      <p className="text-xs text-slate-500">Você é o capitão.</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Título da Sala</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Rumo ao Diamante - Sem Rage"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none transition-colors"
                      value={lobbyConfig.title}
                      onChange={(e) => setLobbyConfig({...lobbyConfig, title: e.target.value})}
                    />
                  </div>

                  {/* Vibe Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Vibe do Lobby</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {[Vibe.TRYHARD, Vibe.CHILL, Vibe.LEARNING].map(vibe => (
                        <button
                          key={vibe}
                          onClick={() => setLobbyConfig({...lobbyConfig, vibe})}
                          className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${
                            lobbyConfig.vibe === vibe 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Players & Min Score */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-400">Reputação Mínima</label>
                            <span className={`font-bold ${lobbyConfig.minScore > 0 ? 'text-green-400' : 'text-slate-400'}`}>{lobbyConfig.minScore}</span>
                        </div>
                        <input 
                            type="range" 
                            min="-20" 
                            max="100" 
                            step="5"
                            value={lobbyConfig.minScore}
                            onChange={(e) => setLobbyConfig({...lobbyConfig, minScore: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      <div>
                         <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-400">Tamanho do Time</label>
                            <span className="font-bold text-white">{lobbyConfig.maxPlayers} Jogadores</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" 
                            max={maxGameLimit} 
                            step="1"
                            value={lobbyConfig.maxPlayers}
                            onChange={(e) => setLobbyConfig({...lobbyConfig, maxPlayers: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                         <p className="text-xs text-slate-500 mt-2">Máximo permitido em {currentGameObj?.name}: {maxGameLimit}</p>
                      </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                       <Mic className="text-slate-400" />
                       <div>
                         <div className="font-bold text-white">Microfone Obrigatório</div>
                         <div className="text-xs text-slate-500">Jogadores sem mic detectado serão removidos.</div>
                       </div>
                    </div>
                    <button 
                      onClick={() => setLobbyConfig({...lobbyConfig, micRequired: !lobbyConfig.micRequired})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${lobbyConfig.micRequired ? 'bg-amber-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${lobbyConfig.micRequired ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="pt-4 flex gap-4">
                     <button 
                       onClick={handleCreateLobby}
                       className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02]"
                     >
                       Criar Sala de {currentGameObj?.name}
                     </button>
                  </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default MatchLobby;
