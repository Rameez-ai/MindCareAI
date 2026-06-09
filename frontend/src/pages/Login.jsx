import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Could not sign in. Please verify your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 via-sky-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="absolute top-10 left-10 flex items-center gap-2">
        <Brain className="h-6 w-6 text-brand-500" />
        <span className="font-bold text-lg text-slate-800 dark:text-white">MindCareAI</span>
      </div>

      <div className="w-full max-w-md p-8 glass-panel rounded-3xl space-y-6 relative">
        <div className="absolute top-0 right-10 -translate-y-1/2 p-3 bg-brand-500 text-white rounded-2xl shadow-lg">
          <Brain className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Step back into your calm, supportive space.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 glass-input text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
              <Link to="/forgot-password" disabled className="text-xs font-semibold text-brand-500 hover:text-brand-600">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 glass-input text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/10">
          New to MindCareAI?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
