
import React, { useEffect, useState } from 'react';
import { Coins, Terminal } from 'lucide-react';

interface CoinCelebrationProps {
  amount: number;
  onComplete: () => void;
}

const CoinCelebration: React.FC<CoinCelebrationProps> = ({ amount, onComplete }) => {
  const [particles, setParticles] = useState<{ id: number, left: number, delay: number, duration: number }[]>([]);

  useEffect(() => {
    const count = Math.min(amount / 10, 40);
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 1.2
    }));
    setParticles(newParticles);
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none overflow-hidden bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-50px] animate-fall"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="text-[#ffb800] drop-shadow-[0_0_15px_#ffb800] transform rotate-12 bg-black/20 rounded-full p-1 border border-[#ffb800]/20">
            <Coins size={20 + Math.random() * 12} strokeWidth={2} fill="currentColor" />
          </div>
        </div>
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in slide-in-from-bottom-20 duration-700 flex flex-col items-center">
        <div className="mb-6 px-4 py-1 bg-white/5 border border-white/10 rounded-sm">
          <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.5em]">CREDITO_AUTORIZADO</span>
        </div>
        <div className="text-8xl font-tactical font-black text-[#ffb800] italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,184,0,0.4)]">
          +{amount}
        </div>
        <div className="flex items-center gap-4 mt-8">
          <div className="h-px w-12 bg-white/10"></div>
          <div className="text-white font-mono font-black uppercase tracking-[0.34em] text-sm animate-pulse">
            CARRY_COINS SINCRIZADOS
          </div>
          <div className="h-px w-12 bg-white/10"></div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default CoinCelebration;
