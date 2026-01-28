
import React, { useState, useEffect } from 'react';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import { Paintbrush, Check, X, Upload, TrendingUp, Lock, Crown, Crosshair, Target, Shield, Activity, Zap, Brain, MessageSquare, Share2, Camera, Terminal, Cpu } from 'lucide-react';
import { Player, ItemType, Clan } from '../types';
import { api } from '../services/api';
import ClanCreationModal from '../components/clans/ClanCreationModal';
import ClanDetailsModal from '../components/clans/ClanDetailsModal';
import PlayerIDCard from '../components/PlayerIDCard';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface ProfileProps {
  user: Player;
  onEquip: (type: 'border' | 'nameColor' | 'banner' | 'title' | 'entryEffect', itemId: string) => void;
  onProfileUpdate?: () => void;
  onUpgrade: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onEquip, onProfileUpdate, onUpgrade }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isClanModalOpen, setIsClanModalOpen] = useState(false);
  const [isClanDetailsOpen, setIsClanDetailsOpen] = useState(false);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);

  const ownedBorders = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.BORDER);
  const ownedColors = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.NAME_COLOR);
  const ownedTitles = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.TITLE);
  const ownedEffects = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.ENTRY_EFFECT);

  const isPremium = user.isPremium;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!newAvatarUrl) return;
    setUpdating(true);
    try {
      const success = await api.updateAvatar(user.id, newAvatarUrl);
      if (success) {
        setIsAvatarModalOpen(false);
        if (onProfileUpdate) onProfileUpdate();
      } else {
        alert("Erro ao atualizar avatar. Tente uma imagem menor.");
      }
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setUpdating(false);
    }
  };

  const getFocusIcon = (title: string) => {
    if (title.includes('Recuo') || title.includes('Aim')) return <Crosshair size={16} />;
    if (title.includes('Flash') || title.includes('Util')) return <Zap size={16} />;
    if (title.includes('Liderança') || title.includes('IGL')) return <Target size={16} />;
    if (title.includes('Comunicação')) return <MessageSquare size={16} />;
    return <Activity size={16} />;
  }

  const handleShareProfile = () => {
    const url = `${window.location.origin}/?u=${user.username}`;
    navigator.clipboard.writeText(url);
    alert("Link do perfil copiado!");
  };

  useEffect(() => {
    const fetchClan = async () => {
      if (user.clanId) {
        const clan = await api.getClan(user.clanId);
        setUserClan(clan);
      } else {
        setUserClan(null);
      }
    };
    fetchClan();
  }, [user.clanId]);

  return (
    <div className="noise-bg grid-bg scanline">
      <ClanCreationModal
        isOpen={isClanModalOpen}
        onClose={() => setIsClanModalOpen(false)}
        user={user}
        onSuccess={() => {
          if (onProfileUpdate) onProfileUpdate();
        }}
      />

      {userClan && (
        <ClanDetailsModal
          isOpen={isClanDetailsOpen}
          onClose={() => setIsClanDetailsOpen(false)}
          clan={userClan}
          user={user}
          onLeave={() => {
            if (onProfileUpdate) onProfileUpdate();
          }}
        />
      )}

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121417] border border-white/10 rounded-sm p-8 w-full max-w-md relative animate-in zoom-in-95">
            <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-xl font-tactical font-black text-white uppercase italic tracking-tighter mb-4">Sincronizar Avatar</h3>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-6">ENDPOINT_AVATAR // UPLOAD_LIMIT: 2MB</p>

            <label className="block w-full cursor-pointer bg-black/40 border-2 border-white/5 border-dashed rounded-sm p-10 text-center hover:border-[#ffb800]/50 transition-all mb-8 group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {newAvatarUrl ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img src={newAvatarUrl} className="w-full h-full rounded-sm object-cover border-4 border-[#1c1f24] shadow-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-[#ffb800]" size={32} />
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 group-hover:text-[#ffb800] transition-colors">
                  <div className="w-16 h-16 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-[#ffb800]/50">
                    <Upload size={28} />
                  </div>
                  <span className="text-[11px] font-mono font-black uppercase tracking-widest">Enviar Arquivo</span>
                  <p className="text-[9px] text-slate-700 mt-2">JPG, PNG, GIF</p>
                </div>
              )}
            </label>

            <button
              onClick={handleUpdateAvatar}
              disabled={updating || !newAvatarUrl}
              className="w-full bg-[#ffb800] hover:bg-[#ffc933] disabled:bg-white/5 disabled:text-slate-700 text-black font-tactical font-black uppercase italic tracking-widest py-4 rounded-sm transition-all shadow-xl active:scale-95"
            >
              {updating ? 'PROCESSANDO...' : 'ATUALIZAR_IDENTIDADE'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <PlayerIDCard
            user={user}
            clan={userClan}
            onAvatarClick={() => setIsAvatarModalOpen(true)}
            onShare={handleShareProfile}
            onClanClick={() => user.clanId ? setIsClanDetailsOpen(true) : setIsClanModalOpen(true)}
            onUpgrade={onUpgrade}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* PERFORMANCE DNA */}
          <div className={`tactical-panel bg-[#121417] rounded-2xl p-8 relative overflow-hidden ${isPremium ? 'border-[#ffb800]/20' : 'border-white/5'}`}>
            <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none"><Cpu size={120} /></div>

            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-sm ${isPremium ? 'bg-[#ffb800]/20 text-[#ffb800]' : 'bg-white/5 text-slate-600'}`}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-tactical font-black text-white uppercase italic tracking-tighter">DNA_COMPETITIVO</h3>
                  <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Sincronização de biometria tática</p>
                </div>
              </div>
              {isPremium && (
                <div className="px-4 py-1.5 rounded-sm border border-[#ffb800]/30 bg-[#ffb800]/10 text-[#ffb800] text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-2">
                  <Crown size={12} /> STATUS_PRO
                </div>
              )}
            </div>

            {!isPremium && (
              <div className="absolute inset-0 z-20 bg-[#0a0b0d]/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-12">
                <div className="relative mb-10">
                  <div className="absolute -inset-8 bg-[#ffb800]/10 rounded-full blur-[80px] animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-[#1c1f24] rounded-sm flex items-center justify-center border border-white/5 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                    <Lock className="text-[#ffb800]" size={48} />
                  </div>
                </div>

                <h3 className="text-3xl font-tactical font-black text-white mb-4 tracking-tighter uppercase italic">
                  Acesso <span className="text-[#ffb800]">RESTRITO</span>
                </h3>
                <p className="text-slate-500 max-w-sm mb-10 text-xs leading-relaxed font-mono font-bold uppercase tracking-widest">
                  Compare mira, utilidade e posicionamento com a elite do servidor para otimizar sua progressão.
                </p>

                <button
                  onClick={onUpgrade}
                  className="w-full max-w-xs py-5 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest rounded-sm shadow-[0_10px_30px_rgba(255,184,0,0.15)] hover:bg-[#ffc933] active:scale-95 transition-all"
                >
                  DESTRAVAR_ANALISE_PRO
                </button>

                <p className="mt-8 text-[9px] text-slate-700 font-mono font-black uppercase tracking-[0.2em] flex items-center gap-3">
                  <Shield size={10} /> PROTOCOLO_DE_ASSINATURA_REQUERIDO
                </p>
              </div>
            )}

            <div className={!isPremium ? 'filter blur-xl pointer-events-none opacity-20' : ''}>
              {/* Grading Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Aim Rating', value: user.advancedStats.headshotPct, unit: '% HS', icon: Crosshair, grade: 'A', color: 'text-white' },
                  { label: 'Damage Impact', value: user.advancedStats.adr, unit: 'ADR', icon: Target, grade: 'B', color: 'text-[#ffb800]' },
                  { label: 'KAST Index', value: user.advancedStats.kast, unit: '%', icon: Shield, grade: 'C+', color: 'text-blue-400' },
                  { label: 'Entry Success', value: user.advancedStats.entrySuccess, unit: '%', icon: Zap, grade: 'D', color: 'text-red-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-black/40 rounded-sm p-5 border border-white/5 relative group overflow-hidden">
                    <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><stat.icon size={40} /></div>
                    <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className={`text-2xl font-mono font-black ${stat.color}`}>{stat.value}</span>
                      <span className="text-[10px] text-slate-700 font-bold">{stat.unit}</span>
                    </div>
                    <span className="text-[10px] font-mono font-black border border-current px-2 py-0.5 rounded-sm opacity-50">{stat.grade}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Radar Chart */}
                <div className="bg-black/20 rounded-sm p-6 border border-white/5 flex flex-col min-h-[400px]">
                  <h4 className="text-[11px] font-mono font-black text-white mb-8 uppercase tracking-widest italic border-b border-white/5 pb-2">MAPA_DE_ATRIBUTOS</h4>
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={user.advancedStats.radar}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Media" dataKey="avg" stroke="transparent" fill="rgba(255,184,0,0.05)" fillOpacity={0.5} />
                        <Radar name="Voce" dataKey="A" stroke="#ffb800" strokeWidth={2} fill="#ffb800" fillOpacity={0.2} />
                        <Tooltip contentStyle={{ backgroundColor: '#1c1f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[11px] font-mono font-black text-white mb-4 uppercase tracking-widest italic border-b border-white/5 pb-2">AREAS_DE_OTIMIZACAO</h4>
                  <div className="space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                    {user.advancedStats.focusAreas?.map((focus, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-sm hover:border-[#ffb800]/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3 font-tactical font-black text-xs text-white uppercase italic tracking-tighter">
                            <span className="text-[#ffb800]">{getFocusIcon(focus.title)}</span>
                            {focus.title}
                          </div>
                          <span className={`text-xs font-mono font-black px-2 py-0.5 border border-current rounded-sm ${focus.color}`}>{focus.score}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-4 font-medium italic">"{focus.description}"</p>
                        <div className="flex items-center gap-3 text-[9px] font-mono font-black uppercase tracking-widest">
                          <span className="text-slate-800">TENDENCIA:</span>
                          {focus.trend === 'up' && <span className="text-green-500 flex items-center"><TrendingUp size={10} className="mr-1" /> OPTIMIZING</span>}
                          {focus.trend === 'down' && <span className="text-red-500 flex items-center"><TrendingUp size={10} className="mr-1 rotate-180" /> DEGRADING</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMIZATION / INVENTORY */}
          <div className="tactical-panel bg-[#121417] rounded-2xl p-8 border-white/5">
            <h3 className="font-tactical font-black text-xl uppercase italic tracking-tighter text-white mb-10 flex items-center gap-4">
              <Paintbrush className="text-[#ffb800]" size={24} /> INVENTARIO_DE_MODULOS
            </h3>

            <div className="space-y-10">
              {/* Titles Section */}
              <div>
                <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] mb-6 block border-b border-white/5 pb-2">PATENTES_ADQUIRIDAS</label>
                {ownedTitles.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {ownedTitles.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('title', item.id)}
                        className={`p-4 rounded-sm border transition-all flex flex-col gap-2 relative group overflow-hidden ${user.equipped.title === item.id ? 'bg-[#ffb800]/10 border-[#ffb800] ring-2 ring-[#ffb800]/20' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                      >
                        <span className={`text-xs font-tactical font-black uppercase italic tracking-widest ${user.equipped.title === item.id ? 'text-[#ffb800]' : 'text-white'}`}>{item.value}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">{item.description}</span>
                        {user.equipped.title === item.id && <div className="absolute top-2 right-2 text-[#ffb800]"><Check size={14} /></div>}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-[10px] font-mono text-slate-800 uppercase tracking-widest">Sem registros no banco de dados.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Borders Section */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] mb-6 block border-b border-white/5 pb-2">BORDAS_DE_AVATAR</label>
                  {ownedBorders.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {ownedBorders.map(item => (
                        <button
                          key={item.id}
                          onClick={() => onEquip('border', item.id)}
                          className={`w-14 h-14 rounded-full border-4 transition-all hover:scale-110 relative ${item.value} ${user.equipped.border === item.id ? 'ring-2 ring-white ring-offset-4 ring-offset-[#121417]' : 'opacity-60 hover:opacity-100'}`}
                        >
                          {user.equipped.border === item.id && <Check className="absolute inset-0 m-auto text-white drop-shadow-md" size={20} />}
                        </button>
                      ))}
                    </div>
                  ) : <p className="text-[10px] font-mono text-slate-800 uppercase tracking-widest">Vazio.</p>}
                </div>

                {/* Name Colors Section */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] mb-6 block border-b border-white/5 pb-2">IDENTIFICAÇÃO_VISUAL</label>
                  {ownedColors.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {ownedColors.map(item => (
                        <button
                          key={item.id}
                          onClick={() => onEquip('nameColor', item.id)}
                          className={`py-3 rounded-sm font-tactical font-black uppercase italic tracking-tighter border transition-all text-xs ${item.value} ${user.equipped.nameColor === item.id ? 'border-[#ffb800] bg-[#ffb800]/5' : 'bg-black/20 border-white/5'}`}
                        >
                          {user.username}
                        </button>
                      ))}
                    </div>
                  ) : <p className="text-[10px] font-mono text-slate-800 uppercase tracking-widest">Vazio.</p>}
                </div>
              </div>

              {/* Entry Effects Section */}
              <div>
                <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] mb-6 block border-b border-white/5 pb-2">EFEITOS_DE_PROTOCOLO_LOBBY</label>
                {ownedEffects.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {ownedEffects.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('entryEffect', item.id)}
                        className={`aspect-square rounded-sm relative overflow-hidden group border-2 transition-all hover:border-[#ffb800]/50 ${user.equipped.entryEffect === item.id ? 'border-[#ffb800]' : 'border-white/5'}`}
                      >
                        <img src={item.value} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Eff" />
                        {user.equipped.entryEffect === item.id && <div className="absolute inset-0 flex items-center justify-center bg-[#ffb800]/20"><Check className="text-white drop-shadow-lg" size={24} /></div>}
                        <div className="absolute bottom-0 w-full bg-black/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] font-mono font-black text-white uppercase truncate">{item.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-[10px] font-mono text-slate-800 uppercase tracking-widest">Vazio.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
