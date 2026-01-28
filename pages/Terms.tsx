import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const Terms = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <button onClick={onBack} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>

                <header className="mb-12 border-b border-slate-800 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600/20 rounded-xl">
                            <Shield size={32} className="text-blue-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">Termos de Uso</h1>
                    </div>
                    <p className="text-slate-400">Última atualização: {new Date().toLocaleDateString()}</p>
                </header>

                <article className="prose prose-invert prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Ao acessar e usar o CarryMe.gg ("Plataforma"), você concorda em cumprir e ficar vinculado aos seguintes termos e condições. Se você não concordar com qualquer parte destes termos, você não deve usar nossa Plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Uso da Plataforma</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            A CarryMe.gg é uma plataforma destinada a conectar jogadores para partidas competitivas e casuais. Você concorda em:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Não usar cheats, hacks ou automações (bots).</li>
                            <li>Manter um comportamento respeitoso e não tóxico com outros usuários.</li>
                            <li>Não criar múltiplas contas para manipular o sistema de ranking ou economia.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Compras e Reembolsos</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            A plataforma oferece bens virtuais ("CarryCoins", "Itens Cosméticos") que podem ser adquiridos com dinheiro real.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong>Natureza Virtual:</strong> Os itens não têm valor monetário no mundo real e não podem ser trocados por dinheiro.</li>
                            <li><strong>Reembolsos:</strong> Todas as vendas são finais. Reembolsos só serão emitidos em caso de erro técnico comprovado ou exigência legal.</li>
                            <li><strong>Cancelamento:</strong> Reservamo-nos o direito de suspender ou cancelar contas que violem os termos, sem reembolso de itens virtuais.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Conduta do Usuário</h2>
                        <p className="text-slate-400 leading-relaxed">
                            A toxicidade, assédio, racismo ou qualquer forma de discriminação resultará em banimento imediato e permanente da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contato</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Para dúvidas sobre estes termos ou suporte, entre em contato através do email: <a href="mailto:support@carryme.gg" className="text-blue-400 hover:underline">support@carryme.gg</a>.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default Terms;
