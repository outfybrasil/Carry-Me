import React from 'react';
import { Player, Clan, StoreItem, ItemType } from '../types';
import { Share2, Camera, Shield, Crown, Check } from 'lucide-react';
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

    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-lg relative overflow-hidden group min-h-[400px]`}>

            {/* Background Layer */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/50 to-transparent z-0"></div>

            {/* Entry Effect (Aura) - Now works everywhere! */}
            {activeEffect && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen overflow-hidden z-0">
                    <img src={activeEffect.value} className="w-full h-full object-cover scale-150 animate-pulse-slow" />
                </div>
            )}

            {/* Share Button */}
            {onShare && (
                <button
                    onClick={onShare}
                    className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-20"
                    title="Compartilhar Perfil"
                >
                    <Share2 size={18} />
                </button>
            )}

            <div className="relative pt-16 px-6 pb-6 z-10">
                {/* Avatar with dynamic border */}
                <div
                    className={`relative mx-auto w-32 h-32 mb-4 group/avatar ${onAvatarClick ? 'cursor-pointer' : ''}`}
                    onClick={onAvatarClick}
                >
                    <div className={`w-full h-full rounded-full border-4 p-1 bg-slate-900 overflow-hidden ${activeBorder ? activeBorder.value : 'border-slate-700'}`}>
                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                    {onAvatarClick && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    )}
                </div>

                {/* Username with dynamic color */}
                <h2 className={`text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${activeColor ? activeColor.value : 'text-white'}`}>
                    {user.username}
                    {user.isPremium && <Crown size={16} className="text-brand-accent fill-brand-accent" />}
                </h2>

                {/* Title */}
                {activeTitle && (
                    <div className="mb-2">
                        <span className="px-3 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            {activeTitle.value.replace(/[^a-zA-Z0-9 ]/g, '')}
                        </span>
                    </div>
                )}

                {/* Clan Tag (Simple View) */}
                {clan && !isPublic && (
                    <div className="mb-6 px-6">
                        <div
                            onClick={onClanClick}
                            className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-500/30 transition-colors cursor-pointer group/clan"
                        >
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                                {clan.logoUrl ? (
                                    <img src={clan.logoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Shield size={20} className="text-indigo-400" />
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-[10px] text-slate-500 uppercase font-bold flex justify-between">
                                    <span>Clã</span>
                                    <span className="text-indigo-400">#{clan.tag}</span>
                                </div>
                                <div className="font-bold text-white truncate max-w-[150px]">
                                    {clan.name}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clan Tag (Public Badge View) */}
                {clan && isPublic && (
                    <div className="flex justify-center items-center gap-2 mb-2 text-indigo-400 font-bold bg-indigo-900/10 py-1 px-3 rounded-lg border border-indigo-500/20 mx-auto w-fit">
                        <Shield size={14} /> <span>{clan.name} <span className="text-slate-500">#{clan.tag}</span></span>
                    </div>
                )}

                {/* No Clan (My Profile Only) */}
                {!clan && !isPublic && onClanClick && (
                    <div className="mb-6 px-6">
                        <button
                            onClick={onClanClick}
                            className="w-full py-3 bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
                        >
                            <Shield size={18} className="group-hover:scale-110 transition-transform" />
                            Criar Clã
                        </button>
                    </div>
                )}

                <p className="text-slate-400 text-sm mb-4">Membro CarryMe</p>

                {/* Badges */}
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {user.badges.length > 0 ? user.badges.map(badge => (
                        <span key={badge} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-blue-300">
                            {badge}
                        </span>
                    )) : (
                        <span className="text-xs text-slate-600 italic">Sem insígnias ainda</span>
                    )}
                </div>

                {/* Score */}
                {showScore && (
                    <div className="bg-slate-950/80 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center mb-6 border border-slate-800">
                        <div className="text-left">
                            <div className="text-xs text-slate-500 uppercase">CarryMe Score</div>
                            <div className="font-mono text-sm text-slate-300">Reputação Atual</div>
                        </div>
                        <ScoreGauge score={user.score} size={80} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default PlayerIDCard;
