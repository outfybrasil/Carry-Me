import { Player, Tag, TagType, Match, Vibe, SherpaProfile, StoreItem, ItemType, Achievement, AppNotification } from './types';

// CURRENT_USER is just a fallback type shape, actual user comes from Auth
export const CURRENT_USER: Player = {
  id: 'u1',
  username: 'Guest',
  avatar: '',
  score: 50,
  badges: [],
  gameRole: '',
  isPremium: false,
  coins: 0,
  inventory: [],
  equipped: {},
  tutorialCompleted: false,
  stats: {
    matchesPlayed: 0,
    mvps: 0,
    commendations: 0,
    sherpaSessions: 0,
    perfectBehaviorStreak: 0
  },
  matchHistory: [],
  advancedStats: {
    headshotPct: 0,
    adr: 0,
    kast: 0,
    entrySuccess: 0,
    clutchSuccess: 0,
    radar: [],
    focusAreas: []
  },
  claimedAchievements: []
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'ach_1', title: 'Aquecimento', description: 'Jogue suas primeiras 3 partidas.', icon: 'Gamepad2', targetValue: 3, reward: 100, statKey: 'matchesPlayed' },
  { id: 'ach_2', title: 'Veterano', description: 'Complete 50 partidas na plataforma.', icon: 'Swords', targetValue: 50, reward: 500, statKey: 'matchesPlayed' },
  { id: 'ach_3', title: 'MVP', description: 'Seja eleito MVP 5 vezes.', icon: 'Trophy', targetValue: 5, reward: 300, statKey: 'mvps' },
  { id: 'ach_4', title: 'Pilar da Comunidade', description: 'Receba 100 elogios.', icon: 'Heart', targetValue: 100, reward: 250, statKey: 'commendations' },
  { id: 'ach_5', title: 'Exemplo a Seguir', description: 'Mantenha comportamento perfeito por 10 jogos.', icon: 'ShieldCheck', targetValue: 10, reward: 200, statKey: 'perfectBehaviorStreak' },
  { id: 'ach_6', title: 'Sensei', description: 'Realize 1 sessão como Sherpa.', icon: 'GraduationCap', targetValue: 1, reward: 1000, statKey: 'sherpaSessions' },
];

// CLEANED: No fake notifications
export const MOCK_NOTIFICATIONS: AppNotification[] = [];

/* --- MASSIVE STORE ITEMS LIST --- */
export const CLAN_CREATION_COST = 2500;

export const STORE_ITEMS: StoreItem[] = [
  // ================= BORDERS =================

  // COMMON (10)
  { id: 'border_c_slate', name: 'Standard Slate', type: ItemType.BORDER, price: 100, value: 'border-slate-600', description: 'O padrão confiável.', rarity: 'common' },
  { id: 'border_c_zinc', name: 'Heavy Zinc', type: ItemType.BORDER, price: 150, value: 'border-zinc-500', description: 'Robusto e industrial.', rarity: 'common' },
  { id: 'border_c_red', name: 'Basic Red', type: ItemType.BORDER, price: 200, value: 'border-red-800', description: 'Um toque de agressividade.', rarity: 'common' },
  { id: 'border_c_blue', name: 'Basic Blue', type: ItemType.BORDER, price: 200, value: 'border-blue-800', description: 'Calmo e controlado.', rarity: 'common' },
  { id: 'border_c_green', name: 'Basic Green', type: ItemType.BORDER, price: 200, value: 'border-green-800', description: 'Cor da natureza.', rarity: 'common' },
  { id: 'border_c_orange', name: 'Basic Orange', type: ItemType.BORDER, price: 200, value: 'border-orange-800', description: 'Energético.', rarity: 'common' },
  { id: 'border_c_purple', name: 'Basic Purple', type: ItemType.BORDER, price: 250, value: 'border-purple-800', description: 'Um pouco de mistério.', rarity: 'common' },
  { id: 'border_c_teal', name: 'Basic Teal', type: ItemType.BORDER, price: 250, value: 'border-teal-800', description: 'Diferente do usual.', rarity: 'common' },
  { id: 'border_c_stone', name: 'Solid Stone', type: ItemType.BORDER, price: 300, value: 'border-stone-500', description: 'Duro como pedra.', rarity: 'common' },
  { id: 'border_c_neutral', name: 'Neutral Grey', type: ItemType.BORDER, price: 100, value: 'border-neutral-500', description: 'Neutro em tudo.', rarity: 'common' },

  // UNCOMMON (10)
  { id: 'border_u_crimson', name: 'Vivid Crimson', type: ItemType.BORDER, price: 600, value: 'border-red-500', description: 'Vermelho vivo.', rarity: 'uncommon' },
  { id: 'border_u_azure', name: 'Bright Azure', type: ItemType.BORDER, price: 600, value: 'border-blue-500', description: 'Azul celeste.', rarity: 'uncommon' },
  { id: 'border_u_emerald', name: 'Deep Emerald', type: ItemType.BORDER, price: 600, value: 'border-emerald-500', description: 'Verde esmeralda.', rarity: 'uncommon' },
  { id: 'border_u_amber', name: 'Glowing Amber', type: ItemType.BORDER, price: 700, value: 'border-amber-500', description: 'Amarelo queimado.', rarity: 'uncommon' },
  { id: 'border_u_violet', name: 'Electric Violet', type: ItemType.BORDER, price: 700, value: 'border-violet-500', description: 'Roxo elétrico.', rarity: 'uncommon' },
  { id: 'border_u_pink', name: 'Hot Pink', type: ItemType.BORDER, price: 700, value: 'border-pink-500', description: 'Rosa choque.', rarity: 'uncommon' },
  { id: 'border_u_cyan', name: 'Cyber Cyan', type: ItemType.BORDER, price: 800, value: 'border-cyan-500', description: 'Ciano futurista.', rarity: 'uncommon' },
  { id: 'border_u_lime', name: 'Acid Lime', type: ItemType.BORDER, price: 800, value: 'border-lime-500', description: 'Verde ácido.', rarity: 'uncommon' },
  { id: 'border_u_rose', name: 'Soft Rose', type: ItemType.BORDER, price: 900, value: 'border-rose-400 border-double', description: 'Borda dupla rosa.', rarity: 'uncommon' },
  { id: 'border_u_white', name: 'Pure White', type: ItemType.BORDER, price: 1000, value: 'border-white', description: 'Pureza absoluta.', rarity: 'uncommon' },

  // RARE (10)
  { id: 'border_r_gold', name: 'Golden Glory', type: ItemType.BORDER, price: 2000, value: 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]', description: 'Brilho dourado.', rarity: 'rare' },
  { id: 'border_r_neon_blue', name: 'Neon Blue', type: ItemType.BORDER, price: 2200, value: 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]', description: 'Luz de neon azul.', rarity: 'rare' },
  { id: 'border_r_neon_green', name: 'Toxic Green', type: ItemType.BORDER, price: 2200, value: 'border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]', description: 'Radioativo.', rarity: 'rare' },
  { id: 'border_r_neon_purple', name: 'Void Purple', type: ItemType.BORDER, price: 2500, value: 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]', description: 'Energia do vazio.', rarity: 'rare' },
  { id: 'border_r_dashed_red', name: 'Danger Zone', type: ItemType.BORDER, price: 2500, value: 'border-red-500 border-dashed shadow-[0_0_5px_rgba(239,68,68,0.5)]', description: 'Mantenha distância.', rarity: 'rare' },
  { id: 'border_r_double_gold', name: 'Double Gold', type: ItemType.BORDER, price: 2800, value: 'border-yellow-500 border-double shadow-sm', description: 'Riqueza em dobro.', rarity: 'rare' },
  { id: 'border_r_ice', name: 'Ice Cold', type: ItemType.BORDER, price: 3000, value: 'border-cyan-200 shadow-[0_0_15px_rgba(165,243,252,0.5)]', description: 'Congelante.', rarity: 'rare' },
  { id: 'border_r_magma', name: 'Magma Crust', type: ItemType.BORDER, price: 3200, value: 'border-orange-600 border-4 shadow-orange-900/50', description: 'Calor intenso.', rarity: 'rare' },
  { id: 'border_r_royal', name: 'Royal Guard', type: ItemType.BORDER, price: 3500, value: 'border-indigo-600 border-8', description: 'Borda espessa real.', rarity: 'rare' },
  { id: 'border_r_stealth', name: 'Stealth Ops', type: ItemType.BORDER, price: 3800, value: 'border-slate-900 shadow-[0_0_15px_rgba(0,0,0,1)]', description: 'Sombra total.', rarity: 'rare' },

  // EPIC (10)
  { id: 'border_e_pulse_red', name: 'Red Alert', type: ItemType.BORDER, price: 5000, value: 'border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]', description: 'Alerta vermelho pulsante.', rarity: 'epic' },
  { id: 'border_e_pulse_cyan', name: 'Cyber Pulse', type: ItemType.BORDER, price: 5500, value: 'border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]', description: 'Pulsar cibernético.', rarity: 'epic' },
  { id: 'border_e_sun', name: 'Sun God', type: ItemType.BORDER, price: 6000, value: 'border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.8)] border-double', description: 'Brilho do sol.', rarity: 'epic' },
  { id: 'border_e_void_walker', name: 'Void Walker', type: ItemType.BORDER, price: 6500, value: 'border-fuchsia-900 shadow-[0_0_20px_rgba(112,26,117,1)] border-dashed', description: 'Caminhante do vazio.', rarity: 'epic' },
  { id: 'border_e_matrix', name: 'The Matrix', type: ItemType.BORDER, price: 7000, value: 'border-green-500 border-dotted shadow-[0_0_10px_#22c55e]', description: 'Entre na matrix.', rarity: 'epic' },
  { id: 'border_e_blood_moon', name: 'Blood Moon', type: ItemType.BORDER, price: 7500, value: 'border-rose-700 shadow-[0_0_20px_#be123c]', description: 'Lua de sangue.', rarity: 'epic' },
  { id: 'border_e_frozen_heart', name: 'Frozen Heart', type: ItemType.BORDER, price: 8000, value: 'border-sky-300 shadow-[0_0_20px_#7dd3fc] animate-pulse', description: 'Coração gelado.', rarity: 'epic' },
  { id: 'border_e_midas', name: 'Midas Touch', type: ItemType.BORDER, price: 8500, value: 'border-yellow-500 border-double shadow-[0_0_15px_#eab308]', description: 'Toque de Midas.', rarity: 'epic' },
  { id: 'border_e_shadow_isles', name: 'Shadow Isles', type: ItemType.BORDER, price: 9000, value: 'border-teal-900 shadow-[0_0_20px_#134e4a]', description: 'Ilhas das Sombras.', rarity: 'epic' },
  { id: 'border_e_arcade', name: 'Arcade Pop', type: ItemType.BORDER, price: 9500, value: 'border-pink-500 border-dashed shadow-[0_0_15px_#ec4899]', description: 'Estilo Arcade.', rarity: 'epic' },

  // LEGENDARY (10)
  { id: 'border_l_rainbow', name: 'Rainbow Road', type: ItemType.BORDER, price: 15000, value: 'border-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-1', description: 'Todas as cores.', rarity: 'legendary' }, // Note: gradients on borders are tricky, this simulates it via bg? No, Profile uses border class directly. Let's stick to glow effects for legendary to match architecture.
  { id: 'border_l_omega', name: 'Omega Weapon', type: ItemType.BORDER, price: 20000, value: 'border-white shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-pulse', description: 'Poder absoluto.', rarity: 'legendary' },
  { id: 'border_l_chaos', name: 'Chaos Theory', type: ItemType.BORDER, price: 22000, value: 'border-red-600 border-double shadow-[0_0_25px_#dc2626] animate-bounce', description: 'Caos instável.', rarity: 'legendary' },
  { id: 'border_l_celestial', name: 'Celestial Being', type: ItemType.BORDER, price: 25000, value: 'border-indigo-400 shadow-[0_0_40px_#818cf8]', description: 'Ser celestial.', rarity: 'legendary' },
  { id: 'border_l_inferno', name: 'Dante\'s Inferno', type: ItemType.BORDER, price: 28000, value: 'border-orange-600 shadow-[0_0_30px_#ea580c] animate-pulse', description: 'Fogo eterno.', rarity: 'legendary' },
  { id: 'border_l_quantum', name: 'Quantum State', type: ItemType.BORDER, price: 30000, value: 'border-violet-500 border-dotted shadow-[0_0_30px_#8b5cf6]', description: 'Estado quântico.', rarity: 'legendary' },
  { id: 'border_l_glitch', name: 'Glitch System', type: ItemType.BORDER, price: 35000, value: 'border-green-400 border-dashed shadow-[0_0_20px_#4ade80]', description: 'Erro no sistema.', rarity: 'legendary' },
  { id: 'border_l_king', name: 'King of Kings', type: ItemType.BORDER, price: 40000, value: 'border-yellow-400 border-4 shadow-[0_0_50px_#facc15]', description: 'Para a realeza.', rarity: 'legendary' },
  { id: 'border_l_void_lord', name: 'Void Lord', type: ItemType.BORDER, price: 45000, value: 'border-black shadow-[0_0_40px_#7c3aed]', description: 'Senhor do Vazio.', rarity: 'legendary' },
  { id: 'border_l_singularity', name: 'Singularity', type: ItemType.BORDER, price: 50000, value: 'border-slate-100 shadow-[inset_0_0_20px_#000000,0_0_30px_#ffffff]', description: 'O fim de tudo.', rarity: 'legendary' },

  // ================= NAME COLORS =================

  // COMMON (10)
  { id: 'color_c_slate', name: 'Classic Slate', type: ItemType.NAME_COLOR, price: 100, value: 'text-slate-400', description: 'Cinza clássico.', rarity: 'common' },
  { id: 'color_c_red', name: 'Simple Red', type: ItemType.NAME_COLOR, price: 200, value: 'text-red-700', description: 'Vermelho escuro.', rarity: 'common' },
  { id: 'color_c_blue', name: 'Simple Blue', type: ItemType.NAME_COLOR, price: 200, value: 'text-blue-700', description: 'Azul escuro.', rarity: 'common' },
  { id: 'color_c_green', name: 'Simple Green', type: ItemType.NAME_COLOR, price: 200, value: 'text-green-700', description: 'Verde escuro.', rarity: 'common' },
  { id: 'color_c_yellow', name: 'Simple Yellow', type: ItemType.NAME_COLOR, price: 200, value: 'text-yellow-700', description: 'Amarelo escuro.', rarity: 'common' },
  { id: 'color_c_purple', name: 'Simple Purple', type: ItemType.NAME_COLOR, price: 250, value: 'text-purple-700', description: 'Roxo escuro.', rarity: 'common' },
  { id: 'color_c_pink', name: 'Simple Pink', type: ItemType.NAME_COLOR, price: 250, value: 'text-pink-700', description: 'Rosa escuro.', rarity: 'common' },
  { id: 'color_c_teal', name: 'Simple Teal', type: ItemType.NAME_COLOR, price: 250, value: 'text-teal-700', description: 'Ciano escuro.', rarity: 'common' },
  { id: 'color_c_orange', name: 'Simple Orange', type: ItemType.NAME_COLOR, price: 250, value: 'text-orange-700', description: 'Laranja escuro.', rarity: 'common' },
  { id: 'color_c_white', name: 'Simple White', type: ItemType.NAME_COLOR, price: 300, value: 'text-slate-200', description: 'Quase branco.', rarity: 'common' },

  // UNCOMMON (10)
  { id: 'color_u_red', name: 'Bright Red', type: ItemType.NAME_COLOR, price: 600, value: 'text-red-500', description: 'Vermelho brilhante.', rarity: 'uncommon' },
  { id: 'color_u_blue', name: 'Bright Blue', type: ItemType.NAME_COLOR, price: 600, value: 'text-blue-500', description: 'Azul brilhante.', rarity: 'uncommon' },
  { id: 'color_u_green', name: 'Bright Green', type: ItemType.NAME_COLOR, price: 600, value: 'text-green-500', description: 'Verde brilhante.', rarity: 'uncommon' },
  { id: 'color_u_yellow', name: 'Bright Yellow', type: ItemType.NAME_COLOR, price: 600, value: 'text-yellow-500', description: 'Amarelo brilhante.', rarity: 'uncommon' },
  { id: 'color_u_purple', name: 'Bright Purple', type: ItemType.NAME_COLOR, price: 700, value: 'text-purple-500', description: 'Roxo brilhante.', rarity: 'uncommon' },
  { id: 'color_u_pink', name: 'Bright Pink', type: ItemType.NAME_COLOR, price: 700, value: 'text-pink-500', description: 'Rosa brilhante.', rarity: 'uncommon' },
  { id: 'color_u_cyan', name: 'Bright Cyan', type: ItemType.NAME_COLOR, price: 700, value: 'text-cyan-500', description: 'Ciano brilhante.', rarity: 'uncommon' },
  { id: 'color_u_orange', name: 'Bright Orange', type: ItemType.NAME_COLOR, price: 700, value: 'text-orange-500', description: 'Laranja brilhante.', rarity: 'uncommon' },
  { id: 'color_u_lime', name: 'Bright Lime', type: ItemType.NAME_COLOR, price: 800, value: 'text-lime-500', description: 'Lima brilhante.', rarity: 'uncommon' },
  { id: 'color_u_rose', name: 'Bright Rose', type: ItemType.NAME_COLOR, price: 800, value: 'text-rose-500', description: 'Rosa suave.', rarity: 'uncommon' },

  // RARE (10)
  { id: 'color_r_ice', name: 'Ice Blue', type: ItemType.NAME_COLOR, price: 2000, value: 'text-blue-300 drop-shadow-sm font-bold', description: 'Azul gelo.', rarity: 'rare' },
  { id: 'color_r_lavender', name: 'Lavender', type: ItemType.NAME_COLOR, price: 2000, value: 'text-purple-300 drop-shadow-sm font-bold', description: 'Lavanda suave.', rarity: 'rare' },
  { id: 'color_r_mint', name: 'Mint Green', type: ItemType.NAME_COLOR, price: 2000, value: 'text-emerald-300 drop-shadow-sm font-bold', description: 'Verde menta.', rarity: 'rare' },
  { id: 'color_r_peach', name: 'Peach', type: ItemType.NAME_COLOR, price: 2000, value: 'text-orange-300 drop-shadow-sm font-bold', description: 'Pêssego.', rarity: 'rare' },
  { id: 'color_r_gold', name: 'Solid Gold', type: ItemType.NAME_COLOR, price: 2500, value: 'text-yellow-400 font-bold', description: 'Ouro puro.', rarity: 'rare' },
  { id: 'color_r_silver', name: 'Silver Lining', type: ItemType.NAME_COLOR, price: 2500, value: 'text-slate-300 font-bold', description: 'Prata.', rarity: 'rare' },
  { id: 'color_r_bronze', name: 'Bronze Age', type: ItemType.NAME_COLOR, price: 2500, value: 'text-orange-700 font-bold', description: 'Bronze.', rarity: 'rare' },
  { id: 'color_r_crimson_bold', name: 'Crimson Lord', type: ItemType.NAME_COLOR, price: 2800, value: 'text-red-600 font-extrabold', description: 'Senhor carmesim.', rarity: 'rare' },
  { id: 'color_r_midnight', name: 'Midnight', type: ItemType.NAME_COLOR, price: 2800, value: 'text-indigo-900 font-extrabold', description: 'Meia-noite.', rarity: 'rare' },
  { id: 'color_r_ghost', name: 'Ghost', type: ItemType.NAME_COLOR, price: 3000, value: 'text-white/70 font-bold blur-[0.5px]', description: 'Fantasmagórico.', rarity: 'rare' },

  // EPIC (10)
  { id: 'color_e_sunset', name: 'Sunset Gradient', type: ItemType.NAME_COLOR, price: 5000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 font-bold', description: 'Pôr do sol.', rarity: 'epic' },
  { id: 'color_e_ocean', name: 'Ocean Gradient', type: ItemType.NAME_COLOR, price: 5500, value: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-bold', description: 'Oceano profundo.', rarity: 'epic' },
  { id: 'color_e_nature', name: 'Nature Gradient', type: ItemType.NAME_COLOR, price: 5500, value: 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-lime-500 font-bold', description: 'Mãe natureza.', rarity: 'epic' },
  { id: 'color_e_royal', name: 'Royal Gradient', type: ItemType.NAME_COLOR, price: 6000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 font-bold', description: 'Realeza.', rarity: 'epic' },
  { id: 'color_e_fire', name: 'Fire Gradient', type: ItemType.NAME_COLOR, price: 6000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 font-bold', description: 'Chamas.', rarity: 'epic' },
  { id: 'color_e_neon', name: 'Neon Gradient', type: ItemType.NAME_COLOR, price: 6500, value: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-bold', description: 'Cidade neon.', rarity: 'epic' },
  { id: 'color_e_shadow', name: 'Shadow Gradient', type: ItemType.NAME_COLOR, price: 7000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-black font-extrabold', description: 'Sombra viva.', rarity: 'epic' },
  { id: 'color_e_gold_rush', name: 'Gold Rush', type: ItemType.NAME_COLOR, price: 8000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 font-extrabold', description: 'Corrida do ouro.', rarity: 'epic' },
  { id: 'color_e_cotton_candy', name: 'Cotton Candy', type: ItemType.NAME_COLOR, price: 8500, value: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300 font-bold', description: 'Algodão doce.', rarity: 'epic' },
  { id: 'color_e_toxic', name: 'Toxic Hazard', type: ItemType.NAME_COLOR, price: 9000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-600 font-bold', description: 'Perigo tóxico.', rarity: 'epic' },

  // LEGENDARY (10)
  { id: 'color_l_rainbow', name: 'Rainbow', type: ItemType.NAME_COLOR, price: 15000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500 font-extrabold', description: 'Arco-íris completo.', rarity: 'legendary' },
  { id: 'color_l_aurora', name: 'Aurora Borealis', type: ItemType.NAME_COLOR, price: 20000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 font-extrabold', description: 'Aurora boreal.', rarity: 'legendary' },
  { id: 'color_l_plasma', name: 'Plasma Beam', type: ItemType.NAME_COLOR, price: 22000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 font-extrabold', description: 'Raio de plasma.', rarity: 'legendary' },
  { id: 'color_l_galaxy', name: 'Galaxy Swirl', type: ItemType.NAME_COLOR, price: 25000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-700 font-extrabold', description: 'Galáxia.', rarity: 'legendary' },
  { id: 'color_l_molten', name: 'Molten Core', type: ItemType.NAME_COLOR, price: 30000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 font-extrabold drop-shadow-md', description: 'Núcleo derretido.', rarity: 'legendary' },
  { id: 'color_l_matrix', name: 'Matrix Code', type: ItemType.NAME_COLOR, price: 35000, value: 'text-green-500 font-mono font-bold tracking-widest', description: 'Código fonte.', rarity: 'legendary' },
  { id: 'color_l_cyberpunk', name: 'Cyberpunk', type: ItemType.NAME_COLOR, price: 40000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-600 font-extrabold', description: 'Futuro distópico.', rarity: 'legendary' },
  { id: 'color_l_divine', name: 'Divine Light', type: ItemType.NAME_COLOR, price: 45000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-white font-extrabold drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]', description: 'Luz divina.', rarity: 'legendary' },
  { id: 'color_l_nightmare', name: 'Nightmare', type: ItemType.NAME_COLOR, price: 48000, value: 'text-red-900 font-black tracking-tighter drop-shadow-[0_0_5px_rgba(0,0,0,1)]', description: 'Pesadelo.', rarity: 'legendary' },
  { id: 'color_l_gm', name: 'Game Master', type: ItemType.NAME_COLOR, price: 50000, value: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 font-black uppercase tracking-widest', description: 'Mestre do jogo.', rarity: 'legendary' },

  // ================= TITLES =================
  // Títulos que aparecem abaixo do nome do jogador

  // COMMON
  { id: 'title_c_gamer', name: 'Gamer', type: ItemType.TITLE, price: 150, value: 'Gamer', description: 'O básico que todo mundo começa.', rarity: 'common' },
  { id: 'title_c_rookie', name: 'Novato', type: ItemType.TITLE, price: 150, value: 'Novato', description: 'Recém chegado.', rarity: 'common' },
  { id: 'title_c_player', name: 'Player One', type: ItemType.TITLE, price: 200, value: 'Player One', description: 'Pronto para jogar.', rarity: 'common' },
  { id: 'title_c_casual', name: 'Casual', type: ItemType.TITLE, price: 200, value: 'Casual', description: 'Só pra relaxar.', rarity: 'common' },
  { id: 'title_c_friendly', name: 'Amigável', type: ItemType.TITLE, price: 250, value: 'Amigável', description: 'Sempre de boas.', rarity: 'common' },

  // UNCOMMON
  { id: 'title_u_tryhard', name: 'Tryhard', type: ItemType.TITLE, price: 600, value: 'Tryhard', description: 'Cada round importa.', rarity: 'uncommon' },
  { id: 'title_u_clutch', name: 'Clutcher', type: ItemType.TITLE, price: 700, value: 'Clutcher', description: 'Especialista em 1vX.', rarity: 'uncommon' },
  { id: 'title_u_sniper', name: 'Sniper', type: ItemType.TITLE, price: 700, value: 'Sniper', description: 'Um tiro, um kill.', rarity: 'uncommon' },
  { id: 'title_u_support', name: 'Suporte', type: ItemType.TITLE, price: 650, value: 'Suporte', description: 'O herói silencioso.', rarity: 'uncommon' },
  { id: 'title_u_igl', name: 'IGL', type: ItemType.TITLE, price: 800, value: 'IGL', description: 'In-Game Leader.', rarity: 'uncommon' },

  // RARE
  { id: 'title_r_ace', name: 'ACE Machine', type: ItemType.TITLE, price: 2000, value: '💥 ACE Machine', description: 'Especialista em Aces.', rarity: 'rare' },
  { id: 'title_r_mvp', name: 'Eterno MVP', type: ItemType.TITLE, price: 2500, value: '⭐ Eterno MVP', description: 'Sempre o melhor.', rarity: 'rare' },
  { id: 'title_r_sherpa', name: 'Sherpa Mestre', type: ItemType.TITLE, price: 3000, value: '🏔️ Sherpa Mestre', description: 'Guia experiente.', rarity: 'rare' },
  { id: 'title_r_veteran', name: 'Veterano', type: ItemType.TITLE, price: 2800, value: '🎖️ Veterano', description: '1000+ partidas.', rarity: 'rare' },
  { id: 'title_r_mentor', name: 'Mentor', type: ItemType.TITLE, price: 3200, value: '📚 Mentor', description: 'Ensina a arte do jogo.', rarity: 'rare' },

  // EPIC
  { id: 'title_e_radiant', name: 'Radiant', type: ItemType.TITLE, price: 5000, value: '✨ Radiant', description: 'Top 500 energy.', rarity: 'epic' },
  { id: 'title_e_global', name: 'Global Elite', type: ItemType.TITLE, price: 5500, value: '🌐 Global Elite', description: 'O topo do CS.', rarity: 'epic' },
  { id: 'title_e_challenger', name: 'Challenger', type: ItemType.TITLE, price: 6000, value: '🔥 Challenger', description: 'Liga dos melhores.', rarity: 'epic' },
  { id: 'title_e_demon', name: 'Demon Mode', type: ItemType.TITLE, price: 7000, value: '😈 Demon Mode', description: 'Incontrolável.', rarity: 'epic' },
  { id: 'title_e_goat', name: 'G.O.A.T', type: ItemType.TITLE, price: 8000, value: '🐐 G.O.A.T', description: 'Greatest Of All Time.', rarity: 'epic' },

  // LEGENDARY
  { id: 'title_l_s1mple', name: 'The GOAT', type: ItemType.TITLE, price: 15000, value: '👑 The GOAT', description: 'Lenda viva.', rarity: 'legendary' },
  { id: 'title_l_god', name: 'Gaming God', type: ItemType.TITLE, price: 25000, value: '⚡ Gaming God', description: 'Divindade dos games.', rarity: 'legendary' },
  { id: 'title_l_myth', name: 'Mito', type: ItemType.TITLE, price: 30000, value: '🏆 Mito', description: 'Lenda do servidor.', rarity: 'legendary' },
  { id: 'title_l_untouchable', name: 'Intocável', type: ItemType.TITLE, price: 40000, value: '💎 Intocável', description: 'Nunca foi banido.', rarity: 'legendary' },
  { id: 'title_l_founder', name: 'Founder', type: ItemType.TITLE, price: 50000, value: '🚀 Founder', description: 'Primeiros 100 usuários.', rarity: 'legendary' },

  // ================= EMOTES =================
  // Emotes para usar no chat/lobby (URLs verificadas BetterTTV/FFZ)

  // COMMON
  { id: 'emote_c_gg', name: 'catJAM', type: ItemType.EMOTE, price: 100, value: 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/2x.webp', description: 'Gatinho dançando.', rarity: 'common' },
  { id: 'emote_c_gl', name: 'peepoHappy', type: ItemType.EMOTE, price: 100, value: 'https://cdn.betterttv.net/emote/5a16ee718c22a247ead62d4a/2x.webp', description: 'Feliz e fofo.', rarity: 'common' },
  { id: 'emote_c_thumbsup', name: 'Okayge', type: ItemType.EMOTE, price: 150, value: 'https://cdn.betterttv.net/emote/5e3543bfe4bd2f1770fb45ac/2x.webp', description: 'Tudo certo!', rarity: 'common' },
  { id: 'emote_c_fire', name: 'POGGERS', type: ItemType.EMOTE, price: 200, value: 'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/2x.webp', description: 'Momento épico!', rarity: 'common' },

  // UNCOMMON
  { id: 'emote_u_clutch', name: 'EZ', type: ItemType.EMOTE, price: 500, value: 'https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/2x.webp', description: 'Fácil demais.', rarity: 'uncommon' },
  { id: 'emote_u_boom', name: 'Clap', type: ItemType.EMOTE, price: 600, value: 'https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/2x.webp', description: 'Aplausos!', rarity: 'uncommon' },
  { id: 'emote_u_cry', name: 'Sadge', type: ItemType.EMOTE, price: 500, value: 'https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/2x.webp', description: 'Triste...', rarity: 'uncommon' },
  { id: 'emote_u_laugh', name: 'KEKW', type: ItemType.EMOTE, price: 700, value: 'https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/2x.webp', description: 'Risada épica.', rarity: 'uncommon' },

  // RARE
  { id: 'emote_r_skull', name: 'Deadge', type: ItemType.EMOTE, price: 1500, value: 'https://cdn.betterttv.net/emote/5f56691b68d9d86c020e87e0/2x.webp', description: 'Morto.', rarity: 'rare' },
  { id: 'emote_r_crown', name: 'monkaW', type: ItemType.EMOTE, price: 2000, value: 'https://cdn.betterttv.net/emote/59ca6551b27c823d5b1f6052/2x.webp', description: 'Nervoso...', rarity: 'rare' },
  { id: 'emote_r_goat', name: 'PogU', type: ItemType.EMOTE, price: 2500, value: 'https://cdn.betterttv.net/emote/5e4e7a1f08b4447d56a92967/2x.webp', description: 'HYPE máximo!', rarity: 'rare' },

  // EPIC
  { id: 'emote_e_rainbow', name: 'pepeLaugh', type: ItemType.EMOTE, price: 4000, value: 'https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/2x.webp', description: 'Sabe de algo...', rarity: 'epic' },
  { id: 'emote_e_rocket', name: 'Clueless', type: ItemType.EMOTE, price: 5000, value: 'https://cdn.betterttv.net/emote/60419081306b602acc5972c9/2x.webp', description: 'Sem noção.', rarity: 'epic' },

  // LEGENDARY
  { id: 'emote_l_diamond', name: 'GIGACHAD', type: ItemType.EMOTE, price: 15000, value: 'https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/2x.webp', description: 'Chad supremo.', rarity: 'legendary' },
  { id: 'emote_l_alien', name: 'modCheck', type: ItemType.EMOTE, price: 20000, value: 'https://cdn.betterttv.net/emote/5efe0ba9f0f3e92023f62a55/2x.webp', description: 'Cadê os mods?', rarity: 'legendary' },



  // ================= ENTRY EFFECTS =================
  // Efeitos visuais quando o jogador entra no lobby (GIFs animados)

  // UNCOMMON
  { id: 'entry_u_spark', name: 'Faíscas', type: ItemType.ENTRY_EFFECT, price: 800, value: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', description: 'Entrada com faíscas.', rarity: 'uncommon' },
  { id: 'entry_u_smoke', name: 'Fumaça', type: ItemType.ENTRY_EFFECT, price: 900, value: 'https://media.giphy.com/media/l0HlPtbGpcnqa0FY4/giphy.gif', description: 'Entrada misteriosa.', rarity: 'uncommon' },

  // RARE
  { id: 'entry_r_fire', name: 'Chamas', type: ItemType.ENTRY_EFFECT, price: 2500, value: 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif', description: 'Entrada flamejante.', rarity: 'rare' },
  { id: 'entry_r_ice', name: 'Gelo', type: ItemType.ENTRY_EFFECT, price: 2500, value: 'https://media.giphy.com/media/3o6Zt4sLJr5qBC86hG/giphy.gif', description: 'Entrada congelante.', rarity: 'rare' },
  { id: 'entry_r_thunder', name: 'Trovão', type: ItemType.ENTRY_EFFECT, price: 3000, value: 'https://media.giphy.com/media/3o85xvmwXbeXlqdXGM/giphy.gif', description: 'Entrada elétrica.', rarity: 'rare' },

  // EPIC
  { id: 'entry_e_portal', name: 'Portal', type: ItemType.ENTRY_EFFECT, price: 6000, value: 'https://media.giphy.com/media/l4FGjNNQaJEMPhkCQ/giphy.gif', description: 'Surge de um portal.', rarity: 'epic' },
  { id: 'entry_e_glitch', name: 'Glitch', type: ItemType.ENTRY_EFFECT, price: 7000, value: 'https://media.giphy.com/media/26tPo9rksWnfPo4HS/giphy.gif', description: 'Entrada bugada.', rarity: 'epic' },
  { id: 'entry_e_matrix', name: 'Matrix', type: ItemType.ENTRY_EFFECT, price: 8000, value: 'https://media.giphy.com/media/4TkKzIZg1VJja/giphy.gif', description: 'Código verde.', rarity: 'epic' },

  // LEGENDARY
  { id: 'entry_l_explosion', name: 'Explosão', type: ItemType.ENTRY_EFFECT, price: 20000, value: 'https://media.giphy.com/media/oe33xf3B50fsc/giphy.gif', description: 'BOOM! Chegou.', rarity: 'legendary' },
  { id: 'entry_l_rainbow', name: 'Arco-Íris', type: ItemType.ENTRY_EFFECT, price: 25000, value: 'https://media.giphy.com/media/SKGo6OYe24EBG/giphy.gif', description: 'Espectro completo.', rarity: 'legendary' },
  { id: 'entry_l_divine', name: 'Divino', type: ItemType.ENTRY_EFFECT, price: 40000, value: 'https://media.giphy.com/media/3oz8xNi7HBbpEtg3cc/giphy.gif', description: 'Luz celestial.', rarity: 'legendary' },


  // ================= THEMED BUNDLES - CS2 =================

  { id: 'cs2_border_awp', name: 'AWP Dragon Lore', type: ItemType.BORDER, price: 8000, value: 'border-yellow-500 shadow-[0_0_20px_#eab308] border-double', description: 'Inspirado na skin lendária.', rarity: 'epic' },
  { id: 'cs2_border_knife', name: 'Karambit Fade', type: ItemType.BORDER, price: 12000, value: 'border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 p-[3px]', description: 'Gradiente de faca.', rarity: 'legendary' },
  { id: 'cs2_title_faceit', name: 'FACEIT 10', type: ItemType.TITLE, price: 5000, value: '🟠 FACEIT 10', description: 'Nível máximo.', rarity: 'epic' },
  { id: 'cs2_title_major', name: 'Major Winner', type: ItemType.TITLE, price: 15000, value: '🏆 Major Winner', description: 'Campeão de Major.', rarity: 'legendary' },
  { id: 'cs2_color_ct', name: 'CT Blue', type: ItemType.NAME_COLOR, price: 3000, value: 'text-blue-400 font-bold', description: 'Azul Counter-Terrorist.', rarity: 'rare' },
  { id: 'cs2_color_t', name: 'T Orange', type: ItemType.NAME_COLOR, price: 3000, value: 'text-orange-400 font-bold', description: 'Laranja Terrorist.', rarity: 'rare' },
  // Banner items removed

  // ================= THEMED BUNDLES - VALORANT =================

  { id: 'val_border_radiant', name: 'Radiant Glow', type: ItemType.BORDER, price: 10000, value: 'border-yellow-300 shadow-[0_0_25px_#fde047] animate-pulse', description: 'Brilho Radiante.', rarity: 'epic' },
  { id: 'val_border_reaver', name: 'Reaver', type: ItemType.BORDER, price: 8000, value: 'border-purple-900 shadow-[0_0_15px_#581c87]', description: 'Energia sombria.', rarity: 'epic' },
  { id: 'val_title_immo', name: 'Immortal', type: ItemType.TITLE, price: 4000, value: '💀 Immortal', description: 'Rank Immortal.', rarity: 'epic' },
  { id: 'val_title_radiant', name: 'Radiant', type: ItemType.TITLE, price: 12000, value: '👑 Radiant', description: 'Top 500.', rarity: 'legendary' },
  { id: 'val_color_jett', name: 'Jett Blue', type: ItemType.NAME_COLOR, price: 2500, value: 'text-cyan-300 font-bold', description: 'Azul da Jett.', rarity: 'rare' },
  { id: 'val_color_reyna', name: 'Reyna Purple', type: ItemType.NAME_COLOR, price: 2500, value: 'text-purple-400 font-bold', description: 'Roxo da Reyna.', rarity: 'rare' },
  // Banner items removed

  // ================= THEMED BUNDLES - LEAGUE OF LEGENDS =================

  { id: 'lol_border_challenger', name: 'Challenger', type: ItemType.BORDER, price: 15000, value: 'border-cyan-400 shadow-[0_0_30px_#22d3ee] animate-pulse border-double', description: 'Elite do LoL.', rarity: 'legendary' },
  { id: 'lol_border_grandmaster', name: 'Grandmaster', type: ItemType.BORDER, price: 8000, value: 'border-red-500 shadow-[0_0_15px_#ef4444]', description: 'Quase lá.', rarity: 'epic' },
  { id: 'lol_title_penta', name: 'PENTAKILL', type: ItemType.TITLE, price: 6000, value: '⚔️ PENTAKILL', description: 'ACE no LoL.', rarity: 'epic' },
  { id: 'lol_title_otp', name: 'OTP', type: ItemType.TITLE, price: 2000, value: '🎭 OTP', description: 'One Trick Pony.', rarity: 'rare' },
  { id: 'lol_color_blue', name: 'Blue Side', type: ItemType.NAME_COLOR, price: 2000, value: 'text-blue-500 font-bold', description: 'Lado azul.', rarity: 'rare' },
  { id: 'lol_color_red', name: 'Red Side', type: ItemType.NAME_COLOR, price: 2000, value: 'text-red-500 font-bold', description: 'Lado vermelho.', rarity: 'rare' }
];

export const POSITIVE_TAGS: Tag[] = [
  { id: 't1', label: 'Líder Nato', type: TagType.POSITIVE, description: 'Organizou o time e fez chamadas claras' },
  { id: 't2', label: 'Chill / Zen', type: TagType.POSITIVE, description: 'Manteve a calma mesmo perdendo' },
  { id: 't3', label: 'Mentor', type: TagType.POSITIVE, description: 'Ensinou mecânicas sem ser arrogante' },
  { id: 't4', label: 'Salvador', type: TagType.POSITIVE, description: 'Jogou muito e carregou o time' },
];

export const NEGATIVE_TAGS: Tag[] = [
  { id: 't5', label: 'Rage', type: TagType.NEGATIVE, description: 'Gritou ou xingou no chat/voz' },
  { id: 't6', label: 'Tóxico', type: TagType.NEGATIVE, description: 'Comentários ofensivos ou preconceituosos' },
  { id: 't7', label: 'Fominha', type: TagType.NEGATIVE, description: 'Jogou sozinho, ignorou o time' },
  { id: 't8', label: 'AFK / Quit', type: TagType.NEGATIVE, description: 'Saiu da partida ou ficou ausente' },
];

// CLEANED: No fake matches
export const MOCK_MATCHES: Match[] = [];

// MOCK SHERPAS - Cleared for production
export const MOCK_SHERPAS: SherpaProfile[] = [];

export const RADAR_DATA = [
  { subject: 'Liderança', A: 90, fullMark: 100 },
  { subject: 'Comunicação', A: 85, fullMark: 100 },
  { subject: 'Skill', A: 70, fullMark: 100 },
  { subject: 'Paciência', A: 95, fullMark: 100 },
  { subject: 'Teamwork', A: 88, fullMark: 100 },
  { subject: 'Resiliência', A: 80, fullMark: 100 },
];
