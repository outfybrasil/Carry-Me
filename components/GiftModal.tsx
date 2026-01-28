
import React, { useState, useEffect } from 'react';
import { X, Gift, Search, AlertCircle, CheckCircle, Loader2, Terminal, User } from 'lucide-react';
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
        setFilteredFriends(friends.filter(f => f.username.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [searchTerm, friends]);

    const loadFriends = async () => {
        setLoading(true);
        try { const data = await api.getFriends(user.id); setFriends(data); }
        catch (e) { setError('Erro ao carregar lista.'); }
        finally { setLoading(false); }
    };

    const handleSendGift = async () => {
        if (!selectedFriend) return;
        setSending(true);
        setError('');
        try {
            const result = await api.sendGift(user.id, selectedFriend.id, item.id, item.price);
            if (result.success) { setSuccess(true); setTimeout(() => onClose(), 2000); }
            else { setError(result.error || 'Falha no envio.'); }
        } catch (e) { setError('Erro de sincro.'); }
        finally { setSending(false); }
    };

    const isEligible = (friend: Friend) => {
        if (!friend.since) return true;
        const date = new Date(friend.since);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 3;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#121417] border border-white/10 rounded-sm max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col noise-bg min-h-[500px]">
                {/* Header */}
                <div className="p-8 bg-black/40 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-tactical font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Gift className="text-[#ffb800]" size={20} /> LOGISTICA_DE_PRESENTES
                    </h2>
                    <button onClick={onClose} className="text-slate-600 hover:text-white transition-all p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 flex-1 flex flex-col min-h-0">
                    {success ? (
                        <div className="text-center py-10 animate-in zoom-in h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-green-500/10 rounded-sm flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
                                <Gift size={48} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-tactical font-black text-white mb-2 uppercase italic tracking-tighter">TRANSFERENCIA_CONCLUIDA</h3>
                            <p className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest">O_DESTINATARIO_IRA_RECEBER_O_SUPRIMENTO_EM_BREVE</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-black/40 p-6 rounded-sm border border-white/5 mb-8 flex items-center gap-6 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Terminal size={40} /></div>
                                <div className={`w-20 h-20 rounded-sm border-2 border-white/5 flex-shrink-0 relative z-10 ${item.value}`}></div>
                                <div className="flex-1 relative z-10">
                                    <div className="text-[8px] font-mono font-black text-slate-800 uppercase tracking-[0.3em] mb-1">RECURSO_SELECIONADO</div>
                                    <div className="font-tactical font-black text-white uppercase italic tracking-tighter text-lg">{item.name}</div>
                                    <div className="text-[#ffb800] font-mono font-black text-xs mt-2 uppercase tracking-widest">{item.price}_CREDITOS</div>
                                </div>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                <input
                                    type="text"
                                    placeholder="IDENTIFICAR_DESTINATARIO..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/60 border border-white/5 rounded-sm pl-12 pr-6 py-5 text-white focus:border-[#ffb800]/50 outline-none transition-all text-xs font-mono font-black placeholder:text-slate-800 uppercase tracking-widest"
                                />
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                                {loading ? (
                                    <div className="text-center py-10">
                                        <div className="w-8 h-8 border-2 border-white/5 border-t-[#ffb800] rounded-full animate-spin mx-auto mb-4"></div>
                                        <span className="text-[9px] font-mono font-black text-slate-800 uppercase tracking-widest">MAPEAR_DIRETORIO...</span>
                                    </div>
                                ) : filteredFriends.length === 0 ? (
                                    <div className="text-center py-10 text-[9px] font-mono font-black text-slate-800 uppercase tracking-[0.4em]">REGISTRO_VAZIO</div>
                                ) : (
                                    filteredFriends.map(friend => {
                                        const eligible = isEligible(friend);
                                        return (
                                            <button
                                                key={friend.id}
                                                onClick={() => eligible && setSelectedFriend(friend)}
                                                disabled={!eligible}
                                                className={`w-full p-4 rounded-sm flex items-center gap-4 border transition-all relative overflow-hidden ${selectedFriend?.id === friend.id
                                                    ? 'bg-[#ffb800]/10 border-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.05)]'
                                                    : 'bg-black/20 border-white/5 hover:border-white/10'
                                                    } ${!eligible ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                <img src={friend.avatar} className="w-10 h-10 rounded-sm bg-black object-cover border border-white/10" />
                                                <div className="flex-1 text-left">
                                                    <div className="font-mono font-black text-white text-[11px] uppercase tracking-widest">{friend.username}</div>
                                                    {!eligible && <div className="text-[8px] font-mono font-black text-red-500 uppercase tracking-widest mt-1">VINCULO_INVALIDO_&lt;3_DIAS</div>}
                                                </div>
                                                {selectedFriend?.id === friend.id && <CheckCircle className="text-[#ffb800]" size={18} />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {error && (
                                <div className="mt-6 p-4 bg-red-600/5 border border-red-600/20 text-red-500 text-[9px] font-mono font-black rounded-sm flex items-center gap-3 uppercase tracking-widest italic animate-in shake">
                                    <AlertCircle size={14} /> ALERT_SYSTEM: {error}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="p-8 bg-black/40 border-t border-white/5">
                        <button
                            onClick={handleSendGift}
                            disabled={!selectedFriend || sending || user.coins < item.price}
                            className="w-full py-5 bg-[#ffb800] hover:bg-[#ffc933] disabled:bg-white/5 disabled:text-slate-800 text-black font-tactical font-black text-lg uppercase italic tracking-widest rounded-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
                        >
                            {sending ? <Loader2 className="animate-spin" /> : <Gift size={20} />}
                            {user.coins < item.price ? 'CREDITOS_INSUFICIENTES' : 'INICIAR_TRANSFERENCIA'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiftModal;
