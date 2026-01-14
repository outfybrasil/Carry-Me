
import React, { useState, useEffect, useRef } from 'react';
import { Player, LobbyPlayer, ChatMessage, LobbyConfig } from '../types';
import { Send, User, Crown, Mic, Clock, MessageSquare, Play, LogOut, CheckCircle, Copy } from 'lucide-react';

interface LobbyRoomProps {
  user: Player;
  isHost: boolean;
  config: LobbyConfig;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

const LobbyRoom: React.FC<LobbyRoomProps> = ({ user, isHost, config, onStartGame, onLeaveLobby }) => {
  // Initialize with ONLY the current user
  const [players, setPlayers] = useState<LobbyPlayer[]>([
    {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isHost: isHost,
      isReady: isHost, // Host is ready by default
      role: 'Flex', // Could be dynamic
      score: user.score
    }
  ]);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [userReady, setUserReady] = useState(isHost);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const maxPlayers = config.maxPlayers || 5;
  const lobbyLink = `${window.location.origin}/lobby/${Math.random().toString(36).substring(7)}`;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // NO BOT SIMULATION - Real Logic would go here (Supabase Realtime)
  // For now, it sits static waiting for invites or real backend implementation

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.username,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChat(prev => [...prev, newMsg]);
    setInputText('');
  };

  const toggleReady = () => {
    const newState = !userReady;
    setUserReady(newState);
    setPlayers(prev => prev.map(p => p.id === user.id ? { ...p, isReady: newState } : p));
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(lobbyLink);
    alert("Link do lobby copiado! Envie para seus amigos.");
  };

  const allReady = players.length > 1 && players.length <= maxPlayers && players.every(p => p.isReady);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* LEFT: Players Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 {config.title || 'Lobby Privado'}
               </h2>
               <p className="text-slate-400 text-sm">{config.game} • {config.vibe}</p>
             </div>
             <div className="flex gap-3">
               <button onClick={copyInvite} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2 text-sm transition-colors">
                  <Copy size={14} /> Convidar
               </button>
               <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                 <span className="text-slate-400 text-sm">Jogadores:</span> <span className="text-white font-bold">{players.length}/{maxPlayers}</span>
               </div>
             </div>
           </div>

           <div className="space-y-3">
             {/* Render slots dynamically based on maxPlayers */}
             {Array.from({ length: maxPlayers }).map((_, i) => {
               const player = players[i];
               return (
                 <div key={i} className={`h-20 rounded-xl border flex items-center px-4 transition-all ${player ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-950/50 border-slate-800 border-dashed'}`}>
                   {player ? (
                     <>
                       <div className="relative">
                         <img src={player.avatar} className="w-12 h-12 rounded-full border border-slate-600" />
                         {player.isHost && <div className="absolute -top-2 -left-2 bg-yellow-500 rounded-full p-0.5"><Crown size={12} className="text-slate-900 fill-slate-900"/></div>}
                       </div>
                       <div className="ml-4 flex-1">
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-white">{player.username}</span>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded border ${player.score >= 80 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}`}>
                             Score: {player.score}
                           </span>
                         </div>
                         <div className="text-xs text-slate-400">{player.role}</div>
                       </div>
                       <div className="flex items-center gap-4">
                          <Mic size={16} className="text-slate-500" />
                          {player.isReady ? (
                            <div className="flex items-center text-green-400 text-sm font-bold bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/20">
                              <CheckCircle size={14} className="mr-1" /> PRONTO
                            </div>
                          ) : (
                            <div className="flex items-center text-slate-500 text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg">
                              <Clock size={14} className="mr-1" /> ESPERANDO
                            </div>
                          )}
                       </div>
                     </>
                   ) : (
                     <div className="w-full flex items-center justify-center text-slate-600 gap-2 animate-pulse">
                       <User size={18} />
                       <span className="text-sm font-medium">Aguardando Jogador...</span>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>

           <div className="mt-auto pt-6 flex gap-4">
             <button 
               onClick={onLeaveLobby}
               className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
             >
               <LogOut size={18} /> Sair
             </button>
             
             {isHost ? (
                <button 
                  onClick={onStartGame}
                  // For testing alone, we might allow starting, but usually requires > 1
                  className={`flex-1 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg
                    ${players.length > 0 // Allow start for testing even alone if needed, or change to players.length > 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  <Play size={20} fill="currentColor" /> {players.length === 1 ? 'Iniciar (Solo Mode)' : 'Iniciar Partida'}
                </button>
             ) : (
                <button 
                  onClick={toggleReady}
                  className={`flex-1 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg
                    ${userReady 
                      ? 'bg-slate-700 text-green-400 border border-green-500/30' 
                      : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'}`}
                >
                  {userReady ? 'Cancelar Pronto' : 'Estou Pronto!'}
                </button>
             )}
           </div>
        </div>
      </div>

      {/* RIGHT: Chat */}
      <div className="w-full md:w-96 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" /> Chat do Time
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/30">
          {chat.length === 0 && (
              <div className="text-center text-slate-600 mt-10 text-sm">
                  <p>A sala está aberta.</p>
                  <p>Convide amigos para conversar.</p>
              </div>
          )}
          {chat.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
              {msg.isSystem ? (
                <span className="text-xs text-slate-500 my-2 px-2 py-1 bg-slate-800/50 rounded-full">{msg.text}</span>
              ) : (
                <>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.senderId === user.id 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 px-1">
                    {msg.senderId !== user.id && <span className="font-bold mr-1">{msg.senderName}</span>}
                    {msg.timestamp}
                  </span>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input 
            type="text" 
            placeholder="Digite uma mensagem..." 
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyRoom;
