
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Bell, Volume2, Trash2, Save, LogOut, Moon, Eye, Settings as SettingsIcon, Link, Gamepad2, CheckCircle, RefreshCw, ExternalLink, X, HelpCircle, Check, History } from 'lucide-react';
import { Player, Transaction } from '../types';
import { api } from '../services/api';

interface SettingsProps {
  user: Player;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout, onNavigate, volume, onVolumeChange }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  
  // Game IDs
  const [riotId, setRiotId] = useState('');
  const [steamId, setSteamId] = useState('');
  const [showRiotInput, setShowRiotInput] = useState(false);
  const [tempRiotId, setTempRiotId] = useState('');
  const [gameAuthCode, setGameAuthCode] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const processingSteam = useRef(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load user data on mount AND check for return from OAuth
  useEffect(() => {
    if (user) {
        setRiotId(user.riotId || '');
        setSteamId(user.steamId || '');
        if ((user as any).gameAuthCode) setGameAuthCode((user as any).gameAuthCode);
        
        // Carregar histórico de transações
        api.getTransactionHistory(user.id).then(setTransactions);
    }

    // Check for OpenID/OAuth return params
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    
    // STEAM OPENID CALLBACK HANDLER
    const openidClaimedId = params.get('openid.claimed_id');
    
    // Check if we have params, user is loaded, and we haven't processed this yet
    if (provider === 'steam' && openidClaimedId && user && !processingSteam.current) {
        processingSteam.current = true; // Lock to prevent infinite loop
        setIsSyncing('steam');
        
        // Extract 64-bit ID from URL: https://steamcommunity.com/openid/id/76561198000000000
        const extractedSteamId = openidClaimedId.split('/').pop() || '';
        
        api.finalizeSteamAuth(user.id, extractedSteamId)
            .then(() => {
                setSteamId(extractedSteamId);
                alert(`Steam autenticada com sucesso! ID: ${extractedSteamId}`);
            })
            .catch(err => {
                console.error("Steam Auth Error:", err);
                alert("Falha ao vincular conta Steam.");
            })
            .finally(() => {
                setIsSyncing(null);
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            });
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    setUpdating(true);
    const success = await api.deleteAccount(user.id);
    if (success) {
      window.location.href = '/';
    } else {
      alert("Erro ao excluir conta. Tente novamente.");
      setUpdating(false);
    }
  };

  const handleLinkAccount = async (provider: 'riot' | 'steam') => {
      
      // STEAM (Real OAuth via OpenID)
      if (provider === 'steam') {
          setIsSyncing('steam');
          const authUrl = api.initiateSocialAuth(user.id, 'steam');
          window.location.href = authUrl;
          return;
      }

      // RIOT (Verification via API Key)
      if (provider === 'riot') {
          if (!showRiotInput) {
              setShowRiotInput(true);
              return;
          }

          if (!tempRiotId || !tempRiotId.includes('#')) {
              alert("Formato inválido. Use Nome#TAG (Ex: Faker#KR1)");
              return;
          }

          setIsSyncing('riot');
          const result = await api.verifyRiotAccount(tempRiotId);
          
          if (result.success && result.data) {
              await api.updateGameAccounts(user.id, result.data.riotId, steamId);
              await api.syncExternalStats(user.id, 'riot');
              setRiotId(result.data.riotId);
              setShowRiotInput(false);
              alert(`Conta Riot conectada! ${result.error ? `\n(Aviso: ${result.error})` : ''}`);
          } else {
              alert(`Erro: ${result.error || 'Não foi possível verificar a conta.'}`);
          }
          setIsSyncing(null);
          return;
      }
  };

  const handleSaveGameCode = async () => {
      setUpdating(true);
      try {
          const success = await api.updateGameAccounts(user.id, riotId, steamId, gameAuthCode);
          if (success) {
              alert("Código de autenticação salvo!");
          } else {
              alert("Erro ao salvar. Verifique se os dados estão corretos.");
          }
      } catch (e) {
          console.error(e);
          alert("Erro de conexão.");
      } finally {
          setUpdating(false);
      }
  };

  const handleSave = async () => {
      setUpdating(true);
      try {
          const success = await api.updateGameAccounts(user.id, riotId, steamId, gameAuthCode);
          if (success) {
              alert("Configurações salvas com sucesso!");
          } else {
              alert("Erro ao salvar dados.");
          }
      } catch (e) {
          console.error(e);
          alert("Ocorreu um erro ao conectar com o servidor.");
      } finally {
          setUpdating(false);
      }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>

      {/* Game Accounts Hub (New Design) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Gamepad2 className="text-blue-500" size={28} /> Central de Jogos
                </h2>
                <p className="text-slate-400 mt-2 max-w-lg">
                    Vincule suas contas oficiais para importar estatísticas reais, histórico de partidas e verificar sua habilidade automaticamente.
                </p>
            </div>
            {isSyncing && (
                <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-500/10 px-3 py-1 rounded-full animate-pulse">
                    <RefreshCw size={14} className="animate-spin" /> Verificando...
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* RIOT GAMES CARD */}
            <div className={`p-6 rounded-xl border transition-all ${riotId ? 'bg-slate-900/80 border-green-500/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <img src="https://img.icons8.com/color/48/riot-games.png" className="w-10 h-10" alt="Riot" />
                        <div>
                            <h3 className="font-bold text-white">Riot Games</h3>
                            <p className="text-xs text-slate-500">League of Legends, Valorant</p>
                        </div>
                    </div>
                    {riotId && <CheckCircle className="text-green-500" size={20} />}
                </div>
                
                {riotId ? (
                    <div className="bg-slate-950/50 rounded-lg p-3 flex items-center justify-between mb-4 border border-slate-800">
                        <span className="font-mono text-sm text-slate-300">{riotId}</span>
                        <span className="text-[10px] text-green-400 font-bold uppercase">Verificado</span>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 mb-4 italic">
                        Verificação via Riot API (RGAPI). Digite seu ID para validar.
                    </div>
                )}

                {showRiotInput ? (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                placeholder="Nome#TAG" 
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                                value={tempRiotId}
                                onChange={(e) => setTempRiotId(e.target.value)}
                            />
                            <button onClick={() => setShowRiotInput(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X size={16}/></button>
                        </div>
                        <button 
                            onClick={() => handleLinkAccount('riot')}
                            disabled={!!isSyncing}
                            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            {isSyncing ? 'Verificando...' : 'Confirmar'}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => handleLinkAccount('riot')}
                        disabled={!!isSyncing}
                        className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${riotId ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-[#d32936] hover:bg-[#b01e2b] text-white shadow-lg shadow-red-900/20'}`}
                    >
                        {riotId ? 'Atualizar Conta' : <><ExternalLink size={16}/> Verificar Riot ID</>}
                    </button>
                )}
            </div>

            {/* STEAM CARD */}
            <div className={`p-6 rounded-xl border transition-all ${steamId ? 'bg-slate-900/80 border-green-500/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-10 h-10" alt="Steam" />
                        <div>
                            <h3 className="font-bold text-white">Steam</h3>
                            <p className="text-xs text-slate-500">CS2, Dota 2</p>
                        </div>
                    </div>
                    {steamId && <CheckCircle className="text-green-500" size={20} />}
                </div>

                {steamId ? (
                    <div className="bg-slate-950/50 rounded-lg p-3 flex items-center justify-between mb-4 border border-slate-800">
                        <span className="font-mono text-sm text-slate-300 truncate max-w-[150px]">{steamId}</span>
                        <span className="text-[10px] text-green-400 font-bold uppercase">Conectado</span>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 mb-4 italic">
                        Login seguro via OpenID. Redireciona para Valve.
                    </div>
                )}

                <button 
                    onClick={() => handleLinkAccount('steam')}
                    disabled={!!isSyncing}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${steamId ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-[#171a21] hover:bg-[#2a475e] text-white border border-slate-600 shadow-lg'}`}
                >
                    {steamId ? 'Atualizar Conta' : <><ExternalLink size={16}/> Entrar com Steam</>}
                </button>

                {steamId && (
                    <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                                Código de Autenticação (CS2)
                                <div className="group relative">
                                    <HelpCircle size={12} className="text-slate-500 cursor-help"/>
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 hidden group-hover:block z-20 shadow-xl">
                                        Permite que nossa IA baixe suas partidas recentes para analisar comportamento (Toxicidade, Teamplay) e Habilidade. Igual ao Leetify.
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="AAAA-BBBB-CCCC-DDDD"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-mono tracking-wider"
                                value={gameAuthCode}
                                onChange={(e) => setGameAuthCode(e.target.value)}
                            />
                            <button 
                                onClick={handleSaveGameCode}
                                disabled={updating}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                                title="Salvar Código"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                            <span className="text-blue-500 font-bold">Diferencial CarryMe:</span> Usamos os dados da partida para detectar se você ajudou o time (Flash Assists, Trades) ou se foi tóxico (Team Damage, AFK), gerando seu Score de Reputação automaticamente.
                        </p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <Shield size={12} /> Seus dados são protegidos e usados apenas para gerar estatísticas de performance.
            </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History size={24} className="text-slate-400" /> Histórico de Compras
          </h2>
          {transactions.length > 0 ? (
              <div className="space-y-3">
                  {transactions.map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                  {t.type === 'PREMIUM' ? 'CarryMe Premium' : `${t.coins} Moedas`}
                                  <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">PAGO</span>
                              </div>
                              <div className="text-xs text-slate-500">{t.date}</div>
                          </div>
                          <div className="font-mono text-slate-300">
                              R$ {Number(t.amount).toFixed(2).replace('.', ',')}
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800 border-dashed">
                  Nenhuma compra realizada ainda.
              </div>
          )}
      </div>

      {/* Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <SettingsIcon size={24} className="text-slate-400" /> Preferências do App
        </h2>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Volume2 className="text-slate-400" />
                    <div>
                        <div className="font-bold text-white">Volume Geral</div>
                        <div className="text-xs text-slate-500">Efeitos sonoros de interface</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                      type="range" 
                      min="0" max="100" 
                      value={volume} 
                      onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                      className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-sm font-mono w-8 text-right text-slate-400">{volume}%</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bell className="text-slate-400" />
                    <div>
                        <div className="font-bold text-white">Notificações</div>
                        <div className="text-xs text-slate-500">Alertas de partida e mensagens</div>
                    </div>
                </div>
                <button 
                   onClick={() => setNotifications(!notifications)}
                   className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-blue-500' : 'bg-slate-700'}`}
                >
                   <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
            
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Eye className="text-slate-400" />
                    <div>
                        <div className="font-bold text-white">Modo Privado</div>
                        <div className="text-xs text-slate-500">Ocultar histórico de partidas no perfil público</div>
                    </div>
                </div>
                <button 
                   onClick={() => setPrivateMode(!privateMode)}
                   className={`w-12 h-6 rounded-full p-1 transition-colors ${privateMode ? 'bg-blue-500' : 'bg-slate-700'}`}
                >
                   <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${privateMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={updating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
                {updating ? 'Salvando...' : <><Save size={16} /> Salvar Alterações</>}
            </button>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield size={24} className="text-slate-400" /> Conta & Privacidade
        </h2>

        <div className="space-y-4">
            <button onClick={() => onNavigate('terms')} className="w-full text-left p-4 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 font-medium flex justify-between">
                Termos de Uso <span className="text-slate-500">Ler</span>
            </button>
            <button onClick={() => onNavigate('privacy')} className="w-full text-left p-4 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 font-medium flex justify-between">
                Política de Privacidade (LGPD) <span className="text-slate-500">Ler</span>
            </button>
            
            <div className="h-px bg-slate-800 my-4"></div>

            <button 
               onClick={onLogout}
               className="w-full text-left p-4 border border-slate-700 hover:bg-slate-800 rounded-xl transition-colors text-white font-bold flex items-center gap-2 justify-center"
            >
                <LogOut size={18} /> Sair da Conta
            </button>

            <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full text-left p-4 bg-red-900/10 border border-red-900/30 hover:bg-red-900/20 rounded-xl transition-colors text-red-400 font-bold flex items-center gap-2 justify-center"
            >
                <Trash2 size={18} /> Excluir Conta Permanentemente
            </button>
        </div>
      </div>

       {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-900/50 rounded-xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl shadow-red-900/20">
            <div className="flex flex-col items-center text-center mb-6">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                 <Trash2 size={32} className="text-red-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Excluir Conta?</h3>
               <p className="text-slate-400">
                 Esta ação é <span className="text-red-400 font-bold">irreversível</span>. Todos os seus dados serão apagados conforme as diretrizes da LGPD.
               </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={updating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-600/20"
              >
                {updating ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
