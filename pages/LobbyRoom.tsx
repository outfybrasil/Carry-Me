
import React, { useState, useEffect } from 'react';
import { Player, LobbyPlayer, ChatMessage, LobbyConfig } from '../types';
import { Users, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import LobbyChat from '../components/lobby/LobbyChat';
import LobbyPlayerList from '../components/lobby/LobbyPlayerList';

interface LobbyRoomProps {
  user: Player;
  isHost: boolean;
  config: LobbyConfig;
  lobbyId?: string | null;
  onStartGame: () => void;
  onLeaveLobby: () => void;
  onViewProfile: (username: string) => void;
}

const LobbyRoom: React.FC<LobbyRoomProps> = ({ user, isHost, config, lobbyId: propLobbyId, onStartGame, onLeaveLobby, onViewProfile }) => {
  // Initialize with ONLY the current user
  const [players, setPlayers] = useState<LobbyPlayer[]>([
    {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isHost: isHost,
      isReady: isHost, // Host is ready by default
      role: 'Flex', // Could be dynamic
      score: user.score,
      // Visual Equips
      title: user.equipped.title,
      entryEffect: user.equipped.entryEffect,
      nameColor: user.equipped.nameColor,
      border: user.equipped.border,
      banner: user.equipped.banner
    }
  ]);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [userReady, setUserReady] = useState(isHost);
  const [isConnected, setIsConnected] = useState(false);
  const [starting, setStarting] = useState(false);

  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'players' | 'chat'>('players');

  // Use a simulated Lobby ID based on the config title to group messages roughly
  // In a full app, this would be passed via props or URL params from the Matchmaking Logic
  const lobbyId = propLobbyId || "lobby_demo_" + (config.game || "general").replace(/\s/g, '_').toLowerCase();

  const maxPlayers = config.maxPlayers || 5;
  const lobbyLink = `${window.location.origin}/join/${lobbyId}`;

  // --- SYNC PLAYERS (REAL LOBBY) ---
  useEffect(() => {
    if (!propLobbyId) return;

    // CORREÇÃO: Buscar estado inicial imediatamente ao entrar
    const fetchLobbyState = async () => {
      const { data } = await supabase.from('lobbies').select('players').eq('id', propLobbyId).single();
      if (data && data.players) {
        setPlayers(data.players);
      }
    };
    fetchLobbyState();

    const channel = supabase.channel(`lobby_state:${propLobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${propLobbyId}`
        },
        (payload) => {
          const updatedLobby = payload.new;
          if (updatedLobby.players) {
            setPlayers(updatedLobby.players);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [propLobbyId]);

  // --- SUPABASE REALTIME SUBSCRIPTION ---
  useEffect(() => {
    setIsConnected(true);

    // 1. Initial fetch of history
    const fetchMessages = async () => {
      const msgs = await api.getLobbyMessages(lobbyId);
      if (msgs.length > 0) setChat(msgs);
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
          // Transform DB shape to App shape
          const formattedMsg: ChatMessage = {
            id: newMsg.id,
            senderId: newMsg.user_id,
            senderName: newMsg.username,
            text: newMsg.text,
            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setChat(prev => {
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

    const updatedPlayers = players.map(p => p.id === user.id ? { ...p, isReady: newState } : p);
    setPlayers(updatedPlayers);

    // Sync with DB if real lobby
    if (propLobbyId) api.updateLobbyPlayers(propLobbyId, updatedPlayers);
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(lobbyLink);
    alert("Link do lobby copiado! (Simulação)");
  };

  const handleStartGameWrapper = async () => {
    setStarting(true);
    if (isHost) {
      // Clean up chat for next time this lobby ID is used
      await api.clearLobbyChat(lobbyId);
    }
    // Artificial delay for effect
    setTimeout(() => {
      onStartGame();
    }, 500);
  };

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
          <LobbyPlayerList
            players={players}
            config={config}
            isHost={isHost}
            maxPlayers={maxPlayers}
            userReady={userReady}
            starting={starting}
            onViewProfile={onViewProfile}
            onCopyInvite={copyInvite}
            onLeaveLobby={onLeaveLobby}
            onStartGame={handleStartGameWrapper}
            onToggleReady={toggleReady}
          />
        </div>

        <div className={`w-full md:w-96 flex-col ${mobileTab === 'chat' ? 'flex h-full' : 'hidden md:flex'}`}>
          <LobbyChat
            chat={chat}
            user={user}
            isConnected={isConnected}
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default LobbyRoom;
