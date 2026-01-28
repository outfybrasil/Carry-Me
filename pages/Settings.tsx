
import React, { useState, useEffect } from 'react';
import { Shield, Bell, Volume2, Trash2, Save, LogOut, Moon, Eye, Settings as SettingsIcon, Link, Gamepad2, CheckCircle, RefreshCw, ExternalLink, X, HelpCircle, Check, History, Camera } from 'lucide-react';
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

    // Settings State
    const [notifications, setNotifications] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);

    const [gameAuthCode, setGameAuthCode] = useState('');
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Steam Popup Listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'STEAM_AUTH_SUCCESS') {
                if (onUpdateUser) onUpdateUser();
                setIsSyncing(null);
            }
            if (event.data?.type === 'STEAM_AUTH_ERROR') {
                setIsSyncing(null);
                alert("Erro ao conectar Steam.");
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onUpdateUser]);

    // Load user data on mount
    useEffect(() => {
        if (user) {
            // Auto-clear syncing state if we see a steamId has arrived
            if (user.steamId && isSyncing === 'steam') {
                setIsSyncing(null);
            }

            if ((user as any).gameAuthCode) setGameAuthCode((user as any).gameAuthCode);
            api.getTransactionHistory(user.id).then(setTransactions);
        }
    }, [user, isSyncing]);

    const handleDeleteAccount = async () => {
        setUpdating(true);
        const success = await api.deleteAccount(user.id);
        if (success) {
            window.location.href = '/';
        } else {
            alert("Erro ao excluir conta. Tente novamente.");
            setUpdating(false);
        }
    };

    const handleLinkAccount = async (provider: 'steam') => {
        // STEAM (Real OAuth via OpenID in POPUP)
        if (provider === 'steam') {
            setIsSyncing('steam');
            const authUrl = api.initiateSocialAuth(user.id, 'steam');

            // Open Popup
            const width = 600;
            const height = 800;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                authUrl,
                'Steam Login',
                `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
            );

            // Safety check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                alert("O popup de login foi bloqueado pelo navegador. Por favor, habilite popups para este site.");
                setIsSyncing(null);
            }
            return;
        }
    };

    const handleUnlinkSteam = async () => {
        if (!confirm("Tem certeza que deseja desvincular sua conta Steam? Suas estatísticas sincronizadas serão removidas.")) return;

        setUpdating(true);
        try {
            const success = await api.unlinkSteam(user.id);
            if (success) {
                if (onUpdateUser) await onUpdateUser();
                alert("Conta Steam desvinculada.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao desvincular.");
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveGameCode = async () => {
        setUpdating(true);
        try {
            const success = await api.updateGameAccounts(user.id, undefined, undefined, gameAuthCode);
            if (success) {
                alert("Código de autenticação salvo!");
                if (onUpdateUser) await onUpdateUser();
            } else {
                alert("Erro ao salvar. Verifique se os dados estão corretos.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro de conexão.");
        } finally {
            setUpdating(false);
        }
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            const success = await api.updateGameAccounts(user.id, undefined, undefined, gameAuthCode);
            if (success) {
                alert("Configurações salvas com sucesso!");
                if (onUpdateUser) await onUpdateUser();
            } else {
                alert("Erro ao salvar dados.");
            }
        } catch (e) {
            console.error(e);
            alert("Ocorreu um erro ao conectar com o servidor.");
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
            alert("Avatar atualizado com sucesso!");
            if (onUpdateUser) await onUpdateUser();
        } catch (error) {
            console.error(error);
            alert("Erro ao subir imagem.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-colors"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800">
                            <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 rounded-full cursor-pointer shadow-lg transition-colors border border-slate-900">
                            <Camera size={16} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
                        <p className="text-slate-500 text-sm mb-4">{user.email || 'Membro CarryMe'}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                🔥 {user.advancedStats.kd} K/D
                            </span>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                🛡️ {user.score}% Confiança
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Connections */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Gamepad2 size={24} className="text-blue-500" /> Conexão Steam & CS2
                        </h2>
                        <p className="text-slate-400 mt-2 max-w-lg text-sm">
                            Vincule sua conta Steam para importar estatísticas do Counter-Strike 2, verificar sua medalha de serviço e habilitar matchmaking ranqueado.
                        </p>
                    </div>
                    {isSyncing && (
                        <div className="inline-flex items-center gap-2 text-blue-400 text-xs bg-blue-500/10 px-3 py-1.5 rounded-full animate-pulse border border-blue-500/20">
                            <RefreshCw size={14} className="animate-spin" /> Sincronizando...
                        </div>
                    )}
                </div>

                <div className="relative z-10">
                    {/* STEAM CARD */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${user.steamId ? 'bg-blue-600/5 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.1)]' : 'bg-black/20 border-slate-800 hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border transition-colors ${user.steamId ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-8 h-8" alt="Steam" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-lg">Steam</h3>
                                        {user.steamId && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-black tracking-tighter animate-pulse">VERIFIED</span>}
                                    </div>
                                    <p className="text-xs text-slate-500">Counter-Strike 2 Global Offensive</p>
                                </div>
                            </div>
                            {user.steamId && <CheckCircle className="text-blue-500 fill-blue-500/20" size={24} />}
                        </div>

                        {user.steamId ? (
                            <div className="bg-slate-950/80 rounded-xl p-4 flex items-center justify-between mb-6 border border-blue-500/20 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none"></div>
                                <div className="relative z-10">
                                    <span className="text-[10px] text-blue-400 uppercase font-black block mb-1 tracking-[0.2em]">SteamID Oficial</span>
                                    <span className="font-mono text-sm text-white font-bold">{user.steamId}</span>
                                </div>
                                <div className="relative z-10 text-right">
                                    <div className="text-[10px] text-green-400 font-black uppercase flex items-center gap-1 justify-end">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div> Ativo
                                    </div>
                                    <div className="text-[8px] text-slate-500 uppercase font-bold">Via Valve OpenID</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 mb-6 italic bg-slate-950/50 p-4 rounded-xl border border-slate-800 border-dashed">
                                Login seguro via OpenID. Nós não teremos acesso à sua senha ou inventário restrito. Apenas estatísticas públicas de jogo.
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {!user.steamId ? (
                                <button
                                    onClick={() => handleLinkAccount('steam')}
                                    disabled={!!isSyncing}
                                    className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all bg-[#171a21] hover:bg-[#2a475e] text-white border border-white/10 shadow-xl shadow-black/20 group"
                                >
                                    <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" /> Conectar com Steam
                                </button>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={async () => {
                                            setIsSyncing('steam');
                                            try {
                                                const result = await api.finalizeSteamAuth(user.id, user.steamId!);
                                                if (result.stats) {
                                                    alert(`✅ Estatísticas sincronizadas!\n\n📊 Resumo CS2:\n• Headshot: ${result.stats.headshotPct}%\n• ADR: ${result.stats.adr}\n• Win Rate: ${result.stats.winRate}%`);
                                                } else {
                                                    alert(`✅ ${result.message}`);
                                                }
                                                if (onUpdateUser) await onUpdateUser();
                                            } catch (err) {
                                                console.error(err);
                                                alert('Erro ao sincronizar.');
                                            }
                                            setIsSyncing(null);
                                        }}
                                        disabled={!!isSyncing}
                                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        {isSyncing === 'steam' ? (
                                            <><RefreshCw size={16} className="animate-spin" /> Sincronizando...</>
                                        ) : (
                                            <><RefreshCw size={16} /> Sincronizar Stats</>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleUnlinkSteam}
                                        disabled={updating}
                                        className="py-3 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 font-medium text-[10px] rounded-xl transition-all border border-slate-800 hover:border-red-500/30 uppercase tracking-widest"
                                    >
                                        Desvincular
                                    </button>
                                </div>
                            )}
                        </div>

                        {user.steamId && (
                            <div className="mt-6 pt-6 border-t border-slate-800/50 animate-in fade-in duration-700">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                                        Código de Autenticação (CS2)
                                        <div className="group relative inline-block">
                                            <HelpCircle size={12} className="text-slate-600 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] text-slate-400 invisible group-hover:visible z-50 shadow-2xl">
                                                Permite que nossa IA baixe suas partidas recentes para analisar comportamento (Toxicidade, Teamplay) e Habilidade. <span className="text-blue-400 italic">O código é gerado dentro do menu de configurações da Steam em "Game Data".</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="AAAA-BBBB-CCCC-DDDD"
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none font-mono tracking-wider shadow-inner"
                                        value={gameAuthCode}
                                        onChange={(e) => setGameAuthCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleSaveGameCode}
                                        disabled={updating}
                                        className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                                        title="Salvar Código"
                                    >
                                        <Check size={20} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
                                    <span className="text-blue-500 font-bold uppercase">Diferencial CarryMe:</span> Usamos os dados da partida para detectar se você ajudou o time (Flash Assists, Trades) ou se foi tóxico, gerando seu Score de Reputação automaticamente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 flex items-center justify-center gap-2 font-medium">
                        <Shield size={12} /> Seus dados são protegidos e usados apenas para gerar estatísticas. Cumprimos rigorosamente a LGPD.
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <History size={24} className="text-slate-400" /> Histórico de Compras
                </h2>
                {transactions.length > 0 ? (
                    <div className="grid gap-3">
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {t.type === 'PREMIUM' ? 'CarryMe Premium' : `${t.coins} Moedas`}
                                        <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">PAGO</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-1">{t.date}</div>
                                </div>
                                <div className="font-mono text-white font-bold bg-white/5 px-3 py-1 rounded-lg">
                                    R$ {Number(t.amount).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                        <History size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhuma compra realizada ainda.</p>
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                    <SettingsIcon size={24} className="text-slate-400" /> Preferências do App
                </h2>

                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <Volume2 size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white">Volume Geral</div>
                                <div className="text-xs text-slate-500">Efeitos sonoros de interface</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0" max="100"
                                value={volume}
                                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                                className="w-48 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-xs font-mono w-8 text-right text-slate-400 font-bold">{volume}%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <Bell size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white">Notificações</div>
                                <div className="text-xs text-slate-500">Alertas de partida e mensagens</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${notifications ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-[28px]' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <Eye size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white">Modo Privado</div>
                                <div className="text-xs text-slate-500">Ocultar histórico no perfil público</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setPrivateMode(!privateMode)}
                            className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${privateMode ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-800'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${privateMode ? 'translate-x-[28px]' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {updating ? <><RefreshCw size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>
            </div>

            {/* Account Management */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                    <Shield size={24} className="text-slate-400" /> Conta & Privacidade
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => onNavigate('terms')} className="group flex items-center justify-between p-5 bg-slate-950 hover:bg-slate-900 rounded-2xl transition-all border border-slate-800">
                        <span className="text-slate-300 font-bold group-hover:text-white">Termos de Uso</span>
                        <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <button onClick={() => onNavigate('privacy')} className="group flex items-center justify-between p-5 bg-slate-950 hover:bg-slate-900 rounded-2xl transition-all border border-slate-800">
                        <span className="text-slate-300 font-bold group-hover:text-white">Política de LGPD</span>
                        <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                </div>

                <div className="h-px bg-slate-800/50 my-8"></div>

                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={onLogout}
                        className="flex-1 p-5 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all text-white font-bold flex items-center gap-3 justify-center"
                    >
                        <LogOut size={20} className="text-slate-500" /> Sair da Conta
                    </button>

                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex-1 p-5 bg-red-900/10 border border-red-900/30 hover:bg-red-900/20 rounded-2xl transition-all text-red-400 font-bold flex items-center gap-3 justify-center"
                    >
                        <Trash2 size={20} /> Excluir Conta Permanemente
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                <Trash2 size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Excluir Conta?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Esta ação deletará todos os seus dados, histórico de moedas e conquistas. Conforme a <span className="text-red-400 font-bold uppercase tracking-wider">LGPD</span>, esta ação é final e irreversível.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl border border-slate-700 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={updating}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating ? 'Deletando...' : 'Excluir Agora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
