
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
import { TermsOfService, PrivacyPolicy } from './pages/Legal';
import PaymentModal from './components/PaymentModal';
import CookieConsent from './components/CookieConsent';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import OnboardingTour from './components/OnboardingTour';
import { Player, StoreItem, LobbyConfig, Vibe } from './types';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

declare global {
  interface Window {
    startMatchHack: () => void;
  }
}

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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'PREMIUM' | 'COINS' | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  
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

  const playUiSound = () => {
    if (volume === 0 || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    const normalizedVolume = (volume / 100) * 0.1;
    gainNode.gain.setValueAtTime(normalizedVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
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
        playUiSound();
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

  // AUTH INITIALIZATION
  useEffect(() => {
    let mounted = true;

    // Safety Timeout: Force loading false after 6 seconds to prevent infinite loops
    const safetyTimeout = setTimeout(() => {
        if (mounted && loading) {
            console.warn("Initialization timed out. Forcing UI load.");
            setLoading(false);
        }
    }, 6000);

    const checkHash = () => {
        const hash = window.location.hash;
        const query = window.location.search;
        if ((hash && hash.includes('type=recovery')) || (query && query.includes('type=recovery'))) {
            setRecoveryMode(true);
            setLoading(false);
            return true;
        }
        return false;
    };

    const initialize = async () => {
      if (checkHash()) return;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session Error:", error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          const profile = await api.syncUserProfile(session.user);
          if (mounted) {
            if (profile) {
              setUser(profile);
              if (!profile.tutorialCompleted) setOnboardingStep(1);
            } else {
              // CRITICAL FIX: If we have a session but NO profile (sync failed),
              // clear the session to prevent infinite loading loops on refresh.
              console.error("Session valid but profile sync failed. Clearing session.");
              await supabase.auth.signOut();
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.error("Init failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
         // Only fetch if we don't have user data yet (e.g. login form success)
         // or if we want to ensure freshness.
         // We do NOT set loading=true here to avoid flickering if init is already done.
         const profile = await api.syncUserProfile(session.user);
         if (profile) {
             setUser(profile);
             if (!profile.tutorialCompleted) setOnboardingStep(1);
             setLoading(false); // Ensure loading is off if this was a login action
         }
      } else if (event === 'SIGNED_OUT') {
         setUser(null);
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
  }, []);

  const handleLoginSuccess = (loggedInUser: Player) => {
    setUser(loggedInUser);
    setShowAuth(false);
    setRecoveryMode(false);
    if (!loggedInUser.tutorialCompleted) setOnboardingStep(1);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const refreshUser = async () => {
    if (!user) return;
    const updated = await api.checkSession();
    if (updated) setUser(updated);
  };

  const handleVoteComplete = () => {
    setShowVotingOverride(false);
    setCurrentPage('dashboard');
  };

  const triggerPayment = (type: 'PREMIUM' | 'COINS') => {
    setPaymentType(type);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      if (paymentType === 'PREMIUM') await api.setPremium(user.id);
      else if (paymentType === 'COINS') await api.purchaseCoins(user.id, 1000);
      await refreshUser();
      setIsPaymentOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnterLobby = (asHost: boolean, config?: LobbyConfig) => {
    setIsLobbyHost(asHost);
    if (config) {
        setCurrentLobbyConfig(config);
    }
    setCurrentPage('lobby-room');
  };

  const handleStartGame = () => setCurrentPage('active-match');

  useEffect(() => {
    window.startMatchHack = handleStartGame;
  }, []);

  const handleFinishMatch = async () => {
    if (user) {
      await api.purchaseCoins(user.id, 100);
      await refreshUser();
    }
    setCurrentPage('dashboard');
    setShowVotingOverride(true);
  };

  const handleBuyItem = async (item: StoreItem) => {
    if (!user) return;
    try {
      const success = await api.purchaseItem(user.id, item.id, item.price);
      if (success) await refreshUser();
      else alert("Saldo insuficiente!");
    } catch (e) {
      alert("Erro ao processar compra.");
    }
  };

  const handleEquipItem = async (type: 'border' | 'nameColor' | 'banner', itemId: string) => {
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
        if(user) {
            await api.completeTutorial(user.id);
            await refreshUser();
        }
        setOnboardingStep(0); 
    }
  };

  const handleOnboardingNavigate = (page: string) => {
      setCurrentPage(page);
  };

  const handleProfileUpdated = () => {
      if (onboardingStep === 2) {
          setOnboardingTasks(prev => ({...prev, avatar: true}));
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

  if (recoveryMode) {
      return (
         <>
            <Auth onLogin={handleLoginSuccess} onBack={() => { setRecoveryMode(false); setShowAuth(false); }} initialView="UPDATE_PASSWORD" />
            <CookieConsent />
         </>
      )
  }

  if (!user) {
    if (currentPage === 'terms') {
      return <div className="min-h-screen bg-[#020202]"><TermsOfService onBack={() => setCurrentPage('dashboard')} /></div>;
    }
    if (currentPage === 'privacy') {
      return <div className="min-h-screen bg-[#020202]"><PrivacyPolicy onBack={() => setCurrentPage('dashboard')} /></div>;
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
      case 'profile': return <Profile user={user} onEquip={handleEquipItem} onProfileUpdate={handleProfileUpdated} />;
      case 'friends': return <Friends user={user} />;
      case 'sherpa': return <SherpaMarket user={user} onUpdateUser={refreshUser} />;
      case 'achievements': return <Achievements user={user} onUpdateUser={refreshUser} />;
      case 'shop': return <Shop user={user} onBuy={handleBuyItem} onAddCoins={() => triggerPayment('COINS')} />;
      case 'match': return (
        <MatchLobby 
            onCancel={() => setCurrentPage('dashboard')} 
            isPremium={!!user.isPremium} 
            onUpgrade={() => triggerPayment('PREMIUM')} 
            onMatchFound={() => handleEnterLobby(false)} 
            onCreateLobby={(config) => handleEnterLobby(true, config)} 
        />
      );
      case 'lobby-room': return (
        <LobbyRoom 
            user={user} 
            isHost={isLobbyHost} 
            config={currentLobbyConfig}
            onStartGame={handleStartGame} 
            onLeaveLobby={() => setCurrentPage('dashboard')} 
        />
      );
      case 'active-match': return <ActiveMatch onFinish={handleFinishMatch} />;
      case 'settings': return <Settings user={user} onLogout={handleLogout} onNavigate={setCurrentPage} volume={volume} onVolumeChange={setVolume} />;
      case 'terms': return <TermsOfService onBack={() => setCurrentPage('settings')} />; 
      case 'privacy': return <PrivacyPolicy onBack={() => setCurrentPage('settings')} />;
      default: return <Dashboard onFindMatch={() => setCurrentPage('match')} onVote={() => setShowVotingOverride(true)} />;
    }
  };

  return (
    <>
      <CookieConsent />
      <OnboardingTour 
        step={onboardingStep} 
        onNext={handleOnboardingNext} 
        onNavigate={handleOnboardingNavigate}
        currentPage={currentPage}
        tasks={onboardingTasks}
      />
      
      {!hasAcceptedManifesto && !onboardingStep && <ManifestoModal onAccept={() => setHasAcceptedManifesto(true)} />}
      
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} itemTitle={paymentType === 'PREMIUM' ? 'CarryMe Premium' : '1000 CarryCoins'} price={paymentType === 'PREMIUM' ? 19.90 : 25.00} />
      
      {(currentPage === 'terms' || currentPage === 'privacy') ? (
         <div className="min-h-screen bg-[#020202]">
            {currentPage === 'terms' && <TermsOfService onBack={() => setCurrentPage('settings')} />}
            {currentPage === 'privacy' && <PrivacyPolicy onBack={() => setCurrentPage('settings')} />}
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
