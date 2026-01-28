import React, { useEffect, useState } from 'react';
import { Clan } from '../types';
import { api } from '../services/api';
import { Trophy, Shield, Users, Crown, TrendingUp } from 'lucide-react';

const ClanRanking: React.FC = () => {
    const [clans, setClans] = useState<Clan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const data = await api.getClanRanking();
                setClans(data);
            } catch (e) {
                console.error("Failed to load ranking", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={32} />
                        Ranking Global de Clãs
                    </h1>
                    <p className="text-slate-400 mt-2">Os clãs mais prestigiados da temporada.</p>
                </div>

                {/* Top 3 Stats Card (Mock/Future) */}
                <div className="hidden md:flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="bg-yellow-500/10 p-2 rounded-lg"><Crown size={20} className="text-yellow-500" /></div>
                        <div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Líder Atual</div>
                            <div className="text-white font-bold">{clans[0]?.name || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-950 border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <div className="col-span-1 text-center">Pos</div>
                    <div className="col-span-1"></div> { /* Logo */}
                    <div className="col-span-4">Clã</div>
                    <div className="col-span-3 text-right">Membros</div>
                    <div className="col-span-3 text-right">Prestige</div>
                </div>

                <div className="divide-y divide-slate-800">
                    {clans.length > 0 ? clans.map((clan, index) => (
                        <div
                            key={clan.id}
                            className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''}`}
                        >
                            {/* Rank Position */}
                            <div className="col-span-1 flex justify-center">
                                {index === 0 && <Crown size={24} className="text-yellow-400 drop-shadow-md" />}
                                {index === 1 && <Trophy size={20} className="text-slate-300" />}
                                {index === 2 && <Trophy size={20} className="text-amber-600" />}
                                {index > 2 && <span className="text-slate-500 font-mono font-bold text-lg">#{index + 1}</span>}
                            </div>

                            {/* Logo */}
                            <div className="col-span-1 flex justify-center">
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                                    {clan.logoUrl ? (
                                        <img src={clan.logoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <Shield size={20} className="text-slate-600" />
                                    )}
                                </div>
                            </div>

                            {/* Clan Name & Tag */}
                            <div className="col-span-4">
                                <div className="font-bold text-white text-lg flex items-center gap-2">
                                    {clan.name}
                                    <span className="text-xs font-bold bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                                        {clan.tag}
                                    </span>
                                </div>
                                {index === 0 && <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Top #1 da Season</span>}
                            </div>

                            {/* Members */}
                            <div className="col-span-3 text-right text-slate-400 flex items-center justify-end gap-2">
                                <Users size={14} />
                                <span>- / 50</span> {/* Placeholder member count */}
                            </div>

                            {/* Prestige */}
                            <div className="col-span-3 text-right">
                                <div className="font-mono font-bold text-xl text-indigo-400 flex items-center justify-end gap-2">
                                    {clan.prestige.toLocaleString()}
                                    <TrendingUp size={16} className="text-green-500" />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-slate-500 italic">
                            Nenhum clã rankeado ainda. Seja o primeiro a criar um!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClanRanking;
