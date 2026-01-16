import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { api } from '../services/api';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import { Loader2, ArrowLeft, Share2, Copy, Check, TrendingUp, Crosshair, Target, Shield, Zap, Brain, MessageSquare, Crown } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface PublicProfileProps {
  username: string;
  onBack: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ username, onBack }) => {
  const [profile, setProfile] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProfileByUsername(username);
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Usuário não encontrado</h1>
        <p className="text-slate-400 mb-8">O jogador "{username}" não existe ou mudou de nome.</p>
        <button onClick={onBack} className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">
            Voltar ao Início
        </button>
      </div>
    );
  }

  const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);
  const activeBanner = getEquippedItem(profile.equipped.banner);
  const activeBorder = getEquippedItem(profile.equipped.border);
  const activeColor = getEquippedItem(profile.equipped.nameColor);

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="mr-2" size={20} /> Voltar
                </button>
                <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                    {copied ? <Check size={16} className="text-green-400"/> : <Share2 size={16} />}
                    {copied ? 'Link Copiado!' : 'Compartilhar Perfil'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ID Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-lg relative overflow-hidden min-h-[400px]">
                        <div className={`absolute top-0 left-0 w-full h-32 ${activeBanner ? activeBanner.value : 'bg-gradient-to-b from-blue-900/50 to-transparent'}`}></div>
                        
                        <div className="relative pt-16 px-6 pb-6">
                            <div className={`relative mx-auto w-32 h-32 mb-4 rounded-full border-4 p-1 bg-slate-900 overflow-hidden ${activeBorder ? activeBorder.value : 'border-slate-700'}`}>
                                <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            </div>
                            
                            <h2 className={`text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${activeColor ? activeColor.value : 'text-white'}`}>
                                {profile.username}
                                {profile.isPremium && <Crown size={16} className="text-brand-accent fill-brand-accent" />}
                            </h2>
                            <p className="text-slate-400 text-sm mb-4">Membro CarryMe</p>
                            
                            <div className="flex justify-center gap-2 mb-6 flex-wrap">
                                {profile.badges.map(badge => (
                                    <span key={badge} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-blue-300">
                                        {badge}
                                    </span>
                                ))}
                            </div>

                            <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center">
                                <div className="text-left">
                                    <div className="text-xs text-slate-500 uppercase">CarryMe Score</div>
                                    <div className="font-mono text-sm text-slate-300">Reputação</div>
                                </div>
                                <ScoreGauge score={profile.score} size={80} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Performance
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-white">{profile.stats.matchesPlayed}</div>
                                <div className="text-xs text-slate-500 uppercase">Partidas</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-green-400">{profile.stats.commendations}</div>
                                <div className="text-xs text-slate-500 uppercase">Elogios</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{profile.stats.mvps}</div>
                                <div className="text-xs text-slate-500 uppercase">MVPs</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-blue-400">{profile.advancedStats.headshotPct}%</div>
                                <div className="text-xs text-slate-500 uppercase">HS Rate</div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full bg-slate-950/30 rounded-xl border border-slate-800 p-4">
                             <ResponsiveContainer width="100%" height="100%">
                                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={profile.advancedStats.radar}>
                                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                      name={profile.username}
                                      dataKey="A"
                                      stroke="#3b82f6"
                                      strokeWidth={3}
                                      fill="#3b82f6"
                                      fillOpacity={0.4}
                                    />
                                    <Tooltip 
                                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                       itemStyle={{ padding: 0 }}
                                    />
                                 </RadarChart>
                              </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PublicProfile;