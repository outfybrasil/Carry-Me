import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Gamepad2, AlertTriangle, Coins, Activity, Server, Lock } from 'lucide-react';
import { api } from '../services/api';

interface ActiveMatchProps {
  onFinish: () => void;
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ onFinish }) => {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'playing' | 'verifying' | 'completed'>('playing');
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate Monitoring Logs
  useEffect(() => {
    const logMessages = [
      "Analisando canal de voz...",
      "Status da conexão: Estável",
      "Detecção de toxicidade: Negativo",
      "Verificando integridade do chat...",
      "Voice-to-text processing chunk #2938...",
      "Nenhuma palavra-chave ofensiva detectada."
    ];

    const logInterval = setInterval(() => {
       const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
       const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
       setLogs(prev => [`[${time}] ${randomLog}`, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinishAttempt = async () => {
    // Anti-cheat: Don't allow finishing too fast (e.g., under 60 seconds for demo purposes, usually 15-20 min)
    if (duration < 60) {
        alert("A partida é muito curta para ser validada. Jogue por pelo menos 1 minuto (Demo).");
        return;
    }

    setStatus('verifying');
    
    // Simulate API Verification with Game Server (Riot/Valve)
    setTimeout(async () => {
        // Update user stats in "Real" local storage DB
        const user = await api.checkSession();
        if(user) {
            await api.incrementMatchStats(user.id, true); // Assume win for demo joy
        }

        setStatus('completed');
        setTimeout(onFinish, 1500); // Wait a bit to show success state
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
      
      {/* Header Status */}
      <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className={`absolute inset-0 ${status === 'playing' ? 'bg-green-500 animate-ping' : 'bg-blue-500'} rounded-full opacity-20`}></div>
            <div className={`absolute inset-0 border-4 ${status === 'playing' ? 'border-green-500/50' : 'border-blue-500/50'} rounded-full flex items-center justify-center bg-slate-900 z-10`}>
              <Gamepad2 size={48} className={status === 'playing' ? 'text-green-400' : 'text-blue-400'} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {status === 'playing' ? 'Partida em Andamento' : 'Verificando Resultado'}
          </h1>
          <div className="font-mono text-5xl font-bold text-white mb-2 tabular-nums tracking-wider">
            {formatTime(duration)}
          </div>
          <p className="text-slate-400 text-sm">League of Legends • Summoner's Rift</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        {/* Monitoring Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-green-400">
                    <Activity size={18} className="animate-pulse" />
                    <span className="font-bold text-sm uppercase tracking-wider">Monitoramento Ativo</span>
                </div>
                <div className="text-[10px] text-slate-500">ID: #8291-LIVE</div>
             </div>
             
             <div className="space-y-2 font-mono text-xs h-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
                {logs.map((log, i) => (
                    <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2 animate-in slide-in-from-left-2 fade-in duration-300">
                        {log}
                    </div>
                ))}
             </div>
        </div>

        {/* Reward & Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                    <ShieldCheck />
                </div>
                <div>
                    <h3 className="font-bold text-white">Proteção Anti-Cheat</h3>
                    <p className="text-xs text-slate-400">Validamos o resultado via API oficial.</p>
                </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 w-full animate-progress-indeterminate"></div>
                </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 py-3 rounded-lg border border-yellow-400/20 mt-auto">
                <Coins size={14} />
                <span className="font-bold">Potencial: +100 Coins</span>
            </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="text-center">
        {status === 'playing' && (
            <button 
                onClick={handleFinishAttempt}
                className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center mx-auto border
                ${duration < 60 
                    ? 'bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/10'}`}
                title={duration < 60 ? "Disponível após 1 minuto de partida" : "Clique se a partida acabou"}
            >
                {duration < 60 ? <Lock className="mr-2" size={18}/> : <AlertTriangle className="mr-2" size={18} />}
                {duration < 60 ? `Aguarde ${60 - duration}s` : "Finalizar Partida"}
            </button>
        )}

        {status === 'verifying' && (
             <div className="flex flex-col items-center animate-in fade-in zoom-in">
                 <div className="flex items-center gap-3 text-blue-400 bg-blue-400/10 px-6 py-3 rounded-full border border-blue-400/20 mb-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-bold">Conectando ao Servidor do Jogo...</span>
                 </div>
                 <p className="text-xs text-slate-500">Verificando KDA e Resultado da partida ID #39201</p>
             </div>
        )}

        {status === 'completed' && (
             <div className="flex items-center gap-3 text-green-400 bg-green-400/10 px-8 py-4 rounded-xl border border-green-400/20 animate-bounce">
                <ShieldCheck size={24} />
                <span className="font-bold text-lg">Partida Validada!</span>
             </div>
        )}
      </div>
    </div>
  );
};

export default ActiveMatch;
