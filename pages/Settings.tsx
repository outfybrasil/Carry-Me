
import React, { useState, useEffect } from 'react';
import { Shield, Bell, Volume2, Trash2, Save, LogOut, Moon, Eye, Settings as SettingsIcon, Link, Gamepad2, CheckCircle, RefreshCw, ExternalLink, X, HelpCircle, Check, History, Camera, Crown, Terminal, Cpu } from 'lucide-react';
import { Player, Transaction } from '../types';
import { api } from '../services/api';

interface SettingsProps {
    user: Player;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    volume: number;
    onVolumeChange: (val: number) => void;
    onUpdateUser?: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout, onNavigate, volume, onVolumeChange, onUpdateUser }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'STEAM_AUTH_ID' && event.data?.steamId) {
                try {
                    await api.finalizeSteamAuth(user.id, event.data.steamId);
                    if (onUpdateUser) await onUpdateUser();
                    setIsSyncing(null);
                } catch (err) {
                    console.error(err);
                    alert("Erro ao vincular Steam.");
                    setIsSyncing(null);
                }
            }
            else if (event.data?.type === 'STEAM_AUTH_SUCCESS') {
                if (onUpdateUser) await onUpdateUser();
                setIsSyncing(null);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [user.id, onUpdateUser]);

    useEffect(() => {
        if (user) {
            api.getTransactionHistory(user.id).then(setTransactions);
        }
    }, [user]);

    const handleDeleteAccount = async () => {
        setUpdating(true);
        const success = await api.deleteAccount(user.id);
        if (success) window.location.href = '/';
        else {
            alert("Erro ao excluir conta.");
            setUpdating(false);
        }
    };

    const handleLinkAccount = async (provider: 'steam') => {
        if (provider === 'steam') {
            setIsSyncing('steam');
            const authUrl = api.initiateSocialAuth(user.id, 'steam');
            const width = 600, height = 800;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            const popup = window.open(authUrl, 'Steam Login', `width=${width},height=${height},left=${left},top=${top}`);

            if (!popup) {
                alert("Habilite popups.");
                setIsSyncing(null);
                return;
            }

            const checkPopup = setInterval(() => {
                if (!popup || popup.closed) {
                    clearInterval(checkPopup);
                    setIsSyncing(prev => prev === 'steam' ? null : prev);
                }
            }, 1000);
        }
    };

    const handleUnlinkSteam = async () => {
        if (!confirm("Desvincular Steam?")) return;
        setUpdating(true);
        try {
            const success = await api.unlinkSteam(user.id);
            if (success && onUpdateUser) await onUpdateUser();
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUpdating(true);
        try {
            await api.uploadAvatar(user.id, file);
            if (onUpdateUser) await onUpdateUser();
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 noise-bg grid-bg scanline">
            {/* Profile Overview */}
            <div className="tactical-panel bg-[#121417] rounded-sm p-10 relative overflow-hidden group border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Cpu size={120} /></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-sm border-2 border-white/10 overflow-hidden bg-black/40 group-hover/avatar:border-[#ffb800]/50 transition-all">
                            <img src={user.avatar} className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all" alt="Av" />
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-[#ffb800] hover:bg-[#ffc933] rounded-sm cursor-pointer shadow-2xl transition-all active:scale-95 border border-black/20">
                            <Camera size={18} className="text-black" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-tactical font-black text-white mb-2 flex items-center justify-center md:justify-start gap-4 uppercase italic tracking-tighter">
                            {user.username}
                            {user.isPremium && <Crown size={24} className="text-[#ffb800] drop-shadow-[0_0_8px_rgba(255,184,0,0.3)]" />}
                        </h1>
                        <p className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-[0.4em] mb-6">REGISTRO_CENTRAL // OPERADOR_N01</p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <span className="px-4 py-1.5 bg-black/40 text-[#ffb800] border border-[#ffb800]/20 rounded-sm text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} /> {user.score}%_CONFIANCA
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Connections */}
            <div className="tactical-panel bg-[#121417] rounded-sm p-10 relative overflow-hidden border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Gamepad2 size={100} /></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-xl font-tactical font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                            <Terminal size={24} className="text-[#ffb800]" /> CONEXÃO_STEAM_CS2
                        </h2>
                        <p className="text-[10px] font-mono font-bold text-slate-600 mt-2 max-w-lg uppercase tracking-widest leading-relaxed">
                            VINCULE SUA CREDENCIAL STEAM PARA IMPORTAR BIOMETRIA TÁTICA E DESBLOQUEAR O ANÁLISE_DNA.
                        </p>
                    </div>
                    {isSyncing && (
                        <div className="inline-flex items-center gap-3 text-[#ffb800] text-[10px] font-mono font-black bg-[#ffb800]/10 px-4 py-2 rounded-sm animate-pulse border border-[#ffb800]/20 uppercase tracking-widest">
                            <RefreshCw size={14} className="animate-spin" /> SINCRO_ATIVA...
                        </div>
                    )}
                </div>

                <div className="relative z-10">
                    <div className={`p-8 rounded-sm border transition-all duration-500 ${user.steamId ? 'bg-[#ffb800]/5 border-[#ffb800]/30 shadow-[0_0_40px_rgba(255,184,0,0.05)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-sm border transition-all ${user.steamId ? 'bg-[#ffb800]/20 border-[#ffb800]/30' : 'bg-white/5 border-white/10'}`}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-8 h-8 grayscale contrast-125" alt="Steam" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-tactical font-black text-white uppercase italic tracking-tighter">PROTOCOLO_VALVE</h3>
                                        {user.steamId && <span className="text-[9px] bg-[#ffb800] text-black px-2 py-0.5 rounded-sm font-mono font-black tracking-widest animate-pulse">VERIFICADO</span>}
                                    </div>
                                    <p className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest mt-1">SISTEMA_OPERACIONAL: CS2</p>
                                </div>
                            </div>
                            {user.steamId && <CheckCircle className="text-[#ffb800]" size={28} />}
                        </div>

                        {user.steamId ? (
                            <div className="bg-black/60 rounded-sm p-6 flex items-center justify-between mb-8 border border-white/5 group relative overflow-hidden">
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffb800]/50 to-transparent animate-shimmer"></div>
                                <div className="relative z-10">
                                    <span className="text-[9px] text-[#ffb800] uppercase font-mono font-black block mb-2 tracking-[0.3em]">IDENTIFICADOR_UNICO (STEAM_ID)</span>
                                    <span className="font-mono text-base text-white font-black tracking-widest">{user.steamId}</span>
                                </div>
                                <div className="relative z-10 text-right">
                                    <div className="text-[9px] text-green-500 font-mono font-black uppercase flex items-center gap-2 justify-end tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#00ff00]"></div> TRAN_OK
                                    </div>
                                    <div className="text-[8px] text-slate-700 uppercase font-mono font-black tracking-widest mt-1">SECURE_OPENID_v2</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[10px] text-slate-600 mb-10 italic bg-black/40 p-6 rounded-sm border border-white/5 border-dashed font-mono font-bold uppercase tracking-widest leading-relaxed">
                                ACESSO CRIPTOGRAFADO VIA OPENID. NENHUMA CREDENCIAL SENSÍVEL SERÁ ARMAZENADA. APENAS DADOS DE PERFORMANCE PÚBLICOS.
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            {!user.steamId ? (
                                <button
                                    onClick={() => handleLinkAccount('steam')}
                                    disabled={!!isSyncing}
                                    className="w-full py-5 rounded-sm font-tactical font-black text-lg uppercase italic tracking-widest transition-all bg-[#ffb800] hover:bg-[#ffc933] text-black shadow-xl flex items-center justify-center gap-4 group"
                                >
                                    <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" /> ESTABELECER_LINK_STEAM
                                </button>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={async () => {
                                            setIsSyncing('steam');
                                            try { await api.finalizeSteamAuth(user.id, user.steamId!); if (onUpdateUser) await onUpdateUser(); } catch (err) { alert('Erro.'); }
                                            setIsSyncing(null);
                                        }}
                                        disabled={!!isSyncing}
                                        className="py-4 bg-white/5 hover:bg-white/10 text-white font-mono font-black text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-3 transition-all border border-white/10"
                                    >
                                        <RefreshCw size={16} className={isSyncing === 'steam' ? 'animate-spin' : ''} />
                                        {isSyncing === 'steam' ? 'SINCRO_ATIVA...' : 'RECUPERAR_ESTATÍSTICAS'}
                                    </button>

                                    <button
                                        onClick={handleUnlinkSteam}
                                        disabled={updating}
                                        className="py-4 bg-transparent hover:bg-red-500/10 text-slate-800 hover:text-red-500 font-mono font-black text-[10px] rounded-sm transition-all border border-white/5 hover:border-red-500/30 uppercase tracking-[0.3em]"
                                    >
                                        DESVINCULAR_TERMINAL
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="tactical-panel bg-[#121417] rounded-sm p-10 border-white/5">
                <h2 className="text-xl font-tactical font-black text-white mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
                    <History size={24} className="text-[#ffb800]" /> LOG_DE_TRANSACTIONS
                </h2>
                {transactions.length > 0 ? (
                    <div className="grid gap-4">
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-black/40 p-6 rounded-sm border border-white/5 hover:border-[#ffb800]/20 transition-all group">
                                <div>
                                    <div className="font-mono font-black text-xs text-white flex items-center gap-4 uppercase tracking-widest">
                                        {t.type === 'PREMIUM' ? 'STATUS_ELITE_PRO' : `${t.coins}_CREDITOS_SUPRIMENTO`}
                                        <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-sm border border-green-500/20">CONFIRMADO</span>
                                    </div>
                                    <div className="text-[9px] text-slate-800 font-mono mt-2 tracking-widest uppercase">{t.date} // ID_{t.id.slice(0, 8)}</div>
                                </div>
                                <div className="font-mono text-[#ffb800] font-black text-sm bg-black px-4 py-2 rounded-sm border border-[#ffb800]/10 shadow-inner">
                                    VAL: R${Number(t.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-black/20 rounded-sm border border-white/5 border-dashed">
                        <History size={40} className="mx-auto mb-6 opacity-5" />
                        <p className="text-[10px] font-mono font-black text-slate-800 uppercase tracking-[0.4em]">NENHUM_REGISTRO_ENCONTRADO</p>
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div className="tactical-panel bg-[#121417] rounded-sm p-10 border-white/5">
                <h2 className="text-xl font-tactical font-black text-white mb-12 flex items-center gap-4 uppercase italic tracking-tighter">
                    <SettingsIcon size={24} className="text-[#ffb800]" /> MODULOS_DO_SISTEMA
                </h2>

                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-black/40 rounded-sm border border-white/5">
                                <Volume2 size={24} className="text-slate-600" />
                            </div>
                            <div>
                                <div className="text-xs font-mono font-black text-white uppercase tracking-widest">OUTPUT_AUDIO</div>
                                <div className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-widest mt-1">AMPLITUDE_DOS_SINAIS_HUD</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <input
                                type="range"
                                min="0" max="100"
                                value={volume}
                                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                                className="w-56 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#ffb800]"
                            />
                            <span className="text-[11px] font-mono font-black w-10 text-right text-[#ffb800] tracking-widest">{volume}%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-black/40 rounded-sm border border-white/5">
                                <Bell size={24} className="text-slate-600" />
                            </div>
                            <div>
                                <div className="text-xs font-mono font-black text-white uppercase tracking-widest">SINALIZADOR_HUD</div>
                                <div className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-widest mt-1">ALERTAS_VISUAIS_INTERMEDIÁRIOS</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${notifications ? 'bg-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.2)]' : 'bg-white/5'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-500 ${notifications ? 'translate-x-[32px] bg-black' : 'translate-x-0 bg-slate-800'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-black/40 rounded-sm border border-white/5">
                                <Eye size={24} className="text-slate-600" />
                            </div>
                            <div>
                                <div className="text-xs font-mono font-black text-white uppercase tracking-widest">MODO_DISCRETO</div>
                                <div className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-widest mt-1">OCULTAR_METADADOS_EM_LOGS_PUBLICOS</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setPrivateMode(!privateMode)}
                            className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${privateMode ? 'bg-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.2)]' : 'bg-white/5'}`}
                        >
                            <div className={`w-6 h-6 rounded-full shadow-md transition-transform duration-500 ${privateMode ? 'translate-x-[32px] bg-black' : 'translate-x-0 bg-slate-800'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Management */}
            <div className="tactical-panel bg-black/20 rounded-sm p-10 border-white/5">
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <button onClick={() => onNavigate('terms')} className="flex-1 p-6 bg-[#121417] hover:bg-[#181b1f] border border-white/5 rounded-sm flex items-center justify-between group transition-all">
                        <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">PROTOCOLO_USO</span>
                        <ExternalLink size={16} className="text-slate-800 group-hover:text-[#ffb800]" />
                    </button>
                    <button onClick={() => onNavigate('privacy')} className="flex-1 p-6 bg-[#121417] hover:bg-[#181b1f] border border-white/5 rounded-sm flex items-center justify-between group transition-all">
                        <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">PRIVACIDADE_LGPD</span>
                        <ExternalLink size={16} className="text-slate-800 group-hover:text-[#ffb800]" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <button
                        onClick={onLogout}
                        className="flex-1 p-6 bg-white/5 hover:bg-white/10 text-white font-mono font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all"
                    >
                        <LogOut size={20} className="text-slate-700" /> ENCERRAR_CONEXAO
                    </button>

                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex-1 p-6 bg-red-600/5 hover:bg-red-600 text-red-600 hover:text-black font-mono font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all border border-red-600/20"
                    >
                        <Trash2 size={20} /> ELIMINAR_IDENTIDADE
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="bg-[#121417] border border-red-600/50 rounded-sm p-12 w-full max-w-lg relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="w-24 h-24 bg-red-600/10 rounded-sm flex items-center justify-center mb-8 border border-red-600/20">
                                <Trash2 size={48} className="text-red-600" />
                            </div>
                            <h3 className="text-2xl font-tactical font-black text-white mb-4 uppercase italic tracking-tighter">APAGAR_REGISTROS?</h3>
                            <p className="text-slate-600 font-mono font-bold text-xs uppercase tracking-widest leading-relaxed">
                                ESTA OPERAÇÃO É FINAL. TODOS OS METADADOS, CRÉDITOS E CONQUISTAS SERÃO EXPURGADOS CONFORME DIRETRIZES DA LGPD.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-mono font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-sm transition-all"
                            >
                                ABORTAR
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={updating}
                                className="flex-1 bg-red-600 text-black font-mono font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-sm shadow-2xl active:scale-95 transition-all"
                            >
                                {updating ? 'EXPURGANDO...' : 'CONFIRMAR_ELIMINACAO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
