
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Swords,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Crown,
  ShoppingBag,
  Coins,
  Settings as SettingsIcon,
  AlignLeft,
  Bell,
  Trophy,
  CheckCircle,
  Users,
  Terminal,
  Cpu,
  Shield
} from 'lucide-react';
import { Player, AppNotification } from '../types';
import { STORE_ITEMS } from '../constants';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  user: Player;
  onTriggerPremium?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, user, onTriggerPremium }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const isPremium = user.isPremium;

  useEffect(() => {
    const fetchNotifs = async () => {
      if (user) {
        const data = await api.getNotifications(user.id);
        setNotifications(data);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const equippedBorderItem = STORE_ITEMS.find(item => item.id === user.equipped.border);
  const avatarBorderClass = equippedBorderItem
    ? `border-4 ${equippedBorderItem.value}`
    : `border-2 ${isPremium ? 'border-[#ffb800]' : 'border-white/10'}`;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await api.markNotificationRead(user.id);
    const syncedData = await api.getNotifications(user.id);
    setNotifications(syncedData);
  };

  const NavItem = ({ page, icon: Icon, label, highlight = false }: { page: string, icon: any, label: string, highlight?: boolean }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} w-full p-4 transition-all duration-300 group overflow-hidden ${activePage === page
        ? 'text-white bg-white/5 border-l-2 border-l-[#ffb800]'
        : highlight
          ? 'text-[#ffb800] hover:bg-[#ffb800]/10'
          : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={18} className={`transition-transform group-hover:scale-110 flex-shrink-0 ${activePage === page ? 'text-[#ffb800]' : ''} ${highlight ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`} />

      {!isCollapsed && (
        <span className={`text-[11px] font-mono font-black uppercase tracking-[0.2em] truncate transition-opacity duration-300 ${activePage === page ? 'text-white' : ''}`}>
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0a0b0d] text-slate-200 overflow-hidden font-sans noise-bg grid-bg scanline selection:bg-[#ffb800] selection:text-black">

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full border-r border-white/5 flex flex-col z-[60] transform transition-all duration-500 ease-in-out md:translate-x-0 bg-[#0a0b0d] md:bg-[#121417]/40 backdrop-blur-3xl
        ${isMobileMenuOpen ? 'translate-x-0 w-80 shadow-[10px_0_50px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
        ${!isMobileMenuOpen && (isCollapsed ? 'md:w-20' : 'md:w-72')}
      `}>
        {/* Desktop Header */}
        <div className={`p-8 hidden md:flex items-center ${isCollapsed ? 'justify-center flex-col gap-6' : 'justify-between'} transition-all`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div className="w-10 h-10 bg-[#ffb800] text-black rounded-sm flex items-center justify-center font-black text-xl shadow-[0_4px_15px_rgba(255,184,0,0.2)] active:scale-95 transition-transform">
              C
            </div>
            {!isCollapsed && (
              <span className="font-tactical font-black text-2xl tracking-tighter text-white uppercase italic">
                Carry<span className="text-[#ffb800]">Me</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-700 hover:text-white transition-colors p-2 rounded-sm hover:bg-white/5"
          >
            <AlignLeft size={20} />
          </button>
        </div>

        {/* Mobile Header Close */}
        <div className="md:hidden p-8 flex justify-between items-center border-b border-white/5">
          <span className="font-tactical font-black text-xl uppercase italic tracking-tighter">Terminal</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-white p-2">
            <X />
          </button>
        </div>

        {/* Balance Card */}
        <div className={`mb-4 mt-8 md:mt-0 transition-all ${isCollapsed ? 'px-2' : 'px-8'}`}>
          <div className={`bg-[#1c1f24] border border-white/5 rounded-sm flex items-center shadow-xl overflow-hidden ${isCollapsed ? 'justify-center p-3 flex-col gap-2' : 'justify-between p-5'}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#ffb800]/10 rounded-sm">
                <Coins size={16} className="text-[#ffb800]" />
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">CREDITOS</span>}
            </div>
            <span className={`font-mono font-black text-[#ffb800] ${isCollapsed ? 'text-xs' : 'text-xl'}`}>{user.coins}</span>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-4 space-y-0.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <NavItem page="dashboard" icon={LayoutDashboard} label="DASHBOARD" />
          <NavItem page="match" icon={Swords} label="INICIAR_PARTIDA" />
          <NavItem page="friends" icon={Users} label="LOBBY_AMIGOS" />
          <NavItem page="achievements" icon={Trophy} label="PRO-REVIEWS" />
          <NavItem page="profile" icon={User} label="MEU_PERFIL" />
          <NavItem page="shop" icon={ShoppingBag} label="LOJA_SUPRIMENTOS" />
          <NavItem page="sherpa" icon={GraduationCap} label="ACADEMIA_SHERPA" />
          <div className="pt-6 mt-6 border-t border-white/5 opacity-50">
            <NavItem page="settings" icon={SettingsIcon} label="SISTEMA" />
          </div>

          {/* Premium CTA */}
          {!isCollapsed && !isPremium && (
            <div className="mx-8 mt-10 relative group cursor-pointer overflow-hidden rounded-sm" onClick={() => onTriggerPremium ? onTriggerPremium() : onNavigate('match')}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffb800]/20 to-transparent"></div>
              <div className="relative p-6 border border-[#ffb800]/10 bg-[#181b1f] hover:bg-[#1c1f24] transition-all">
                <Crown className="w-8 h-8 text-[#ffb800] mb-4 drop-shadow-[0_0_8px_rgba(255,184,0,0.3)]" />
                <h3 className="text-white font-tactical font-black text-xs uppercase italic tracking-widest mb-2">Upgrade Tactical</h3>
                <p className="text-slate-500 text-[10px] leading-tight mb-4 font-medium uppercase tracking-widest">Acesse as filas exclusivas OutfyBR.</p>
                <div className="w-full py-2 bg-[#ffb800] text-black font-mono font-black text-[9px] uppercase tracking-widest text-center shadow-[0_4px_10px_rgba(255,184,0,0.1)]">
                  CONTRATAR_PLANO
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="p-6 border-t border-white/5 bg-[#121417]/80">
          <div
            className={`flex items-center mb-6 p-3 rounded-sm border border-transparent hover:bg-white/5 transition-all group cursor-pointer ${isCollapsed ? 'justify-center' : 'space-x-4'}`}
            onClick={() => onNavigate('profile')}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar}
                alt="User"
                className={`w-12 h-12 rounded-sm object-cover ${avatarBorderClass} shadow-2xl transition-transform group-hover:scale-105`}
              />
              {isPremium && <div className="absolute -top-1 -right-1 p-0.5 bg-[#ffb800] text-black rounded-sm shadow-lg"><Crown size={10} /></div>}
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className={`text-sm font-tactical font-black uppercase italic tracking-tighter truncate ${isPremium ? 'text-[#ffb800]' : 'text-white'}`}>
                  {user.username}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.score > 80 ? 'bg-green-500' : 'bg-[#ffb800]'} shadow-[0_0_5px_currentColor] animate-pulse`}></div>
                  <div className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest">TACTICAL_SCORE: {user.score}</div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('logout')}
            className={`flex items-center justify-center w-full p-2 text-slate-700 hover:text-red-400 transition-colors text-[10px] font-mono font-black uppercase tracking-[0.3em] ${isCollapsed ? '' : 'space-x-3'}`}
            title="Sair"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>TERMINAR_SESSAO</span>}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 transition-all duration-500">

        {/* Header Ribbon */}
        <header className="flex justify-between items-center px-8 h-20 border-b border-white/5 bg-[#0a0b0d]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white p-2 bg-white/5 rounded-sm">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 text-slate-500">
              <Cpu size={16} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">GATEWAY_STABLE // POS_001</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-3 rounded-sm transition-all relative ${isNotifOpen ? 'bg-[#ffb800] text-black' : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && !isNotifOpen && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#0a0b0d] rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 top-14 w-96 bg-[#1c1f24] border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#121417]">
                      <span className="font-tactical font-black text-sm uppercase italic tracking-widest text-[#ffb800]">CENTRAL_DE_ALERTAS</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAsRead} className="text-[10px] font-mono font-black text-white px-2 py-1 bg-white/5 hover:bg-[#ffb800] hover:text-black transition-all">LIMPAR_LOG</button>
                      )}
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto custom-scrollbar bg-[#0f1114]">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={`p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${n.read ? 'opacity-40' : 'border-l-2 border-l-[#ffb800] bg-[#ffb800]/5'}`}>
                            <div className="flex gap-4">
                              <Info size={18} className={n.type === 'reward' ? 'text-yellow-400' : 'text-[#ffb800]'} />
                              <div>
                                <h4 className="text-xs font-black text-white mb-1 uppercase tracking-wider italic">{n.title}</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{n.message}</p>
                                <span className="text-[9px] font-mono font-bold text-slate-700 mt-3 block uppercase tracking-widest">{n.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-16 text-center text-slate-800 flex flex-col items-center gap-4">
                          <Shield size={48} className="opacity-10" />
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest">NENHUM_ALERTA_DETECTADO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="h-8 border-r border-white/5"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-tactical font-black uppercase italic tracking-tighter text-white">{user.username}</p>
                <p className="text-[9px] font-mono font-bold text-[#ffb800] uppercase tracking-widest">{isPremium ? 'ELITE_PRO' : 'OPERADOR_RESERVISTA'}</p>
              </div>
              <img src={user.avatar} className="w-10 h-10 rounded-sm border border-white/10" alt="Av" />
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-12 min-h-full">
            {children}
          </div>

          <footer className="p-8 border-t border-white/5 bg-[#121417]/30 text-center">
            <div className="flex justify-center gap-10 mb-4 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
              <button onClick={() => onNavigate('terms')} className="hover:text-[#ffb800] transition-colors">PROTOCOLO_DE_USO</button>
              <button onClick={() => onNavigate('privacy')} className="hover:text-[#ffb800] transition-colors">POLITICA_LGPD</button>
              <a href="mailto:support@carryme.gg" className="hover:text-[#ffb800] transition-colors">NUCLEO_SUPORTE</a>
            </div>
            <p className="text-[9px] font-mono text-slate-800 uppercase tracking-widest italic">&c; {new Date().getFullYear()} OUTFYBR_TECH // TODOS OS DIREITOS RESERVADOS.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
