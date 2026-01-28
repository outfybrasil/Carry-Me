import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

const Privacy = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <button onClick={onBack} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>

                <header className="mb-12 border-b border-slate-800 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-600/20 rounded-xl">
                            <Lock size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">Política de Privacidade</h1>
                    </div>
                    <p className="text-slate-400">Última atualização: {new Date().toLocaleDateString()}</p>
                </header>

                <article className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Coleta de Dados</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Nós coletamos apenas as informações necessárias para operar a plataforma CarryMe.gg:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong>Informações de Conta:</strong> Email, Nome de Usuário e ID de provedores de autenticação (Google, Discord).</li>
                            <li><strong>Dados de Jogo:</strong> Estatísticas de partidas, Riot ID, Steam ID e histórico de jogos.</li>
                            <li><strong>Transações:</strong> Histórico de compras e pagamentos (não armazenamos dados de cartão de crédito; estes são processados pelo Mercado Pago).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Uso das Informações</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Usamos seus dados para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Fornecer e manter o serviço, incluindo pareamento de partidas.</li>
                            <li>Processar pagamentos e prevenir fraudes.</li>
                            <li>Comunicar atualizações do sistema e notificações de partidas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Compartilhamento de Dados</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Não vendemos seus dados pessoais. Compartilhamos informações apenas com terceiros necessários para o funcionamento do serviço:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong>Processadores de Pagamento:</strong> Mercado Pago (para processar transações).</li>
                            <li><strong>Supabase:</strong> Para hospedagem de banco de dados e autenticação segura.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Seus Direitos (LGPD)</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Você tem o direito de solicitar o acesso, correção ou exclusão de seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato conosco.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contato</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Para questões de privacidade, contate nosso DPO (Data Protection Officer) em: <a href="mailto:privacy@carryme.gg" className="text-blue-400 hover:underline">privacy@carryme.gg</a>.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default Privacy;
