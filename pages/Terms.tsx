import React from 'react';
import { Shield, ArrowLeft, Scale, Skull, Coins, AlertCircle } from 'lucide-react';

const Terms = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="min-h-screen bg-[#020202] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="inline-flex items-center text-slate-400 hover:text-white mb-10 transition-all group px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar ao Dashboard
                </button>

                <header className="mb-16">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                            <Shield size={40} className="text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Termos de Uso</h1>
                            <p className="text-slate-500 mt-2 font-medium">Contrato de Licença e Serviço CarryMe (OutfyBR)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-slate-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Última atualização: 28 de Janeiro de 2026
                    </div>
                </header>

                <div className="space-y-12 pb-20">
                    {/* 1. ACERTAÇÃO */}
                    <section className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Scale className="text-blue-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">1. Aceitação e Elegibilidade</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-4">
                            <p>
                                Este documento constitui um acordo legal entre você ("Usuário") e a <strong>OutfyBR</strong>, operadora da plataforma <strong>CarryMe</strong>. Ao criar uma conta, você declara ter pelo menos 13 anos de idade (ou a idade mínima legal em seu país) e possuir capacidade legal para aceitar estes termos.
                            </p>
                            <p>
                                O uso continuado da plataforma implica na aceitação automática de qualquer atualização futura deste documento. Caso não concorde com os Termos, o acesso deve ser interrompido imediatamente.
                            </p>
                        </div>
                    </section>

                    {/* 2. CONDUTA */}
                    <section className="p-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Skull className="text-red-500" size={24} />
                            <h2 className="text-2xl font-bold text-white">2. Código de Conduta e Anti-Cheat</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} /> Tolerância Zero
                                </h3>
                                <p className="text-sm text-slate-400">
                                    O uso de softwares de trapaça (cheats), scripts de automação, exploits ou manipulação de rede resultará em <strong>banimento permanente</strong> sem aviso prévio e perda de todos os ativos digitais.
                                </p>
                            </div>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
                                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                    <Shield size={16} /> Toxicidade
                                </h3>
                                <p className="text-sm text-slate-400">
                                    A CarryMe é focada em reputação. Assédio, racismo, homofobia ou comportamento disruptivo recorrente levará à suspensão da conta e queda drástica no score de pareamento.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. ECONOMIA */}
                    <section className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Coins className="text-yellow-500" size={24} />
                            <h2 className="text-2xl font-bold text-white">3. Ativos Virtuais (CarryCoins)</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-4">
                            <p>
                                <strong>CarryCoins</strong> e itens cosméticos (bordas, títulos, efeitos) são bens virtuais sem valor monetário fora da plataforma.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Não são reembolsáveis após o consumo ou atribuição à conta.</li>
                                <li>Não podem ser transferidos entre contas ou convertidos em dinheiro real.</li>
                                <li>A OutfyBR reserva-se o direito de gerenciar, modificar ou remover itens da loja a qualquer momento por motivos de equilíbrio ou técnicos.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. PREMIUM */}
                    <section className="bg-purple-900/10 border border-purple-500/20 p-8 rounded-3xl backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-purple-200 mb-6">4. Assinaturas Premium</h2>
                        <div className="text-slate-400 leading-relaxed space-y-4">
                            <p>
                                Ao assinar o plano Premium, você concorda com o faturamento recorrente. O cancelamento pode ser feito a qualquer momento através das configurações, interrompendo a renovação para o próximo ciclo.
                            </p>
                            <p className="text-sm italic">
                                Benefícios premium (badges, acesso a dicas, prioridade de busca) são vinculados à conta ativa e não podem ser compartilhados.
                            </p>
                        </div>
                    </section>

                    {/* 5. RESPONSABILIDADE */}
                    <section className="p-2 border-t border-slate-800 pt-12">
                        <h2 className="text-lg font-bold text-white mb-4">5. Limitação de Responsabilidade</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            A CarryMe é fornecida "como está". A OutfyBR não garante que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por perdas de ranking em terceiros (ex: Valve, Faceit) ou danos resultantes do uso da plataforma. Estes termos são regidos pelas leis da República Federativa do Brasil.
                        </p>
                    </section>

                    {/* RODAPÉ LEGAL */}
                    <footer className="text-center text-slate-600 text-[10px] space-y-2">
                        <p>© 2026 OUTFYBR - TODOS OS DIREITOS RESERVADOS</p>
                        <p>Dúvidas? <a href="mailto:support@carryme.gg" className="text-blue-500 hover:underline">support@carryme.gg</a></p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Terms;
