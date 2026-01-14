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
import { TermsOfService, PrivacyPolicy } from './pages/Legal';
import PaymentModal from './components/PaymentModal';
import CookieConsent from './components/CookieConsent';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
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

  useEffect(() => {
    // Initial Session Check
    const initSession = async () => {
      const sessionUser = await api.checkSession();
      if (sessionUser) {
        setUser(sessionUser);
      }
      setLoading(false);
    };

    initSession();

    // Listen for Auth Changes (crucial for OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await api.syncUserProfile(session.user);
        if (profile) setUser(profile);
        setShowAuth(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser: Player) => {
    setUser(loggedInUser);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <span className="text-slate-500 font-display font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Sincronizando</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showAuth ? (
          <Auth onLogin={handleLoginSuccess} onBack={() => setShowAuth(false)} />
        ) : (
          <LandingPage onGetStarted={() => setShowAuth(true)} />
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
      case 'profile': return <Profile user={user} onEquip={handleEquipItem} />;
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
      {!hasAcceptedManifesto && <ManifestoModal onAccept={() => setHasAcceptedManifesto(true)} />}
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