import React, { useState } from 'react';
import { Lock, User as UserIcon, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, pwd: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 text-white font-extrabold text-2xl mx-auto">
            R
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-4 tracking-tight flex items-center justify-center gap-1.5">
            Rajdhani Workforce <Sparkles className="w-4 h-4 text-brand-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Management Portal</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username / Email</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />

              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 rounded-xl border border-slate-800 text-center truncate"
              title="Admin (Full Access)"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('manager');
                setPassword('manager123');
              }}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 rounded-xl border border-slate-800 text-center truncate"
              title="Manager (Read Only)"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('operator');
                setPassword('operator123');
              }}
              className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 rounded-xl border border-slate-800 text-center truncate"
              title="Attendance Operator"
            >
              Operator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
