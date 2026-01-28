import React, { useState, useEffect } from 'react';
import { Player, Clan } from '../types';
import { api } from '../services/api';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import PlayerIDCard from '../components/PlayerIDCard';
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

  // Helpers
  const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);

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
            {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            {copied ? 'Link Copiado!' : 'Compartilhar Perfil'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ID Card */}
          <div className="lg:col-span-1 space-y-6">
            <PlayerIDCard
              user={profile}
              clan={clan}
              isPublic={true}
              onShare={handleCopyLink}
              showScore={true}
            />
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
      </div >
    </div >
  );
};

export default PublicProfile;