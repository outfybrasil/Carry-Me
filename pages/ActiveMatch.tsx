
import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Gamepad2, AlertTriangle, Coins, Activity, Lock, CheckCircle, XCircle, Upload } from 'lucide-react';
import { api } from '../services/api';

interface ActiveMatchProps {
  onFinish: () => void;
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ onFinish }) => {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'playing' | 'verifying' | 'manual_report' | 'upload_proof' | 'completed'>('playing');
  const [logs, setLogs] = useState<string[]>([]);
  const [matchResult, setMatchResult] = useState<'WIN' | 'LOSS' | null>(null);

  // Simulate Monitoring Logs
  useEffect(() => {
    if (status !== 'playing') return;

    const logMessages = [
      "Analisando canal de voz...",
      "Status da conexão: Estável",
      "Detecção de toxicidade: Negativo",
      "Verificando integridade do chat...",
      "Voice-to-text processing chunk...",
      "Nenhuma palavra-chave ofensiva detectada."
    ];

    const logInterval = setInterval(() => {
       const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
       const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
       setLogs(prev => [`[${time}] ${randomLog}`, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(logInterval);
  }, [status]);

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinishAttempt = async () => {
    if (duration < 5) {
        alert("A partida é muito curta para ser validada (min 10s para Demo).");
        return;
    }

    setStatus('verifying');
    
    // Simulate API Verification
    setTimeout(() => {
        // ALWAYS fail auto verification for web MVP to force manual report flow
        setLogs(prev => [`[System] Falha na verificação automática da API.`, ...prev]);
        setStatus('manual_report');
    }, 2000);
  };

  const handleManualSelection = (result: 'WIN' | 'LOSS') => {
      setMatchResult(result);
      setStatus('upload_proof');
  };

  const handleProofUpload = () => {
      // Simulate upload delay
      setTimeout(() => {
          completeMatch(matchResult === 'WIN');
      }, 1500);
  };

  const completeMatch = async (isWin: boolean) => {
      const user = await api.checkSession();
      if(user) {
          await api.incrementMatchStats(user.id, isWin);
      }
      setStatus('completed');
      setTimeout(onFinish, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      
      {/* Header Status */}
      <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className={`absolute inset-0 ${status === 'playing' ? 'bg-green-500 animate-ping' : 'bg-blue-500'} rounded-full opacity-20`}></div>
            <div className={`absolute inset-0 border-4 ${status === 'playing' ? 'border-green-500/50' : 'border-blue-500/50'} rounded-full flex items-center justify-center bg-slate-900 z-10 transition-colors`}>
              <Gamepad2 size={48} className={status === 'playing' ? 'text-green-400' : 'text-blue-400'} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {status === 'playing' && 'Partida em Andamento'}
            {status === 'verifying' && 'Verificando com API...'}
            {(status === 'manual_report' || status === 'upload_proof') && 'Reporte o Resultado'}
            {status === 'completed' && 'Processamento Concluído'}
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
                    <Activity size={18} className={status === 'playing' ? "animate-pulse" : ""} />
                    <span className="font-bold text-sm uppercase tracking-wider">CarryMe Monitor v2.1</span>
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
                    <p className="text-xs text-slate-400">
                        {(status === 'manual_report' || status === 'upload_proof') ? 'Verificação falhou. Envie evidência.' : 'Validamos o resultado via API oficial.'}
                    </p>
                </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className={`h-full w-full transition-all duration-500 ${status === 'playing' ? 'bg-blue-500 animate-progress-indeterminate' : (status === 'manual_report' || status === 'upload_proof') ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 py-3 rounded-lg border border-yellow-400/20 mt-auto">
                <Coins size={14} />
                <span className="font-bold">Potencial: +100 Coins (Se Vitória)</span>
            </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="text-center w-full max-w-md">
        {status === 'playing' && (
            <button 
                onClick={handleFinishAttempt}
                className={`w-full px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center mx-auto border
                ${duration < 5 
                    ? 'bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/10'}`}
            >
                {duration < 5 ? <Lock className="mr-2" size={18}/> : <AlertTriangle className="mr-2" size={18} />}
                {duration < 5 ? `Aguarde ${5 - duration}s` : "Finalizar Partida"}
            </button>
        )}

        {status === 'verifying' && (
             <div className="flex flex-col items-center animate-in fade-in zoom-in">
                 <div className="flex items-center gap-3 text-blue-400 bg-blue-400/10 px-6 py-3 rounded-full border border-blue-400/20 mb-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-bold">Consultando API da Riot Games...</span>
                 </div>
                 <p className="text-xs text-slate-500">Isso pode levar alguns segundos.</p>
             </div>
        )}

        {status === 'manual_report' && (
             <div className="animate-in slide-in-from-bottom-4">
                <p className="text-white font-bold mb-4">A API não respondeu. Qual foi o resultado?</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleManualSelection('WIN')}
                        className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex flex-col items-center gap-1 border border-green-400/50 shadow-lg shadow-green-500/20"
                    >
                        <CheckCircle size={24} /> VITÓRIA
                    </button>
                    <button 
                        onClick={() => handleManualSelection('LOSS')}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex flex-col items-center gap-1 border border-red-400/50 shadow-lg shadow-red-500/20"
                    >
                        <XCircle size={24} /> DERROTA
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                    <AlertTriangle size={10} className="inline mr-1"/>
                    Falsos reports resultam em banimento permanente.
                </p>
             </div>
        )}

        {status === 'upload_proof' && (
            <div className="animate-in zoom-in">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-4">
                    <h3 className="font-bold text-white mb-2">Comprovar Resultado ({matchResult})</h3>
                    <p className="text-slate-400 text-xs mb-4">Envie um print do placar final para validação.</p>
                    
                    <button onClick={handleProofUpload} className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-blue-500 transition-colors">
                        <Upload size={24} className="mb-2"/>
                        <span className="text-sm font-bold">Clique para enviar Print</span>
                    </button>
                </div>
                <button onClick={handleProofUpload} className="text-xs text-slate-500 underline">Pular envio (apenas para teste)</button>
            </div>
        )}

        {status === 'completed' && (
             <div className="flex items-center justify-center gap-3 text-green-400 bg-green-400/10 px-8 py-4 rounded-xl border border-green-400/20 animate-bounce">
                <ShieldCheck size={24} />
                <span className="font-bold text-lg">Partida Validada com Sucesso!</span>
             </div>
        )}
      </div>
    </div>
  );
};

export default ActiveMatch;
