import { useEffect, useState } from 'react';

export const AuthGate = ({ children }) => {
  const [status, setStatus] = useState('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setStatus(d.authenticated ? 'authed' : 'guest'))
      .catch(() => setStatus('guest'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 animate-pulse-soft shadow-xl shadow-primary-500/30 flex items-center justify-center">
          <span className="text-xl text-white">₹</span>
        </div>
      </div>
    );
  }

  if (status === 'authed') {
    return (
      <>
        {children}
        <button
          onClick={async () => {
            try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
            setStatus('guest');
            setPassword('');
          }}
          className="fixed bottom-6 right-6 z-[100] bg-dark-800/80 backdrop-blur-xl text-white/80 hover:text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-xl border border-white/10 transition-all hover:bg-dark-900 hover:scale-105"
        >
          🔒 Lock
        </button>
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) { setError('Enter a password'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
        credentials: 'include',
      });
      if (res.ok) {
        setStatus('authed');
        setPassword('');
      } else {
        setError('Wrong password — try again');
      }
    } catch {
      setError('Cannot reach the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-primary-950">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        <div className="glass bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-primary-500/30">
              <span className="text-3xl text-white">₹</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Finance Tracker</h1>
            <p className="text-sm text-white/50 mt-2">Enter your password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                autoFocus
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-lg"
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-2.5 rounded-xl animate-scale-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary-500 to-emerald-600 hover:from-primary-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? 'Checking...' : 'Enter'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">Password verified on the server</p>
        </div>
      </div>
    </div>
  );
};