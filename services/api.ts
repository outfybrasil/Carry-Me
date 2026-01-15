
import { supabase } from '../lib/supabase';
import { Player, AppNotification, Friend, FriendRequest, AdvancedStats, Match, ChatMessage } from '../types';

// Helper: Empty stats for new users
const getEmptyAdvancedStats = (): AdvancedStats => {
  return {
    headshotPct: 0,
    adr: 0,
    kast: 0,
    entrySuccess: 0,
    clutchSuccess: 0,
    radar: [
      { subject: 'Aim', A: 0, fullMark: 100 },
      { subject: 'Util', A: 0, fullMark: 100 },
      { subject: 'Pos', A: 0, fullMark: 100 },
      { subject: 'Team', A: 0, fullMark: 100 },
      { subject: 'Clutch', A: 0, fullMark: 100 },
      { subject: 'Entry', A: 0, fullMark: 100 },
    ]
  };
};

// Helper to transform DB shape to App shape
const transformProfile = (data: any, inventory: any[]): Player => {
  const dbInventoryIds = inventory.map((i: any) => i.item_id);
  
  const defaultStats = {
    matchesPlayed: 0,
    mvps: 0,
    commendations: 0,
    sherpaSessions: 0,
    perfectBehaviorStreak: 0
  };

  const dbStats = data.stats || defaultStats;
  const dbAdvanced = data.advanced_stats || {};
  const matchHistory = dbAdvanced.matchHistory || []; 
  const advancedStats = dbAdvanced.performance || getEmptyAdvancedStats();

  return {
    id: data.id,
    username: data.username,
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    riotId: data.riot_id, // READ FROM DB
    steamId: data.steam_id, // READ FROM DB
    score: data.score ?? 50,
    coins: data.coins ?? 0,
    isPremium: data.is_premium,
    isSherpa: data.is_sherpa || false,
    tutorialCompleted: data.tutorial_completed || false,
    badges: data.badges || [],
    equipped: data.equipped || {},
    inventory: dbInventoryIds,
    stats: dbStats,
    matchHistory: matchHistory,
    advancedStats: advancedStats,
    claimedAchievements: data.claimed_achievements || []
  };
};

export const api = {
  // --- STATS & ANALYTICS ---
  async getLandingStats() {
    try {
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: totalMatches } = await supabase.from('match_history').select('*', { count: 'exact', head: true });
      
      return { 
          users: totalUsers || 0, 
          matches: (totalMatches || 0) + ((totalUsers || 0) * 5),
          sherpas: Math.floor((totalUsers || 0) * 0.1), 
          satisfaction: 4.9 
      };
    } catch (e) {
      return { users: 0, matches: 0, sherpas: 0, satisfaction: 5.0 };
    }
  },

  async getQueueStats() {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    return Math.floor((count || 1) * 1.5);
  },

  // --- AUTH & PROFILE ---
  async login(loginIdentifier: string, password: string): Promise<Player | null> {
    let emailToUse = loginIdentifier;
    const isEmail = loginIdentifier.includes('@');

    if (!isEmail) {
        const { data: profileData } = await supabase.from('profiles').select('email').eq('username', loginIdentifier).maybeSingle();
        if (!profileData?.email) throw new Error('Usuário não encontrado.');
        emailToUse = profileData.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
    if (error) throw error;
    if (!data.user) return null;
    return await this.syncUserProfile(data.user);
  },

  async register(username: string, email: string, password: string) {
    const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle();
    if (existingUser) throw new Error('Este nome de usuário já está em uso.');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username } }
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(identifier: string) {
    let emailToUse = identifier;
    if (!identifier.includes('@')) {
        const { data } = await supabase.from('profiles').select('email').eq('username', identifier).maybeSingle();
        if (!data?.email) throw new Error('Usuário não encontrado.');
        emailToUse = data.email;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, { redirectTo: window.location.origin + '?type=recovery' });
    if (error) throw error;
    return true;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },

  async loginWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin, skipBrowserRedirect: false },
    });
    if (error) throw error;
    return data;
  },

  async checkSession(): Promise<Player | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return await this.syncUserProfile(session.user);
  },

  async syncUserProfile(user: any): Promise<Player | null> {
    const userId = user.id;
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (!profile) {
      const meta = user.user_metadata || {};
      let username = meta.custom_claims?.global_name || meta.full_name || meta.username || user.email?.split('@')[0] || 'Gamer';
      const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const email = user.email;

      const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert([{ 
              id: userId, 
              username, 
              email, 
              avatar, 
              score: 50, 
              coins: 0, 
              tutorial_completed: false 
          }])
          .select().single();
      
      if (error) {
          console.error("Error creating profile:", error);
          return null;
      }
      profile = newProfile;
    } 
    
    if (!profile) return null;
    const { data: inventory } = await supabase.from('inventory').select('item_id').eq('user_id', userId);
    return transformProfile(profile, inventory || []);
  },

  async updateAvatar(userId: string, newUrl: string) {
    const { error } = await supabase.from('profiles').update({ avatar: newUrl }).eq('id', userId);
    return !error;
  },

  async updateGameAccounts(userId: string, riotId: string, steamId: string) {
    const { error } = await supabase.from('profiles').update({ riot_id: riotId, steam_id: steamId }).eq('id', userId);
    return !error;
  },

  async completeTutorial(userId: string) {
    await this.purchaseCoins(userId, 500);
    await supabase.from('profiles').update({ tutorial_completed: true }).eq('id', userId);
    return true;
  },

  async deleteAccount(userId: string) {
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    return true;
  },

  // --- ECONOMY & ITEMS ---

  async purchaseCoins(userId: string, amount: number) {
    const { data: user } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    if (user) {
        await supabase.from('profiles').update({ coins: user.coins + amount }).eq('id', userId);
    }
    return true; 
  },

  async claimAchievement(userId: string, achievementId: string, reward: number) {
    const { data: user } = await supabase.from('profiles').select('claimed_achievements').eq('id', userId).single();
    if (!user) return false;

    const currentClaims = user.claimed_achievements || [];
    if (!currentClaims.includes(achievementId)) {
        const newClaims = [...currentClaims, achievementId];
        await supabase.from('profiles').update({ claimed_achievements: newClaims }).eq('id', userId);
        await this.purchaseCoins(userId, reward);
        return true;
    }
    return false;
  },

  async purchaseItem(userId: string, itemId: string, price: number) {
    const { data: user } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    if (!user || user.coins < price) return false;

    const { error: coinError } = await supabase.from('profiles').update({ coins: user.coins - price }).eq('id', userId);
    if (coinError) return false;

    const { error: invError } = await supabase.from('inventory').insert({ user_id: userId, item_id: itemId });
    return !invError;
  },

  async equipItem(userId: string, type: string, itemId: string) {
    const { data: user } = await supabase.from('profiles').select('equipped').eq('id', userId).single();
    if (!user) return false;

    const newEquipped = { ...user.equipped, [type]: itemId };
    const { error } = await supabase.from('profiles').update({ equipped: newEquipped }).eq('id', userId);
    return !error;
  },

  async setPremium(userId: string) {
    await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
    return true;
  },

  // --- MATCHMAKING & STATS ---

  async incrementMatchStats(userId: string, isWin: boolean) {
    const { data: profile } = await supabase.from('profiles').select('stats, advanced_stats, score').eq('id', userId).single();
    if (!profile) return;

    let stats = profile.stats || { matchesPlayed: 0, mvps: 0, commendations: 0, perfectBehaviorStreak: 0 };
    let advanced = profile.advanced_stats || { matchHistory: [], performance: getEmptyAdvancedStats() };
    let newScore = profile.score || 50;

    stats.matchesPlayed += 1;
    stats.perfectBehaviorStreak += 1;
    if (isWin) {
      newScore = Math.min(100, newScore + 2);
      if (Math.random() > 0.7) stats.mvps += 1;
    } else {
      newScore = Math.max(0, newScore - 1);
    }

    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    advanced.matchHistory = [...(advanced.matchHistory || []), {
        date: today,
        rating: newScore,
        kda: Number((isWin ? 2.5 + Math.random() : 1.0 + Math.random()).toFixed(2))
    }].slice(-10);

    await supabase.from('profiles').update({
        stats: stats,
        advanced_stats: advanced,
        score: newScore
    }).eq('id', userId);

    await supabase.from('match_history').insert({
        user_id: userId,
        result: isWin ? 'VICTORY' : 'DEFEAT',
        score_change: isWin ? 2 : -1,
        game_mode: 'Ranked',
        created_at: new Date().toISOString()
    });

    this.createNotification(userId, "Partida Processada", `Resultado: ${isWin ? 'Vitória' : 'Derrota'}. Score atualizado.`, isWin ? "success" : "info");
  },

  async getRecentMatches(userId: string): Promise<Match[]> {
    const { data } = await supabase
      .from('match_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return (data || []).map((m: any) => ({
      id: m.id,
      game: 'League of Legends', // Default for MVP
      vibe: 'Tryhard', // Default
      date: new Date(m.created_at).toLocaleDateString(),
      teammates: [], // Empty for history view
      result: m.result,
      pendingVote: false
    }));
  },

  // --- LOBBY CHAT (Interaction) ---
  
  async sendLobbyMessage(lobbyId: string, user: Player, text: string) {
    // Assuming a 'lobby_messages' table exists. 
    // If not, it will fail silently or log error, but for MVP launch we provide the code.
    await supabase.from('lobby_messages').insert({
      lobby_id: lobbyId,
      user_id: user.id,
      username: user.username,
      text: text,
      created_at: new Date().toISOString()
    });
  },

  async getLobbyMessages(lobbyId: string): Promise<ChatMessage[]> {
    const { data } = await supabase
      .from('lobby_messages')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('created_at', { ascending: true })
      .limit(50);

    return (data || []).map((msg: any) => ({
      id: msg.id,
      senderId: msg.user_id,
      senderName: msg.username,
      text: msg.text,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
  },

  // NEW: Clear chat when game starts
  async clearLobbyChat(lobbyId: string) {
    const { error } = await supabase.from('lobby_messages').delete().eq('lobby_id', lobbyId);
    return !error;
  },

  // --- NOTIFICATIONS & FRIENDS ---

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    return (data || []).map((n: any) => ({
        id: n.id, title: n.title, message: n.message, type: n.type, timestamp: new Date(n.created_at).toLocaleDateString(), read: n.read
    }));
  },

  async markNotificationRead(userId: string) {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  },

  async createNotification(userId: string, title: string, message: string, type: any) {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type, read: false, created_at: new Date().toISOString() });
  },

  async searchUsers(query: string, currentUserId: string): Promise<Friend[]> {
    const { data } = await supabase.from('profiles').select('id, username, avatar, score').ilike('username', `%${query}%`).neq('id', currentUserId).limit(5);
    return (data || []).map((u: any) => ({ ...u, status: 'offline' })) as Friend[];
  },

  async getFriends(userId: string): Promise<Friend[]> {
    const { data: friendships } = await supabase.from('friendships').select(`status, sender:user_id_1(id, username, avatar, score), receiver:user_id_2(id, username, avatar, score)`)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`).eq('status', 'accepted');
    if (!friendships) return [];
    return friendships.map((f: any) => {
        const friendData = f.sender.id === userId ? f.receiver : f.sender;
        return { id: friendData.id, username: friendData.username, avatar: friendData.avatar, score: friendData.score, status: 'offline' };
    });
  },

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data } = await supabase.from('friendships').select(`id, created_at, sender:user_id_1(id, username, avatar, score)`).eq('user_id_2', userId).eq('status', 'pending');
    return (data || []).map((r: any) => ({ id: r.id, fromUser: { ...r.sender, status: 'online' }, timestamp: new Date(r.created_at).toLocaleDateString() }));
  },

  async sendFriendRequest(fromUser: Player, toUser: Friend) {
    const { data: existing } = await supabase.from('friendships').select('id').or(`and(user_id_1.eq.${fromUser.id},user_id_2.eq.${toUser.id}),and(user_id_1.eq.${toUser.id},user_id_2.eq.${fromUser.id})`).maybeSingle();
    if (existing) return { success: false, message: 'Já existe uma conexão entre vocês.' };
    const { error } = await supabase.from('friendships').insert({ user_id: fromUser.id, user_id_2: toUser.id, status: 'pending' });
    if (error) return { success: false, message: 'Erro ao enviar.' };
    this.createNotification(toUser.id, "Nova Solicitação", `${fromUser.username} quer ser seu amigo.`, "info");
    return { success: true, message: 'Solicitação enviada!' };
  },

  async acceptFriendRequest(requestId: string, currentUserId: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
  },

  async rejectFriendRequest(requestId: string) {
    await supabase.from('friendships').delete().eq('id', requestId);
  },

  // --- SHERPA ---
  async becomeSherpa(userId: string, hourlyRate: number, specialties: string[]) {
    const { error } = await supabase.from('profiles').update({ is_sherpa: true, sherpa_data: { hourlyRate, specialties } }).eq('id', userId);
    return !error;
  },

  async hireSherpa(clientId: string, sherpaId: string, cost: number) {
    const { data: client } = await supabase.from('profiles').select('coins').eq('id', clientId).single();
    if (!client || client.coins < cost) return { success: false, message: 'Saldo insuficiente.' };
    await this.purchaseCoins(clientId, -cost);
    await this.purchaseCoins(sherpaId, cost);
    this.createNotification(sherpaId, "Nova Contratação!", "Alguém contratou seus serviços de Sherpa.", "reward");
    return { success: true, message: 'Sucesso!' };
  },

  // --- PAYMENT (MOCK) ---
  async createMercadoPagoPreference(title: string, price: number): Promise<string | null> {
    return null; // Requires Backend Function
  },

  async processPaymentSimulation(price: number, method: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};
