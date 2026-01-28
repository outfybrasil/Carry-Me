
import React, { useState, useEffect } from 'react';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import { Paintbrush, Check, X, Upload, TrendingUp, Lock, Crown, Crosshair, Target, Shield, Activity, Zap, Brain, MessageSquare, Share2, Camera } from 'lucide-react';
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ProfileProps {
  user: Player;
  onEquip: (type: 'border' | 'nameColor' | 'banner' | 'title' | 'entryEffect', itemId: string) => void;
  onProfileUpdate?: () => void; // New prop for tutorial
  onUpgrade: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onEquip, onProfileUpdate, onUpgrade }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isClanModalOpen, setIsClanModalOpen] = useState(false);
  const [isClanDetailsOpen, setIsClanDetailsOpen] = useState(false);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);


  // Helper to find item details
  const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);


  // =================================================================================================
  //                                  INVENTORY & CUSTOMIZATION
  // =================================================================================================

  // Inventory Filtering (Real Data Only)
  const ownedBorders = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.BORDER);
  const ownedColors = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.NAME_COLOR);

  const activeBorder = getEquippedItem(user.equipped.border);
  const activeColor = getEquippedItem(user.equipped.nameColor);
  const activeTitle = getEquippedItem(user.equipped.title);

  // New Inventory Filters
  const ownedTitles = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.TITLE);
  const ownedEffects = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.ENTRY_EFFECT);

  const isPremium = user.isPremium;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
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
        // Trigger tutorial callback if provided. This updates Parent state.
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

  // Helper for Focus Area icons
  const getFocusIcon = (title: string) => {
    if (title.includes('Recuo') || title.includes('Aim')) return <Crosshair size={16} />;
    if (title.includes('Flash') || title.includes('Util')) return <Zap size={16} />;
    if (title.includes('Liderança') || title.includes('IGL')) return <Brain size={16} />;
    if (title.includes('Comunicação')) return <MessageSquare size={16} />;
    return <Activity size={16} />;
  }

  const handleShareProfile = () => {
    const url = `${window.location.origin}/?u=${user.username}`;
    navigator.clipboard.writeText(url);
    alert("Link do perfil copiado para a área de transferência!");
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
    <>
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md relative">
            <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-4">Alterar Foto de Perfil</h3>
            <p className="text-sm text-slate-400 mb-4">Selecione uma imagem do seu dispositivo (max 2MB).</p>

            <label className="block w-full cursor-pointer bg-slate-950 border-2 border-slate-700 border-dashed rounded-xl p-8 text-center hover:border-blue-500 transition-colors mb-6 group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {newAvatarUrl ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img src={newAvatarUrl} className="w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700 group-hover:border-blue-500">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-bold">Clique para enviar foto</span>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG ou GIF</p>
                </div>
              )}
            </label>

            <button
              onClick={handleUpdateAvatar}
              disabled={updating || !newAvatarUrl}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              {updating ? 'Salvando...' : 'Salvar Nova Foto'}
            </button>
          </div>
        </div>
      )}

      import PlayerIDCard from '../components/PlayerIDCard';

      // ... (inside component)

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <PlayerIDCard
            user={user}
            clan={userClan}
            onAvatarClick={() => setIsAvatarModalOpen(true)}
            onShare={handleShareProfile}
            onClanClick={() => user.clanId ? setIsClanDetailsOpen(true) : setIsClanModalOpen(true)}
            onUpgrade={onUpgrade}
          />
        </div>

        {/* Right Column: DNA Competitivo (Leetify Style) */}
        <div className="lg:col-span-2 space-y-6">

          {/* PERFORMANCE DNA SECTION */}
          <div className={`relative bg-slate-900 border rounded-2xl p-6 overflow-hidden ${isPremium ? 'border-brand-accent/30' : 'border-slate-800'}`}>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPremium ? 'bg-brand-accent/20 text-brand-accent' : 'bg-slate-800 text-slate-400'}`}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isPremium ? 'text-white' : 'text-slate-300'}`}>DNA Competitivo</h3>
                  <p className="text-xs text-slate-500">Análise Cruzada: Habilidade vs. Comportamento</p>
                </div>
              </div>
              {isPremium && (
                <div className="px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-bold flex items-center gap-1">
                  <Crown size={12} /> PRO
                </div>
              )}
            </div>

            {/* LOCK OVERLAY FOR NON-PREMIUM */}
            {!isPremium && (
              <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-xl">
                  <Lock className="text-slate-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Análise Profunda Bloqueada</h3>
                <p className="text-slate-400 max-w-md mb-6">
                  Descubra seu verdadeiro impacto. Assinantes Premium veem como se comparam à média do rank em Mira, Utilitários e Liderança.
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
                  Desbloquear Premium Agora
                </button>
              </div>
            )}

            {/* ANALYTICS CONTENT */}
            <div className={!isPremium ? 'filter blur-md pointer-events-none opacity-50' : ''}>

              {/* Top Stats Grid with Grading */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-colors">
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Crosshair size={40} /></div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Aim Rating</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-white">{user.advancedStats.headshotPct}</span>
                    <span className="text-xs text-slate-500">% HS</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-green-400 bg-green-900/20 inline-block px-1.5 rounded">Grade A</div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-colors">
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={40} /></div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Impact (ADR)</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-blue-400">{user.advancedStats.adr}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-yellow-400 bg-yellow-900/20 inline-block px-1.5 rounded">Grade B</div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-colors">
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Shield size={40} /></div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Utility / Supp</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-purple-400">{user.advancedStats.kast}</span>
                    <span className="text-xs text-slate-500">KAST</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-400 bg-slate-800 inline-block px-1.5 rounded">Grade C+</div>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-colors">
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={40} /></div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Opening Duels</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-red-400">{user.advancedStats.entrySuccess}</span>
                    <span className="text-xs text-slate-500">% Win</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-red-400 bg-red-900/20 inline-block px-1.5 rounded">Grade D</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* The "Leetify" Radar Chart */}
                <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800 flex flex-col min-h-[350px]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">Perfil Híbrido</h4>
                      <p className="text-[10px] text-slate-500">Você vs. Média do Elo (Ouro IV)</p>
                    </div>
                    <div className="flex flex-col text-[10px] gap-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-accent"></span> Você</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Média</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={user.advancedStats.radar}>
                        <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        {/* Rank Average Ghost */}
                        <Radar
                          name="Média do Rank"
                          dataKey="avg"
                          stroke="#475569"
                          strokeWidth={2}
                          fill="#475569"
                          fillOpacity={0.1}
                        />
                        {/* User Stats */}
                        <Radar
                          name={user.username}
                          dataKey="A"
                          stroke="#d946ef" // Brand Accent
                          strokeWidth={3}
                          fill="#d946ef"
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

                {/* Focus Areas (AI Coach) */}
                <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Brain size={16} className="text-brand-purple" /> Áreas de Foco
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                    {user.advancedStats.focusAreas?.map((focus, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                            {getFocusIcon(focus.title)}
                            {focus.title}
                          </div>
                          <span className={`text-sm font-black ${focus.color}`}>{focus.score}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {focus.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-slate-600">Tendência:</span>
                          {focus.trend === 'up' && <span className="text-green-500 flex items-center"><TrendingUp size={10} className="mr-1" /> Melhorando</span>}
                          {focus.trend === 'down' && <span className="text-red-500 flex items-center"><TrendingUp size={10} className="mr-1 rotate-180" /> Caindo</span>}
                          {focus.trend === 'stable' && <span className="text-blue-500 flex items-center">Estável</span>}
                        </div>
                      </div>
                    ))}
                    <div className="bg-brand-purple/10 border border-brand-purple/20 p-3 rounded-lg text-center mt-2">
                      <p className="text-xs text-brand-purple font-bold">Dica do Sherpa IA</p>
                      <p className="text-[10px] text-slate-400 mt-1">"Seu uso de utilitários está baixo. Tente comprar mais flashbangs em rounds armados."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Section (Inventory) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-white flex items-center">
              <Paintbrush className="mr-2 text-purple-400" size={20} /> Personalizar (Inventário)
            </h3>

            <div className="space-y-6">
              {/* Borders */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-3 block border-b border-slate-800 pb-1">Bordas Adquiridas</label>
                {ownedBorders.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {ownedBorders.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('border', item.id)}
                        className={`w-14 h-14 rounded-full border-4 flex-shrink-0 relative transition-transform hover:scale-105 ${item.value} ${user.equipped.border === item.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                        title={item.name}
                      >
                        {user.equipped.border === item.id && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><Check size={16} className="text-white" /></div>}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-600 italic">Nenhuma borda comprada.</p>}
              </div>

              {/* Colors */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-3 block border-b border-slate-800 pb-1">Cores de Nome</label>
                {ownedColors.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {ownedColors.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('nameColor', item.id)}
                        className={`h-12 px-4 rounded-lg flex-shrink-0 relative bg-slate-950 font-bold text-lg flex items-center justify-center border border-slate-800 ${item.value} ${user.equipped.nameColor === item.id ? 'ring-2 ring-white' : ''}`}
                        title={item.name}
                      >
                        {user.username}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-600 italic">Nenhuma cor comprada.</p>}
              </div>

              {/* Titles */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-3 block border-b border-slate-800 pb-1">Títulos</label>
                {ownedTitles.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {ownedTitles.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('title', item.id)}
                        className={`px-4 py-2 rounded-lg flex-shrink-0 relative bg-slate-950 text-sm font-bold border border-slate-800 transition-all hover:border-yellow-500/50 ${user.equipped.title === item.id ? 'ring-2 ring-yellow-500 border-yellow-500 bg-yellow-900/10 text-yellow-200' : 'text-slate-300'}`}
                        title={item.description}
                      >
                        {item.value}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-600 italic">Nenhum título comprado.</p>}
              </div>

              {/* Entry Effects */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-3 block border-b border-slate-800 pb-1">Efeitos de Entrada (Lobby)</label>
                {ownedEffects.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {ownedEffects.map(item => (
                      <button
                        key={item.id}
                        onClick={() => onEquip('entryEffect', item.id)}
                        className={`w-20 h-20 rounded-lg flex-shrink-0 relative overflow-hidden group border-2 transition-all ${user.equipped.entryEffect === item.id ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : 'border-slate-800 hover:border-slate-600'}`}
                        title={item.name}
                      >
                        <img src={item.value} className="w-full h-full object-cover" />
                        {user.equipped.entryEffect === item.id && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Check size={24} className="text-white drop-shadow-md" /></div>}
                        <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-white py-1 text-center font-bold truncate px-1">
                          {item.name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-600 italic">Nenhum efeito comprado.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
