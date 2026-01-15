
import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Users, MessageSquare, Gamepad2, Check, X, Bell, Send, ArrowLeft } from 'lucide-react';
import { Player, Friend, FriendRequest, ChatMessage } from '../types';
import { api } from '../services/api';

interface FriendsProps {
  user: Player;
}

const Friends: React.FC<FriendsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'requests'>('list');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Chat State
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const refreshData = async () => {
    const myFriends = await api.getFriends(user.id);
    const myRequests = await api.getFriendRequests(user.id);
    setFriends(myFriends);
    setRequests(myRequests);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Chat Polling
  useEffect(() => {
      let interval: any;
      if (activeChatFriend) {
          const fetchMsgs = async () => {
              const msgs = await api.getDirectMessages(user.id, activeChatFriend.id);
              setChatMessages(msgs);
          };
          fetchMsgs(); // Initial fetch
          interval = setInterval(fetchMsgs, 3000); // Poll every 3s
      }
      return () => clearInterval(interval);
  }, [activeChatFriend, user.id]);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
        const results = await api.searchUsers(searchQuery, user.id);
        setSearchResults(results);
    } finally {
        setIsSearching(false);
    }
  };

  const handleAddFriend = async (targetUser: Friend) => {
    const result = await api.sendFriendRequest(user, targetUser);
    alert(result.message);
    if(result.success) {
        setSearchResults(prev => prev.filter(u => u.id !== targetUser.id));
    }
  };

  const handleAccept = async (reqId: string) => {
    await api.acceptFriendRequest(reqId, user.id);
    refreshData();
  };

  const handleDecline = async (reqId: string) => {
    await api.rejectFriendRequest(reqId);
    refreshData();
  };

  // --- ACTIONS: CHAT & INVITE ---

  const handleOpenChat = (friend: Friend) => {
      setActiveChatFriend(friend);
  };

  const handleInviteGame = async (friend: Friend) => {
      const confirm = window.confirm(`Convidar ${friend.username} para jogar?`);
      if (confirm) {
          await api.sendGameInvite(user, friend.id);
          alert(`Convite enviado para ${friend.username}!`);
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeChatFriend) return;

      // Optimistic update
      const tempMsg: ChatMessage = {
          id: 'temp_' + Date.now(),
          senderId: user.id,
          senderName: user.username,
          text: chatInput,
          timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
      };
      setChatMessages(prev => [...prev, tempMsg]);
      const txt = chatInput;
      setChatInput('');

      await api.sendDirectMessage(user.id, activeChatFriend.id, txt);
  };

  // --- RENDER CHAT WINDOW ---
  if (activeChatFriend) {
      return (
          <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChatFriend(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                          <ArrowLeft size={20} />
                      </button>
                      <img src={activeChatFriend.avatar} className="w-10 h-10 rounded-full border border-slate-700" />
                      <div>
                          <h2 className="font-bold text-white text-lg">{activeChatFriend.username}</h2>
                          <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${activeChatFriend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                              <span className="text-xs text-slate-400">{activeChatFriend.status === 'online' ? 'Online' : 'Offline'}</span>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => handleInviteGame(activeChatFriend)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                      title="Convidar para Jogar"
                  >
                      <Gamepad2 size={20} />
                  </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar">
                  {chatMessages.length === 0 && (
                      <div className="text-center py-10 text-slate-600">
                          <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
                          <p>Comece a conversa com {activeChatFriend.username}!</p>
                      </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                      <div key={msg.id || idx} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                              msg.senderId === user.id 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                          }`}>
                              {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-600 mt-1 px-1">
                              {msg.timestamp}
                          </span>
                      </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      autoFocus
                  />
                  <button 
                      type="submit" 
                      disabled={!chatInput.trim()}
                      className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Send size={20} />
                  </button>
              </form>
          </div>
      );
  }

  // --- DEFAULT VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Central Social</h1>
          <p className="text-slate-400">Gerencie seus aliados e construa seu squad.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800">
         <button 
           onClick={() => setActiveTab('list')}
           className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'list' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
         >
           <Users size={18}/> Meus Amigos <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{friends.length}</span>
         </button>
         <button 
           onClick={() => setActiveTab('add')}
           className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'add' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
         >
           <UserPlus size={18}/> Adicionar
         </button>
         <button 
           onClick={() => setActiveTab('requests')}
           className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'requests' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
         >
           <Bell size={18}/> Solicitações
           {requests.length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs animate-pulse">{requests.length}</span>}
         </button>
      </div>

      <div className="min-h-[400px]">
        {/* LIST TAB */}
        {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.length > 0 ? friends.map(friend => (
                    <div key={friend.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors group">
                        <div className="relative">
                            <img src={friend.avatar} className="w-12 h-12 rounded-full bg-slate-800" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'ingame' ? 'bg-blue-500' : 'bg-slate-500'}`}></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{friend.username}</h3>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded border ${friend.score >= 80 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-700 text-slate-500'}`}>Score: {friend.score}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleOpenChat(friend)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" 
                                title="Enviar Mensagem"
                            >
                                <MessageSquare size={16}/>
                            </button>
                            <button 
                                onClick={() => handleInviteGame(friend)}
                                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg shadow-blue-600/20" 
                                title="Convidar para Jogo"
                            >
                                <Gamepad2 size={16}/>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Sua lista de amigos está vazia.</p>
                        <button onClick={() => setActiveTab('add')} className="text-blue-400 hover:underline mt-2">Encontrar jogadores</button>
                    </div>
                )}
            </div>
        )}

        {/* ADD TAB */}
        {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="mb-8 relative">
                    <Search className="absolute top-4 left-4 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por Nickname..." 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-bold text-sm transition-colors">
                        {isSearching ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </form>

                <div className="space-y-3">
                    {searchResults.map(result => {
                        const isAlreadyFriend = friends.some(f => f.id === result.id);
                        
                        return (
                            <div key={result.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={result.avatar} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-white">{result.username}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${result.score >= 80 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-700 text-slate-500'}`}>Score: {result.score}</span>
                                    </div>
                                </div>
                                {isAlreadyFriend ? (
                                    <span className="text-green-500 text-sm font-bold flex items-center gap-1"><Check size={14}/> Amigos</span>
                                ) : (
                                    <button 
                                        onClick={() => handleAddFriend(result)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                    >
                                        <UserPlus size={16} /> Adicionar
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {searchResults.length === 0 && searchQuery && !isSearching && (
                        <p className="text-center text-slate-500 text-sm">Nenhum usuário encontrado com este nome.</p>
                    )}
                </div>
            </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
            <div className="max-w-2xl mx-auto space-y-4">
                {requests.length > 0 ? requests.map(req => (
                    <div key={req.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-left-4">
                        <div className="flex items-center gap-4">
                            <img src={req.fromUser.avatar} className="w-12 h-12 rounded-full border-2 border-slate-700" />
                            <div>
                                <h3 className="font-bold text-white text-lg">{req.fromUser.username}</h3>
                                <p className="text-xs text-slate-400">Quer ser seu amigo • {req.timestamp}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAccept(req.id)}
                                className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg transition-colors" 
                                title="Aceitar"
                            >
                                <Check size={20} />
                            </button>
                            <button 
                                onClick={() => handleDecline(req.id)}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-colors" 
                                title="Recusar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                        <Bell size={32} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma solicitação pendente.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
