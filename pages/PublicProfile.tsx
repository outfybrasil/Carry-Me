
import React, { useState, useEffect } from 'react';
import { Player, Clan } from '../types';
import { api } from '../services/api';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import PlayerIDCard from '../components/PlayerIDCard';
import { Loader2, ArrowLeft, Share2, Copy, Check, TrendingUp, Crosshair, Target, Shield, Zap, Brain, MessageSquare, Crown, Terminal, Activity } from 'lucide-react';
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
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProfileByUsername(username);
        setProfile(data);
        if (data && data.clanId) {
          const clanData = await api.getClan(data.clanId);
          setClan(clanData);
        }
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
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center noise-bg">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-white/5 border-t-[#ffb800] rounded-full animate-spin"></div>
          <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-[0.4em]">Interceptando_Dados...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center text-white p-8 text-center noise-bg grid-bg">
        <Terminal size={48} className="text-red-500 mb-8 opacity-20" />
        <h1 className="text-3xl font-tactical font-black mb-4 uppercase italic tracking-tighter">SUJEITO_NAO_IDENTIFICADO</h1>
        <p className="text-slate-600 mb-10 font-mono font-bold text-xs uppercase tracking-widest leading-relaxed">O registro operacional para "{username}" foi removido ou nunca existiu no diretório central.</p>
        <button onClick={onBack} className="px-10 py-4 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest rounded-sm shadow-xl active:scale-95 transition-all">
          RETORNAR_AO_QG
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-200 p-6 md:p-12 overflow-y-auto noise-bg grid-bg scanline">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-12">
          <button onClick={onBack} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-all text-white flex items-center gap-3">
            <ArrowLeft size={20} /> <span className="text-[10px] font-mono font-black uppercase tracking-widest hidden sm:inline">RECUA_OPERACAO</span>
          </button>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-3 px-6 py-3 rounded-sm transition-all text-[10px] font-mono font-black uppercase tracking-widest border ${copied ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[#ffb800] text-black border-[#ffb800]'}`}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'LINK_COPIADO' : 'SYNC_PERFIL'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <PlayerIDCard
              user={profile}
              clan={clan}
              isPublic={true}
              onShare={handleCopyLink}
              showScore={true}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="tactical-panel bg-[#121417] rounded-sm p-8 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Activity size={100} /></div>
              <h3 className="text-xl font-tactical font-black text-white mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
                <TrendingUp className="text-[#ffb800]" size={24} /> PERFORMANCE_DNA
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Partidas', value: profile.stats.matchesPlayed, icon: Target, color: 'text-white' },
                  { label: 'Elogios', value: profile.stats.commendations, icon: MessageSquare, color: 'text-green-500' },
                  { label: 'MVPs', value: profile.stats.mvps, icon: Crown, color: 'text-[#ffb800]' },
                  { label: 'HS Rate', value: `${profile.advancedStats.headshotPct}%`, icon: Crosshair, color: 'text-blue-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-black/40 p-5 rounded-sm border border-white/5 flex flex-col items-center">
                    <stat.icon size={16} className="text-slate-800 mb-3" />
                    <div className={`text-2xl font-mono font-black ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="h-[400px] w-full bg-black/20 rounded-sm border border-white/5 p-6 flex flex-col">
                <h4 className="text-[11px] font-mono font-black text-white mb-8 uppercase tracking-widest italic border-b border-white/5 pb-2">MAPA_DE_ATRIBUTOS</h4>
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profile.advancedStats.radar}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name={profile.username}
                        dataKey="A"
                        stroke="#ffb800"
                        strokeWidth={2}
                        fill="#ffb800"
                        fillOpacity={0.2}
                      />
                      <Tooltip contentStyle={{ backgroundColor: '#1c1f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default PublicProfile;