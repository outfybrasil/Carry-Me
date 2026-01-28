
import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, Loader2, ExternalLink, ShieldCheck, Coins, Copy, Terminal, Shield } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemTitle: string;
    price: number;
    type?: 'PREMIUM' | 'COINS';
}

const COIN_PACKS = [
    { coins: 100, price: 4.90, label: 'PUNHADO_DE_COINS' },
    { coins: 500, price: 14.90, label: 'BOLSA_DE_COINS', popular: true },
    { coins: 1000, price: 25.00, label: 'BAU_DE_COINS', bestValue: true },
    { coins: 2500, price: 55.00, label: 'COFRE_DE_COINS' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, itemTitle, price, type }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'redirecting' | 'pix_display' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedPack, setSelectedPack] = useState<{ coins: number, price: number, label: string } | null>(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64: string } | null>(null);
    const [copiedPix, setCopiedPix] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
            setPaymentUrl('');
            setPixData(null);
            setIsChecking(false);
            if (type === 'COINS') {
                const defaultPack = COIN_PACKS.find(p => p.coins === 1000);
                setSelectedPack(defaultPack || COIN_PACKS[2]);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const channel = supabase.channel('payment_listener')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
                    const newProfile = payload.new as any;
                    const oldProfile = payload.old as any;
                    if (newProfile.coins > oldProfile.coins || (newProfile.is_premium && !oldProfile.is_premium)) {
                        setStatus('success');
                        setTimeout(() => onSuccess(), 2000);
                    }
                }
                ).subscribe();
            return () => { supabase.removeChannel(channel); };
        };
        checkUser();
    }, [isOpen, onSuccess]);

    useEffect(() => {
        if ((status !== 'pix_display' && status !== 'redirecting') || !isOpen) return;
        const checkPayment = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: recentTx } = await supabase.from('transactions').select('id').eq('user_id', user.id).eq('status', 'approved').gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()).maybeSingle();
            if (recentTx) { setStatus('success'); setTimeout(() => onSuccess(), 2000); }
        };
        const interval = setInterval(checkPayment, 5000);
        return () => clearInterval(interval);
    }, [status, isOpen, onSuccess]);

    const handleManualCheck = async () => {
        setIsChecking(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: recentTx } = await supabase.from('transactions').select('id').eq('user_id', user.id).eq('status', 'approved').gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()).maybeSingle();
            if (recentTx) { setStatus('success'); setTimeout(() => onSuccess(), 2000); }
        }
        setTimeout(() => setIsChecking(false), 2000);
    };

    const handleMercadoPagoCheckout = async (method: 'ALL' | 'PIX' = 'ALL') => {
        setStatus('loading');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const finalTitle = type === 'COINS' && selectedPack ? `${selectedPack.coins} CarryCoins` : itemTitle;
        const finalPrice = type === 'COINS' && selectedPack ? selectedPack.price : price;
        const data = await api.createMercadoPagoPreference(user.id, user.email || 'user@carryme.gg', finalTitle, finalPrice, method);
        if (data) {
            if (data.type === 'PIX_DIRECT') { setPixData(data); setStatus('pix_display'); }
            else if (data.init_point) { setPaymentUrl(data.init_point); setStatus('redirecting'); window.open(data.init_point, '_blank'); }
        } else { setStatus('error'); setErrorMessage("Erro ao conectar ao Mercado Pago."); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#121417] border border-white/10 rounded-sm max-w-md w-full shadow-2xl relative overflow-hidden noise-bg">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-white rounded-sm z-20 transition-all">
                    <X size={20} />
                </button>

                <div className="h-40 bg-black/40 relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Shield size={120} /></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#ffb800] rounded-sm flex items-center justify-center shadow-2xl border border-black/20">
                            <img src="https://img.icons8.com/color/96/mercado-pago.png" alt="MP" className="w-12 h-12 grayscale contrast-125" />
                        </div>
                        <div className="mt-4 text-[10px] font-mono font-black text-[#ffb800] uppercase tracking-[0.4em]">CHECKOUT_SEGURO</div>
                    </div>
                </div>

                <div className="p-10 text-center">
                    <h2 className="text-2xl font-tactical font-black text-white mb-2 uppercase italic tracking-tighter">
                        {type === 'COINS' && selectedPack ? `${selectedPack.coins} CARRY_COINS` : itemTitle}
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-slate-700 mb-10 uppercase tracking-widest">AUTORIZACAO_REQUERIDA // MP_GATEWAY</p>

                    <div className="bg-black/40 rounded-sm p-6 border border-white/5 mb-10 flex justify-between items-center shadow-inner">
                        <div className="text-left">
                            <p className="text-[8px] font-mono font-black text-slate-700 uppercase tracking-widest mb-1">MONANTE_TOTAL</p>
                            <p className="text-3xl font-mono font-black text-[#ffb800]">R$ {(type === 'COINS' && selectedPack ? selectedPack.price : price).toFixed(2)}</p>
                        </div>
                        <div className="bg-[#ffb800]/5 px-3 py-1.5 rounded-sm border border-[#ffb800]/20">
                            <span className="text-[9px] font-mono font-black text-[#ffb800] flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck size={12} /> ENCRYPTED
                            </span>
                        </div>
                    </div>

                    {type === 'COINS' && status === 'idle' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {COIN_PACKS.map(pack => (
                                <button
                                    key={pack.coins}
                                    onClick={() => setSelectedPack(pack)}
                                    className={`p-4 rounded-sm border text-left transition-all relative ${selectedPack?.coins === pack.coins ? 'bg-[#ffb800]/10 border-[#ffb800] shadow-[0_0_20px_rgba(255,184,0,0.05)]' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                                >
                                    {pack.popular && <span className="absolute -top-2 -right-2 bg-[#ffb800] text-black text-[8px] font-mono font-black px-2 py-0.5 rounded-sm">POPULAR</span>}
                                    <div className="flex items-center gap-3 mb-2">
                                        <Coins size={14} className="text-[#ffb800]" />
                                        <span className="font-mono font-black text-white text-sm tracking-widest uppercase">{pack.coins}</span>
                                    </div>
                                    <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">R$ {pack.price.toFixed(2)}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => handleMercadoPagoCheckout('ALL')}
                                className="w-full py-5 bg-[#ffb800] hover:bg-[#ffc933] text-black font-tactical font-black text-lg uppercase italic tracking-widest rounded-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
                            >
                                <ExternalLink size={20} /> ENVIAR_PARA_CHECKOUT
                            </button>

                            <button
                                onClick={() => handleMercadoPagoCheckout('PIX')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-mono font-black text-[10px] uppercase tracking-[0.3em] rounded-sm transition-all flex items-center justify-center gap-4 border border-white/10"
                            >
                                <img src="https://img.icons8.com/color/48/pix.png" className="w-5 h-5 grayscale" alt="Pix" />
                                SOLICITAR_QR_PIX
                            </button>
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="py-10">
                            <div className="w-12 h-12 border-2 border-white/5 border-t-[#ffb800] rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-[0.4em]">GERANDO_PROTOCOLO...</p>
                        </div>
                    )}

                    {status === 'pix_display' && pixData && (
                        <div className="py-6 animate-in zoom-in">
                            <h3 className="text-xl font-tactical font-black text-white mb-2 uppercase italic tracking-tighter">IDENTIFICACAO_PIX</h3>
                            <p className="text-[10px] font-mono font-bold text-slate-700 mb-8 uppercase tracking-widest">ESCANEIE_PARA_CONCLUIR</p>

                            <div className="bg-white p-3 rounded-sm w-48 h-48 mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR" className="w-full h-full" />
                            </div>

                            <div className="bg-black/60 p-4 rounded-sm border border-white/5 flex items-center gap-4 mb-8">
                                <input type="text" readOnly value={pixData.qr_code} className="bg-transparent text-[10px] font-mono font-black text-slate-600 flex-1 outline-none truncate uppercase tracking-widest" />
                                <button onClick={handleCopyPix} className="text-[#ffb800] hover:text-[#ffc933] transition-colors p-1">
                                    {copiedPix ? <CheckCircle size={18} /> : <Copy size={18} />}
                                </button>
                            </div>

                            <button onClick={handleManualCheck} disabled={isChecking} className="text-[9px] font-mono font-black text-[#ffb800] uppercase tracking-[0.4em] hover:text-[#ffc933] transition-all flex items-center justify-center gap-3 w-full">
                                {isChecking ? <><Loader2 size={12} className="animate-spin" /> VERIFICANDO</> : 'JA_PAGUEI_VERIFICAR'}
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-10 animate-in zoom-in">
                            <div className="w-20 h-20 bg-green-500/10 rounded-sm flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-tactical font-black text-white mb-2 uppercase italic tracking-tighter">TRANSACAO_AUTORIZADA</h3>
                            <p className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest">CREDITO_DISPONIBILIZADO_IMEDIATAMENTE</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-10 animate-in shake">
                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-sm text-[10px] font-mono font-black text-red-500 uppercase tracking-widest mb-6">
                                {errorMessage}
                            </div>
                            <button onClick={() => setStatus('idle')} className="text-slate-800 hover:text-white text-[10px] font-mono font-black uppercase tracking-[0.4em] transition-colors underline">
                                RETENTAR_SISTEMA
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-black/60 p-6 border-t border-white/5 flex justify-center gap-8 opacity-20 hover:opacity-100 transition-all grayscale contrast-150">
                    <img src="https://img.icons8.com/color/48/pix.png" className="h-6" alt="Pix" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6" alt="MC" />
                    <img src="https://img.icons8.com/color/48/visa.png" className="h-6" alt="V" />
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
