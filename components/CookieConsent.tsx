import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('carryme_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('carryme_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 md:p-6 z-[200] shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl hidden md:block">
            <Cookie className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Respeitamos sua privacidade (LGPD)</h3>
            <p className="text-slate-400 text-sm max-w-2xl">
              Utilizamos cookies e tecnologias similares para melhorar a experiência de matchmaking e analisar o tráfego. 
              Ao continuar navegando, você concorda com nossa <a href="#" className="text-blue-400 hover:underline">Política de Privacidade</a> e o uso de seus dados para funcionamento da plataforma.
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;