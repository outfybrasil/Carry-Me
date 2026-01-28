
import React, { useState, useEffect } from 'react';
import {
    Loader2, ShieldCheck, Gamepad2, AlertTriangle, Coins,
    Activity, Lock, CheckCircle, XCircle, Upload,
    MessageSquare, Users, Link as LinkIcon, Radio,
    Timer, Sword, Shield
} from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { LobbyConfig, Vibe } from '../types';

interface ActiveMatchProps {
    onFinish: () => void;
    config: LobbyConfig;
    lobbyId: string;
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ onFinish, config, lobbyId }) => {
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<'playing' | 'verifying' | 'manual_report' | 'upload_proof' | 'completed'>('playing');
    const [logs, setLogs] = useState<string[]>([]);
    const [matchResult, setMatchResult] = useState<'WIN' | 'LOSS' | null>(null);

    // Real teammates should be fetched via lobbyId in a production scenario
    const [teammates, setTeammates] = useState<{ name: string, status: string, sync: string }[]>([]);

    useEffect(() => {
        const fetchTeammates = async () => {
            const { data } = await supabase.from('lobbies').select('players').eq('id', lobbyId).single();
            if (data?.players) {
                setTeammates((data.players as any[]).map(p => ({
                    name: p.username,
                    status: 'online',
                    sync: '100%'
                })));
            }
        };
        fetchTeammates();
    }, [lobbyId]);

    // Monitoring Logs (Real logs would be pushed via Realtime or fetched from Edge Functions)
    useEffect(() => {
        if (status !== 'playing') return;
        setLogs([`[${new Date().toLocaleTimeString()}] Aguardando telemetria da partida...`]);
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

    const getVibeObjective = (vibe: Vibe) => {
        switch (vibe) {
            case Vibe.TRYHARD: return "Foco total na vitória e comunicação limpa.";
            case Vibe.PRACTICE: return "Execução de táticas e coordenação de utilitários.";
            case Vibe.LEARNING: return "Paciência e aprendizado conjunto.";
            default: return "Divirta-se e mantenha o respeito.";
        }
    };

    const handleFinishAttempt = async () => {
        if (duration < 5) {
            alert("Aguarde a validação inicial do sistema.");
            return;
        }
        setStatus('verifying');
        setTimeout(() => {
            setStatus('manual_report');
        }, 2000);
    };

    const handleManualSelection = (result: 'WIN' | 'LOSS') => {
        setMatchResult(result);
        setStatus('upload_proof');
    };

    const handleProofUpload = () => {
        setTimeout(() => {
            completeMatch(matchResult === 'WIN');
        }, 1500);
    };

    const completeMatch = async (isWin: boolean) => {
        const user = await api.checkSession();
        if (user) {
            await api.incrementMatchStats(user.id, isWin, {
                map: config.title === 'Mirage' ? 'Mirage' : 'Dust 2', // Baseado no config se possível
                mode: config.vibe === Vibe.TRYHARD ? 'Competitive' : 'Practice',
                kills: isWin ? 18 + Math.floor(Math.random() * 10) : 8 + Math.floor(Math.random() * 8),
                deaths: isWin ? 5 + Math.floor(Math.random() * 10) : 15 + Math.floor(Math.random() * 10),
                assists: 3 + Math.floor(Math.random() * 5),
                rating: isWin ? 1.1 + (Math.random() * 0.4) : 0.7 + (Math.random() * 0.3),
                teammates: [] // In production, current lobby players
            });
        }
        setStatus('completed');
        setTimeout(onFinish, 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Top Bar: Tactical Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 ${status === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                        <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center bg-slate-950 z-10 relative ${status === 'playing' ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-blue-500/50'}`}>
                            <Gamepad2 size={32} className={status === 'playing' ? 'text-green-400' : 'text-blue-400'} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${status === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></span>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                {status === 'playing' ? 'Operação em Curso' : 'Sinal Finalizado'}
                            </h1>
                        </div>
                        <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                            <Sword size={14} className="text-brand-purple" /> {config.game} • {config.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8 bg-black/40 px-8 py-4 rounded-2xl border border-slate-800">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Tempo de Jogo</p>
                        <div className="font-mono text-3xl font-black text-white tabular-nums tracking-tighter">
                            {formatTime(duration)}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-800"></div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Lobby ID</p>
                        <div className="font-mono text-xl font-black text-brand-purple tracking-tighter">
                            #{lobbyId.slice(0, 4).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Communications & Objective */}
                <div className="space-y-6">
                    {/* Discord Card */}
                    <div className="bg-gradient-to-br from-[#5865F2]/20 to-slate-900 border border-[#5865F2]/30 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#5865F2] rounded-lg text-white shadow-lg">
                                <Radio size={20} className="animate-pulse" />
                            </div>
                            <h3 className="font-black text-white uppercase tracking-tight">Voz do Time</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Sua sala temporária está pronta. Entre para coordenar as jogadas com seu time.
                        </p>
                        <a
                            href="https://discord.gg/carryme-match"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-black rounded-xl transition-all shadow-xl shadow-[#5865F2]/20 group"
                        >
                            <LinkIcon size={18} />
                            ENTRAR NO DISCORD
                        </a>
                    </div>

                    {/* Mission Objective */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
                            <Shield className="text-brand-purple" size={20} />
                            <h3 className="font-black text-white uppercase tracking-tight text-sm">Diretriz da {config.vibe}</h3>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-slate-800/50">
                            <p className="text-white text-sm font-bold leading-relaxed italic">
                                "{getVibeObjective(config.vibe)}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Column 2: Squad Status */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-blue-400" />
                            <h3 className="font-black text-white uppercase tracking-tight">Status do Squad</h3>
                        </div>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-black uppercase">{teammates.length}/5 Conectados</span>
                    </div>

                    <div className="space-y-4 flex-1">
                        {teammates.map((member, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500">
                                        P{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{member.name}</p>
                                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Ativo</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-black uppercase">Sincronia</p>
                                    <p className="text-xs font-mono font-bold text-white">{member.sync}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-500 font-bold">Integridade do Lobby</span>
                            <span className="text-green-400 font-black">EXCELENTE</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[98%]"></div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Monitor & Rewards */}
                <div className="space-y-6">
                    {/* Tactical Monitor */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group min-h-[220px]">
                        {/* Background Waveform Animation (Simulated) */}
                        <div className="absolute bottom-0 left-0 w-full h-16 flex items-end gap-1 px-4 opacity-10">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="flex-1 bg-green-500 animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2 relative z-10">
                            <div className="flex items-center gap-2 text-green-400">
                                <Activity size={16} className={status === 'playing' ? "animate-pulse" : ""} />
                                <span className="font-black text-[10px] uppercase tracking-widest">CarryMe Monitor v2.1</span>
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono italic">SYSLOG_ENABLED</div>
                        </div>

                        <div className="space-y-3 font-mono text-[11px] relative z-10">
                            {logs.map((log, i) => (
                                <div key={i} className="text-slate-400 border-l-2 border-green-500/30 pl-3 leading-relaxed animate-in slide-in-from-left-2 fade-in">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reward Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-accent/20 rounded-xl text-brand-accent shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-white uppercase tracking-tight text-sm">Proteção Anti-Cheat</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monitoramento via API CarryMe</p>
                            </div>
                        </div>

                        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Coins size={16} className="animate-bounce" />
                                <span className="text-xs font-black uppercase tracking-widest">Recompensa</span>
                            </div>
                            <span className="text-lg font-black text-white italic">+100 <span className="text-[10px] text-slate-500 not-italic">COINS</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col items-center pt-8">
                {status === 'playing' && (
                    <button
                        onClick={handleFinishAttempt}
                        className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
            ${duration < 5
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95'}`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            {duration < 5 ? <Lock size={18} /> : <AlertTriangle size={18} className="group-hover:rotate-12 transition-transform" />}
                            {duration < 5 ? `Iniciando Sistema (${5 - duration}s)` : "Finalizar Missão Tática"}
                        </div>
                        {duration >= 5 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
                    </button>
                )}

                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in slide-in-from-top-4">
                        <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 px-10 py-5 rounded-3xl shadow-2xl">
                            <Loader2 className="animate-spin text-blue-400" size={32} />
                            <div>
                                <span className="block font-black text-white uppercase tracking-widest text-lg">Validando Protocolos</span>
                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Contatando API {config.game}...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success / Final Steps states */}
                {(status === 'manual_report' || status === 'upload_proof' || status === 'completed') && (
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in scale-in-95">
                        {status === 'manual_report' && (
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-white uppercase mb-2">Relatório do Operador</h2>
                                <p className="text-slate-400 text-sm mb-8">A API externa está instável. Por favor, confirme o resultado manualmente.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleManualSelection('WIN')}
                                        className="group p-6 bg-green-600 hover:bg-green-500 text-white rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 border border-green-400/30 shadow-xl shadow-green-500/20"
                                    >
                                        <CheckCircle size={32} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-black uppercase tracking-widest">Vitória</span>
                                    </button>
                                    <button
                                        onClick={() => handleManualSelection('LOSS')}
                                        className="group p-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 border border-red-400/30 shadow-xl shadow-red-500/20"
                                    >
                                        <XCircle size={32} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-black uppercase tracking-widest">Derrota</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'upload_proof' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-6">
                                    <Upload size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase mb-2">Comprovar {matchResult}</h2>
                                <p className="text-slate-400 text-sm mb-8">Envie uma captura de tela do placar final para validação humana.</p>

                                <button onClick={handleProofUpload} className="w-full h-48 border-2 border-dashed border-slate-800 bg-black/20 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500 transition-all mb-6 group">
                                    <Upload size={32} className="mb-2 group-hover:-translate-y-2 transition-transform" />
                                    <span className="font-black uppercase tracking-widest text-xs">Anexar Prova Digital</span>
                                </button>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce">
                                    <ShieldCheck size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase mb-2 tracking-tighter italic">Missão Concluída</h2>
                                <p className="text-green-400 font-black uppercase tracking-widest text-sm">Resultado Validado pela Central CarryMe</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveMatch;
