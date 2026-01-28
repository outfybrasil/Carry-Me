import React, { useMemo } from 'react';
import { Player, Clan, StoreItem, ItemType } from '../types';
import { Share2, Camera, Shield, Crown, Check, TrendingUp, Info, Zap, Crosshair, Target, Award, Terminal } from 'lucide-react';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from './ScoreGauge';

interface PlayerIDCardProps {
    user: Player;
    clan: Clan | null;
    equippedOverride?: {
        border?: string;
        nameColor?: string;
        title?: string;
        entryEffect?: string;
    };
    isPublic?: boolean;
    onShare?: () => void;
    onAvatarClick?: () => void;
    onClanClick?: () => void;
    onUpgrade?: () => void;
    showScore?: boolean;
}

const PlayerIDCard: React.FC<PlayerIDCardProps> = ({
    user,
    clan,
    equippedOverride,
    isPublic = false,
    onShare,
    onAvatarClick,
    onClanClick,
    onUpgrade,
    showScore = true
}) => {
    const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);

    // Resolve items (Override > User Equipped > Default)
    const borderId = equippedOverride?.border !== undefined ? equippedOverride.border : user.equipped.border;
    const colorId = equippedOverride?.nameColor !== undefined ? equippedOverride.nameColor : user.equipped.nameColor;
    const titleId = equippedOverride?.title !== undefined ? equippedOverride.title : user.equipped.title;
    const effectId = equippedOverride?.entryEffect !== undefined ? equippedOverride.entryEffect : user.equipped.entryEffect;

    const activeBorder = getEquippedItem(borderId);
    const activeColor = getEquippedItem(colorId);
    const activeTitle = getEquippedItem(titleId);
    const activeEffect = getEquippedItem(effectId);

    // Dynamic Aura Color based on Score
    const auraColor = useMemo(() => {
        if (user.score >= 80) return 'rgba(234, 179, 8, 0.4)'; // Gold/Yellow
        if (user.score >= 50) return 'rgba(59, 130, 246, 0.4)'; // Blue
        if (user.score >= 20) return 'rgba(139, 92, 246, 0.4)'; // Purple
        return 'rgba(71, 85, 105, 0.3)'; // Slate
    }, [user.score]);

    // Trust Seal
    const TrustSeal = useMemo(() => {
        if (user.score >= 80) return { icon: <Award className="text-yellow-400" size={24} />, label: 'Exemplar', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
        if (user.score >= 50) return { icon: <Shield className="text-blue-400" size={24} />, label: 'Confiável', color: 'text-blue-400', bg: 'bg-blue-400/10' };
        return { icon: <Check className="text-slate-400" size={24} />, label: 'Membro', color: 'text-slate-400', bg: 'bg-slate-400/10' };
    }, [user.score]);

    // Gamer Archetype for non-premium/non-linked
    const archetype = useMemo(() => {
        if (user.score >= 80) return { title: 'Líder Nato', desc: 'Sua presença eleva o nível do time.' };
        if (user.score >= 50) return { title: 'Jogador Estratégico', desc: 'Joga com inteligência e calma.' };
        if (user.score >= 20) return { title: 'Duelista em Potencial', desc: 'Foco técnico em evolução.' };
        return { title: 'Recruta CarryMe', desc: 'Iniciando sua jornada competitiva.' };
    }, [user.score]);

    return (
        <div className="relative group/card animate-scale-in">
            {/* Dynamic Aura Background */}
            <div
                className="absolute -inset-4 rounded-[40px] opacity-20 blur-[60px] animate-aura pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: auraColor }}
            ></div>

            <div className={`bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] animate-shimmer`}>

                {/* Background Layer */}
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-900/40 via-blue-900/10 to-transparent z-0"></div>

                {/* Entry Effect (Aura) */}
                {activeEffect && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen overflow-hidden z-0">
                        <img src={activeEffect.value} className="w-full h-full object-cover scale-150 animate-pulse-slow" alt="" />
                    </div>
                )}

                {/* Top Action Bar */}
                <div className="relative z-20 flex justify-between items-center p-4">
                    <div className={`${TrustSeal.bg} ${TrustSeal.color} px-3 py-1 rounded-full border border-current border-opacity-20 flex items-center gap-2 animate-float`}>
                        {TrustSeal.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{TrustSeal.label}</span>
                    </div>
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="p-2.5 bg-black/40 hover:bg-black/60 rounded-xl text-white transition-all hover:scale-110 active:scale-95 border border-white/5"
                            title="Compartilhar Perfil"
                        >
                            <Share2 size={18} />
                        </button>
                    )}
                </div>

                <div className="relative px-6 pb-6 z-10">
                    {/* Avatar with dynamic border */}
                    <div
                        className={`relative mx-auto w-32 h-32 mb-4 group/avatar ${onAvatarClick ? 'cursor-pointer' : ''}`}
                        onClick={onAvatarClick}
                    >
                        <div className={`w-full h-full rounded-full border-[6px] p-1.5 bg-slate-950 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${activeBorder ? activeBorder.value : 'border-slate-800'}`}>
                            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        </div>
                        {onAvatarClick && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        )}
                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-3 w-6 h-6 bg-slate-900 rounded-full p-1 border-2 border-slate-900 shadow-xl">
                            <div className="w-full h-full bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                        </div>
                    </div>

                    {/* Username with dynamic color */}
                    <h2 className={`text-2xl font-black mb-1 flex items-center justify-center gap-2 drop-shadow-md ${activeColor ? activeColor.value : 'text-white'}`}>
                        {user.username}
                        {user.isPremium && <Crown size={20} className="text-brand-accent fill-brand-accent animate-float" />}
                    </h2>

                    {/* Title */}
                    {activeTitle && (
                        <div className="mb-4">
                            <span className="px-4 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
                                {activeTitle.value.replace(/[^a-zA-Z0-9 ]/g, '')}
                            </span>
                        </div>
                    )}

                    {/* Clan Tag */}
                    {clan ? (
                        <div className="mb-6 px-4">
                            <div
                                onClick={onClanClick}
                                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 hover:border-indigo-500/50 transition-all cursor-pointer group/clan shadow-lg"
                            >
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800 group-hover/clan:border-indigo-500/30 transition-colors">
                                    {clan.logoUrl ? (
                                        <img src={clan.logoUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Shield size={20} className="text-indigo-400" />
                                    )}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-[9px] text-slate-500 uppercase font-black flex justify-between">
                                        <span>Clã de Elite</span>
                                        <span className="text-indigo-400">#{clan.tag}</span>
                                    </div>
                                    <div className="font-bold text-white truncate text-base">
                                        {clan.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !isPublic && onClanClick && (
                        <div className="mb-6 px-4">
                            <button
                                onClick={onClanClick}
                                className="w-full py-3.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all group"
                            >
                                <Shield size={18} className="group-hover:rotate-12 transition-transform" />
                                Alistar em um Clã
                            </button>
                        </div>
                    )}
                </div>

                {/* DNA Section - The HOOK */}
                <div className="mt-auto px-6 pb-6">
                    <div className="bg-slate-950/80 border border-white/5 rounded-[24px] p-5 relative overflow-hidden group/dna shadow-inner">
                        <div className="absolute inset-0 bg-blue-600/[0.02] pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">DNA Competitivo</span>
                            </div>
                            <TrendingUp size={14} className="text-blue-500/50" />
                        </div>

                        {user.steamId ? (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center group/stat">
                                    <div className="text-[9px] text-slate-500 uppercase font-black mb-2 flex items-center justify-center gap-1 group-hover/stat:text-blue-400 transition-colors">
                                        <Target size={10} /> ADR
                                    </div>
                                    <div className="text-xl font-black text-white font-mono leading-none tracking-tighter">
                                        {user.advancedStats?.adr || '00.0'}
                                    </div>
                                </div>
                                <div className="text-center group/stat border-x border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase font-black mb-2 flex items-center justify-center gap-1 group-hover/stat:text-blue-400 transition-colors">
                                        <Crosshair size={10} /> HS%
                                    </div>
                                    <div className="text-xl font-black text-white font-mono leading-none tracking-tighter">
                                        {user.advancedStats?.headshotPct || '0'}%
                                    </div>
                                </div>
                                <div className="text-center group/stat">
                                    <div className="text-[9px] text-slate-500 uppercase font-black mb-2 flex items-center justify-center gap-1 group-hover/stat:text-blue-400 transition-colors">
                                        <Zap size={10} /> KAST
                                    </div>
                                    <div className="text-xl font-black text-white font-mono leading-none tracking-tighter">
                                        {user.advancedStats?.kast || '0'}%
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Archetype Display */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-600/20 text-blue-400">
                                        <Terminal size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-white text-sm uppercase leading-none mb-1">{archetype.title}</div>
                                        <div className="text-[10px] text-slate-500 font-medium leading-tight">{archetype.desc}</div>
                                    </div>
                                </div>

                                {/* Teaser / Call to action */}
                                <button
                                    onClick={onUpgrade}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 group/btn"
                                >
                                    Sincronizar DNA do CS2
                                    <TrendingUp size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>

                                {/* Blurred Content Mask */}
                                <div className="absolute -inset-1 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover/dna:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-[10px] text-white font-black uppercase tracking-widest bg-blue-600 px-3 py-1 rounded-full shadow-lg">Preview Bloqueado</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reputation Footer */}
                {showScore && (
                    <div className="bg-slate-950 px-6 py-4 flex justify-between items-center border-t border-white/5">
                        <div className="text-left">
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Reputação Real</div>
                            <div className="flex items-center gap-1">
                                <span className={`text-base font-black ${user.score >= 50 ? 'text-green-400' : 'text-slate-400'}`}>
                                    {user.score}% Score
                                </span>
                                <Info size={12} className="text-slate-700 cursor-help" />
                            </div>
                        </div>
                        <ScoreGauge score={user.score} size={50} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerIDCard;
