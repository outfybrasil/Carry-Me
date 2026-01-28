
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Voting from './pages/Voting';
import SherpaMarket from './pages/Sherpa';
import MatchLobby from './pages/MatchLobby';
import LobbyRoom from './pages/LobbyRoom';
import Shop from './pages/Shop';
import ActiveMatch from './pages/ActiveMatch';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';

import Friends from './pages/Friends';
import ClanRanking from './pages/ClanRanking';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import PaymentModal from './components/PaymentModal';
import CookieConsent from './components/CookieConsent';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import PublicProfile from './pages/PublicProfile';
import OnboardingTour from './components/OnboardingTour';
import CoinCelebration from './components/CoinCelebration';
import { Player, StoreItem, LobbyConfig, Vibe } from './types';
import { api } from './services/api';
import { Loader2, LogOut, AlertTriangle, RefreshCw, MessageSquare, CheckCircle, X } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- GLOBAL TOAST NOTIFICATION COMPONENT ---
const Toast = ({ title, message, type, onClose }: { title: string, message: string, type: 'success' | 'chat' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-300 pointer-events-none max-w-sm w-full">
      <div className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md pointer-events-auto ${type === 'chat' ? 'bg-slate-900/95 border-blue-500/50 text-white' :
        type === 'success' ? 'bg-slate-900/95 border-green-500/50 text-white' :
          'bg-slate-900/95 border-red-500/50 text-white'
        }`}>
        <div className={`p-2 rounded-full mt-1 ${type === 'chat' ? 'bg-blue-500/20 text-blue-400' :
          type === 'success' ? 'bg-green-500/20 text-green-400' :
            'bg-red-500/20 text-red-400'
          }`}>
          {type === 'chat' ? <MessageSquare size={18} /> : <CheckCircle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm mb-0.5 ${type === 'chat' ? 'text-blue-400' :
            type === 'success' ? 'text-green-400' :
              'text-red-400'
            }`}>{title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed break-words">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const ManifestoModal = ({ onAccept }: { onAccept: () => void }) => (
  <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-orange-500"></div>
      <h2 className="text-2xl font-bold text-white mb-6 font-display">O Manifesto CarryMe</h2>
      <div className="space-y-4 text-slate-300 mb-8 max-h-[60vh] overflow-y-auto">
        <p>Ao entrar nesta plataforma, eu entendo que:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Habilidade não é salvo-conduto.</strong> Ser bom no jogo não me dá o direito de ser tóxico.</li>
          <li><strong>Paciência é uma virtude.</strong> Erros acontecem e eu irei apoiar meu time ao invés de julgar.</li>
          <li><strong>Meu voto tem poder.</strong> Avaliarei meus colegas com justiça e honestidade.</li>
          <li><strong>Respeito é a base.</strong> Racismo, homofobia ou assédio resultarão em banimento permanente.</li>
        </ul>
      </div>
      <button
        onClick={onAccept}
        className="w-full py-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-purple/20"
      >
        Eu Aceito o Compromisso
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [hasAcceptedManifesto, setHasAcceptedManifesto] = useState(false);
  const [showVotingOverride, setShowVotingOverride] = useState(false);
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLobbyHost, setIsLobbyHost] = useState(false);
  const [currentLobbyId, setCurrentLobbyId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'PREMIUM' | 'COINS' | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [publicProfileUsername, setPublicProfileUsername] = useState<string | null>(null);
  const [lastPage, setLastPage] = useState('dashboard');

  // Notification State
  const [toast, setToast] = useState<{ title: string, msg: string, type: 'success' | 'chat' | 'error' } | null>(null);
  const [coinDiff, setCoinDiff] = useState<number | null>(null); // For CoinCelebration

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingTasks, setOnboardingTasks] = useState({
    avatar: false,
    shop: false,
    match: false
  });

  // Lobby Config State
  const [currentLobbyConfig, setCurrentLobbyConfig] = useState<LobbyConfig>({
    title: 'Lobby Público',
    game: 'League of Legends',
    vibe: Vibe.TRYHARD,
    minScore: 0,
    micRequired: true,
    maxPlayers: 5
  });

  // Audio State
  const [volume, setVolume] = useState(50);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playUiSound = (type: 'click' | 'notification' | 'coin' = 'click') => {
    if (volume === 0 || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'notification') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
      gainNode.gain.setValueAtTime((volume / 100) * 0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'coin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
      gainNode.gain.setValueAtTime((volume / 100) * 0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      const normalizedVolume = (volume / 100) * 0.1;
      gainNode.gain.setValueAtTime(normalizedVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        initAudio();
        playUiSound('click');
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [volume]);

  useEffect(() => {
    if (onboardingStep === 2) {
      if (currentPage === 'shop' && !onboardingTasks.shop) {
        setOnboardingTasks(prev => ({ ...prev, shop: true }));
      }
      if (currentPage === 'match' && !onboardingTasks.match) {
        setOnboardingTasks(prev => ({ ...prev, match: true }));
      }
    }
  }, [currentPage, onboardingStep]);

  useEffect(() => {
    if (onboardingStep === 2) {
      if (onboardingTasks.avatar && onboardingTasks.shop && onboardingTasks.match) {
        setOnboardingStep(3);
      }
    }
  }, [onboardingTasks, onboardingStep]);

  // Check for pre-existing avatar (e.g. from Discord)
  const checkAvatarTask = (profile: Player) => {
    if (profile && !profile.avatar.includes('dicebear.com')) {
      setOnboardingTasks(prev => ({ ...prev, avatar: true }));
    }
  };

  // AUTH INITIALIZATION & LISTENER
  useEffect(() => {
    let mounted = true;
    let currentUserRef = user; // Local ref to track user state inside closure
    let isInitializing = false;

    // Safety Timeout - Force finish loading if something gets stuck
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    const checkHash = () => {
      const hash = window.location.hash;
      const query = window.location.search;
      const params = new URLSearchParams(query);

      if ((hash && hash.includes('type=recovery')) || (query && query.includes('type=recovery'))) {
        setRecoveryMode(true);
        setLoading(false);
        return true;
      }

      // Handle Steam OAuth callback - return true to pause other hash logic if needed
      const steamProvider = params.get('provider');
      const openidClaimedId = params.get('openid.claimed_id');
      if (steamProvider === 'steam' && openidClaimedId) {
        return false; // Let initialize run, handleSteamCallback will pick it up
      }

      const publicUser = params.get('u');
      if (publicUser) {
        setPublicProfileUsername(publicUser);
        setCurrentPage('public-profile');
      }

      return false;
    };

    const initialize = async () => {
      if (checkHash()) return;

      isInitializing = true;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          const profile = await api.syncUserProfile(session.user);
          if (mounted) {
            if (profile) {
              setUser(profile);
              checkAvatarTask(profile); // Check avatar immediately
              currentUserRef = profile; // Update local ref
              if (!profile.tutorialCompleted) setOnboardingStep(1);
            } else {
              // Se falhar ao sincronizar, desloga para evitar loop infinito
              console.warn("Profile sync failed, signing out.");
              await supabase.auth.signOut();
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.error("Init failed:", e);
        await supabase.auth.signOut();
      } finally {
        isInitializing = false;
        if (mounted) setLoading(false);
      }
    };

    // Run initial check
    initialize();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Evita conflito se a inicialização ainda estiver rodando
        if (isInitializing) return;

        if (session?.user) {
          // CRITICAL FIX: If we already have the user loaded, DO NOT re-sync.
          if (currentUserRef && currentUserRef.id === session.user.id) {
            return;
          }

          setLoading(true);
          try {
            const profile = await api.syncUserProfile(session.user);
            if (profile) {
              setUser(profile);
              checkAvatarTask(profile); // Check avatar on login
              currentUserRef = profile;
              if (!profile.tutorialCompleted) setOnboardingStep(1);
            } else {
              console.warn("Could not sync profile on state change");
            }
          } catch (e) {
            console.error("Auth listener sync error:", e);
          } finally {
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        currentUserRef = null;
        setLoading(false);
        setCurrentPage('dashboard');
      } else if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run once

  // --- REALTIME CHAT & PROFILE LISTENER ---
  useEffect(() => {
    if (!user) return;

    // 1. Direct Messages Listener (Chat)
    const chatChannel = supabase.channel('realtime_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const newMessage = payload.new as any;

          // Fetch sender info
          const { data: sender } = await supabase.from('profiles').select('username').eq('id', newMessage.sender_id).single();
          const senderName = sender?.username || 'Alguém';

          playUiSound('notification');
          setToast({
            title: `Mensagem de ${senderName}`,
            msg: newMessage.text,
            type: 'chat'
          });
        }
      )
      .subscribe();

    // 2. System Notifications Listener
    const notificationChannel = supabase.channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as any;
          playUiSound('notification');

          let type: 'success' | 'chat' | 'error' = 'chat';
          if (newNotif.type === 'success' || newNotif.type === 'reward') type = 'success';
          if (newNotif.type === 'warning') type = 'error';

          setToast({
            title: newNotif.title,
            msg: newNotif.message,
            type: type
          });
        }
      )
      .subscribe();

    // Profile Coins Listener (For Payment Celebration)
    const profileChannel = supabase.channel('profile_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const newProfile = payload.new as any;
          const oldProfile = payload.old as any;

          // Sync local user state
          setUser(prev => prev ? ({ ...prev, ...newProfile }) : null);

          // Detect Coin Increase
          if (newProfile.coins > oldProfile.coins) {
            const diff = newProfile.coins - oldProfile.coins;
            setCoinDiff(diff);
            playUiSound('coin');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  // --- STEAM CALLBACK HANDLER (Popup & Normal Flow) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    const openidClaimedId = params.get('openid.claimed_id');

    if (provider === 'steam' && openidClaimedId) {
      if ((window as any)._steamProcessed) return;
      (window as any)._steamProcessed = true;

      const extractedSteamId = openidClaimedId.split('/').pop() || '';
      if (!extractedSteamId) return;

      // 1. If we have a user (linking through Settings)
      if (user) {
        setLoading(true);
        api.finalizeSteamAuth(user.id, extractedSteamId)
          .then(async (result) => {
            // Force a full profile re-sync from DB
            await refreshUser();

            // IF IN POPUP: Message parent and close
            if (window.opener) {
              window.opener.postMessage({ type: 'STEAM_AUTH_SUCCESS', steamId: extractedSteamId }, window.location.origin);
              window.close();
              return;
            }

            setToast({
              title: 'Steam Vinculada',
              msg: result.message || 'Sua conta Steam foi conectada.',
              type: 'success'
            });
            window.history.replaceState({}, document.title, window.location.pathname);
            setCurrentPage('settings');
          })
          .catch(err => {
            console.error("Steam Finalization Error:", err);
            if (window.opener) {
              window.opener.postMessage({ type: 'STEAM_AUTH_ERROR' }, window.location.origin);
              window.close();
            }
            setToast({ title: 'Erro Steam', msg: 'Falha ao processar login da Steam.', type: 'error' });
          })
          .finally(() => {
            setLoading(false);
          });
      }
      // 2. If NO user (Logging in via Steam - future implementation)
      else if (window.opener) {
        window.opener.postMessage({ type: 'STEAM_AUTH_ID', steamId: extractedSteamId }, window.location.origin);
        window.close();
      }
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: Player) => {
    setUser(loggedInUser);
    checkAvatarTask(loggedInUser);
    setShowAuth(false);
    setRecoveryMode(false);
    setProfileError(false);
    if (!loggedInUser.tutorialCompleted) setOnboardingStep(1);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfileError(false);
  };

  const forceLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const refreshUser = async () => {
    if (!user) return;
    const updated = await api.checkSession();
    if (updated) {
      setUser(updated);
      checkAvatarTask(updated);
    }
  };

  const handleVoteComplete = () => {
    setShowVotingOverride(false);
    setCurrentPage('dashboard');
  };

  const handleViewPublicProfile = (username: string) => {
    setLastPage(currentPage);
    setPublicProfileUsername(username);
    setCurrentPage('public-profile');
  };

  const triggerPayment = (type: 'PREMIUM' | 'COINS') => {
    setPaymentType(type);
    setIsPaymentOpen(true);
  };

  // Payment Success is now handled via Realtime Listener in PaymentModal and App.tsx
  // This just closes the UI after animation
  const handlePaymentSuccess = async () => {
    setIsPaymentOpen(false);
  };

  const handleEnterLobby = (asHost: boolean, config?: LobbyConfig, lobbyId?: string) => {
    setIsLobbyHost(asHost);
    if (config) {
      setCurrentLobbyConfig(config);
    }
    if (lobbyId) setCurrentLobbyId(lobbyId);
    setCurrentPage('lobby-room');
  };

  const handleStartGame = () => setCurrentPage('active-match');

  const handleFinishMatch = async () => {
    if (user) {
      await api.purchaseCoins(user.id, 100);
      // Removed manual refreshUser() here because Realtime listener will catch the coin update
    }
    setCurrentPage('dashboard');
    setShowVotingOverride(true);
  };

  const handleBuyItem = async (item: StoreItem) => {
    if (!user) return;
    try {
      const success = await api.purchaseItem(user.id, item.id, item.price);
      if (success) await refreshUser(); // Realtime might not catch inventory table, so explicit refresh is okay
      else alert("Saldo insuficiente!");
    } catch (e) {
      alert("Erro ao processar compra.");
    }
  };

  const handleEquipItem = async (type: 'border' | 'nameColor' | 'title' | 'entryEffect', itemId: string) => {
    if (!user) return;
    try {
      await api.equipItem(user.id, type, itemId);
      await refreshUser();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep === 1) {
      setOnboardingStep(2);
    } else if (onboardingStep === 3) {
      if (user) {
        await api.completeTutorial(user.id);
        // Realtime will catch the 500 coin reward
      }
      setOnboardingStep(0);
    }
  };

  const handleOnboardingNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleProfileUpdated = () => {
    if (onboardingStep === 2) {
      setOnboardingTasks(prev => ({ ...prev, avatar: true }));
      refreshUser();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <span className="text-slate-500 font-display font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Carregando...</span>
      </div>
    );
  }

  // --- ERROR STATE UI ---
  if (profileError) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Erro de Sincronização</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          Não foi possível carregar seu perfil. Isso geralmente acontece quando o banco de dados não tem as tabelas corretas (erro 400).
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
          >
            <RefreshCw size={18} /> Tentar Novamente
          </button>
          <button
            onClick={forceLogout}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 border border-slate-700"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
        <p className="mt-8 text-xs text-slate-600">Dica: Rode o script SQL 'CREATE TABLE' no Supabase.</p>
      </div>
    );
  }

  if (recoveryMode) {
    return (
      <>
        <Auth onLogin={handleLoginSuccess} onBack={() => { setRecoveryMode(false); setShowAuth(false); }} initialView="UPDATE_PASSWORD" />
        <CookieConsent />
      </>
    )
  }

  if (!user) {
    if (currentPage === 'public-profile' && publicProfileUsername) {
      return <PublicProfile username={publicProfileUsername} onBack={() => { setPublicProfileUsername(null); setCurrentPage('dashboard'); }} />;
    }
    if (currentPage === 'terms') {
      return <div className="min-h-screen bg-[#020202]"><Terms onBack={() => setCurrentPage('dashboard')} /></div>;
    }
    if (currentPage === 'privacy') {
      return <div className="min-h-screen bg-[#020202]"><Privacy onBack={() => setCurrentPage('dashboard')} /></div>;
    }

    return (
      <>
        {showAuth ? (
          <Auth onLogin={handleLoginSuccess} onBack={() => setShowAuth(false)} />
        ) : (
          <LandingPage
            onGetStarted={() => setShowAuth(true)}
            onViewTerms={() => setCurrentPage('terms')}
            onViewPrivacy={() => setCurrentPage('privacy')}
          />
        )}
        <CookieConsent />
      </>
    );
  }

  const renderContent = () => {
    if (showVotingOverride) return <Voting onComplete={handleVoteComplete} />;

    switch (currentPage) {
      case 'dashboard': return <Dashboard onFindMatch={() => setCurrentPage('match')} onVote={() => setShowVotingOverride(true)} />;
      case 'profile': return <Profile user={user} onEquip={handleEquipItem} onProfileUpdate={handleProfileUpdated} onUpgrade={() => triggerPayment('PREMIUM')} />;
      case 'friends': return <Friends user={user} onViewProfile={handleViewPublicProfile} />;
      case 'sherpa': return <SherpaMarket user={user} onUpdateUser={refreshUser} onViewProfile={handleViewPublicProfile} />;
      case 'achievements': return <Achievements user={user} onUpdateUser={refreshUser} />;
      case 'clan-ranking': return <ClanRanking />;
      case 'shop': return <Shop user={user} onBuy={handleBuyItem} onAddCoins={() => triggerPayment('COINS')} />;
      case 'match': return (
        <MatchLobby
          onCancel={() => setCurrentPage('dashboard')}
          isPremium={!!user.isPremium}
          onUpgrade={() => triggerPayment('PREMIUM')}
          onMatchFound={(lobbyId, config) => handleEnterLobby(false, config, lobbyId)}
          onCreateLobby={(config, lobbyId) => handleEnterLobby(true, config, lobbyId)}
        />
      );
      case 'lobby-room': return (
        <LobbyRoom
          user={user}
          isHost={isLobbyHost}
          config={currentLobbyConfig}
          lobbyId={currentLobbyId}
          onStartGame={handleStartGame}
          onLeaveLobby={() => setCurrentPage('dashboard')}
          onViewProfile={handleViewPublicProfile}
        />
      );
      case 'active-match': return <ActiveMatch onFinish={handleFinishMatch} />;
      case 'settings': return <Settings user={user} onLogout={handleLogout} onNavigate={setCurrentPage} volume={volume} onVolumeChange={setVolume} onUpdateUser={refreshUser} />;
      case 'terms': return <Terms onBack={() => setCurrentPage('dashboard')} />;
      case 'privacy': return <Privacy onBack={() => setCurrentPage('dashboard')} />;
      case 'public-profile': return <PublicProfile username={publicProfileUsername || ''} onBack={() => setCurrentPage(lastPage)} />;
      default: return <Dashboard onFindMatch={() => setCurrentPage('match')} onVote={() => setShowVotingOverride(true)} />;
    }
  };

  return (
    <>
      <CookieConsent />

      {/* COIN CELEBRATION EFFECT */}
      {coinDiff && (
        <CoinCelebration
          amount={coinDiff}
          onComplete={() => setCoinDiff(null)}
        />
      )}

      {/* RENDER GLOBAL TOAST */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <OnboardingTour
        step={onboardingStep}
        onNext={handleOnboardingNext}
        onNavigate={handleOnboardingNavigate}
        currentPage={currentPage}
        tasks={onboardingTasks}
      />

      {!hasAcceptedManifesto && !onboardingStep && <ManifestoModal onAccept={() => setHasAcceptedManifesto(true)} />}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        itemTitle={paymentType === 'PREMIUM' ? 'CarryMe Premium' : '1000 CarryCoins'}
        price={paymentType === 'PREMIUM' ? 19.90 : 25.00}
        type={paymentType || undefined}
      />

      {(currentPage === 'terms' || currentPage === 'privacy') ? (
        <div className="min-h-screen bg-[#020202]">
          {currentPage === 'terms' && <Terms onBack={() => setCurrentPage('dashboard')} />}
          {currentPage === 'privacy' && <Privacy onBack={() => setCurrentPage('dashboard')} />}
        </div>
      ) : (
        <Layout activePage={currentPage} onNavigate={(page) => page === 'logout' ? handleLogout() : setCurrentPage(page)} user={user} onTriggerPremium={() => triggerPayment('PREMIUM')}>
          {renderContent()}
        </Layout>
      )}
    </>
  );
};

export default App;
