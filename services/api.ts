
import { supabase } from '../lib/supabase';
import { Player, AppNotification, Friend, FriendRequest } from '../types';

// Helper to transform DB shape to App shape
const transformProfile = (data: any, inventory: any[]): Player => {
  // LocalStorage Fallback/Sync mechanism (Persists user state across sessions)
  const localInventoryKey = `carryme_inventory_${data.id}`;
  const localEquippedKey = `carryme_equipped_${data.id}`;
  const localCoinsKey = `carryme_coins_${data.id}`;
  const localClaimsKey = `carryme_claims_${data.id}`;
  const localStatsKey = `carryme_stats_${data.id}`;
  const localTutorialKey = `carryme_tutorial_${data.id}`;
  const localAvatarKey = `carryme_avatar_${data.id}`; // NEW: Local Avatar Key

  const localInventory = JSON.parse(localStorage.getItem(localInventoryKey) || '[]');
  const localEquipped = JSON.parse(localStorage.getItem(localEquippedKey) || '{}');
  const localCoins = localStorage.getItem(localCoinsKey);
  const localClaims = JSON.parse(localStorage.getItem(localClaimsKey) || '[]');
  const localStats = JSON.parse(localStorage.getItem(localStatsKey) || 'null');
  const localTutorial = localStorage.getItem(localTutorialKey) === 'true';
  const localAvatar = localStorage.getItem(localAvatarKey); // NEW: Get Local Avatar

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
    // Prioritize local avatar (for base64 support), then DB avatar, then dicebear fallback
    avatar: localAvatar || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    score: data.score,
    coins: finalCoins,
    isPremium: data.is_premium,
    isSherpa: data.is_sherpa || false,
    tutorialCompleted: localTutorial || data.tutorial_completed || false,
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
      const estimatedMatches = users > 0 ? users * 2 : 0; 
      
      return { users, matches: estimatedMatches, sherpas, satisfaction: 5.0 };
    } catch (e) {
      return { users: 0, matches: 0, sherpas: 0, satisfaction: 5.0 };
    }
  },

  async login(loginIdentifier: string, password: string): Promise<Player | null> {
    let emailToUse = loginIdentifier;

    const isEmail = String(loginIdentifier).toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

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
      options: { 
        data: { username: username },
        emailRedirectTo: 'https://carry-me.netlify.app' 
      }
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(identifier: string) {
    let emailToUse = identifier;
    const isEmail = String(identifier).toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .maybeSingle();
        
        if (profileError || !profileData || !profileData.email) {
            throw new Error('Usuário não encontrado.');
        }
        emailToUse = profileData.email;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: 'https://carry-me.netlify.app', 
    });
    
    if (error) throw error;
    return true;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },

  async loginWithDiscord() {
    const url = new URL(window.location.href);
    const redirectUrl = `${url.protocol}//${url.host}`;
    
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
      // Initialize with 0 coins as requested
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, username, email: user.email, avatar, score: 50, coins: 0, tutorial_completed: false }])
        .select().single();
      if (error && error.code !== '23505') return null;
      profile = newProfile || (await supabase.from('profiles').select('*').eq('id', userId).single()).data;
    } 
    const { data: inventory } = await supabase.from('inventory').select('item_id').eq('user_id', userId);
    return transformProfile(profile, inventory || []);
  },

  async updateAvatar(userId: string, newUrl: string) {
    // 1. Always save locally first to guarantee UI update (Hybrid approach)
    // This handles large Base64 strings that might be rejected by the DB strictly
    try {
        localStorage.setItem(`carryme_avatar_${userId}`, newUrl);
    } catch (e) {
        console.warn("Local storage full", e);
    }

    // 2. Try to update DB (Best effort)
    const { error } = await supabase.from('profiles').update({ avatar: newUrl }).eq('id', userId);
    
    // We return true even if DB fails, because we saved it locally for the session.
    // This ensures the user isn't blocked in the tutorial.
    if (error) {
        console.warn("DB Update failed (likely size limit), using local fallback.");
    }
    
    return true;
  },

  // NEW: Tutorial Completion
  async completeTutorial(userId: string) {
    const localTutorialKey = `carryme_tutorial_${userId}`;
    localStorage.setItem(localTutorialKey, 'true');
    
    // Add 500 coins reward
    await this.purchaseCoins(userId, 500);
    
    // Update DB flag
    await supabase.from('profiles').update({ tutorial_completed: true }).eq('id', userId);
    
    return true;
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
    const localCoinsKey = `carryme_coins_${userId}`;
    const currentCoins = parseInt(localStorage.getItem(localCoinsKey) || '0'); 
    
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    const baseCoins = profile ? profile.coins : currentCoins;
    const newTotal = baseCoins + amount;
    
    localStorage.setItem(localCoinsKey, newTotal.toString());

    const { error } = await supabase.rpc('add_coins', { user_id_input: userId, amount: amount });
    return true; 
  },

  async claimAchievement(userId: string, achievementId: string, reward: number) {
    const localClaimsKey = `carryme_claims_${userId}`;
    const localCoinsKey = `carryme_coins_${userId}`;
    
    const claims = JSON.parse(localStorage.getItem(localClaimsKey) || '[]');
    if (!claims.includes(achievementId)) {
        claims.push(achievementId);
        localStorage.setItem(localClaimsKey, JSON.stringify(claims));
        
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

  async incrementMatchStats(userId: string, isWin: boolean) {
    const localStatsKey = `carryme_stats_${userId}`;
    let stats = JSON.parse(localStorage.getItem(localStatsKey) || JSON.stringify({ matchesPlayed: 0, mvps: 0, commendations: 0, perfectBehaviorStreak: 0 }));
    
    stats.matchesPlayed += 1;
    if (isWin) {
        if (Math.random() > 0.7) stats.mvps += 1;
        if (Math.random() > 0.5) stats.commendations += 1;
    }
    stats.perfectBehaviorStreak += 1;

    localStorage.setItem(localStatsKey, JSON.stringify(stats));
    this.createNotification(userId, "Partida Concluída", "Seus dados de comportamento foram atualizados.", "info");
  },

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const key = `carryme_notifs_${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
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
    
    const updated = [newNotif, ...data].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  async searchUsers(query: string, currentUserId: string): Promise<Friend[]> {
    const { data } = await supabase.from('profiles')
        .select('id, username, avatar, score')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId) 
        .limit(5);

    if (!data) return [];

    let results = data.map((u: any) => ({ ...u, status: 'offline' }));
    return results as Friend[];
  },

  async getFriends(userId: string): Promise<Friend[]> {
    const key = `carryme_friendships`;
    const friendships = JSON.parse(localStorage.getItem(key) || '[]');
    
    const myFriends = friendships
        .filter((f: any) => (f.from === userId || f.to === userId) && f.status === 'accepted')
        .map((f: any) => f.from === userId ? f.friendData : f.userData);

    return myFriends;
  },

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const key = `carryme_friendships`;
    const friendships = JSON.parse(localStorage.getItem(key) || '[]');
    
    return friendships
        .filter((f: any) => f.to === userId && f.status === 'pending')
        .map((f: any) => ({
            id: f.id,
            fromUser: f.userData,
            timestamp: new Date(f.timestamp).toLocaleDateString()
        }));
  },

  async sendFriendRequest(fromUser: Player, toUser: Friend) {
    const key = `carryme_friendships`;
    const friendships = JSON.parse(localStorage.getItem(key) || '[]');

    const exists = friendships.find((f: any) => 
        (f.from === fromUser.id && f.to === toUser.id) || 
        (f.from === toUser.id && f.to === fromUser.id)
    );

    if (exists) return { success: false, message: 'Solicitação já enviada ou já são amigos.' };

    const newRequest = {
        id: Date.now().toString(),
        from: fromUser.id,
        to: toUser.id,
        status: 'pending',
        timestamp: new Date().toISOString(),
        userData: { id: fromUser.id, username: fromUser.username, avatar: fromUser.avatar, score: fromUser.score, status: 'online' },
        friendData: toUser 
    };

    localStorage.setItem(key, JSON.stringify([...friendships, newRequest]));
    this.createNotification(toUser.id, "Novo Pedido de Amizade", `${fromUser.username} quer ser seu amigo.`, "info");
    
    return { success: true, message: 'Solicitação enviada!' };
  },

  async acceptFriendRequest(requestId: string, currentUserId: string) {
    const key = `carryme_friendships`;
    const friendships = JSON.parse(localStorage.getItem(key) || '[]');
    
    const updated = friendships.map((f: any) => {
        if (f.id === requestId) {
            return { ...f, status: 'accepted' };
        }
        return f;
    });

    localStorage.setItem(key, JSON.stringify(updated));
    
    const req = friendships.find((f: any) => f.id === requestId);
    if(req) {
       this.createNotification(req.from, "Pedido Aceito", `Agora você é amigo de ${req.friendData.username}`, "success");
    }
  },

  async rejectFriendRequest(requestId: string) {
    const key = `carryme_friendships`;
    const friendships = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = friendships.filter((f: any) => f.id !== requestId);
    localStorage.setItem(key, JSON.stringify(filtered));
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
