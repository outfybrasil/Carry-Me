
export enum Vibe {
  TRYHARD = 'Tryhard',
  CHILL = 'Casual',
  LEARNING = 'Iniciante',
  PRACTICE = 'Treino (Execs)'
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
  TITLE = 'TITLE',
  EMOTE = 'EMOTE',
  ENTRY_EFFECT = 'ENTRY_EFFECT'
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

export interface MatchHistoryPoint {
  date: string;
  rating: number; // For the line chart
  kda: number;
}

export interface RadarDataPoint {
  subject: string;
  A: number; // User value
  avg: number; // Rank Average (Leetify style comparison)
  fullMark: number;
}

export interface FocusArea {
  title: string;
  score: string; // "S", "A", "F"
  trend: 'up' | 'down' | 'stable';
  description: string;
  color: string;
}

export interface AdvancedStats {
  headshotPct: number;
  adr: number; // Average Damage per Round
  kast: number; // Kill, Assist, Survive, Trade %
  entrySuccess: number;
  clutchSuccess: number;
  radar: RadarDataPoint[];
  focusAreas: FocusArea[]; // NEW: Specific areas to improve
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  riotId?: string;
  gameAuthCode?: string;
  steamId?: string;
  clanId?: string;
  score: number; // -100 to 100
  badges: string[];
  isSherpa?: boolean;
  gameRole?: string;
  isPremium?: boolean;
  coins: number;
  tutorialCompleted: boolean;
  inventory: string[];
  equipped: {
    border?: string;
    nameColor?: string;
    title?: string;
    entryEffect?: string;
  };
  stats: PlayerStats;
  matchHistory: MatchHistoryPoint[];
  advancedStats: AdvancedStats;
  claimedAchievements: string[];
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'ingame';
  score: number;
  since?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: Friend;
  timestamp: string;
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
  // Visual Equips
  title?: string;
  entryEffect?: string;
  nameColor?: string;
  border?: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  ownerId: string;
  logoUrl?: string;
  description?: string;
  prestige: number;
  createdAt: string;
  memberCount?: number;
}

export interface ClanMember {
  clanId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  profile?: Player;
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
  map?: string;
  mode?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  rating: number;
  teammates: Player[];
  result: 'VICTORY' | 'DEFEAT' | 'WIN' | 'LOSS';
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

export interface Transaction {
  id: string;
  amount: number;
  coins: number;
  type: 'COINS' | 'PREMIUM';
  date: string;
}
