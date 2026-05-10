import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const resetForm = () => { setEmail(''); setPassword(''); setDisplayName(''); setError(''); setIsLoading(false); };
  const handleClose = () => { resetForm(); onClose(); };

  const handleGoogleLogin = async () => {
    setError(''); setIsLoading(true);
    try { await loginWithGoogle(); handleClose(); if (onSuccess) onSuccess(); }
    catch (err) { setError(err.message || 'Failed to login with Google'); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!isLogin && !displayName) { setError('Please enter your name'); return; }
    setIsLoading(true);
    try {
      if (isLogin) await loginWithEmail(email, password);
      else await signupWithEmail(email, password, displayName);
      handleClose(); if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)/, '').trim() || `Failed to ${isLogin ? 'login' : 'signup'}`);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cyber-black/90 backdrop-blur-md" onClick={handleClose} />

      <div className="relative glass-panel hud-frame rounded-sm w-full max-w-md p-8" style={{animation:'scaleIn 0.25s ease-out'}}>

        {/* Corner label */}
        <div className="absolute top-3 left-3 font-mono-jet text-xs text-neon-cyan/40 tracking-widest">SYS.AUTH</div>

        {/* Close */}
        <button onClick={handleClose} className="absolute top-3 right-3 text-slate-500 hover:text-neon-cyan transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-neon-cyan/40 rounded-sm mb-4 bg-neon-cyan/5">
            <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="font-orbitron text-xl font-bold text-white tracking-wider">
            {isLogin ? 'AUTHENTICATION' : 'CREATE ACCESS'}
          </h2>
          <p className="font-mono-jet text-xs text-slate-500 tracking-widest mt-1">
            {isLogin ? 'ENTER CREDENTIALS TO PROCEED' : 'REGISTER NEW OPERATOR'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 border border-neon-red/50 bg-neon-red/10 rounded-sm" style={{animation:'shake 0.4s ease-out'}}>
            <p className="font-mono-jet text-xs text-neon-red">{error}</p>
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mb-4 px-4 py-3 bg-cyber-navy border border-slate-700 hover:border-neon-cyan/50 text-white rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-mono-jet text-sm tracking-wide"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="font-mono-jet text-xs text-slate-600">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block font-mono-jet text-xs tracking-widest text-neon-cyan/70 mb-1.5">OPERATOR NAME</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="John Doe" disabled={isLoading}
                className="cyber-input w-full px-4 py-2.5 text-sm disabled:opacity-50" />
            </div>
          )}
          <div>
            <label className="block font-mono-jet text-xs tracking-widest text-neon-cyan/70 mb-1.5">EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="operator@visionsafe.io" disabled={isLoading}
              className="cyber-input w-full px-4 py-2.5 text-sm disabled:opacity-50" />
          </div>
          <div>
            <label className="block font-mono-jet text-xs tracking-widest text-neon-cyan/70 mb-1.5">ACCESS CODE</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" disabled={isLoading}
              className="cyber-input w-full px-4 py-2.5 text-sm disabled:opacity-50" />
          </div>

          <button type="submit" disabled={isLoading}
            className="btn-cyber-solid w-full py-3 font-orbitron text-sm tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>AUTHENTICATING...</>
            ) : isLogin ? 'AUTHENTICATE' : 'CREATE ACCESS'}
          </button>
        </form>

        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="w-full mt-4 font-mono-jet text-xs text-slate-500 hover:text-neon-cyan transition-colors tracking-wide">
          {isLogin ? 'NO ACCOUNT? → REGISTER' : 'HAVE ACCESS? → LOGIN'}
        </button>
      </div>

      <style>{`
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
};

export default LoginModal;
