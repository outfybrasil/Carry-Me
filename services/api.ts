
import { supabase } from '../lib/supabase';
import { Player, AppNotification } from '../types';

// Helper to transform DB shape to App shape
const transformProfile = (data: any, inventory: any[]): Player => {
  // LocalStorage Fallback/Sync mechanism
  const localInventoryKey = `carryme_inventory_${data.id}`;
  const localEquippedKey = `carryme_equipped_${data.id}`;
  const localCoinsKey = `carryme_coins_${data.id}`;
  const localClaimsKey = `carryme_claims_${data.id}`;
  // New: Sync stats locally to simulate progress in demo without DB writes
  const localStatsKey = `carryme_stats_${data.id}`;

  const localInventory = JSON.parse(localStorage.getItem(localInventoryKey) || '[]');
  const localEquipped = JSON.parse(localStorage.getItem(localEquippedKey) || '{}');
  const localCoins = localStorage.getItem(localCoinsKey);
  const localClaims = JSON.parse(localStorage.getItem(localClaimsKey) || '[]');
  const localStats = JSON.parse(localStorage.getItem(localStatsKey) || 'null');

  // Merge DB inventory with LocalStorage inventory (deduplicated)
  const dbInventoryIds = inventory.map((i: any) => i.item_id);
  const mergedInventory = Array.from(new Set([...dbInventoryIds, ...localInventory]));

  // Prioritize LocalStorage for equipped items if they exist, otherwise DB
  const finalEquipped = Object.keys(localEquipped).length > 0 ? localEquipped : (data.equipped || {});
  
  // Use local coins if available (since we can't write to DB easily in this demo) or DB coins
  const finalCoins = localCoins ? parseInt(localCoins) : data.coins;

  // ZERADO: Default stats are now 0 if no data exists
  const defaultStats = {
    matchesPlayed: 0,
    mvps: 0,
    commendations: 0,
    sherpaSessions: 0,
    perfectBehaviorStreak: 0
  };

  return {
    id: data.id,
    username: data.username,
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    score: data.score,
    coins: finalCoins,
    isPremium: data.is_premium,
    isSherpa: data.is_sherpa || false,
    badges: data.badges || [],
    equipped: finalEquipped,
    inventory: mergedInventory,
    stats: localStats || data.stats || defaultStats,
    claimedAchievements: localClaims
  };
};

export const api = {
  async getLandingStats() {
    try {
      const { count: totalUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      const { count: totalSherpas, error: sherpaError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_sherpa', true);
      if (userError) throw userError;
      const users = totalUsers || 0;
      const sherpas = totalSherpas || 0;
      const estimatedMatches = users > 0 ? users * 12 + 842 : 12400; 
      return { users, matches: estimatedMatches, sherpas, satisfaction: 4.9 };
    } catch (e) {
      return { users: 1200, matches: 15000, sherpas: 45, satisfaction: 5.0 };
    }
  },

  async login(loginIdentifier: string, password: string): Promise<Player | null> {
    let emailToUse = loginIdentifier;

    // Check if input looks like an email
    const isEmail = String(loginIdentifier).toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    // If not an email, assume it's a username and try to find the associated email
    if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', loginIdentifier)
            .maybeSingle();
        
        if (profileError || !profileData || !profileData.email) {
            throw new Error('Usuário não encontrado.');
        }
        emailToUse = profileData.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
        email: emailToUse, 
        password 
    });

    if (error) throw error;
    if (!data.user) return null;
    return await this.syncUserProfile(data.user);
  },

  async register(username: string, email: string, password: string) {
    // Check if username exists first to avoid vague DB errors
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

    if (existingUser) {
        throw new Error('Este nome de usuário já está em uso.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username } }
    });
    if (error) throw error;
    return data;
  },

  async loginWithDiscord() {
    const url = new URL(window.location.href);
    const redirectUrl = `${url.protocol}//${url.host}`;
    
    console.log("Iniciando login Discord. Redirecting to:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false
      },
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
    const meta = user.user_metadata || {};
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (!profile) {
      const username = meta.custom_claims?.global_name || meta.full_name || meta.username || user.email?.split('@')[0] || 'Gamer';
      const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, username, email: user.email, avatar, score: 50, coins: 100 }])
        .select().single();
      if (error && error.code !== '23505') return null;
      profile = newProfile || (await supabase.from('profiles').select('*').eq('id', userId).single()).data;
    } 
    const { data: inventory } = await supabase.from('inventory').select('item_id').eq('user_id', userId);
    return transformProfile(profile, inventory || []);
  },

  async updateAvatar(userId: string, newUrl: string) {
    const { error } = await supabase.from('profiles').update({ avatar: newUrl }).eq('id', userId);
    return !error;
  },

  async deleteAccount(userId: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    await supabase.auth.signOut();
    return true;
  },

  async becomeSherpa(userId: string, hourlyRate: number, specialties: string[]) {
    const { error } = await supabase.from('profiles').update({ is_sherpa: true }).eq('id', userId);
    return !error;
  },

  async hireSherpa(clientId: string, sherpaId: string, cost: number) {
    // Local simulation for coins if RPC fails
    const localCoinsKey = `carryme_coins_${clientId}`;
    const currentCoins = parseInt(localStorage.getItem(localCoinsKey) || '0');
    
    if (currentCoins >= cost) {
       localStorage.setItem(localCoinsKey, (currentCoins - cost).toString());
       return { success: true, message: 'Sucesso!' };
    }

    const { data: client } = await supabase.from('profiles').select('coins').eq('id', clientId).single();
    if (!client || client.coins < cost) return { success: false, message: 'Saldo insuficiente.' };
    
    await supabase.rpc('add_coins', { user_id_input: clientId, amount: -cost });
    await supabase.rpc('add_coins', { user_id_input: sherpaId, amount: cost });
    return { success: true, message: 'Sucesso!' };
  },

  async purchaseCoins(userId: string, amount: number) {
    // Save to local storage for persistence in demo mode
    const localCoinsKey = `carryme_coins_${userId}`;
    const currentCoins = parseInt(localStorage.getItem(localCoinsKey) || '0'); 
    
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    const baseCoins = profile ? profile.coins : currentCoins;
    const newTotal = baseCoins + amount;
    
    localStorage.setItem(localCoinsKey, newTotal.toString());

    // Try DB write
    const { error } = await supabase.rpc('add_coins', { user_id_input: userId, amount: amount });
    return true; 
  },

  async claimAchievement(userId: string, achievementId: string, reward: number) {
    const localClaimsKey = `carryme_claims_${userId}`;
    const localCoinsKey = `carryme_coins_${userId}`;
    
    // Update Claims
    const claims = JSON.parse(localStorage.getItem(localClaimsKey) || '[]');
    if (!claims.includes(achievementId)) {
        claims.push(achievementId);
        localStorage.setItem(localClaimsKey, JSON.stringify(claims));
        
        // Update Coins
        const currentCoins = parseInt(localStorage.getItem(localCoinsKey) || '0');
        localStorage.setItem(localCoinsKey, (currentCoins + reward).toString());
        return true;
    }
    return false;
  },

  async purchaseItem(userId: string, itemId: string, price: number) {
    const localInventoryKey = `carryme_inventory_${userId}`;
    const localCoinsKey = `carryme_coins_${userId}`;
    
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    
    const localCoinsVal = localStorage.getItem(localCoinsKey);
    let currentCoins = profile ? profile.coins : (localCoinsVal ? parseInt(localCoinsVal) : 0);
    
    if (localCoinsVal && profile && parseInt(localCoinsVal) !== profile.coins) {
       currentCoins = parseInt(localCoinsVal);
    }

    if (currentCoins < price) return false;

    const newCoins = currentCoins - price;
    localStorage.setItem(localCoinsKey, newCoins.toString());

    const currentInventory = JSON.parse(localStorage.getItem(localInventoryKey) || '[]');
    if (!currentInventory.includes(itemId)) {
      currentInventory.push(itemId);
      localStorage.setItem(localInventoryKey, JSON.stringify(currentInventory));
    }

    await supabase.rpc('buy_item', { user_id_input: userId, item_id_input: itemId, cost: price });
    
    return true;
  },

  async equipItem(userId: string, type: string, itemId: string) {
    const localEquippedKey = `carryme_equipped_${userId}`;
    const currentEquipped = JSON.parse(localStorage.getItem(localEquippedKey) || '{}');
    
    currentEquipped[type] = itemId;
    localStorage.setItem(localEquippedKey, JSON.stringify(currentEquipped));

    await supabase.rpc('equip_item', { user_id_input: userId, type, item_id: itemId });
    return true;
  },

  async setPremium(userId: string) {
    const { error } = await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
    return !error;
  },

  // --- Real Stats & Notification System (Simulated via LocalStorage for persistence) ---

  async incrementMatchStats(userId: string, isWin: boolean) {
    const localStatsKey = `carryme_stats_${userId}`;
    let stats = JSON.parse(localStorage.getItem(localStatsKey) || JSON.stringify({ matchesPlayed: 0, mvps: 0, commendations: 0, perfectBehaviorStreak: 0 }));
    
    stats.matchesPlayed += 1;
    if (isWin) {
        // Random chance to simulate getting MVP or Commendation for realism
        if (Math.random() > 0.7) stats.mvps += 1;
        if (Math.random() > 0.5) stats.commendations += 1;
    }
    stats.perfectBehaviorStreak += 1;

    localStorage.setItem(localStatsKey, JSON.stringify(stats));
    
    // Trigger notification
    this.createNotification(userId, "Partida Concluída", "Seus dados de comportamento foram atualizados.", "info");
  },

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const key = `carryme_notifs_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
        // Initial welcome notification if empty
        const initial: AppNotification[] = [{
            id: 'welcome',
            title: 'Bem-vindo ao CarryMe',
            message: 'Complete seu perfil e jogue para ganhar Coins.',
            type: 'info',
            timestamp: 'Agora',
            read: false
        }];
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(data);
  },

  async markNotificationRead(userId: string) {
    const key = `carryme_notifs_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = data.map((n: AppNotification) => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(updated));
  },

  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'reward') {
    const key = `carryme_notifs_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newNotif: AppNotification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: 'Agora',
        read: false
    };
    
    // Keep last 20 notifications
    const updated = [newNotif, ...data].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  async createMercadoPagoPreference(title: string, price: number): Promise<string | null> {
    console.log(`Creating MP preference for: ${title} - R$ ${price}`);
    return null; 
  },

  async processPaymentSimulation(price: number, method: string): Promise<boolean> {
    console.log(`Simulating ${method} payment of R$ ${price}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }
};
