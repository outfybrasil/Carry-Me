
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
  Users
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

  // Load real notifications on mount
  useEffect(() => {
    const fetchNotifs = async () => {
        if(user) {
            const data = await api.getNotifications(user.id);
            setNotifications(data);
        }
    };
    fetchNotifs();
    
    // Simple polling for new notifications (demo real-time)
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Find equipped border styles
  const equippedBorderItem = STORE_ITEMS.find(item => item.id === user.equipped.border);
  const avatarBorderClass = equippedBorderItem 
    ? `border-4 ${equippedBorderItem.value}` 
    : `border-2 ${isPremium ? 'border-brand-accent' : 'border-slate-700'}`;

  // Strict unread count based on current state
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async () => {
      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      
      // Update persistent storage
      await api.markNotificationRead(user.id);
      
      // Force refresh data from storage to ensure sync and prevent interval overrides
      const syncedData = await api.getNotifications(user.id);
      setNotifications(syncedData);
  };

  const NavItem = ({ page, icon: Icon, label, highlight = false }: { page: string, icon: any, label: string, highlight?: boolean }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-3 rounded-xl transition-all duration-300 group overflow-hidden ${
        activePage === page 
          ? 'text-white bg-white/5 border border-white/10' 
          : highlight 
            ? 'text-brand-accent hover:bg-brand-accent/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
      title={isCollapsed ? label : undefined}
    >
      {activePage === page && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-purple rounded-l-xl shadow-[0_0_10px_#7c3aed]"></div>
      )}
      <Icon size={20} className={`transition-transform group-hover:scale-110 flex-shrink-0 ${activePage === page ? 'text-brand-purple' : ''} ${highlight ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`} />
      
      {!isCollapsed && (
        <span className={`font-medium truncate transition-opacity duration-300 ${activePage === page ? 'font-bold' : ''}`}>
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-slate-100 overflow-hidden font-sans selection:bg-brand-purple selection:text-white">
      
      {/* Background Noise/Grid (Global) */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full glass-panel border-r border-white/5 flex flex-col z-50 transform transition-all duration-300 ease-in-out md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
        ${!isMobileMenuOpen && (isCollapsed ? 'md:w-20' : 'md:w-72')}
      `}>
        {/* Desktop Header with Toggle */}
        <div className={`p-6 hidden md:flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} transition-all`}>
           <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 flex-shrink-0 bg-white text-black rounded-lg flex items-center justify-center font-display font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                C
              </div>
              {!isCollapsed && (
                <span className="font-display font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden">
                  Carry<span className="text-brand-purple">Me</span>
                </span>
              )}
           </div>
           
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
           >
             <AlignLeft size={24} />
           </button>
        </div>

        {/* Mobile Sidebar Header with Close Button */}
        <div className="md:hidden p-6 flex justify-between items-center border-b border-white/5">
           <span className="font-display font-bold text-xl tracking-tight">Menu</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
             <X />
           </button>
        </div>

        {/* Currency Display */}
        <div className={`mb-4 mt-6 md:mt-0 transition-all ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`bg-black/40 border border-white/10 rounded-2xl flex items-center shadow-inner overflow-hidden ${isCollapsed ? 'justify-center p-2 flex-col gap-1' : 'justify-between p-4'}`}>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                <Coins size={16} className="text-yellow-400" />
              </div>
              {!isCollapsed && <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Saldo</span>}
            </div>
            <span className={`font-display font-bold text-yellow-400 ${isCollapsed ? 'text-xs' : 'text-lg'}`}>{user.coins}</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div className="mb-8 px-2">
             {!isCollapsed && <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 pl-2">Navegação</div>}
             <div className="space-y-1">
               <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
               <NavItem page="match" icon={Swords} label="Jogar Agora" />
               <NavItem page="friends" icon={Users} label="Amigos" />
               <NavItem page="achievements" icon={Trophy} label="Conquistas" />
               <NavItem page="profile" icon={User} label="Meu Perfil" />
               <NavItem page="shop" icon={ShoppingBag} label="Loja" />
               <NavItem page="sherpa" icon={GraduationCap} label="Sherpa Market" />
               <div className="pt-4 mt-4 border-t border-white/5">
                 <NavItem page="settings" icon={SettingsIcon} label="Configurações" />
               </div>
             </div>
             
             {!isPremium && !isCollapsed && (
               <div className="mt-8 relative group cursor-pointer animate-in fade-in duration-500" onClick={() => onTriggerPremium ? onTriggerPremium() : onNavigate('match')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-brand-purple blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-md">
                     <Crown className="w-8 h-8 text-brand-accent mx-auto mb-2 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
                     <h3 className="text-white font-display font-bold text-sm mb-1">Seja Premium</h3>
                     <p className="text-slate-400 text-xs mb-3 font-light">Desbloqueie lobbies exclusivos.</p>
                     <button className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors">
                       Assinar
                     </button>
                  </div>
               </div>
             )}
             
             {!isPremium && isCollapsed && (
                <button 
                  onClick={() => onTriggerPremium ? onTriggerPremium() : onNavigate('match')}
                  className="mt-8 w-full p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent hover:bg-brand-accent/20 flex justify-center"
                  title="Seja Premium"
                >
                  <Crown size={20} />
                </button>
             )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div 
            className={`flex items-center mb-4 p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all group cursor-pointer ${isCollapsed ? 'justify-center' : 'space-x-3'}`} 
            onClick={() => onNavigate('profile')}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={user.avatar} 
                alt="User" 
                className={`w-10 h-10 rounded-xl object-cover ${avatarBorderClass}`} 
              />
              {isPremium && <Crown size={12} className="absolute -top-1 -right-1 text-brand-accent fill-brand-accent" />}
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className={`text-sm font-bold truncate ${isPremium ? 'text-brand-accent' : 'text-white'}`}>
                  {user.username}
                </div>
                <div className="flex items-center gap-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${user.score > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                   <div className="text-xs text-slate-500 font-medium">Score: {user.score}</div>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate('logout')}
            className={`flex items-center justify-center w-full p-2 text-slate-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-wider ${isCollapsed ? '' : 'space-x-2'}`}
            title="Desconectar"
          >
            <LogOut size={14} />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Desktop Header for Notifications */}
        <div className="hidden md:flex absolute top-4 right-8 z-50">
           <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-3 rounded-full transition-colors relative ${isNotifOpen ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 border hover:bg-slate-800'}`}
              >
                 <Bell size={20} className={unreadCount > 0 ? 'text-white' : 'text-slate-400'} />
                 {unreadCount > 0 && (
                   <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020202]"></span>
                 )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                   <div className="absolute right-0 top-14 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                         <span className="font-bold text-sm">Notificações</span>
                         {unreadCount > 0 && (
                           <button onClick={handleMarkAsRead} className="text-xs text-blue-400 hover:underline">Marcar lidas</button>
                         )}
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                         {notifications.length > 0 ? (
                            notifications.map(n => (
                              <div key={n.id} className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${n.read ? 'opacity-50' : 'opacity-100 border-l-2 border-l-blue-500 bg-blue-500/5'}`}>
                                 <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'reward' ? 'bg-yellow-400' : n.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                                    <div>
                                       <h4 className="text-sm font-bold text-white mb-1">{n.title}</h4>
                                       <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                                       <span className="text-[10px] text-slate-600 mt-2 block">{n.timestamp}</span>
                                    </div>
                                 </div>
                              </div>
                            ))
                         ) : (
                            <div className="p-8 text-center text-slate-500 text-xs">
                               <Bell className="mx-auto mb-2 opacity-20" size={32} />
                               Sem notificações
                            </div>
                         )}
                      </div>
                   </div>
                 </>
              )}
           </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 z-30 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">C</div>
            <span className="font-display font-bold text-xl tracking-tight">Carry<span className="text-brand-purple">Me</span></span>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-300 hover:text-white"
             >
                <Bell size={24} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
             </button>
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300 hover:text-white p-2">
               <Menu />
             </button>
          </div>
        </div>
        
        {/* Mobile Notification Drawer (Simplified) */}
        {isNotifOpen && (
           <div className="md:hidden fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto animate-in slide-in-from-right">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Notificações</h2>
                 <div className="flex gap-4">
                     {unreadCount > 0 && <button onClick={handleMarkAsRead} className="text-xs text-blue-400 font-bold">Marcar lidas</button>}
                     <button onClick={() => setIsNotifOpen(false)} className="p-2 bg-slate-900 rounded-full"><X/></button>
                 </div>
               </div>
               <div className="space-y-4">
                  {notifications.map(n => (
                     <div key={n.id} className={`bg-slate-900 p-4 rounded-xl border border-slate-800 ${n.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
                         <h4 className="font-bold text-white mb-1">{n.title}</h4>
                         <p className="text-sm text-slate-400">{n.message}</p>
                     </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center text-slate-500 mt-10">Tudo limpo por aqui.</p>}
               </div>
           </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
