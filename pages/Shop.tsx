import React, { useState } from 'react';
import { STORE_ITEMS } from '../constants';
import { ItemType, Player, StoreItem, Clan } from '../types';
import { Coins, Lock, Check, Plus, Filter, Gift, Eye } from 'lucide-react';
import GiftModal from '../components/GiftModal';
import ItemPreviewModal from '../components/shop/ItemPreviewModal';
import { api } from '../services/api';

interface ShopProps {
  user: Player;
  onBuy: (item: StoreItem) => void;
  onAddCoins: () => void;
}

const Shop: React.FC<ShopProps> = ({ user, onBuy, onAddCoins }) => {
  const [activeTab, setActiveTab] = useState<ItemType>(ItemType.BORDER);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [hideOwned, setHideOwned] = useState(false);
  const [giftItem, setGiftItem] = useState<StoreItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [userClan, setUserClan] = useState<Clan | null>(null);

  React.useEffect(() => {
    if (user.clanId) {
      api.getClan(user.clanId).then(setUserClan).catch(console.error);
    }
  }, [user.clanId]);

  const filteredItems = STORE_ITEMS.filter(item => {
    const typeMatch = item.type === activeTab;
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    const ownedMatch = hideOwned ? !user.inventory.includes(item.id) : true;
    return typeMatch && rarityMatch && ownedMatch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return 'text-green-400 border-green-500/50';
      case 'rare': return 'text-blue-400 border-blue-500/50';
      case 'epic': return 'text-purple-400 border-purple-500/50';
      case 'legendary': return 'text-orange-400 border-orange-500/50';
      default: return 'text-slate-400 border-slate-700';
    }
  };

  return (
    <>
      {giftItem && (
        <GiftModal
          isOpen={true}
          onClose={() => setGiftItem(null)}
          item={giftItem}
          user={user}
        />
      )}

      {previewItem && (
        <ItemPreviewModal
          isOpen={true}
          onClose={() => setPreviewItem(null)}
          item={previewItem}
          user={user}
          userClan={userClan}
          onBuy={() => onBuy(previewItem)}
          canAfford={user.coins >= previewItem.price}
          isOwned={user.inventory.includes(previewItem.id)}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Loja de Itens</h1>
            <p className="text-slate-400">Gaste seus CarryCoins para personalizar seu perfil.</p>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-4">
            <span className="text-slate-400 text-sm font-bold uppercase hidden md:inline">Seu Saldo:</span>
            <div className="flex items-center text-yellow-400 font-bold text-xl">
              <Coins className="mr-2" size={20} />
              {user.coins}
            </div>
            <button
              onClick={onAddCoins}
              className="p-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-yellow-500/20"
              title="Comprar Moedas"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 border-b border-slate-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab(ItemType.BORDER)}
            className={`px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === ItemType.BORDER ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Bordas
          </button>
          <button
            onClick={() => setActiveTab(ItemType.NAME_COLOR)}
            className={`px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === ItemType.NAME_COLOR ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Cores
          </button>
          <button
            onClick={() => setActiveTab(ItemType.TITLE)}
            className={`px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === ItemType.TITLE ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Títulos
          </button>
          <button
            onClick={() => setActiveTab(ItemType.ENTRY_EFFECT)}
            className={`px-4 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === ItemType.ENTRY_EFFECT ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Efeitos
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter size={14} /> Filtros:
            </span>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todas as Raridades</option>
              <option value="common">Comum</option>
              <option value="uncommon">Incomum</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Lendário</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors select-none">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hideOwned ? 'bg-blue-600 border-blue-600' : 'bg-slate-950 border-slate-700'}`}>
              {hideOwned && <Check size={12} className="text-white" />}
            </div>
            <input
              type="checkbox"
              checked={hideOwned}
              onChange={(e) => setHideOwned(e.target.checked)}
              className="hidden"
            />
            Ocultar itens já adquiridos
          </label>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const isOwned = user.inventory.includes(item.id);
              const canAfford = user.coins >= item.price;
              const rarityClass = getRarityColor(item.rarity);

              return (
                <div key={item.id} className={`bg-slate-900 border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${rarityClass.split(' ')[1]}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${rarityClass}`}>
                      {item.rarity}
                    </span>
                    {isOwned && <div className="bg-green-500/20 text-green-400 p-1 rounded-full"><Check size={16} /></div>}
                  </div>

                  {/* Preview Area */}
                  <div className="h-32 bg-slate-950 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                    {item.type === ItemType.BORDER && (
                      <div className={`w-20 h-20 rounded-full border-4 ${item.value}`}>
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover opacity-80" />
                      </div>
                    )}
                    {item.type === ItemType.NAME_COLOR && (
                      <span className={`text-2xl font-bold ${item.value}`}>{user.username}</span>
                    )}

                    {item.type === ItemType.TITLE && (
                      <div className="text-center">
                        <span className="text-slate-400 text-sm">{user.username}</span>
                        <div className="text-lg font-bold text-white mt-1">{item.value}</div>
                      </div>
                    )}
                    {item.type === ItemType.EMOTE && (
                      <img
                        src={item.value}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    {item.type === ItemType.ENTRY_EFFECT && (
                      <img
                        src={item.value}
                        alt={item.name}
                        className="w-24 h-24 object-contain rounded-lg shadow-lg shadow-blue-500/20"
                      />
                    )}
                  </div>

                  <div className="mb-4 flex-1">
                    <h3 className="font-bold text-xl text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center justify-center transition-all"
                      title="Visualizar no Perfil"
                    >
                      <Eye size={20} />
                    </button>

                    {/* Buy Button */}
                    <button
                      disabled={isOwned || !canAfford}
                      onClick={() => onBuy(item)}
                      className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-all
                        ${isOwned
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : canAfford
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20'
                            : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                    >
                      {isOwned ? (
                        'Comprado'
                      ) : (
                        <>
                          {canAfford ? <Coins size={18} className="mr-2" /> : <Lock size={18} className="mr-2" />}
                          {item.price}
                        </>
                      )}
                    </button>

                    {/* Gift Button */}
                    <button
                      onClick={() => setGiftItem(item)}
                      disabled={!canAfford}
                      className={`px-3 rounded-xl font-bold flex items-center justify-center transition-all border
                        ${canAfford
                          ? 'bg-slate-800 border-slate-700 hover:bg-pink-600/10 hover:border-pink-500 hover:text-pink-500 text-slate-400'
                          : 'bg-slate-800 border-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
                        }`}
                      title="Presentear Amigo"
                    >
                      <Gift size={20} />
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
              <p>Nenhum item encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;