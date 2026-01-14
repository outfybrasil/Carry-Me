import React, { useState, useEffect } from 'react';
import { Vibe, LobbyConfig } from '../types';
import { Loader2, Mic, Crown, Lock, Settings, Users, Gamepad2, Search, ArrowLeft } from 'lucide-react';

interface MatchLobbyProps {
  onCancel: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onMatchFound: () => void;
  onCreateLobby: (config: LobbyConfig) => void;
}

const GAMES = [
  { id: 'lol', name: 'League of Legends', color: 'from-blue-600 to-blue-400', icon: 'https://img.icons8.com/color/96/league-of-legends.png', maxLimit: 5 },
  { id: 'cs2', name: 'CS2', color: 'from-orange-600 to-yellow-500', icon: 'https://1000logos.net/wp-content/uploads/2025/10/Counter-Strike-2-CS2-%E2%80%93-A-Modern-Evolution-2023%E2%80%93Present.png', maxLimit: 5 },
  { id: 'valorant', name: 'Valorant', color: 'from-red-600 to-rose-500', icon: 'https://img.icons8.com/windows/96/FA5252/valorant.png', maxLimit: 5 },
  { id: 'apex', name: 'Apex Legends', color: 'from-red-700 to-orange-600', icon: 'https://logosmarcas.net/wp-content/uploads/2020/11/Apex-Legends-Logo.png', maxLimit: 3 },
  { id: 'r6', name: 'Rainbow Six Siege', color: 'from-slate-700 to-slate-500', icon: 'https://fbi.cults3d.com/uploaders/20470091/illustration-file/4a3bc3b5-3a54-4c8d-bdfa-0232fc950341/Rainbow-Six-Symbol.png', maxLimit: 5 }
];

const MatchLobby: React.FC<MatchLobbyProps> = ({ onCancel, isPremium, onUpgrade, onMatchFound, onCreateLobby }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'find' | 'create'>('find');
  const [selectedVibe, setSelectedVibe] = useState<Vibe>(Vibe.TRYHARD);
  const [isSearching, setIsSearching] = useState(false);
  const [timer, setTimer] = useState(0);

  // Host State
  const [lobbyConfig, setLobbyConfig] = useState<LobbyConfig>({
    title: '',
    minScore: 50,
    micRequired: true,
    vibe: Vibe.TRYHARD,
    game: 'League of Legends',
    maxPlayers: 5
  });

  useEffect(() => {
    let interval: any;
    if (isSearching) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  // Simulate finding a match
  useEffect(() => {
    if (isSearching && activeTab === 'find' && timer > 3) {
      // Auto-accept simulation
    }
  }, [isSearching, timer, activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCreateLobby = () => {
    if(!lobbyConfig.title) {
        alert("Por favor, dê um nome para sua sala.");
        return;
    }
    onCreateLobby(lobbyConfig);
  };

  const handleGameSelect = (gameId: string, gameName: string, maxPlayers: number) => {
    setSelectedGame(gameId);
    setLobbyConfig(prev => ({ 
        ...prev, 
        game: gameName,
        maxPlayers: maxPlayers
    }));
  };

  // --- STEP 1: GAME SELECTION ---
  if (!selectedGame) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center mb-8">
           <button onClick={onCancel} className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft /></button>
           <h1 className="text-3xl font-bold text-white">Escolha seu Jogo</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
           {GAMES.map((game) => (
             <button
               key={game.id}
               onClick={() => handleGameSelect(game.id, game.name, game.maxLimit)}
               className="group relative h-64 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
             >
                <div className={`absolute inset-0 bg-gradient-to-b ${game.color} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                   <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img src={game.icon} alt={game.name} className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
                   </div>
                   <h3 className="text-xl font-bold text-white text-center group-hover:scale-110 transition-transform">{game.name}</h3>
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
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-4">
             <div className={`p-3 rounded-xl bg-gradient-to-br ${currentGameObj?.color}`}>
                <img src={currentGameObj?.icon} className="w-8 h-8 invert brightness-0 object-contain" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white">{currentGameObj?.name}</h2>
                <button onClick={() => setSelectedGame(null)} className="text-xs text-slate-400 hover:text-white underline">Trocar Jogo</button>
             </div>
         </div>
         
         {/* Mode Toggle */}
         {!isSearching && (
           <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800">
            <button 
              onClick={() => setActiveTab('find')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'find' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Encontrar
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-amber-400'}`}
            >
              <Crown size={14} />
              Criar (Captain)
            </button>
          </div>
         )}
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-slate-900/50 rounded-3xl border border-slate-800">
           <div className="relative mb-8">
             <div className={`absolute inset-0 blur-xl opacity-20 animate-pulse rounded-full ${activeTab === 'create' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
             <Loader2 className={`w-24 h-24 animate-spin relative z-10 ${activeTab === 'create' ? 'text-amber-500' : 'text-blue-500'}`} />
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-2">
             {timer > 3 && activeTab === 'find' ? "Partida Encontrada!" : (activeTab === 'create' ? "Configurando Servidor..." : "Escaneando Jogadores...")}
           </h2>
           <p className="text-slate-400 mb-6">{currentGameObj?.name} • {selectedVibe}</p>
           <div className="text-4xl font-mono text-slate-300 mb-8">{formatTime(timer)}</div>

           {timer > 3 && activeTab === 'find' && (
             <button 
               onClick={onMatchFound} 
               className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl animate-bounce shadow-lg shadow-green-500/30"
             >
               Aceitar Partida
             </button>
           )}
           
           <button 
            onClick={() => setIsSearching(false)}
            className="mt-4 text-sm text-slate-500 hover:text-white"
           >
             Cancelar Busca
           </button>
        </div>
      ) : activeTab === 'find' ? (
        // FIND MATCH MODE
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 text-white">Qual a vibe de hoje?</h1>
            <p className="text-slate-400">Isso define quem será colocado no seu time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

          <button 
            onClick={() => setIsSearching(true)}
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
                <h2 className="text-3xl font-bold text-white mb-4">Captain Mode Bloqueado</h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
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
                    <div className="flex gap-4">
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