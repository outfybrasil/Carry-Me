import React, { useState, useEffect } from 'react';
import { X, Gift, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Player, Friend, StoreItem } from '../types';
import { api } from '../services/api';

interface GiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: StoreItem;
    user: Player;
}

const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, item, user }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadFriends();
            setSuccess(false);
            setSelectedFriend(null);
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        setFilteredFriends(
            friends.filter(f => f.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, friends]);

    const loadFriends = async () => {
        setLoading(true);
        try {
            const data = await api.getFriends(user.id);
            setFriends(data);
        } catch (e) {
            console.error(e);
            setError('Erro ao carregar lista de amigos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendGift = async () => {
        if (!selectedFriend) return;
        setSending(true);
        setError('');

        try {
            const result = await api.sendGift(user.id, selectedFriend.id, item.id, item.price);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(result.error || 'Erro ao enviar presente.');
            }
        } catch (e) {
            setError('Erro de conexão.');
        } finally {
            setSending(false);
        }
    };

    const isEligible = (friend: Friend) => {
        if (!friend.since) return true; // Legacy friends are eligible
        const date = new Date(friend.since);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 3;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Gift className="text-pink-500" /> Presentear Amigo
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

                    {success ? (
                        <div className="text-center py-10 animate-in zoom-in">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                <Gift size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Presente Enviado!</h3>
                            <p className="text-slate-400">Seu amigo receberá o item em breve.</p>
                        </div>
                    ) : (
                        <>
                            {/* Item Summary */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6 flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-xl border-2 border-slate-700 ${item.value}`}></div>
                                <div className="flex-1">
                                    <div className="text-xs text-slate-500 font-bold uppercase">Item Selecionado</div>
                                    <div className="font-bold text-white">{item.name}</div>
                                    <div className="text-yellow-500 font-mono font-bold text-sm mt-1">{item.price} Coins</div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar amigo..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>

                            {/* Friend List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {loading ? (
                                    <div className="text-center py-8 text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" />Carregando amigos...</div>
                                ) : filteredFriends.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">Nenhum amigo encontrado.</div>
                                ) : (
                                    filteredFriends.map(friend => {
                                        const eligible = isEligible(friend);
                                        return (
                                            <button
                                                key={friend.id}
                                                onClick={() => eligible && setSelectedFriend(friend)}
                                                disabled={!eligible}
                                                className={`w-full p-3 rounded-xl flex items-center gap-3 border transition-all ${selectedFriend?.id === friend.id
                                                    ? 'bg-pink-600/20 border-pink-500/50 ring-1 ring-pink-500'
                                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                                    } ${!eligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <img src={friend.avatar} className="w-10 h-10 rounded-full bg-slate-800" />
                                                <div className="flex-1 text-left">
                                                    <div className="font-bold text-white text-sm">{friend.username}</div>
                                                    {!eligible && <div className="text-[10px] text-red-400">Requer 3 dias de amizade</div>}
                                                </div>
                                                {selectedFriend?.id === friend.id && <CheckCircle className="text-pink-500" size={20} />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* Footer */}
                {!success && (
                    <div className="p-6 bg-slate-900 border-t border-slate-800">
                        <button
                            onClick={handleSendGift}
                            disabled={!selectedFriend || sending || user.coins < item.price}
                            className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
                        >
                            {sending ? <Loader2 className="animate-spin" /> : <Gift size={20} />}
                            {user.coins < item.price ? 'Moedas Insuficientes' : 'Confirmar Envio'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GiftModal;
