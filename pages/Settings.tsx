import React, { useState } from 'react';
import { Shield, Bell, Volume2, Trash2, Save, LogOut, Moon, Eye, Settings as SettingsIcon } from 'lucide-react';
import { Player } from '../types';
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
  
  // Mock Settings State
  const [notifications, setNotifications] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

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

  const handleSave = () => {
      setUpdating(true);
      setTimeout(() => {
          setUpdating(false);
          alert("Configurações salvas localmente!");
      }, 1000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>

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