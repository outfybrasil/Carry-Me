import React, { useState } from 'react';
import { MOCK_MATCHES, POSITIVE_TAGS, NEGATIVE_TAGS } from '../constants';
import { Tag, TagType, Match, Vibe } from '../types';
import { Check, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

interface VotingProps {
  onComplete: () => void;
}

// Fallback match data to ensure voting works even if MOCK_MATCHES is cleared
const FALLBACK_MATCH: Match = {
  id: 'temp_match',
  game: 'League of Legends',
  vibe: Vibe.TRYHARD,
  date: 'Just now',
  teammates: [
    { 
      id: 'p99', 
      username: 'MidOrFeed', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mid', 
      score: 50, 
      badges: [], 
      coins: 0, 
      inventory: [], 
      equipped: {},
      stats: { matchesPlayed: 10, mvps: 1, commendations: 5, sherpaSessions: 0, perfectBehaviorStreak: 2 },
      claimedAchievements: []
    },
    { 
      id: 'p98', 
      username: 'JungleGap', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jungle', 
      score: 60, 
      badges: [], 
      coins: 0, 
      inventory: [], 
      equipped: {},
      stats: { matchesPlayed: 20, mvps: 3, commendations: 10, sherpaSessions: 0, perfectBehaviorStreak: 5 },
      claimedAchievements: []
    },
    { 
      id: 'p97', 
      username: 'SuppKing', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=supp', 
      score: 80, 
      badges: [], 
      coins: 0, 
      inventory: [], 
      equipped: {},
      stats: { matchesPlayed: 50, mvps: 5, commendations: 30, sherpaSessions: 0, perfectBehaviorStreak: 10 },
      claimedAchievements: []
    },
    { 
      id: 'p96', 
      username: 'TopLaner', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=top', 
      score: 40, 
      badges: [], 
      coins: 0, 
      inventory: [], 
      equipped: {},
      stats: { matchesPlayed: 5, mvps: 0, commendations: 2, sherpaSessions: 0, perfectBehaviorStreak: 0 },
      claimedAchievements: []
    },
  ],
  result: 'VICTORY',
  pendingVote: true
};

const Voting: React.FC<VotingProps> = ({ onComplete }) => {
  // Use a pending match from constants, OR use the fallback if list is empty (post-game flow)
  const match = MOCK_MATCHES.find(m => m.pendingVote) || FALLBACK_MATCH;
  
  const [currentStep, setCurrentStep] = useState(0);
  // Filter out current user from teammates to vote on
  // In a real app we would check against actual user ID, here we assume current user is not in this list or filtered
  const teammatesToVote = match.teammates; 
  
  const [votes, setVotes] = useState<Record<string, { tags: string[] }>>({});

  const handleToggleTag = (playerId: string, tagId: string) => {
    setVotes(prev => {
      const playerVotes = prev[playerId] || { tags: [] };
      const hasTag = playerVotes.tags.includes(tagId);
      
      let newTags;
      if (hasTag) {
        newTags = playerVotes.tags.filter(t => t !== tagId);
      } else {
        newTags = [...playerVotes.tags, tagId];
      }
      
      return {
        ...prev,
        [playerId]: { tags: newTags }
      };
    });
  };

  const currentPlayer = teammatesToVote[currentStep];
  const currentVotes = votes[currentPlayer?.id]?.tags || [];

  const handleNext = () => {
    if (currentStep < teammatesToVote.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit
      onComplete();
    }
  };

  if (!currentPlayer) return <div className="p-8 text-center">Carregando jogadores...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Relatório de Missão</h1>
        <p className="text-slate-400">Avalie o comportamento dos seus aliados em <span className="text-blue-400 font-semibold">{match.game}</span>.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep) / teammatesToVote.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <img 
              src={currentPlayer.avatar} 
              alt={currentPlayer.username} 
              className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl mb-4"
            />
            <h2 className="text-2xl font-bold text-white">{currentPlayer.username}</h2>
            <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Como foi jogar com ele?</p>
          </div>

          {/* Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Positive */}
            <div className="space-y-3">
              <div className="flex items-center text-green-400 mb-2 text-sm font-bold uppercase tracking-wider">
                <ThumbsUp size={16} className="mr-2" /> Pontos Fortes
              </div>
              {POSITIVE_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(currentPlayer.id, tag.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group
                    ${currentVotes.includes(tag.id) 
                      ? 'bg-green-500/10 border-green-500/50 text-green-300' 
                      : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div>
                    <div className="font-semibold">{tag.label}</div>
                    <div className="text-xs opacity-70">{tag.description}</div>
                  </div>
                  {currentVotes.includes(tag.id) && <Check size={18} className="text-green-500" />}
                </button>
              ))}
            </div>

            {/* Negative */}
            <div className="space-y-3">
               <div className="flex items-center text-red-400 mb-2 text-sm font-bold uppercase tracking-wider">
                <ThumbsDown size={16} className="mr-2" /> Pontos Críticos
              </div>
              {NEGATIVE_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(currentPlayer.id, tag.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group
                    ${currentVotes.includes(tag.id) 
                      ? 'bg-red-500/10 border-red-500/50 text-red-300' 
                      : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div>
                    <div className="font-semibold">{tag.label}</div>
                    <div className="text-xs opacity-70">{tag.description}</div>
                  </div>
                  {currentVotes.includes(tag.id) && <AlertCircle size={18} className="text-red-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-800">
             <button
               onClick={handleNext}
               className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
             >
               {currentStep === teammatesToVote.length - 1 ? 'Finalizar Votação' : 'Próximo Jogador'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voting;