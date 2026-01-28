import React, { useState } from 'react';
import { X, Shield, Users, Loader2, AlertCircle, Check, Coins } from 'lucide-react';
import { Player } from '../../types';
import { api } from '../../services/api';
import { CLAN_CREATION_COST } from '../../constants';

interface ClanCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: Player;
}

const ClanCreationModal: React.FC<ClanCreationModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState(`https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`); // Default random
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const canAfford = user.coins >= CLAN_CREATION_COST;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.length < 3 || name.length > 20) {
            setError('Nome deve ter entre 3 e 20 caracteres.');
            return;
        }
        if (tag.length < 3 || tag.length > 5) {
            setError('Tag deve ter entre 3 e 5 caracteres.');
            return;
        }
        if (!canAfford) {
            setError('Moedas insuficientes.');
            return;
        }

        setLoading(true);
        try {
            const result = await api.createClan(user, name, tag.toUpperCase(), logoUrl, description);

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.error || 'Erro ao criar clã.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro interno. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-20 transition-all backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="h-32 bg-gradient-to-br from-indigo-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mb-2 border-2 border-slate-700">
                            <Shield size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Criar Clã</h2>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Cost Display */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${canAfford ? 'bg-slate-900/50 border-slate-800' : 'bg-red-900/10 border-red-900/30'}`}>
                            <div className="flex items-center gap-2">
                                <div className="bg-yellow-500/10 p-2 rounded-lg">
                                    <Coins className="text-yellow-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Custo de Criação</p>
                                    <p className="font-bold text-white">{CLAN_CREATION_COST} Coins</p>
                                </div>
                            </div>
                            {!canAfford && <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">Saldo Insuficiente</span>}
                        </div>

                        {/* Inputs */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Clã</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                maxLength={20}
                                placeholder="Ex: Os Lendários"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tag (3-5 Letras)</label>
                            <input
                                type="text"
                                value={tag}
                                onChange={e => setTag(e.target.value.toUpperCase())}
                                maxLength={5}
                                placeholder="EX: LENS"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono tracking-wider"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                maxLength={140}
                                placeholder="O que define seu clã?"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !canAfford}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg
                ${loading || !canAfford
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Users className="mr-2" size={20} />
                                    Criar Clã
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClanCreationModal;
