
import React, { useState, useEffect } from 'react';
import { Player, LobbyPlayer, ChatMessage, LobbyConfig } from '../types';
import { Users, MessageSquare, Terminal, Cpu } from 'lucide-react';
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
  const [players, setPlayers] = useState<LobbyPlayer[]>([
    {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isHost: isHost,
      isReady: isHost,
      role: 'FLEX_OPERATOR',
      score: user.score,
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
  const [mobileTab, setMobileTab] = useState<'players' | 'chat'>('players');

  const lobbyId = propLobbyId || "";
  const maxPlayers = config.maxPlayers || 5;
  const lobbyLink = `${window.location.origin}/join/${lobbyId}`;

  useEffect(() => {
    if (!propLobbyId) return;

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

  useEffect(() => {
    setIsConnected(true);
    const fetchMessages = async () => {
      const msgs = await api.getLobbyMessages(lobbyId);
      if (msgs.length > 0) setChat(msgs);
    };
    fetchMessages();

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    const tempMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      senderId: user.id,
      senderName: user.username,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChat(prev => [...prev, tempMsg]);
    await api.sendLobbyMessage(lobbyId, user, textToSend);
  };

  const toggleReady = () => {
    const newState = !userReady;
    setUserReady(newState);
    const updatedPlayers = players.map(p => p.id === user.id ? { ...p, isReady: newState } : p);
    setPlayers(updatedPlayers);
    if (propLobbyId) api.updateLobbyPlayers(propLobbyId, updatedPlayers);
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(lobbyLink);
    alert("LINK_DE_IDENTIFICACAO_COPIADO");
  };

  const handleStartGameWrapper = async () => {
    setStarting(true);
    if (isHost) {
      await api.clearLobbyChat(lobbyId);
    }
    setTimeout(() => {
      onStartGame();
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in zoom-in-95 duration-500 noise-bg grid-bg scanline">
      {/* HUD HEADER (Mobile Tab Terminal) */}
      <div className="md:hidden flex mb-6 p-1.5 bg-[#121417] rounded-sm border border-white/5 shrink-0 shadow-2xl">
        <button
          onClick={() => setMobileTab('players')}
          className={`flex-1 py-3 text-[10px] font-mono font-black rounded-sm flex items-center justify-center gap-3 transition-all ${mobileTab === 'players' ? 'bg-[#ffb800] text-black shadow-lg' : 'text-slate-600'}`}
        >
          <Users size={14} /> SQUAD_MONITOR
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-[10px] font-mono font-black rounded-sm flex items-center justify-center gap-3 transition-all ${mobileTab === 'chat' ? 'bg-[#ffb800] text-black shadow-lg' : 'text-slate-600'}`}
        >
          <MessageSquare size={14} /> COMM_LINK
          {chat.length > 0 && <span className="bg-black text-[9px] px-2 py-0.5 rounded-full ml-2 animate-pulse text-[#ffb800] border border-[#ffb800]/50">{chat.length}</span>}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-10 min-h-0 relative">
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

        <div className={`w-full md:w-[400px] flex-col ${mobileTab === 'chat' ? 'flex h-full pb-20 md:pb-0' : 'hidden md:flex'}`}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <Cpu size={14} className="text-[#ffb800]" />
            <span className="text-[9px] font-mono font-black text-slate-700 uppercase tracking-[0.4em]">Subsystem_Status: Verified</span>
          </div>
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
