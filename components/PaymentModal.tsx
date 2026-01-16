import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, Loader2, ExternalLink, ShieldCheck, Coins, Copy } from 'lucide-react';
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
  { coins: 100, price: 4.90, label: 'Punhado de Moedas' },
  { coins: 500, price: 14.90, label: 'Bolsa de Moedas', popular: true },
  { coins: 1000, price: 25.00, label: 'Baú de Moedas', bestValue: true },
  { coins: 2500, price: 55.00, label: 'Cofre de Moedas' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, itemTitle, price, type }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'redirecting' | 'pix_display' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPack, setSelectedPack] = useState<{coins: number, price: number, label: string} | null>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [pixData, setPixData] = useState<{qr_code: string, qr_code_base64: string} | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
      setPaymentUrl('');
      setPixData(null);
      setIsChecking(false);
      
      // Se for compra de moedas, seleciona o pacote padrão (1000) ou reseta
      if (type === 'COINS') {
          const defaultPack = COIN_PACKS.find(p => p.coins === 1000);
          setSelectedPack(defaultPack || COIN_PACKS[2]);
      }
    }
  }, [isOpen]);

  // --- LISTEN FOR PAYMENT SUCCESS (Realtime) ---
  useEffect(() => {
      if (!isOpen) return;

      const checkUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if(!user) return;

          const channel = supabase.channel('payment_listener')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    const newProfile = payload.new as any;
                    const oldProfile = payload.old as any;
                    
                    if (newProfile.coins > oldProfile.coins || (newProfile.is_premium && !oldProfile.is_premium)) {
                        setStatus('success');
                        setTimeout(() => {
                            onSuccess(); 
                        }, 2000);
                    }
                }
            )
            .subscribe();

          return () => {
              supabase.removeChannel(channel);
          };
      };
      
      checkUser();
  }, [isOpen, onSuccess]);

  // --- POLLING FALLBACK (Verificação Automática) ---
  useEffect(() => {
      if ((status !== 'pix_display' && status !== 'redirecting') || !isOpen) return;

      const checkPayment = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Verifica se existe uma transação aprovada nos últimos 10 minutos
          const { data: recentTx } = await supabase.from('transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
            .maybeSingle();

          if (recentTx) {
              setStatus('success');
              setTimeout(() => {
                  onSuccess();
              }, 2000);
          }
      };

      const interval = setInterval(checkPayment, 5000); // Verifica a cada 5 segundos
      return () => clearInterval(interval);
  }, [status, isOpen, onSuccess]);

  const handleManualCheck = async () => {
      setIsChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: recentTx } = await supabase.from('transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
            .maybeSingle();
          
          if (recentTx) {
              setStatus('success');
              setTimeout(() => onSuccess(), 2000);
          }
      }
      setTimeout(() => setIsChecking(false), 2000);
  };

  const handleMercadoPagoCheckout = async (method: 'ALL' | 'PIX' = 'ALL') => {
    setStatus('loading');
    setErrorMessage('');
    
    const { data: { user } } = await supabase.auth.getUser(); // Pega o usuário atual
    if(!user) return;

    const finalTitle = type === 'COINS' && selectedPack ? `${selectedPack.coins} CarryCoins` : itemTitle;
    const finalPrice = type === 'COINS' && selectedPack ? selectedPack.price : price;

    // Call Backend
    const data = await api.createMercadoPagoPreference(user.id, user.email || 'user@carryme.gg', finalTitle, finalPrice, method);
    
    if (data) {
      if (data.type === 'PIX_DIRECT') {
          setPixData(data);
          setStatus('pix_display');
      } else if (data.init_point) {
          setPaymentUrl(data.init_point);
          setStatus('redirecting');
          window.open(data.init_point, '_blank');
      }
    } else {
      setStatus('error');
      setErrorMessage("Não foi possível conectar ao Mercado Pago. Verifique se o Access Token está configurado corretamente na Edge Function.");
    }
  };

  const handleCopyPix = () => {
      if (pixData?.qr_code) {
          navigator.clipboard.writeText(pixData.qr_code);
          setCopiedPix(true);
          setTimeout(() => setCopiedPix(false), 2000);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-20 transition-all backdrop-blur-sm">
          <X size={20} />
        </button>

        {/* Header Image / Gradient */}
        <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
            
            <div className="relative z-10 text-center transform translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-2 rotate-3">
                    <img src="https://img.icons8.com/color/96/mercado-pago.png" alt="MP" className="w-10 h-10" />
                </div>
            </div>
        </div>

        <div className="px-8 pb-8 pt-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{type === 'COINS' && selectedPack ? `${selectedPack.coins} CarryCoins` : itemTitle}</h2>
            <p className="text-slate-400 text-sm mb-6">Finalize sua compra com segurança.</p>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-8 flex justify-between items-center">
                <div className="text-left">
                    <p className="text-xs text-slate-500 uppercase font-bold">Total a Pagar</p>
                    <p className="text-2xl font-mono font-bold text-white">R$ {(type === 'COINS' && selectedPack ? selectedPack.price : price).toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                        <ShieldCheck size={12} /> Seguro
                    </span>
                </div>
            </div>

            {/* COIN SELECTION GRID */}
            {type === 'COINS' && status === 'idle' && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {COIN_PACKS.map(pack => (
                        <button
                            key={pack.coins}
                            onClick={() => setSelectedPack(pack)}
                            className={`p-3 rounded-xl border text-left transition-all relative ${selectedPack?.coins === pack.coins ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                        >
                            {pack.popular && <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                            {pack.bestValue && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">MELHOR</span>}
                            
                            <div className="flex items-center gap-2 mb-1">
                                <Coins size={14} className="text-yellow-500" />
                                <span className="font-bold text-white text-sm">{pack.coins}</span>
                            </div>
                            <div className="text-xs text-slate-400">R$ {pack.price.toFixed(2).replace('.', ',')}</div>
                        </button>
                    ))}
                </div>
            )}

            {status === 'idle' && (
                <div className="space-y-3">
                    <button 
                        onClick={() => handleMercadoPagoCheckout('ALL')}
                        className="w-full py-4 bg-[#009EE3] hover:bg-[#008CC9] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Pagar com Mercado Pago <ExternalLink size={18} />
                        </span>
                    </button>

                    <button 
                        onClick={() => handleMercadoPagoCheckout('PIX')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <img src="https://img.icons8.com/color/48/pix.png" className="w-5 h-5" alt="Pix" />
                        Pagar via Pix (Instantâneo)
                    </button>
                    <p className="text-[10px] text-slate-500">
                        Aceitamos Pix, Cartão de Crédito e Débito.
                    </p>
                </div>
            )}

            {status === 'loading' && (
                <div className="py-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">Gerando link de pagamento...</p>
                </div>
            )}

            {status === 'redirecting' && (
                <div className="py-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-ping">
                        <ExternalLink className="text-white" size={20} />
                    </div>
                    <p className="text-slate-300 font-medium">Pagamento aberto em nova aba...</p>
                    <p className="text-xs text-slate-500 mt-2 mb-2">Aguardando confirmação automática.</p>
                    {paymentUrl && (
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:text-blue-300 underline">
                            Clique aqui se a janela não abriu
                        </a>
                    )}
                </div>
            )}

            {status === 'pix_display' && pixData && (
                <div className="py-4 animate-in zoom-in">
                    <h3 className="text-lg font-bold text-white mb-2">Escaneie o QR Code</h3>
                    <p className="text-xs text-slate-400 mb-4">Abra o app do seu banco e pague via Pix.</p>
                    
                    <div className="bg-white p-2 rounded-xl w-48 h-48 mx-auto mb-4">
                        <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-full h-full" />
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2 mb-4">
                        <input 
                            type="text" 
                            readOnly 
                            value={pixData.qr_code} 
                            className="bg-transparent text-xs text-slate-500 flex-1 outline-none truncate"
                        />
                        <button onClick={handleCopyPix} className="text-blue-400 hover:text-white transition-colors">
                            {copiedPix ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-yellow-500 animate-pulse mb-4">
                        <Loader2 size={12} className="animate-spin" /> Aguardando pagamento...
                    </div>

                    <button 
                        onClick={handleManualCheck}
                        disabled={isChecking}
                        className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-50 w-full text-center"
                    >
                        {isChecking ? 'Verificando...' : 'Já paguei, verificar agora'}
                    </button>
                </div>
            )}

            {status === 'success' && (
                <div className="py-4 animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Pagamento Confirmado!</h3>
                    <p className="text-slate-400 text-sm">Suas moedas foram adicionadas.</p>
                </div>
            )}

            {status === 'error' && (
                <div className="py-4 animate-in shake">
                    <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 text-sm mb-4">
                        {errorMessage}
                    </div>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="text-slate-400 hover:text-white text-sm underline"
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}
        </div>
        
        {/* Footer Trust Badges */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <img src="https://img.icons8.com/color/48/pix.png" className="h-6" alt="Pix" />
            <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6" alt="Mastercard" />
            <img src="https://img.icons8.com/color/48/visa.png" className="h-6" alt="Visa" />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
