import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Trophy, LogOut, Crown } from 'lucide-react';
import { Player, Clan, ClanMember } from '../../types';
import { api } from '../../services/api';

interface ClanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    clan: Clan;
    user: Player;
    onLeave: () => void;
}

const ClanDetailsModal: React.FC<ClanDetailsModalProps> = ({ isOpen, onClose, clan, user, onLeave }) => {
    const [members, setMembers] = useState<ClanMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen, clan.id]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await api.getClanMembers(clan.id);
            setMembers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClan = async () => {
        if (!confirm("Tem certeza que deseja sair do clã?")) return;
        setLeaving(true);
        try {
            const success = await api.leaveClan(clan.id, user.id);
            if (success) {
                onLeave();
                onClose();
            } else {
                alert("Erro ao sair do clã.");
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setLeaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-t-2xl p-6 flex flex-col justify-end">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm transition-colors">
                        <X size={20} />
                    </button>

                    <div className="flex items-end gap-4 translate-y-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                            {clan.logoUrl ? (
                                <img src={clan.logoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Shield size={32} className="text-slate-600" />
                            )}
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {clan.name}
                                <span className="text-sm font-bold bg-white/10 text-indigo-300 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">
                                    #{clan.tag}
                                </span>
                            </h2>
                            <p className="text-slate-400 text-sm max-w-md line-clamp-1">{clan.description || 'Sem descrição.'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-950 border-b border-slate-800 pt-8 pb-4 px-6 flex justify-around">
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Prestige</div>
                        <div className="text-xl font-mono font-bold text-yellow-500 flex items-center justify-center gap-2">
                            <Trophy size={16} /> {clan.prestige}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Membros</div>
                        <div className="text-xl font-mono font-bold text-white flex items-center justify-center gap-2">
                            <Users size={16} /> {members.length}/50
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 px-2">Membros do Clã</h3>
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Carregando membros...</div>
                        ) : (
                            members.map((member) => (
                                <div key={member.userId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                        <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm">{member.username}</span>
                                            {member.role === 'leader' && <Crown size={12} className="text-yellow-500" />}
                                            {member.role === 'admin' && <Shield size={12} className="text-blue-400" />}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">{member.role}</div>
                                    </div>
                                    {/* Actions (Kick, etc - Future) */}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
                    <button
                        onClick={handleLeaveClan}
                        disabled={leaving}
                        className="w-full py-3 bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/30 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {leaving ? 'Saindo...' : <><LogOut size={18} /> Sair do Clã</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ClanDetailsModal;
