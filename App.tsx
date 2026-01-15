
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
  // Track specific sub-tasks for step 2
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

  // Initialize Audio Context on user interaction to comply with browser policies
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

    // "Futuristic Click" sound parameters
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    
    // Volume control
    const normalizedVolume = (volume / 100) * 0.1; // Max 0.1 gain to not blast ears
    gainNode.gain.setValueAtTime(normalizedVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  };

  // Global Click Listener for Sound
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only play sound if clicking on interactive elements
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

  // ONBOARDING TASK TRACKER
  useEffect(() => {
    // Check navigation based tasks
    if (onboardingStep === 2) {
      if (currentPage === 'shop' && !onboardingTasks.shop) {
        setOnboardingTasks(prev => ({ ...prev, shop: true }));
      }
      if (currentPage === 'match' && !onboardingTasks.match) {
        setOnboardingTasks(prev => ({ ...prev, match: true }));
      }
    }
  }, [currentPage, onboardingStep]);

  // COMPLETE ONBOARDING STEP 2
  useEffect(() => {
    if (onboardingStep === 2) {
      if (onboardingTasks.avatar && onboardingTasks.shop && onboardingTasks.match) {
        setOnboardingStep(3); // All tasks done, move to reward
      }
    }
  }, [onboardingTasks, onboardingStep]);

  // AUTHENTICATION & INITIALIZATION LOGIC
  useEffect(() => {
    let mounted = true;

    // 1. Manual Check for Recovery URL
    const hash = window.location.hash;
    const query = window.location.search;
    
    if ((hash && hash.includes('type=recovery')) || (query && query.includes('type=recovery'))) {
      setRecoveryMode(true);
      setLoading(false);
      return; // Stop further processing if recovering
    }

    // 2. Deterministic Initialization
    const initialize = async () => {
      try {
        // Attempt to get the session from local storage/API
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          // If we have a user, fetch their detailed profile
          const profile = await api.syncUserProfile(session.user);
          if (mounted) {
            if (profile) {
              setUser(profile);
              if (!profile.tutorialCompleted) setOnboardingStep(1);
            }
            // Clear URL fragment if it contained access token to prevent re-parsing issues
            if (window.location.hash && window.location.hash.includes('access_token')) {
               window.history.replaceState(null, '', window.location.pathname);
            }
          }
        }
      } catch (e) {
        console.error("Initialization failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    // 3. Listen for Auth Changes (Sign In, Sign Out, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only react to specific events after initial load to avoid double-fetching
      if (event === 'SIGNED_IN' && session?.user && !user) {
         // User just signed in (or was found by the listener before getSession finished)
         setLoading(true);
         const profile = await api.syncUserProfile(session.user);
         if (profile) {
            setUser(profile);
            if (!profile.tutorialCompleted) setOnboardingStep(1);
         }
         setLoading(false);
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
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array: runs once on mount

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
    // State update handled by onAuthStateChange('SIGNED_OUT')
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
        const updated = await api.checkSession();
        if (updated) setUser(updated);
    } catch (e) {
        console.error("Failed to refresh user", e);
    }
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
    } else {
        // Reset to default if not host (joining random match)
        setCurrentLobbyConfig({
            title: 'Sala Pública #8291',
            game: 'League of Legends',
            vibe: Vibe.TRYHARD,
            minScore: 0,
            micRequired: true,
            maxPlayers: 5
        });
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

  // ONBOARDING HANDLERS
  const handleOnboardingNext = async () => {
    if (onboardingStep === 1) {
        setOnboardingStep(2); // Start Missions
    } else if (onboardingStep === 3) {
        if(user) {
            await api.completeTutorial(user.id);
            await refreshUser();
        }
        setOnboardingStep(0); // Finish
    }
  };

  const handleOnboardingNavigate = (page: string) => {
      setCurrentPage(page);
  };

  // Called by Profile page when avatar changes
  const handleProfileUpdated = () => {
      if (onboardingStep === 2) {
          setOnboardingTasks(prev => ({...prev, avatar: true}));
          refreshUser(); // Update UI immediately without reload
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <span className="text-slate-500 font-display font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Sincronizando</span>
      </div>
    );
  }

  // FORCE RECOVERY VIEW if recovery mode is active
  if (recoveryMode) {
      return (
         <>
            <Auth onLogin={handleLoginSuccess} onBack={() => { setRecoveryMode(false); setShowAuth(false); }} initialView="UPDATE_PASSWORD" />
            <CookieConsent />
         </>
      )
  }

  // Allow public access to legal pages even without user
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
    
    // Routing Logic
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
