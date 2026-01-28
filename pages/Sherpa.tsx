import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, DollarSign, X, CheckCircle, AlertTriangle, GraduationCap, XCircle, Briefcase, Coins, Zap } from 'lucide-react';
import { Player, SherpaProfile } from '../types';
import { api } from '../services/api';

interface SherpaMarketProps {
  user?: Player;
  onUpdateUser?: () => void;
  onViewProfile: (username: string) => void;
}

const SherpaMarket: React.FC<SherpaMarketProps> = ({ user, onUpdateUser, onViewProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<'requirements' | 'form' | 'success'>('requirements');

  // Hiring Modal State
  const [hiringSherpa, setHiringSherpa] = useState<SherpaProfile | null>(null);
  const [hireStatus, setHireStatus] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [hireMessage, setHireMessage] = useState('');

  // Application Form State
  const [hourlyRate, setHourlyRate] = useState(20);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sherpas, setSherpas] = useState<SherpaProfile[]>([]);
  const [loadingSherpas, setLoadingSherpas] = useState(true);

  useEffect(() => {
    const loadSherpas = async () => {
      setLoadingSherpas(true);
      const data = await api.getSherpas();
      setSherpas(data);
      setLoadingSherpas(false);
    };
    loadSherpas();
  }, []);

  // Requirements Logic
  const REQUIREMENTS = [
    {
      id: 'score',
      label: 'Reputação Exemplar',
      description: 'CarryMe Score acima de 80',
      met: (user?.score || 0) >= 80
    },
    {
      id: 'badges',
      label: 'Reconhecimento da Comunidade',
      description: 'Pelo menos 1 badge de comportamento',
      met: (user?.badges || []).length > 0
    },
    {
      id: 'coins',
      label: 'Taxa de Inscrição',
      description: '100 CarryCoins para validação',
      met: (user?.coins || 0) >= 100
    }
  ];

  const allRequirementsMet = REQUIREMENTS.every(r => r.met);
  const SPECIALTY_OPTIONS = ['Macro Gaming', 'Micro / Mecânica', 'Liderança', 'Controle de Tilt', 'Suporte', 'Jungle Pathing', 'FPS Aim'];

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter(s => s !== spec));
    } else {
      if (specialties.length < 3) {
        setSpecialties([...specialties, spec]);
      }
    }
  };

  const handleSubmitApplication = async () => {
    if (!user) return;
    setIsLoading(true);

    // Simulate API call for application
    const success = await api.becomeSherpa(user.id, hourlyRate, specialties);

    if (success) {
      if (onUpdateUser) await onUpdateUser();
      setStep('success');
    } else {
      alert("Erro ao aplicar. Tente novamente.");
    }
    setIsLoading(false);
  };

  const initiateHire = (sherpa: SherpaProfile) => {
    setHiringSherpa(sherpa);
    setHireStatus('confirm');
    setHireMessage('');
  };

  const confirmHire = async () => {
    if (!user || !hiringSherpa) return;
    setHireStatus('processing');

    const result = await api.hireSherpa(user.id, hiringSherpa.player.id, hiringSherpa.hourlyRate);

    if (result.success) {
      setHireStatus('success');
      if (onUpdateUser) await onUpdateUser();
    } else {
      setHireStatus('error');
      setHireMessage(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Sherpa Market</h1>
          <p className="text-slate-400">Contrate mentores de elite para subir de elo e aprender.</p>
        </div>
        <div className="flex gap-2">
          {user?.isSherpa ? (
            <div className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/50 flex items-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <ShieldCheck size={18} className="mr-2" />
              Sherpa Verificado
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex items-center"
            >
              <GraduationCap size={18} className="mr-2" />
              Torne-se um Sherpa
            </button>
          )}
        </div>
      </div>

      {user?.isSherpa && (
        <div className="bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Você é um Mentor!</h3>
              <p className="text-xs text-slate-400">Acumule Coins ensinando e compre itens lendários na loja.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">Saldo Atual</div>
            <div className="text-xl font-bold text-yellow-400 flex items-center justify-end gap-1">
              <Coins size={16} /> {user.coins}
            </div>
          </div>
        </div>
      )}

      {/* BECOME SHERPA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"
            >
              <X size={24} />
            </button>

            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="text-blue-400" />
                Jornada Sherpa
              </h2>
              <p className="text-blue-200/70 text-sm mt-1">Compartilhe conhecimento e ganhe Coins.</p>
            </div>

            <div className="p-8">
              {/* STEP 1: REQUIREMENTS */}
              {step === 'requirements' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {REQUIREMENTS.map((req) => (
                      <div key={req.id} className={`flex items-start p-4 rounded-xl border ${req.met ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="mr-4 mt-1">
                          {req.met ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                        </div>
                        <div>
                          <h4 className={`font-bold ${req.met ? 'text-green-400' : 'text-red-400'}`}>{req.label}</h4>
                          <p className="text-sm text-slate-400">{req.description}</p>
                          {!req.met && req.id === 'score' && (
                            <p className="text-xs text-red-400 mt-1 font-semibold">Seu Score atual: {user?.score}</p>
                          )}
                          {!req.met && req.id === 'coins' && (
                            <p className="text-xs text-red-400 mt-1 font-semibold">Seu Saldo: {user?.coins}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {allRequirementsMet ? (
                      <button
                        onClick={() => setStep('form')}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center"
                      >
                        Continuar Candidatura
                      </button>
                    ) : (
                      <div className="text-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <AlertTriangle className="mx-auto text-yellow-500 mb-2" />
                        <p className="text-slate-400 text-sm">
                          Você ainda não atende a todos os requisitos. Jogue limpo, ganhe reputação e tente novamente!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: FORM */}
              {step === 'form' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Valor da Sessão (Coins)</label>
                    <div className="relative">
                      <Coins className="absolute top-3 left-3 text-slate-500" size={18} />
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sugerido: 20 - 50 Coins para iniciantes.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Especialidades (Max 3)</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map(spec => (
                        <button
                          key={spec}
                          onClick={() => toggleSpecialty(spec)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${specialties.includes(spec)
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitApplication}
                    disabled={isLoading || specialties.length === 0}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <span className="animate-spin mr-2">⏳</span> : 'Confirmar e Pagar Taxa'}
                  </button>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bem-vindo à Elite!</h3>
                  <p className="text-slate-400 mb-6">
                    Seu perfil de Sherpa foi ativado. Jogadores agora podem ver seus serviços no mercado.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HIRE CONFIRMATION MODAL */}
      {hiringSherpa && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm relative animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
            <button
              onClick={() => setHiringSherpa(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"
            >
              <X size={20} />
            </button>

            {hireStatus === 'confirm' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <img src={hiringSherpa.player.avatar} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">Contratar {hiringSherpa.player.username}?</h3>
                  <p className="text-sm text-slate-400">Sessão de Coaching (1 Hora)</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Custo da Sessão</span>
                    <span className="text-white font-bold">{hiringSherpa.hourlyRate} Coins</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Seu Saldo Atual</span>
                    <span className={`font-bold ${user && user.coins >= hiringSherpa.hourlyRate ? 'text-green-400' : 'text-red-400'}`}>
                      {user?.coins} Coins
                    </span>
                  </div>
                </div>

                <button
                  onClick={confirmHire}
                  disabled={user ? user.coins < hiringSherpa.hourlyRate : true}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  title={user && user.coins < hiringSherpa.hourlyRate ? "Saldo Insuficiente. Jogue mais partidas!" : ""}
                >
                  <Briefcase size={18} /> Confirmar Contratação
                </button>
                {user && user.coins < hiringSherpa.hourlyRate && (
                  <div className="text-center mt-3">
                    <p className="text-xs text-red-400 mb-1">Saldo insuficiente.</p>
                    <p className="text-[10px] text-slate-500">Jogue partidas para ganhar Coins ou compre na loja.</p>
                  </div>
                )}
              </div>
            )}

            {hireStatus === 'processing' && (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-white font-bold">Processando Transação...</h3>
              </div>
            )}

            {hireStatus === 'success' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sucesso!</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Sessão agendada. O Sherpa entrará em contato em breve através do chat.
                </p>
                <button
                  onClick={() => setHiringSherpa(null)}
                  className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
                >
                  Fechar
                </button>
              </div>
            )}

            {hireStatus === 'error' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Erro</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {hireMessage || "Não foi possível completar a transação."}
                </p>
                <button
                  onClick={() => setHireStatus('confirm')}
                  className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
                >
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingSherpas ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800"></div>
          ))
        ) : sherpas.length > 0 ? (
          sherpas.map((sherpa) => (
            <div key={sherpa.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={sherpa.player.avatar} alt={sherpa.player.username} className="w-12 h-12 rounded-full border-2 border-blue-500" />
                    <div>
                      <h3 onClick={() => onViewProfile(sherpa.player.username)} className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer hover:underline">
                        {sherpa.player.username}
                        <ShieldCheck size={16} className="text-blue-500" />
                      </h3>
                      <div className="flex items-center text-xs text-yellow-400">
                        <Star size={12} fill="currentColor" className="mr-1" />
                        <span className="font-bold mr-1">{sherpa.rating}</span>
                        <span className="text-slate-500">({sherpa.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{sherpa.hourlyRate}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-end gap-1"><Coins size={10} /> Coins</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Especialidades</div>
                  <div className="flex flex-wrap gap-2">
                    {sherpa.specialties.map(spec => (
                      <span key={spec} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => initiateHire(sherpa)}
                  className="w-full py-3 bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 font-semibold rounded-xl transition-all border border-slate-700 hover:border-blue-500 flex items-center justify-center"
                >
                  <DollarSign size={16} className="mr-1" /> Contratar Sessão
                </button>
              </div>
              <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <span>CarryMe Score: <span className="text-green-400 font-bold">{sherpa.player.score}</span></span>
                <span>Ultima sessão: 2h atrás</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
            <GraduationCap size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold">Nenhum Sherpa disponível no momento.</p>
            <p className="text-xs text-slate-600">Seja o primeiro a se tornar um mentor!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SherpaMarket;