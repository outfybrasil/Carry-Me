import React from 'react';
import { Player, StoreItem, ItemType, Clan } from '../../types';
import PlayerIDCard from '../PlayerIDCard';
import { X, ShoppingCart } from 'lucide-react';

interface ItemPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: StoreItem;
    user: Player;
    userClan: Clan | null;
    onBuy: () => void;
    canAfford: boolean;
    isOwned: boolean;
}

const ItemPreviewModal: React.FC<ItemPreviewModalProps> = ({
    isOpen,
    onClose,
    item,
    user,
    userClan,
    onBuy,
    canAfford,
    isOwned
}) => {
    if (!isOpen) return null;

    // Create override object based on item type
    const equippedOverride = {
        border: item.type === ItemType.BORDER ? item.id : undefined,
        nameColor: item.type === ItemType.NAME_COLOR ? item.id : undefined,
        title: item.type === ItemType.TITLE ? item.id : undefined,
        entryEffect: item.type === ItemType.ENTRY_EFFECT ? item.id : undefined,
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Pré-visualização de Item</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Preview Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-[url('https://wallpaperaccess.com/full/3373204.jpg')] bg-cover bg-center relative">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                        <PlayerIDCard
                            user={user}
                            clan={userClan}
                            equippedOverride={equippedOverride}
                            isPublic={true}
                        />
                    </div>
                </div>

                {/* Item Details Footer */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 rounded-b-2xl">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            Voltar
                        </button>

                        <button
                            disabled={isOwned || !canAfford}
                            onClick={() => {
                                onBuy();
                                onClose();
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
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
                                    <ShoppingCart size={18} />
                                    {canAfford ? `Comprar por ${item.price}` : `Faltam ${item.price - user.coins}`}
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ItemPreviewModal;
