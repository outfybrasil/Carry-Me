
import React, { useState, useEffect, useRef } from 'react';
import { Player, LobbyPlayer, ChatMessage, LobbyConfig } from '../types';
import { Send, User, Crown, Mic, Clock, MessageSquare, Play, LogOut, CheckCircle, Copy, Wifi, Users, Zap } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

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
  const [isConnected, setIsConnected] = useState(false);
  const [starting, setStarting] = useState(false);
  
  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'players' | 'chat'>('players');

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Use a simulated Lobby ID based on the config title to group messages roughly
  // In a full app, this would be passed via props or URL params from the Matchmaking Logic
  const lobbyId = "lobby_demo_" + (config.game || "general").replace(/\s/g, '_').toLowerCase();
  
  const maxPlayers = config.maxPlayers || 5;
  const lobbyLink = `${window.location.origin}/join/${lobbyId}`;

  // Auto-scroll chat
  useEffect(() => {
    if (mobileTab === 'chat' || window.innerWidth >= 768) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, mobileTab]);

  // --- SUPABASE REALTIME SUBSCRIPTION ---
  useEffect(() => {
    setIsConnected(true);
    
    // 1. Initial fetch of history
    const fetchMessages = async () => {
        const msgs = await api.getLobbyMessages(lobbyId);
        if(msgs.length > 0) setChat(msgs);
    };
    fetchMessages();

    // 2. Subscribe to NEW messages (INSERT events)
    const channel = supabase.channel(`lobby:${lobbyId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'lobby_messages',
                filter: `lobby_id=eq.${lobbyId}`
            },
            (payload) => {
                const newMsg = payload.new;
                // Avoid duplicating if we optimistically added it (check by timestamp approx or ID if possible)
                // ideally backend returns the real ID. For demo, we just append if sender is not me (or handle duplication logic)
                
                // Transform DB shape to App shape
                const formattedMsg: ChatMessage = {
                    id: newMsg.id,
                    senderId: newMsg.user_id,
                    senderName: newMsg.username,
                    text: newMsg.text,
                    timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                // Only add if we don't have it (simple dedup based on timestamp/content risk, ideally use ID)
                setChat(prev => {
                    // Check if we already have a temp message from ourselves with same content recently?
                    // For simplicity in this demo, we assume the optimistic update is replaced or we just allow the double render briefly
                    // Better approach: Filter out optimistic messages when real one arrives
                    const filtered = prev.filter(m => !m.id.startsWith('temp_') || m.text !== formattedMsg.text);
                    return [...filtered, formattedMsg];
                });
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Connected to Realtime Lobby Chat');
            }
        });

    return () => {
        supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(''); // Clear immediately for UX

    // Optimistic Update (Immediate Feedback)
    const tempMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      senderId: user.id,
      senderName: user.username,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChat(prev => [...prev, tempMsg]);
    
    // Send to DB (Realtime subscription will pick this up and replace the temp one)
    await api.sendLobbyMessage(lobbyId, user, textToSend);
  };

  const toggleReady = () => {
    const newState = !userReady;
    setUserReady(newState);
    setPlayers(prev => prev.map(p => p.id === user.id ? { ...p, isReady: newState } : p));
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(lobbyLink);
    alert("Link do lobby copiado! (Simulação)");
  };

  const handleStartGameWrapper = async () => {
    setStarting(true);
    if(isHost) {
        // Clean up chat for next time this lobby ID is used
        await api.clearLobbyChat(lobbyId);
    }
    // Artificial delay for effect
    setTimeout(() => {
        onStartGame();
    }, 500);
  };

  // Helper components to avoid duplication between mobile/desktop views
  const PlayerList = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex-1 flex flex-col h-full">
       <div className="flex justify-between items-center mb-6">
         <div>
           <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
             {config.title || 'Lobby Privado'}
           </h2>
           <p className="text-slate-400 text-xs md:text-sm">{config.game} • {config.vibe}</p>
         </div>
         <div className="flex gap-2">
           <button onClick={copyInvite} className="bg-slate-800 hover:bg-slate-700 text-white p-2 md:px-3 md:py-2 rounded-lg border border-slate-700 flex items-center gap-2 text-sm transition-colors">
              <Copy size={14} /> <span className="hidden md:inline">Convidar</span>
           </button>
           <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-center">
             <span className="text-white font-bold text-sm">{players.length}/{maxPlayers}</span>
           </div>
         </div>
       </div>

       <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
         {/* Render slots dynamically based on maxPlayers */}
         {Array.from({ length: maxPlayers }).map((_, i) => {
           const player = players[i];
           return (
             <div key={i} className={`h-16 md:h-20 rounded-xl border flex items-center px-3 md:px-4 transition-all ${player ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-950/50 border-slate-800 border-dashed'}`}>
               {player ? (
                 <>
                   <div className="relative">
                     <img src={player.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-600" />
                     {player.isHost && <div className="absolute -top-2 -left-2 bg-yellow-500 rounded-full p-0.5"><Crown size={10} className="text-slate-900 fill-slate-900"/></div>}
                   </div>
                   <div className="ml-3 md:ml-4 flex-1 overflow-hidden">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-white text-sm md:text-base truncate">{player.username}</span>
                       <span className={`text-[10px] px-1.5 py-0.5 rounded border hidden sm:inline-block ${player.score >= 80 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}`}>
                         {player.score} Rep
                       </span>
                     </div>
                     <div className="text-[10px] md:text-xs text-slate-400">{player.role}</div>
                   </div>
                   <div className="flex items-center gap-2 md:gap-4">
                      <Mic size={14} className="text-slate-500 hidden sm:block" />
                      {player.isReady ? (
                        <div className="flex items-center text-green-400 text-xs md:text-sm font-bold bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
                          <CheckCircle size={12} className="mr-1" /> <span className="hidden sm:inline">PRONTO</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-500 text-xs md:text-sm font-bold bg-slate-800 px-2 py-1 rounded-lg">
                          <Clock size={12} className="mr-1" /> <span className="hidden sm:inline">...</span>
                        </div>
                      )}
                   </div>
                 </>
               ) : (
                 <div className="w-full flex items-center justify-center text-slate-600 gap-2 animate-pulse">
                   <User size={16} />
                   <span className="text-xs md:text-sm font-medium">Vaga</span>
                 </div>
               )}
             </div>
           );
         })}
       </div>

       <div className="mt-4 pt-4 md:mt-auto md:pt-6 flex gap-3 border-t border-slate-800 md:border-0">
         <button 
           onClick={onLeaveLobby}
           className="px-4 md:px-6 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
         >
           <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
         </button>
         
         {isHost ? (
            <button 
              onClick={handleStartGameWrapper}
              disabled={starting}
              className={`flex-1 py-3 md:py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-lg
                ${players.length > 0 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <Play size={20} fill="currentColor" /> 
              {starting ? 'Iniciando...' : (players.length === 1 ? 'Iniciar (Solo)' : 'Iniciar Partida')}
            </button>
         ) : (
            <button 
              onClick={toggleReady}
              className={`flex-1 py-3 md:py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-lg
                ${userReady 
                  ? 'bg-slate-700 text-green-400 border border-green-500/30' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'}`}
            >
              {userReady ? 'Cancelar Pronto' : 'Estou Pronto!'}
            </button>
         )}
       </div>
    </div>
  );

  const ChatArea = () => (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
      <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
          <MessageSquare size={16} className="text-blue-500" /> Chat do Time
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className={isConnected ? 'text-green-500' : 'text-slate-500'}>{isConnected ? 'Realtime' : 'Conectando...'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar bg-slate-950/30">
        {chat.length === 0 && (
            <div className="text-center text-slate-600 mt-10 text-sm">
                <Wifi size={24} className="mx-auto mb-2 opacity-20" />
                <p>Inicie a conversa...</p>
                <p className="text-xs text-slate-700 mt-1">Conectado via Supabase Realtime</p>
            </div>
        )}
        {chat.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.senderId === user.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            {msg.isSystem ? (
              <span className="text-[10px] text-slate-500 my-2 px-2 py-1 bg-slate-800/50 rounded-full border border-slate-800">{msg.text}</span>
            ) : (
              <>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${
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

      <form onSubmit={handleSendMessage} className="p-2 md:p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          placeholder={isConnected ? "Mensagem..." : "Conectando..."}
          disabled={!isConnected}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || !isConnected}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* MOBILE TABS */}
      <div className="md:hidden flex mb-4 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
          <button 
            onClick={() => setMobileTab('players')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileTab === 'players' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
          >
             <Users size={16} /> Squad ({players.length})
          </button>
          <button 
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileTab === 'chat' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
          >
             <MessageSquare size={16} /> Chat
             {chat.length > 0 && <span className="bg-blue-600 text-[10px] px-1.5 rounded-full ml-1 animate-pulse">{chat.length}</span>}
          </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Mobile: Render based on Tab. Desktop: Render both. */}
        <div className={`flex-1 flex-col gap-4 ${mobileTab === 'players' ? 'flex' : 'hidden md:flex'}`}>
            <PlayerList />
        </div>

        <div className={`w-full md:w-96 flex-col ${mobileTab === 'chat' ? 'flex h-full' : 'hidden md:flex'}`}>
            <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default LobbyRoom;
