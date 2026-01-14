import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2, ExternalLink, Wallet, QrCode } from 'lucide-react';
import { api } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemTitle: string;
  price: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, itemTitle, price }) => {
  const [method, setMethod] = useState<'CARD' | 'PIX' | 'MERCADO_PAGO'>('MERCADO_PAGO');
  const [step, setStep] = useState<'form' | 'processing' | 'redirecting' | 'success'>('form');
  
  // Card State (Simulation)
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setMethod('MERCADO_PAGO'); // Default to MP as it is the real integration
      setCardNum('');
      setExpiry('');
      setCvc('');
      setCardName('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    if (method === 'MERCADO_PAGO') {
      // 1. Get the preference link from backend
      const checkoutUrl = await api.createMercadoPagoPreference(itemTitle, price);
      
      if (checkoutUrl) {
        setStep('redirecting');
        // 2. Redirect user to Mercado Pago securely
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1500); // Small delay to show the "Redirecting" UI
        return; 
      } else {
        // Fallback if backend is not set up (Demo Mode)
        console.warn("Backend function missing or failed. Running in DEMO mode.");
        setTimeout(() => {
          setStep('success');
          setTimeout(onSuccess, 1500);
        }, 2000);
      }
    } else {
      // Legacy/Demo Simulation for direct card input
      await api.processPaymentSimulation(price, method === 'CARD' ? 'CREDIT_CARD' : 'PIX');
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock size={20} /> Checkout Seguro
          </h2>
          <div className="mt-4 flex justify-between items-end border-t border-blue-400/30 pt-4">
            <div>
              <p className="text-xs uppercase opacity-70">Item</p>
              <p className="font-bold text-lg leading-tight">{itemTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase opacity-70">Total</p>
              <div className="text-2xl font-bold">R$ {price.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>

        {/* Method Selection */}
        {step === 'form' && (
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setMethod('MERCADO_PAGO')}
              className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${method === 'MERCADO_PAGO' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="flex items-center gap-1"><QrCode size={16}/> Pix</span> / <span className="flex items-center gap-1"><Wallet size={16}/> MP</span>
            </button>
            <button 
              onClick={() => setMethod('CARD')}
              className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${method === 'CARD' ? 'text-slate-200 border-b-2 border-slate-600 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <CreditCard size={18} /> Simulação
            </button>
          </div>
        )}

        <div className="p-6">
          {/* OPTION 1: MERCADO PAGO (REAL) */}
          {step === 'form' && method === 'MERCADO_PAGO' && (
             <div className="text-center py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-[#009EE3]/10 p-6 rounded-2xl border border-[#009EE3]/30 mb-6 relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 text-[#009EE3]/10 group-hover:text-[#009EE3]/20 transition-colors">
                      <QrCode size={120} />
                   </div>
                   
                   <div className="flex justify-center mb-4 relative z-10">
                      <div className="w-20 h-12 bg-[#009EE3] rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg">
                         MP
                      </div>
                   </div>
                   <h3 className="text-white font-bold text-lg mb-2 relative z-10">Mercado Pago</h3>
                   <p className="text-sm text-slate-400 relative z-10">
                     Pague instantaneamente com <strong>Pix</strong> ou use seu cartão de crédito/débito com segurança total.
                   </p>
                </div>

                <button 
                  onClick={handleSubmit} 
                  className="w-full py-4 bg-[#009EE3] hover:bg-[#008CC9] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group transform hover:scale-[1.02]"
                >
                  Ir para Pagamento <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                   <div className="h-4 w-8 bg-slate-700 rounded"></div>
                   <div className="h-4 w-8 bg-slate-700 rounded"></div>
                   <div className="h-4 w-8 bg-slate-700 rounded"></div>
                   <span className="text-xs text-slate-500">+ Pix</span>
                </div>
             </div>
          )}

          {/* OPTION 2: CARD (DEMO) */}
          {step === 'form' && method === 'CARD' && (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome no Cartão</label>
                <input 
                  type="text" 
                  placeholder="COMO NO CARTAO"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 focus:outline-none uppercase"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Número do Cartão</label>
                <div className="relative">
                  <CreditCard className="absolute top-3 left-3 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none font-mono"
                    value={cardNum}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardNum(v);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Validade</label>
                  <input 
                    type="text" 
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 focus:outline-none font-mono"
                    value={expiry}
                    onChange={(e) => {
                       let v = e.target.value.replace(/\D/g, '');
                       if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                       setExpiry(v);
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">CVC</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-9 pr-4 text-white focus:border-blue-500 focus:outline-none font-mono"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                  <Lock size={16} /> Simular Pagamento
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#009EE3] blur-xl opacity-20 rounded-full"></div>
                <Loader2 className="w-16 h-16 text-[#009EE3] animate-spin mb-4 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                 Conectando ao Gateway...
              </h3>
              <p className="text-slate-400">Gerando seu link de pagamento seguro.</p>
            </div>
          )}

          {step === 'redirecting' && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative">
                 <div className="w-16 h-16 bg-[#009EE3] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
                    <ExternalLink className="text-white" size={32} />
                 </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                 Redirecionando...
              </h3>
              <p className="text-slate-400">Você será levado ao ambiente seguro do Mercado Pago.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 ring-4 ring-green-500/20">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sucesso (Simulação)</h3>
              <p className="text-slate-400">Seus itens já foram adicionados à sua conta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;