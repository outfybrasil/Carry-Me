import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, ShieldCheck, CheckCircle, Terminal, Cpu, Info } from 'lucide-react';
import { api } from '../services/api';
import { Player } from '../types';

interface AuthProps {
  onLogin: (user: Player) => void;
  onBack: () => void;
  initialView?: 'LOGIN' | 'REGISTER' | 'FORGOT' | 'VERIFY_SENT' | 'UPDATE_PASSWORD';
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'VERIFY_SENT' | 'UPDATE_PASSWORD';

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, initialView = 'LOGIN' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [username, setUsername] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email OR Username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await api.login(loginIdentifier, password);
      if (user) onLogin(user);
      else setError('Credenciais inválidas.');
    } catch (err: any) {
      if (err.message.includes('Usuário não encontrado')) {
        setError('Usuário ou email não encontrado.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Confirme seu email.');
      } else {
        setError('Credenciais inválidas ou erro de conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreedToTerms) { setError("Aceite os termos."); return; }
    setIsLoading(true);
    try {
      if (password !== confirmPassword) throw new Error("Senhas não coincidem.");
      const result = await api.register(username, email, password);
      if (result && !result.session) setView('VERIFY_SENT');
      else {
        const profile = await api.checkSession();
        if (profile) onLogin(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setIsDiscordLoading(true);
    setError('');
    try {
      await api.loginWithDiscord();
    } catch (e: any) {
      setIsDiscordLoading(false);
      setError("Erro ao conectar com Discord.");
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await api.loginWithGoogle();
    } catch (e: any) {
      setIsGoogleLoading(false);
      setError("Erro ao conectar com Google.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await api.resetPassword(loginIdentifier);
      setSuccessMsg('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
      if (password !== confirmPassword) throw new Error("Senhas não coincidem.");
      await api.updatePassword(password);
      setSuccessMsg("Senha atualizada com sucesso!");
      setTimeout(async () => {
        const user = await api.checkSession();
        if (user) onLogin(user);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-200 font-sans noise-bg grid-bg scanline">
      {/* Tactical Borders / Frames */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-[1px] border-l-[1px] border-white/5 pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-32 h-32 border-t-[1px] border-r-[1px] border-white/5 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-[1px] border-l-[1px] border-white/5 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-[1px] border-r-[1px] border-white/5 pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-500">

        {/* ACCESS TERMINAL UI */}
        <div className="bg-[#121417] border border-white/10 shadow-2xl overflow-hidden flex flex-col">

          {/* TERMINAL HEADER */}
          <div className="bg-[#1c1f24] p-5 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffb800] text-black flex items-center justify-center font-black rounded-sm shadow-[0_0_15px_rgba(255,184,0,0.2)]">
                <Terminal size={20} />
              </div>
              <div>
                <h1 className="text-lg font-tactical font-black tracking-tighter text-white uppercase italic">Carry<span className="text-[#ffb800]">Me</span></h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> SERVER_ONLINE</span>
                  <span className="opacity-30">|</span>
                  <span>v4.2.0_TACTICAL</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end font-mono text-[9px] text-slate-600">
              <p>SECURE_AUTH_LAYER</p>
              <p>ENCRYPTION: AES-256</p>
            </div>
          </div>

          {/* MAIN FORM AREA */}
          <div className="p-8 md:p-12 relative">

            {/* BACK BUTTON */}
            <button onClick={onBack} className="absolute top-4 left-4 text-slate-600 hover:text-[#ffb800] transition-colors z-20 flex items-center text-[10px] font-mono uppercase tracking-[0.2em] group">
              <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" /> TERMINAR_CONEXAO
            </button>

            <div className="mt-4">
              {error && (
                <div className="mb-8 p-4 bg-red-500/5 border-l-2 border-red-500 rounded-sm text-red-400 text-xs font-medium flex items-center gap-3 animate-in slide-in-from-left-2 transition-all">
                  <div className="p-1.5 bg-red-500/20 rounded-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <span>{error}</span>
                </div>
              )}

              {view === 'LOGIN' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-tactical font-black text-white uppercase tracking-tight italic">Acesso Restrito</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Insira suas credenciais táticas para prosseguir.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">ID_USUARIO / EMAIL</label>
                        <Cpu size={12} className="text-slate-700" />
                      </div>
                      <input
                        type="text"
                        placeholder="NICKNAME_OU_EMAIL"
                        className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all placeholder:text-slate-800 font-mono text-sm text-white"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">PASSWORD_TOKEN</label>
                        <Lock size={12} className="text-slate-700" />
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 pr-14 focus:border-[#ffb800]/50 focus:outline-none transition-all placeholder:text-slate-800 font-mono text-sm text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-4 text-slate-600 hover:text-white transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setView('FORGOT')} className="text-[10px] text-slate-600 font-bold hover:text-[#ffb800] transition-colors uppercase tracking-widest">Recuperar Acesso</button>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading || isDiscordLoading} className="w-full py-4 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest hover:bg-[#ffc933] transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(255,184,0,0.15)] active:scale-95 disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Sincronizar Terminal'}
                    </button>
                  </form>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-mono font-bold"><span className="px-4 bg-[#121417] text-slate-600">OU_CONEXAO_EXTERNA</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading || isLoading || isDiscordLoading}
                      className="group py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 group hover:bg-white/10"
                    >
                      {isGoogleLoading ? <Loader2 className="animate-spin" /> : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8" />
                        </svg>
                      )}
                      <span className="text-[11px] font-mono uppercase tracking-widest hidden sm:inline">Google</span>
                    </button>

                    <button
                      onClick={handleDiscordLogin}
                      disabled={isDiscordLoading || isLoading || isGoogleLoading}
                      className="group py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-white/10"
                    >
                      {isDiscordLoading ? <Loader2 className="animate-spin" /> : <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/discord-round-color-icon.png" alt="Discord" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />}
                      <span className="text-[11px] font-mono uppercase tracking-widest hidden sm:inline">Discord</span>
                    </button>
                  </div>
                </div>
              )}

              {view === 'REGISTER' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-tactical font-black text-white uppercase tracking-tight italic">Criação de Agente</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Inicie seu protocolo de registro na plataforma.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">ESTABELECER_NICKNAME</label>
                      <input type="text" placeholder="EX: CARRY_MASTER" className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all font-mono text-sm text-white" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">ENDPOINT_EMAIL</label>
                      <input type="email" placeholder="OPERADOR@CARRYME.GG" className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all font-mono text-sm text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">PASSWORD</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all font-mono text-sm text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">CONFIRM</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all font-mono text-sm text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-sm mt-6 group">
                      <div className="pt-0.5">
                        <input type="checkbox" id="terms" className="h-4 w-4 rounded-sm border-white/10 bg-black checked:bg-[#ffb800] transition-colors cursor-pointer" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                      </div>
                      <label htmlFor="terms" className="text-[11px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-300 transition-colors cursor-pointer">
                        Eu aceito os <span className="text-white font-bold underline">Termos de Uso</span> e confirmo que meus dados serão processados via LGPD pela CarryMe.
                      </label>
                    </div>

                    <button type="submit" disabled={isLoading || !agreedToTerms} className="w-full py-5 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest hover:bg-[#ffc933] transition-all flex items-center justify-center mt-6 shadow-[0_4px_20px_rgba(255,184,0,0.15)]">
                      {isLoading ? <Loader2 className="animate-spin" /> : 'CONCLUIR_CADASTRO'}
                    </button>
                  </form>
                </div>
              )}

              {/* OTHER VIEWS (FORGOT, UPDATE_PASSWORD, VERIFY_SENT) follow the same tactical pattern */}
              {view === 'FORGOT' && (
                <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-tactical font-black text-white uppercase tracking-tight italic">Recuperar Acesso</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Informe seu ID para redefinir o protocolo de senha.</p>
                  </div>

                  {successMsg ? (
                    <div className="p-5 bg-green-500/5 border-l-2 border-green-500 rounded-sm text-green-400 text-xs font-medium flex items-center gap-3">
                      <CheckCircle size={20} className="flex-shrink-0" /> {successMsg}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">EMAIL_VINCULADO</label>
                      <input
                        type="text"
                        placeholder="OPERADOR@EMAIL.COM"
                        className="w-full bg-black/40 border border-white/5 rounded-sm py-4 px-5 focus:border-[#ffb800]/50 focus:outline-none transition-all font-mono text-sm text-white"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {!successMsg && (
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#ffb800] text-black font-tactical font-black uppercase italic tracking-widest hover:bg-[#ffc933] transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(255,184,0,0.15)]">
                      {isLoading ? <Loader2 className="animate-spin" /> : 'ENVIAR_PROTOCOLO_RECUPERACAO'}
                    </button>
                  )}

                  <button type="button" onClick={() => setView('LOGIN')} className="w-full py-2 text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em] hover:text-white transition-colors">
                    CANCELAR_OPERACAO
                  </button>
                </form>
              )}

            </div>
          </div>

          {/* TERMINAL FOOTER */}
          <div className="bg-[#1c1f24] p-6 border-t border-white/10 flex justify-between items-center">
            {view === 'LOGIN' ? (
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">Sem acesso ao sistema?</p>
                <button onClick={() => setView('REGISTER')} className="text-[#ffb800] text-xs font-black uppercase tracking-widest hover:underline text-left">INICIAR_NOVA_INSCRICAO</button>
              </div>
            ) : view === 'FORGOT' ? null : view === 'UPDATE_PASSWORD' ? null : (
              <div className="flex flex-col gap-1 w-full text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono">Já possui protocolo ativo?</p>
                <button onClick={() => setView('LOGIN')} className="text-[#ffb800] text-xs font-black uppercase tracking-widest hover:underline">VOLTAR_AO_LOGIN</button>
              </div>
            )}

            <div className="hidden md:flex items-center gap-4 text-slate-800">
              <Cpu size={24} />
              <Info size={24} />
            </div>
          </div>
        </div>

        {/* EXTERNAL DECORATIVE ELEMENTS */}
        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-[9px] font-mono text-slate-700 tracking-widest">ENCRYPTED_SIGNAL :: 248.12.9.22</p>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;