import React from 'react';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto p-6 text-slate-300">
    <button onClick={onBack} className="mb-6 flex items-center text-blue-400 hover:text-white transition-colors">
      <ArrowLeft size={16} className="mr-2" /> Voltar
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <FileText className="text-blue-500" /> Termos de Uso
      </h1>
      <p>Última atualização: 15 de Outubro de 2023</p>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar a plataforma CarryMe, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">2. Código de Conduta</h2>
        <p>A CarryMe é uma comunidade baseada em respeito. É estritamente proibido:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Assédio, discurso de ódio ou discriminação.</li>
          <li>Uso de cheats, hacks ou exploração de bugs nos jogos pareados.</li>
          <li>Comportamento tóxico (rage, griefing, AFK intencional).</li>
        </ul>
        <p className="mt-2">Violações resultarão em suspensão ou banimento permanente sem reembolso.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">3. Compras e Reembolsos</h2>
        <p>Itens virtuais (CarryCoins, Cosméticos) não são reembolsáveis, exceto quando exigido por lei. A CarryMe reserva-se o direito de alterar preços a qualquer momento.</p>
      </section>
      
      <section>
         <h2 className="text-xl font-bold text-white mb-2">4. Responsabilidade</h2>
         <p>A CarryMe atua como intermediária para encontrar partidas. Não somos responsáveis pelo comportamento dos usuários dentro dos jogos de terceiros (LoL, CS2, etc), embora façamos o possível para moderar nossa comunidade.</p>
      </section>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto p-6 text-slate-300">
    <button onClick={onBack} className="mb-6 flex items-center text-blue-400 hover:text-white transition-colors">
      <ArrowLeft size={16} className="mr-2" /> Voltar
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Shield className="text-green-500" /> Política de Privacidade (LGPD)
      </h1>
      
      <section>
        <h2 className="text-xl font-bold text-white mb-2">1. Coleta de Dados</h2>
        <p>Coletamos apenas os dados necessários para o funcionamento do matchmaking:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Informações de perfil (Nickname, Avatar, Email).</li>
          <li>Dados de comportamento e reputação (CarryMe Score).</li>
          <li>Histórico de compras e transações internas.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">2. Uso dos Dados</h2>
        <p>Seus dados são usados exclusivamente para:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Conectar você a jogadores com nível de habilidade e comportamento compatíveis.</li>
          <li>Processar pagamentos e entregar itens virtuais.</li>
          <li>Melhorar a segurança da plataforma.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-2">3. Seus Direitos (LGPD)</h2>
        <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Solicitar cópia de todos os seus dados armazenados.</li>
          <li>Solicitar a correção de dados incompletos ou inexatos.</li>
          <li>Solicitar a exclusão total da sua conta e dados (Direito ao Esquecimento).</li>
        </ul>
        <p className="mt-2">Você pode exercer esses direitos diretamente na página de Configurações do app.</p>
      </section>
    </div>
  </div>
);