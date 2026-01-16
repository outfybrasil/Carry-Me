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

  // ================= BANNERS =================

  // COMMON (10)
  { id: 'banner_c_slate', name: 'Slate Wall', type: ItemType.BANNER, price: 100, value: 'bg-slate-800', description: 'Parede cinza.', rarity: 'common' },
  { id: 'banner_c_zinc', name: 'Zinc Plate', type: ItemType.BANNER, price: 150, value: 'bg-zinc-800', description: 'Placa de zinco.', rarity: 'common' },
  { id: 'banner_c_red', name: 'Red Cloth', type: ItemType.BANNER, price: 200, value: 'bg-red-900', description: 'Tecido vermelho.', rarity: 'common' },
  { id: 'banner_c_blue', name: 'Blue Sea', type: ItemType.BANNER, price: 200, value: 'bg-blue-900', description: 'Mar azul.', rarity: 'common' },
  { id: 'banner_c_green', name: 'Green Field', type: ItemType.BANNER, price: 200, value: 'bg-green-900', description: 'Campo verde.', rarity: 'common' },
  { id: 'banner_c_purple', name: 'Purple Haze', type: ItemType.BANNER, price: 250, value: 'bg-purple-900', description: 'Névoa roxa.', rarity: 'common' },
  { id: 'banner_c_orange', name: 'Orange Sky', type: ItemType.BANNER, price: 250, value: 'bg-orange-900', description: 'Céu laranja.', rarity: 'common' },
  { id: 'banner_c_teal', name: 'Teal Deep', type: ItemType.BANNER, price: 250, value: 'bg-teal-900', description: 'Profundezas.', rarity: 'common' },
  { id: 'banner_c_dark', name: 'Darkness', type: ItemType.BANNER, price: 300, value: 'bg-black', description: 'Escuridão.', rarity: 'common' },
  { id: 'banner_c_light', name: 'Lightness', type: ItemType.BANNER, price: 300, value: 'bg-slate-200', description: 'Luz.', rarity: 'common' },

  // UNCOMMON (10)
  { id: 'banner_u_grad_blue', name: 'Blue Gradient', type: ItemType.BANNER, price: 600, value: 'bg-gradient-to-br from-blue-900 to-blue-800', description: 'Gradiente azul.', rarity: 'uncommon' },
  { id: 'banner_u_grad_red', name: 'Red Gradient', type: ItemType.BANNER, price: 600, value: 'bg-gradient-to-br from-red-900 to-red-800', description: 'Gradiente vermelho.', rarity: 'uncommon' },
  { id: 'banner_u_grad_green', name: 'Green Gradient', type: ItemType.BANNER, price: 600, value: 'bg-gradient-to-br from-green-900 to-green-800', description: 'Gradiente verde.', rarity: 'uncommon' },
  { id: 'banner_u_grad_purple', name: 'Purple Gradient', type: ItemType.BANNER, price: 700, value: 'bg-gradient-to-br from-purple-900 to-purple-800', description: 'Gradiente roxo.', rarity: 'uncommon' },
  { id: 'banner_u_grad_orange', name: 'Orange Gradient', type: ItemType.BANNER, price: 700, value: 'bg-gradient-to-br from-orange-900 to-orange-800', description: 'Gradiente laranja.', rarity: 'uncommon' },
  { id: 'banner_u_grad_teal', name: 'Teal Gradient', type: ItemType.BANNER, price: 700, value: 'bg-gradient-to-br from-teal-900 to-teal-800', description: 'Gradiente ciano.', rarity: 'uncommon' },
  { id: 'banner_u_grad_grey', name: 'Grey Gradient', type: ItemType.BANNER, price: 800, value: 'bg-gradient-to-br from-slate-900 to-slate-700', description: 'Gradiente cinza.', rarity: 'uncommon' },
  { id: 'banner_u_grad_zinc', name: 'Zinc Gradient', type: ItemType.BANNER, price: 800, value: 'bg-gradient-to-br from-zinc-900 to-zinc-700', description: 'Gradiente de zinco.', rarity: 'uncommon' },
  { id: 'banner_u_grad_stone', name: 'Stone Gradient', type: ItemType.BANNER, price: 900, value: 'bg-gradient-to-br from-stone-900 to-stone-700', description: 'Gradiente de pedra.', rarity: 'uncommon' },
  { id: 'banner_u_grad_neutral', name: 'Neutral Gradient', type: ItemType.BANNER, price: 900, value: 'bg-gradient-to-br from-neutral-900 to-neutral-700', description: 'Gradiente neutro.', rarity: 'uncommon' },

  // RARE (10)
  { id: 'banner_r_night_sky', name: 'Night Sky', type: ItemType.BANNER, price: 2000, value: 'bg-gradient-to-b from-slate-900 to-blue-900', description: 'Céu noturno.', rarity: 'rare' },
  { id: 'banner_r_forest', name: 'Deep Forest', type: ItemType.BANNER, price: 2000, value: 'bg-gradient-to-b from-green-900 to-emerald-950', description: 'Floresta densa.', rarity: 'rare' },
  { id: 'banner_r_volcano', name: 'Volcano', type: ItemType.BANNER, price: 2200, value: 'bg-gradient-to-t from-red-900 to-orange-900', description: 'Vulcão ativo.', rarity: 'rare' },
  { id: 'banner_r_ocean', name: 'Abyss', type: ItemType.BANNER, price: 2200, value: 'bg-gradient-to-b from-blue-900 to-black', description: 'O abismo.', rarity: 'rare' },
  { id: 'banner_r_royal', name: 'Royal Hall', type: ItemType.BANNER, price: 2500, value: 'bg-gradient-to-r from-purple-900 to-red-900', description: 'Salão real.', rarity: 'rare' },
  { id: 'banner_r_cyber', name: 'Cyber Grid', type: ItemType.BANNER, price: 2800, value: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black', description: 'Rede cibernética.', rarity: 'rare' },
  { id: 'banner_r_sunrise', name: 'Sunrise', type: ItemType.BANNER, price: 3000, value: 'bg-gradient-to-t from-orange-500 to-blue-400', description: 'Nascer do sol.', rarity: 'rare' },
  { id: 'banner_r_toxic', name: 'Wasteland', type: ItemType.BANNER, price: 3200, value: 'bg-gradient-to-r from-green-900 to-yellow-900', description: 'Terra devastada.', rarity: 'rare' },
  { id: 'banner_r_candy', name: 'Candy Land', type: ItemType.BANNER, price: 3500, value: 'bg-gradient-to-r from-pink-300 to-blue-300', description: 'Terra dos doces.', rarity: 'rare' },
  { id: 'banner_r_gold', name: 'Gold Bullion', type: ItemType.BANNER, price: 4000, value: 'bg-gradient-to-b from-yellow-600 to-yellow-800', description: 'Barra de ouro.', rarity: 'rare' },

  // EPIC (10)
  { id: 'banner_e_vaporwave', name: 'Vaporwave', type: ItemType.BANNER, price: 5000, value: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500', description: 'Estética vaporwave.', rarity: 'epic' },
  { id: 'banner_e_synthwave', name: 'Synthwave', type: ItemType.BANNER, price: 5500, value: 'bg-gradient-to-b from-purple-900 via-pink-800 to-yellow-600', description: 'Retrofuturismo.', rarity: 'epic' },
  { id: 'banner_e_northern', name: 'Northern Lights', type: ItemType.BANNER, price: 6000, value: 'bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600', description: 'Aurora.', rarity: 'epic' },
  { id: 'banner_e_galaxy', name: 'Galaxy', type: ItemType.BANNER, price: 6500, value: 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600', description: 'Espaço profundo.', rarity: 'epic' },
  { id: 'banner_e_fire', name: 'Inferno', type: ItemType.BANNER, price: 7000, value: 'bg-gradient-to-t from-yellow-500 via-red-500 to-black', description: 'Inferno.', rarity: 'epic' },
  { id: 'banner_e_ice', name: 'Glacier', type: ItemType.BANNER, price: 7500, value: 'bg-gradient-to-b from-white via-cyan-200 to-blue-500', description: 'Geleira.', rarity: 'epic' },
  { id: 'banner_e_magic', name: 'Arcane', type: ItemType.BANNER, price: 8000, value: 'bg-gradient-to-bl from-fuchsia-600 via-purple-600 to-pink-600', description: 'Magia arcana.', rarity: 'epic' },
  { id: 'banner_e_jungle', name: 'Amazon', type: ItemType.BANNER, price: 8500, value: 'bg-gradient-to-tr from-emerald-900 via-green-600 to-lime-500', description: 'Selva.', rarity: 'epic' },
  { id: 'banner_e_desert', name: 'Sahara', type: ItemType.BANNER, price: 9000, value: 'bg-gradient-to-tl from-orange-500 via-yellow-500 to-red-500', description: 'Deserto.', rarity: 'epic' },
  { id: 'banner_e_void', name: 'The Void', type: ItemType.BANNER, price: 9500, value: 'bg-gradient-to-br from-black via-purple-950 to-black', description: 'O vazio.', rarity: 'epic' },

  // LEGENDARY (10)
  { id: 'banner_l_rainbow', name: 'Rainbow Flow', type: ItemType.BANNER, price: 15000, value: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500', description: 'Fluxo de arco-íris.', rarity: 'legendary' },
  { id: 'banner_l_hologram', name: 'Hologram', type: ItemType.BANNER, price: 18000, value: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-80', description: 'Holograma.', rarity: 'legendary' },
  { id: 'banner_l_gold_rush', name: 'Midas Kingdom', type: ItemType.BANNER, price: 20000, value: 'bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800', description: 'Reino dourado.', rarity: 'legendary' },
  { id: 'banner_l_nebula', name: 'Nebula Cloud', type: ItemType.BANNER, price: 25000, value: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500', description: 'Nebulosa.', rarity: 'legendary' },
  { id: 'banner_l_cyberpunk', name: 'Night City', type: ItemType.BANNER, price: 30000, value: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-500', description: 'Cidade noturna.', rarity: 'legendary' },
  { id: 'banner_l_plasma', name: 'Plasma Storm', type: ItemType.BANNER, price: 35000, value: 'bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500', description: 'Tempestade de plasma.', rarity: 'legendary' },
  { id: 'banner_l_matrix', name: 'System Core', type: ItemType.BANNER, price: 40000, value: 'bg-gradient-to-b from-black via-green-900 to-black', description: 'Núcleo do sistema.', rarity: 'legendary' },
  { id: 'banner_l_divine', name: 'Heaven', type: ItemType.BANNER, price: 45000, value: 'bg-gradient-to-b from-blue-200 via-white to-blue-200', description: 'Paraíso.', rarity: 'legendary' },
  { id: 'banner_l_hell', name: 'Underworld', type: ItemType.BANNER, price: 48000, value: 'bg-gradient-to-t from-red-900 via-black to-red-900', description: 'Submundo.', rarity: 'legendary' },
  { id: 'banner_l_gm', name: 'Developer', type: ItemType.BANNER, price: 50000, value: 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-2 border-white/20', description: 'Acesso de desenvolvedor.', rarity: 'legendary' }
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

// CLEANED: No fake sherpas
export const MOCK_SHERPAS: SherpaProfile[] = [];

export const RADAR_DATA = [
  { subject: 'Liderança', A: 90, fullMark: 100 },
  { subject: 'Comunicação', A: 85, fullMark: 100 },
  { subject: 'Skill', A: 70, fullMark: 100 },
  { subject: 'Paciência', A: 95, fullMark: 100 },
  { subject: 'Teamwork', A: 88, fullMark: 100 },
  { subject: 'Resiliência', A: 80, fullMark: 100 },
];
