import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, MessageSquare, Gamepad2, Check, X, Bell } from 'lucide-react';
import { Player, Friend, FriendRequest } from '../types';
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

  const refreshData = async () => {
    const myFriends = await api.getFriends(user.id);
    const myRequests = await api.getFriendRequests(user.id);
    setFriends(myFriends);
    setRequests(myRequests);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

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
        // Remove from search results to indicate sent
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
                    <div key={friend.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors">
                        <div className="relative">
                            <img src={friend.avatar} className="w-12 h-12 rounded-full bg-slate-800" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'ingame' ? 'bg-blue-500' : 'bg-slate-500'}`}></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">{friend.username}</h3>
                            <div className="text-xs text-slate-500 font-medium">
                                {friend.status === 'online' ? 'Online' : friend.status === 'ingame' ? 'Jogando LoL' : 'Offline'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="Mensagem"><MessageSquare size={16}/></button>
                            <button className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white" title="Convidar"><Gamepad2 size={16}/></button>
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