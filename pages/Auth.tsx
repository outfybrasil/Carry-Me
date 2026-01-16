import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
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
    if(initialView) setView(initialView);
  }, [initialView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // loginIdentifier can be email or username
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
      // Redirection happens automatically
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
      // Redirection happens automatically
    } catch (e: any) {
      setIsGoogleLoading(false);
      console.error("Google Auth Error:", e);
      if (e.message?.includes('provider is not enabled')) {
          setError("Google não ativado no painel do Supabase.");
      } else {
          setError("Erro ao conectar com Google.");
      }
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
      
      // Auto login/redirect after delay
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
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-white/10 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors z-20 flex items-center text-xs font-medium uppercase tracking-widest">
          <ArrowLeft size={14} className="mr-1" /> Início
        </button>

        <div className="p-8 pb-0 text-center mt-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white text-black rounded-xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="text-2xl font-bold font-display">C</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Carry<span className="text-brand-purple">Me</span></h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Protocolo de Acesso</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center"><ShieldCheck size={16} className="mr-2 flex-shrink-0" />{error}</div>}

          {view === 'LOGIN' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex gap-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading || isDiscordLoading}
                  className="group relative flex-1 py-4 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center shadow-xl shadow-white/5 overflow-hidden disabled:opacity-50"
                  title="Entrar com Google"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin" /> : (
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                  )}
                </button>

                <button
                  onClick={handleDiscordLogin}
                  disabled={isDiscordLoading || isLoading || isGoogleLoading}
                  className="group relative flex-1 py-4 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center shadow-xl shadow-white/5 overflow-hidden disabled:opacity-50"
                  title="Entrar com Discord"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  {isDiscordLoading ? <Loader2 className="animate-spin" /> : <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/discord-round-color-icon.png" alt="Discord" className="w-6 h-6" />}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold"><span className="px-3 bg-brand-dark text-slate-600">Ou via Credenciais</span></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email ou Usuário</label>
                  <input 
                    type="text" 
                    placeholder="SeuNick ou email@carryme.com" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple focus:outline-none transition-all placeholder:text-slate-700" 
                    value={loginIdentifier} 
                    onChange={(e) => setLoginIdentifier(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Senha</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-12 focus:border-brand-purple focus:outline-none transition-all placeholder:text-slate-700" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-600 hover:text-white transition-colors">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                
                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button type="button" onClick={() => setView('FORGOT')} className="text-[10px] text-brand-purple font-bold hover:underline">Esqueci minha senha</button>
                </div>

                <button type="submit" disabled={isLoading || isDiscordLoading} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center mt-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Acessar Terminal'}
                </button>
              </form>
            </div>
          )}

          {view === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nickname</label>
                  <input type="text" placeholder="Seu Nick" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                  <input type="email" placeholder="gamer@carryme.com" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Senha</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar</label>
                  <input type="password" placeholder="Repita a senha" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                  <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-slate-700 bg-black" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <label htmlFor="terms" className="text-[10px] text-slate-400 leading-tight">Concordo com os Termos de Uso e Política de Privacidade (LGPD) da CarryMe.</label>
                </div>

                <button type="submit" disabled={isLoading || !agreedToTerms} className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all flex items-center justify-center shadow-lg shadow-brand-purple/20">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
                </button>
            </form>
          )}

          {view === 'FORGOT' && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white">Recuperar Acesso</h2>
                    <p className="text-slate-400 text-xs mt-1">Informe seu email ou nome de usuário para redefinir a senha.</p>
                </div>
                
                {successMsg ? (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center">
                        <CheckCircle size={16} className="mr-2 flex-shrink-0" /> {successMsg}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email ou Usuário</label>
                        <input 
                            type="text" 
                            placeholder="SeuNick ou email@carryme.com" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple focus:outline-none transition-all placeholder:text-slate-700" 
                            value={loginIdentifier} 
                            onChange={(e) => setLoginIdentifier(e.target.value)} 
                            required 
                        />
                    </div>
                )}

                {!successMsg && (
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all flex items-center justify-center shadow-lg shadow-brand-purple/20">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Recuperação'}
                    </button>
                )}
                
                <button type="button" onClick={() => setView('LOGIN')} className="w-full py-2 text-slate-500 text-xs font-bold hover:text-white mt-2">
                    Voltar para Login
                </button>
            </form>
          )}
          
          {view === 'UPDATE_PASSWORD' && (
             <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white">Criar Nova Senha</h2>
                    <p className="text-slate-400 text-xs mt-1">Defina uma nova credencial segura para sua conta.</p>
                </div>
                
                {successMsg ? (
                   <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center">
                        <CheckCircle size={16} className="mr-2 flex-shrink-0" /> {successMsg}
                    </div>
                ) : (
                    <>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nova Senha</label>
                            <input type="password" placeholder="Mínimo 6 caracteres" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar Nova Senha</label>
                            <input type="password" placeholder="Repita a senha" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-cyan focus:outline-none transition-all" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all flex items-center justify-center shadow-lg shadow-brand-purple/20">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Atualizar Senha'}
                        </button>
                    </>
                )}
             </form>
          )}

          {view === 'VERIFY_SENT' && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-brand-cyan/20 rounded-full flex items-center justify-center mx-auto text-brand-cyan"><CheckCircle size={32} /></div>
              <h2 className="text-xl font-bold">Verifique seu Inbox</h2>
              <p className="text-slate-500 text-sm">Enviamos um link de confirmação para {email}.</p>
              <button onClick={() => setView('LOGIN')} className="text-brand-purple font-bold text-sm">Voltar para Login</button>
            </div>
          )}

          <div className="bg-black/30 p-6 text-center border-t border-white/5 mt-6 -mx-8 -mb-8">
            {view === 'LOGIN' ? (
              <p className="text-slate-500 text-xs">Novo no ecossistema? <button onClick={() => setView('REGISTER')} className="text-brand-purple font-bold hover:underline">Registrar</button></p>
            ) : view === 'FORGOT' ? null : view === 'UPDATE_PASSWORD' ? null : (
              <p className="text-slate-500 text-xs">Já possui cadastro? <button onClick={() => setView('LOGIN')} className="text-brand-purple font-bold hover:underline">Fazer Login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;