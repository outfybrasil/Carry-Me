import React from 'react';
import { Lock, ArrowLeft, Eye, Database, Share2, ShieldCheck, HeartPulse, Skull } from 'lucide-react';

const Privacy = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="min-h-screen bg-[#020202] text-slate-200 p-6 md:p-12 font-sans selection:bg-green-500/30">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="inline-flex items-center text-slate-400 hover:text-white mb-10 transition-all group px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar ao Dashboard
                </button>

                <header className="mb-16">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="p-4 bg-green-600/10 rounded-2xl border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <Lock size={40} className="text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Política de Privacidade</h1>
                            <p className="text-slate-500 mt-2 font-medium">Transparência e proteção de dados OutfyBR</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-slate-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Documento atualizado: 28 de Janeiro de 2026
                    </div>
                </header>

                <div className="space-y-12 pb-20">
                    <section className="prose prose-invert max-w-none">
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Respeitamos sua privacidade. Esta política descreve como a <strong>OutfyBR</strong> ("nós", "nosso") coleta, processa e protege suas informações ao utilizar o serviço CarryMe. Operamos em conformidade com a <strong>LGPD</strong> (Lei Geral de Proteção de Dados).
                        </p>
                    </section>

                    {/* 1. COLETA */}
                    <section className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="text-green-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">1. Informações que Coletamos</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-white font-bold mb-3">Dados Cadastrais</h3>
                                <ul className="text-sm text-slate-400 space-y-3">
                                    <li className="flex gap-2"><span>•</span> Email e Nome de usuário via Google/Discord.</li>
                                    <li className="flex gap-2"><span>•</span> Foto de perfil vinculada ao provedor de auth.</li>
                                    <li className="flex gap-2"><span>•</span> Steam ID (para sincronização de ranking).</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-3">Dados de Atividade</h3>
                                <ul className="text-sm text-slate-400 space-y-3">
                                    <li className="flex gap-2"><span>•</span> Histórico de partidas e desempenho competitivo.</li>
                                    <li className="flex gap-2"><span>•</span> Commendations (elogios) e denúncias de comportamento.</li>
                                    <li className="flex gap-2"><span>•</span> Logs técnicos de acesso para segurança.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. FINALIDADE */}
                    <section className="p-2">
                        <div className="flex items-center gap-3 mb-6">
                            <HeartPulse className="text-blue-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">2. Finalidade do Processamento</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed md:w-3/4">
                            Seus dados não são vendidos ou alugados. Eles são processados estritamente para:
                        </p>
                        <div className="flex flex-wrap gap-4 mt-6">
                            {['Matchmaking Tático', 'Prevenção de Fraude', 'Personalização de Perfil', 'Suporte ao Cliente'].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* 3. COMPARTILHAMENTO */}
                    <section className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Share2 className="text-purple-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">3. Compartilhamento com Terceiros</h2>
                        </div>
                        <div className="text-sm text-slate-400 space-y-4">
                            <p>Compartilhamos dados exclusivamente com parceiros tecnológicos essenciais:</p>
                            <ul className="space-y-4">
                                <li className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <strong className="text-white block mb-1">Supabase / AWS:</strong>
                                    Hospedagem segura de dados e gestão de autenticação.
                                </li>
                                <li className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <strong className="text-white block mb-1">Mercado Pago / Stripe:</strong>
                                    Processamento de pagamentos criptografados (não temos acesso aos seus dados de cartão).
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. DIREITOS */}
                    <section className="bg-green-900/10 border border-green-500/20 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-green-300" size={24} />
                            <h2 className="text-2xl font-bold text-green-100">4. Seus Direitos (LGPD)</h2>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Sob a legislação brasileira, você possui controle total. Através das configurações ou contato direto, você pode:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-green-200/70 uppercase tracking-wider">
                            <li className="flex items-center gap-2"><Eye size={14} /> Confirmar a existência de processamento</li>
                            <li className="flex items-center gap-2"><Lock size={14} /> Solicitar anonimização ou bloqueio</li>
                            <li className="flex items-center gap-2"><Database size={14} /> Portabilidade de dados</li>
                            <li className="flex items-center gap-2"><Skull size={14} /> Exclusão definitiva de conta</li>
                        </ul>
                    </section>

                    {/* 5. CONTATO */}
                    <section className="p-2 border-t border-slate-800 pt-12 text-center">
                        <h2 className="text-lg font-bold text-white mb-2">Canal de Privacidade</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Para exercer seus direitos, contate nosso DPO em:
                        </p>
                        <a href="mailto:privacy@carryme.gg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 inline-block">
                            privacy@carryme.gg
                        </a>
                    </section>

                    {/* RODAPÉ LEGAL */}
                    <footer className="text-center text-slate-600 text-[10px] pt-10">
                        <p>© 2026 OUTFYBR - TRANSFORMAÇÃO DIGITAL COM SEGURANÇA</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
