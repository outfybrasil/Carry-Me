
import React from 'react';
import { User, Crown, Mic, Clock, LogOut, CheckCircle, Copy, Play, Terminal, Shield, Target } from 'lucide-react';
import { LobbyPlayer, LobbyConfig } from '../../types';
import { STORE_ITEMS } from '../../constants';

const getItemValue = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId)?.value;

interface LobbyPlayerListProps {
    players: LobbyPlayer[];
    config: LobbyConfig;
    isHost: boolean;
    maxPlayers: number;
    userReady: boolean;
    starting: boolean;
    onViewProfile: (username: string) => void;
    onCopyInvite: () => void;
    onLeaveLobby: () => void;
    onStartGame: () => void;
    onToggleReady: () => void;
}

const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({
    players,
    config,
    isHost,
    maxPlayers,
    userReady,
    starting,
    onViewProfile,
    onCopyInvite,
    onLeaveLobby,
    onStartGame,
    onToggleReady
}) => {
    return (
        <div className="bg-[#121417] border border-white/5 rounded-sm p-6 md:p-8 flex-1 flex flex-col h-full noise-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Shield size={160} /></div>

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                    <h2 className="text-2xl font-tactical font-black text-white flex items-center gap-4 uppercase italic tracking-tighter truncate max-w-[300px] md:max-w-none">
                        <Target size={24} className="text-[#ffb800]" /> {config.title || 'OPERACAO_ANONIMA'}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-mono font-black text-[#ffb800] uppercase tracking-[0.2em]">{config.game}</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.2em]">{config.vibe}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCopyInvite} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-sm border border-white/10 flex items-center gap-3 text-[10px] font-mono font-black uppercase tracking-widest transition-all">
                        <Copy size={14} /> <span className="hidden md:inline">GERAR_CONVITE</span>
                    </button>
                    <div className="bg-black/60 px-4 py-2 rounded-sm border border-white/5 text-center flex items-center gap-3">
                        <User size={14} className="text-slate-700" />
                        <span className="text-[#ffb800] font-mono font-black text-sm">{players.length}/{maxPlayers}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {Array.from({ length: maxPlayers }).map((_, i) => {
                    const player = players[i];
                    return (
                        <div key={i} className={`h-20 md:h-24 rounded-sm border flex items-center px-6 transition-all relative overflow-hidden ${player ? 'bg-black/20 border-white/10' : 'bg-black/40 border-white/5 border-dashed'}`}>
                            {player ? (
                                <>
                                    <div className="relative flex-shrink-0">
                                        <div className="relative z-10">
                                            <img src={player.avatar} className={`w-12 h-12 md:w-16 md:h-16 rounded-sm object-cover border-2 border-slate-700 ${getItemValue(player.border)}`} />
                                            {player.isHost && <div className="absolute -top-2 -left-2 bg-[#ffb800] text-black rounded-sm p-1 shadow-lg"><Crown size={12} /></div>}
                                        </div>
                                    </div>
                                    <div className="ml-6 flex-1 overflow-hidden z-10">
                                        <div className="flex items-center gap-3">
                                            <span onClick={() => onViewProfile(player.username)} className={`font-tactical font-black text-base md:text-xl uppercase italic tracking-tighter cursor-pointer hover:text-[#ffb800] transition-colors ${getItemValue(player.nameColor) || 'text-white'}`}>{player.username}</span>
                                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest ${player.score >= 80 ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-slate-800 text-slate-700'}`}>
                                                REP: {player.score}
                                            </span>
                                        </div>
                                        {player.title && (
                                            <div className="mt-1">
                                                <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] text-[#ffb800] bg-[#ffb800]/5 px-2 py-0.5 border border-[#ffb800]/20 rounded-sm">
                                                    {getItemValue(player.title)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-[9px] font-mono font-black text-slate-700 mt-1.5 uppercase tracking-widest">{player.role || 'INFANTARIA'}</div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Mic size={16} className="text-slate-800" />
                                        {player.isReady ? (
                                            <div className="flex items-center text-[#00ff88] text-[9px] font-mono font-black bg-[#00ff88]/5 px-3 py-1.5 rounded-sm border border-[#00ff88]/20 uppercase tracking-widest">
                                                <CheckCircle size={12} className="mr-2" /> PRONTO
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-slate-700 text-[9px] font-mono font-black bg-black/40 px-3 py-1.5 rounded-sm border border-white/5 uppercase tracking-widest">
                                                <Clock size={12} className="mr-2" /> AGUARDANDO
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-center text-slate-800 gap-4 opacity-30">
                                    <Terminal size={18} />
                                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em]">SLOT_DISPONIVEL</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 flex gap-4 border-t border-white/5 relative z-10">
                <button
                    onClick={onLeaveLobby}
                    className="px-8 py-5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/5 text-slate-600 font-mono font-black text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-3"
                >
                    <LogOut size={18} /> ABORTAR
                </button>

                {isHost ? (
                    <button
                        onClick={onStartGame}
                        disabled={starting}
                        className={`flex-1 py-5 font-tactical font-black text-xl uppercase italic tracking-widest rounded-sm transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95
                ${players.length > 0
                                ? 'bg-[#ffb800] text-black shadow-[0_10px_30px_rgba(255,184,0,0.2)]'
                                : 'bg-[#1c1f24] text-slate-800 cursor-not-allowed border border-white/5'}`}
                    >
                        <Play size={24} fill="currentColor" />
                        {starting ? 'CALIBRANDO...' : (players.length === 1 ? 'INICIAR_TREINO' : 'INICIAR_OPERACAO')}
                    </button>
                ) : (
                    <button
                        onClick={onToggleReady}
                        className={`flex-1 py-5 font-tactical font-black text-xl uppercase italic tracking-widest rounded-sm transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95
                ${userReady
                                ? 'bg-black border border-[#00ff88] text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                                : 'bg-[#00ff88] text-black shadow-[0_10px_30px_rgba(0,255,136,0.2)]'}`}
                    >
                        {userReady ? 'CANCELAR_PRONTO' : 'ESTOU_PRONTO'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default LobbyPlayerList;
