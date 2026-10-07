'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4">
      {/* Ambient background rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-teal-500/10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-teal-500/5" />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/5 text-center">
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" showSubtitle={false} />
            </div>
            <h1 className="text-xl font-bold text-white mt-2">Secure Sign In</h1>
            <p className="text-sm text-slate-400 mt-1">
              HealthScreen Clinical Platform — Authorised Personnel Only
            </p>
          </div>

          {/* Security indicator */}
          <div className="mx-8 mt-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Shield className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs text-teal-300 font-medium">
              End-to-end encrypted · HIPAA-aligned session
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm
                             focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !username || !password}
              className="w-full mt-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm
                         flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/40
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600
                         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>Sign In to HealthScreen</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-slate-500">
              Access is restricted to authorised clinical staff only.<br />
              All sessions are logged for audit compliance (HIPAA § 164.312).
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="mt-4 text-center text-xs text-slate-600">
          HealthScreen AI · Community Screening Platform · v1.4.0
        </p>
      </div>
    </div>
  );
}
