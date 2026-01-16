
import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

interface CoinCelebrationProps {
  amount: number;
  onComplete: () => void;
}

const CoinCelebration: React.FC<CoinCelebrationProps> = ({ amount, onComplete }) => {
  const [particles, setParticles] = useState<{id: number, left: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    // Generate particles
    const count = Math.min(amount / 10, 50); // Cap at 50 particles for performance
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position 0-100%
      delay: Math.random() * 0.5, // Random start delay
      duration: 1 + Math.random() * 1.5 // Random fall duration
    }));
    setParticles(newParticles);

    // Cleanup after animation
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-50px] animate-fall"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear'
          }}
        >
          <div className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] transform rotate-12">
             <Coins size={24 + Math.random() * 16} strokeWidth={1.5} fill="rgba(250, 204, 21, 0.2)" />
          </div>
        </div>
      ))}
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in slide-in-from-bottom-10 duration-500 flex flex-col items-center">
         <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-2xl filter shadow-yellow-500/50">
            +{amount}
         </div>
         <div className="text-yellow-200 font-bold uppercase tracking-widest text-xl mt-2 animate-pulse">
            Coins Adicionados
         </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
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
