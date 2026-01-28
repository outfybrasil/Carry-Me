
import React from 'react';
import { User, Crown, Mic, Clock, LogOut, CheckCircle, Copy, Play } from 'lucide-react';
import { LobbyPlayer, LobbyConfig } from '../../types';
import { STORE_ITEMS } from '../../constants';

// Helper to look up item values (gifs, texts, styles)
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
                        {config.title || 'Lobby Privado'}
                    </h2>
                    <p className="text-slate-400 text-xs md:text-sm">{config.game} • {config.vibe}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCopyInvite} className="bg-slate-800 hover:bg-slate-700 text-white p-2 md:px-3 md:py-2 rounded-lg border border-slate-700 flex items-center gap-2 text-sm transition-colors">
                        <Copy size={14} /> <span className="hidden md:inline">Convidar</span>
                    </button>
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-white font-bold text-sm">{players.length}/{maxPlayers}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Render slots dynamically based on maxPlayers */}
                {Array.from({ length: maxPlayers }).map((_, i) => {
                    const player = players[i];
                    return (
                        <div key={i} className={`h-16 md:h-20 rounded-xl border flex items-center px-3 md:px-4 transition-all ${player ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-950/50 border-slate-800 border-dashed'}`}>
                            {player ? (
                                <>
                                    <div className="relative group/player">
                                        {/* Avatar Layer (z-10 ensures it's above effect) */}
                                        <div className="relative z-10">
                                            <img src={player.avatar} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-600 ${getItemValue(player.border)}`} />
                                            {player.isHost && <div className="absolute -top-2 -left-2 bg-yellow-500 rounded-full p-0.5"><Crown size={10} className="text-slate-900 fill-slate-900" /></div>}
                                        </div>
                                    </div>
                                    <div className="ml-3 md:ml-4 flex-1 overflow-hidden z-10">
                                        <div className="flex items-center gap-2">
                                            <span onClick={() => onViewProfile(player.username)} className={`font-bold text-sm md:text-base truncate cursor-pointer hover:underline ${getItemValue(player.nameColor) || 'text-white'}`}>{player.username}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border hidden sm:inline-block ${player.score >= 80 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}`}>
                                                {player.score} Rep
                                            </span>
                                        </div>
                                        {/* Title Badge Rendering */}
                                        {player.title && (
                                            <div className="mt-0.5">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                                                    {getItemValue(player.title)?.replace(/[^a-zA-Z0-9 ]/g, '')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-[10px] md:text-xs text-slate-400 mt-0.5">{player.role}</div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-4">
                                        <Mic size={14} className="text-slate-500 hidden sm:block" />
                                        {player.isReady ? (
                                            <div className="flex items-center text-green-400 text-xs md:text-sm font-bold bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
                                                <CheckCircle size={12} className="mr-1" /> <span className="hidden sm:inline">PRONTO</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-slate-500 text-xs md:text-sm font-bold bg-slate-800 px-2 py-1 rounded-lg">
                                                <Clock size={12} className="mr-1" /> <span className="hidden sm:inline">...</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-center text-slate-600 gap-2 animate-pulse">
                                    <User size={16} />
                                    <span className="text-xs md:text-sm font-medium">Vaga</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 md:mt-auto md:pt-6 flex gap-3 border-t border-slate-800 md:border-0">
                <button
                    onClick={onLeaveLobby}
                    className="px-4 md:px-6 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
                </button>

                {isHost ? (
                    <button
                        onClick={onStartGame}
                        disabled={starting}
                        className={`flex-1 py-3 md:py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-lg
                ${players.length > 0
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        <Play size={20} fill="currentColor" />
                        {starting ? 'Iniciando...' : (players.length === 1 ? 'Iniciar (Solo)' : 'Iniciar Partida')}
                    </button>
                ) : (
                    <button
                        onClick={onToggleReady}
                        className={`flex-1 py-3 md:py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-lg
                ${userReady
                                ? 'bg-slate-700 text-green-400 border border-green-500/30'
                                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'}`}
                    >
                        {userReady ? 'Cancelar Pronto' : 'Estou Pronto!'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default LobbyPlayerList;
