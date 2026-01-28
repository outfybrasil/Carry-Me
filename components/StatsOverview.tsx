import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, User, UserPlus } from 'lucide-react';
import { AdvancedStats } from '../types';

interface StatsOverviewProps {
    stats: AdvancedStats;
    winRate: number;
    leetifyRating: string | number;
    totalMatches: number;
}

const SkillBar = ({ label, value, trend, avg }: { label: string, value: number, trend: number | string, avg?: number }) => {
    const isPositive = typeof trend === 'number' ? trend >= 0 : trend.toString().startsWith('+');
    const displayTrend = typeof trend === 'number' ? (trend >= 0 ? `+${trend.toFixed(2)}` : trend.toFixed(2)) : trend;

    return (
        <div className="group space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    {label}
                </span>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white tracking-widest">{Math.round(value)}</span>
                    <div className={`flex items-center gap-1 text-[9px] font-mono font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {displayTrend}
                    </div>
                </div>
            </div>
            <div className="relative h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                {/* Progress Bar */}
                <div
                    className="absolute h-full bg-white transition-all duration-1000 ease-out fill-mode-forwards"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                ></div>
                {/* Average Indicator */}
                {avg && (
                    <div
                        className="absolute top-0 w-0.5 h-full bg-[#ffb800] z-10 opacity-70"
                        style={{ left: `${avg}%` }}
                        title={`Média do Rank: ${avg}`}
                    ></div>
                )}
            </div>
        </div>
    );
};

const CircleGauge = ({ label, value, subLabel, color = "stroke-[#ffb800]" }: { label: string, value: string | number, subLabel: string, color?: string }) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
    const displayValue = typeof value === 'number' ? (value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)) : value;

    const circumference = 2 * Math.PI * 45;
    // For rating, let's map 0-2 range to 0-100% for the gauge circle (approximate)
    const percent = label.includes('RATING') ? (Math.abs(numValue) * 50) : numValue;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mb-4">{label}</span>
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        className="stroke-white/5"
                        strokeWidth="8"
                        fill="transparent"
                        r="45"
                        cx="64"
                        cy="64"
                    />
                    <circle
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        r="45"
                        cx="64"
                        cy="64"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-mono font-black text-white italic tracking-tighter">
                        {label.includes('RATE') ? `${Math.round(numValue)}%` : displayValue}
                    </span>
                </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-4">{subLabel}</span>
        </div>
    );
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, winRate, leetifyRating, totalMatches }) => {
    // Mocking stack data for now - could be added to types later
    const stackData = {
        solo: 53,
        party: 47,
        full: 0
    };

    return (
        <div className="tactical-panel bg-[#121417] border border-white/5 rounded-3xl p-8 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

            <div className="relative flex flex-col xl:flex-row gap-12">
                {/* LEFT COLUMN: Skill Bars */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-tactical font-black text-white italic tracking-tighter uppercase">Stats Overview</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">Data from last 30 matches</span>
                            <div className="px-2 py-0.5 bg-[#4B4EFC]/20 border border-[#4B4EFC]/40 rounded text-[9px] font-mono font-black text-[#4B4EFC]">5k</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <SkillBar label="AIM" value={stats.headshotPct || 50} trend={+0.52} avg={48} />
                        <SkillBar label="UTILITY" value={stats.radar?.[1]?.A || 0} trend={-1.25} avg={51} />
                        <SkillBar label="POSITIONING" value={stats.radar?.[2]?.A || 0} trend={-0.89} avg={50} />
                        <SkillBar label="OPENING DUELS" value={stats.entrySuccess || 0} trend={stats.entrySuccess > 0 ? `+${stats.entrySuccess}` : stats.entrySuccess} avg={45} />
                        <SkillBar label="CLUTCHING" value={stats.clutchSuccess || 0} trend={stats.clutchSuccess > 0 ? `+${stats.clutchSuccess}` : stats.clutchSuccess} avg={42} />
                    </div>
                </div>

                {/* RIGHT COLUMN: Gauges */}
                <div className="flex flex-col md:flex-row xl:flex-col gap-12 justify-between xl:w-96 border-l border-white/5 pl-0 xl:pl-12">
                    <div className="flex flex-1 justify-around items-start">
                        <CircleGauge label="WIN RATE" value={Math.round(winRate * 100)} subLabel="Average" />
                        <CircleGauge label="LEETIFY RATING" value={leetifyRating > 0 ? `+${leetifyRating}` : leetifyRating} subLabel="Average" />
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/5">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                    <User size={12} />
                                    <span className="text-[8px] font-mono font-black uppercase">SOLO</span>
                                </div>
                                <span className="text-sm font-mono font-black text-white italic">{stackData.solo}%</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                    <Users size={12} />
                                    <span className="text-[8px] font-mono font-black uppercase">2-4 STACK</span>
                                </div>
                                <span className="text-sm font-mono font-black text-white italic">{stackData.party}%</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                    <UserPlus size={12} />
                                    <span className="text-[8px] font-mono font-black uppercase">5 STACK</span>
                                </div>
                                <span className="text-sm font-mono font-black text-white italic">{stackData.full}%</span>
                            </div>
                        </div>

                        {/* Stack Progress Bar */}
                        <div className="h-1.5 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden flex">
                            <div className="h-full bg-white transition-all duration-700" style={{ width: `${stackData.solo}%` }}></div>
                            <div className="h-full bg-slate-500 transition-all duration-700" style={{ width: `${stackData.party}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
