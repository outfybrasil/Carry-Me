
export enum Vibe {
  TRYHARD = 'Tryhard',
  CHILL = 'Chill',
  LEARNING = 'Learning'
}

export enum TagType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE'
}

export interface Tag {
  id: string;
  label: string;
  type: TagType;
  description: string;
}

export enum ItemType {
  BORDER = 'BORDER',
  NAME_COLOR = 'NAME_COLOR',
  BANNER = 'BANNER'
}

export interface StoreItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  value: string; // The CSS class or Image URL
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  targetValue: number;
  reward: number;
  statKey: keyof PlayerStats;
}

export interface PlayerStats {
  matchesPlayed: number;
  mvps: number;
  commendations: number;
  sherpaSessions: number;
  perfectBehaviorStreak: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number; // -100 to 100
  badges: string[];
  isSherpa?: boolean;
  gameRole?: string;
  isPremium?: boolean;
  coins: number;
  inventory: string[]; // List of Item IDs owned
  equipped: {
    border?: string; // Item ID
    nameColor?: string; // Item ID
    banner?: string; // Item ID
  };
  stats: PlayerStats;
  claimedAchievements: string[]; // List of Achievement IDs
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reward';
  timestamp: string;
  read: boolean;
}

export interface LobbyPlayer {
  id: string;
  username: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  role: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Match {
  id: string;
  game: string;
  vibe: Vibe;
  date: string;
  teammates: Player[];
  result: 'VICTORY' | 'DEFEAT';
  pendingVote: boolean;
}

export interface SherpaProfile {
  id: string;
  player: Player;
  hourlyRate: number;
  rating: number; // 0-5
  reviews: number;
  specialties: string[];
}

export interface LobbyConfig {
  title: string;
  minScore: number;
  micRequired: boolean;
  vibe: Vibe;
  game: string;
  maxPlayers: number;
}
