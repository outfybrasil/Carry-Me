
import React, { useState } from 'react';
import { STORE_ITEMS } from '../constants';
import ScoreGauge from '../components/ScoreGauge';
import { Paintbrush, Check, Camera, X, Upload, Award, Coins, TrendingUp, Lock, Crown, Crosshair, Target, Shield, Activity } from 'lucide-react';
import { Player, ItemType } from '../types';
import { api } from '../services/api';
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
} from 'recharts';

interface ProfileProps {
  user: Player; 
  onEquip: (type: 'border' | 'nameColor' | 'banner', itemId: string) => void;
  onProfileUpdate?: () => void; // New prop for tutorial
}

const Profile: React.FC<ProfileProps> = ({ user, onEquip, onProfileUpdate }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  // Helper to find item details
  const getEquippedItem = (itemId?: string) => STORE_ITEMS.find(i => i.id === itemId);
  
  // Inventory Filtering (Real Data Only)
  const ownedBorders = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.BORDER);
  const ownedColors = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.NAME_COLOR);
  const ownedBanners = STORE_ITEMS.filter(i => user.inventory.includes(i.id) && i.type === ItemType.BANNER);

  const activeBanner = getEquippedItem(user.equipped.banner);
  const activeBorder = getEquippedItem(user.equipped.border);
  const activeColor = getEquippedItem(user.equipped.nameColor);
  
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
    if(!newAvatarUrl) return;
    setUpdating(true);
    try {
        const success = await api.updateAvatar(user.id, newAvatarUrl);
        if(success) {
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

  return (
    <>
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md relative">
            <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-lg relative overflow-hidden group min-h-[400px]`}>
            {/* Banner Background */}
            <div className={`absolute top-0 left-0 w-full h-32 transition-colors ${activeBanner ? activeBanner.value : 'bg-gradient-to-b from-blue-900/50 to-transparent'}`}></div>
            
            <div className="relative pt-16 px-6 pb-6">
              {/* Avatar with dynamic border */}
              <div className="relative mx-auto w-32 h-32 mb-4 group/avatar cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                <div className={`w-full h-full rounded-full border-4 p-1 bg-slate-900 overflow-hidden ${activeBorder ? activeBorder.value : 'border-slate-700'}`}>
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              
              {/* Username with dynamic color */}
              <h2 className={`text-2xl font-bold mb-1 ${activeColor ? activeColor.value : 'text-white'}`}>{user.username}</h2>
              <p className="text-slate-400 text-sm mb-4">Membro CarryMe</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {user.badges.length > 0 ? user.badges.map(badge => (
                  <span key={badge} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-blue-300">
                    {badge}
                  </span>
                )) : (
                  <span className="text-xs text-slate-600 italic">Sem insígnias ainda</span>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center mb-6">
                 <div className="text-left">
                   <div className="text-xs text-slate-500 uppercase">CarryMe Score</div>
                   <div className="font-mono text-sm text-slate-300">Reputação Atual</div>
                 </div>
                 <ScoreGauge score={user.score} size={80} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Analytics (GC Style) & Customization */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* PREMIUM ANALYTICS SECTION */}
           <div className={`relative bg-slate-900 border rounded-2xl p-6 overflow-hidden ${isPremium ? 'border-brand-accent/30' : 'border-slate-800'}`}>
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isPremium ? 'bg-brand-accent/20 text-brand-accent' : 'bg-slate-800 text-slate-400'}`}>
                        <TrendingUp size={24} />
                     </div>
                     <div>
                        <h3 className={`text-xl font-bold ${isPremium ? 'text-white' : 'text-slate-300'}`}>Premium Analytics</h3>
                        <p className="text-xs text-slate-500">Performance Detalhada</p>
                     </div>
                 </div>
                 {isPremium && (
                   <div className="px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-bold flex items-center gap-1">
                      <Crown size={12} /> ATIVO
                   </div>
                 )}
              </div>

              {/* LOCK OVERLAY FOR NON-PREMIUM */}
              {!isPremium && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-xl">
                      <Lock className="text-slate-400" size={32} />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">Estatísticas Bloqueadas</h3>
                   <p className="text-slate-400 max-w-md mb-6">
                     Assinantes Premium têm acesso a gráficos detalhados de evolução, mapas de calor e análise de desempenho estilo Pro.
                   </p>
                   <button className="px-8 py-3 bg-gradient-to-r from-brand-accent to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
                     Desbloquear Premium Agora
                   </button>
                </div>
              )}

              {/* ANALYTICS CONTENT (Blurred if locked) */}
              <div className={!isPremium ? 'filter blur-md pointer-events-none opacity-50' : ''}>
                 
                 {/* Top Stats Grid */}
                 <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Crosshair size={12}/> HS%</div>
                       <div className="text-2xl font-mono font-bold text-white">{user.advancedStats.headshotPct}%</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Target size={12}/> ADR</div>
                       <div className="text-2xl font-mono font-bold text-blue-400">{user.advancedStats.adr}</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Shield size={12}/> KAST</div>
                       <div className="text-2xl font-mono font-bold text-green-400">{user.advancedStats.kast}%</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                       <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Activity size={12}/> Entry</div>
                       <div className="text-2xl font-mono font-bold text-yellow-400">{user.advancedStats.entrySuccess}%</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
                    {/* Rating History Chart */}
                    <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800 flex flex-col">
                       <h4 className="text-sm font-bold text-slate-300 mb-4">Evolução de Rating</h4>
                       <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={user.matchHistory}>
                              <defs>
                                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#10b981' }}
                              />
                              <Area type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRating)" />
                            </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Radar Chart Playstyle */}
                    <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800 flex flex-col">
                       <h4 className="text-sm font-bold text-slate-300 mb-4">Estilo de Jogo</h4>
                       <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={user.advancedStats.radar}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                  name={user.username}
                                  dataKey="A"
                                  stroke="#8b5cf6"
                                  strokeWidth={2}
                                  fill="#8b5cf6"
                                  fillOpacity={0.4}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                             </RadarChart>
                          </ResponsiveContainer>
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
                         {user.equipped.border === item.id && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><Check size={16} className="text-white"/></div>}
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

               {/* Banners */}
               <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-3 block border-b border-slate-800 pb-1">Banners de Perfil</label>
                 {ownedBanners.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {ownedBanners.map(item => (
                       <button 
                         key={item.id}
                         onClick={() => onEquip('banner', item.id)}
                         className={`w-24 h-12 rounded-lg flex-shrink-0 relative ${item.value} ${user.equipped.banner === item.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                         title={item.name}
                       >
                         {user.equipped.banner === item.id && <div className="absolute inset-0 flex items-center justify-center"><Check size={20} className="text-white drop-shadow-md"/></div>}
                       </button>
                    ))}
                  </div>
                 ) : <p className="text-sm text-slate-600 italic">Nenhum banner comprado.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
