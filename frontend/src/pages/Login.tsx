import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';

const demoAccounts = [
  { role: 'System Admin', email: 'admin@pmm.gov', emoji: '👑' },
  { role: 'Auditor', email: 'auditor@pmm.gov', emoji: '📋' },
  { role: 'Port Manager', email: 'pm_karachi@pmm.gov', emoji: '🚢' },
  { role: 'Revenue Officer', email: 'rev_karachi@pmm.gov', emoji: '💰' },
];

const Login = () => {
  const [email, setEmail] = useState('admin@pmm.gov');
  const [password, setPassword] = useState('Password123!');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  const selectAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 font-sans text-slate-800">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md relative overflow-hidden">
        {/* Top Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
            🛃
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customs PMM</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Performance Measurement & Trade Intelligence Suite
          </p>
        </div>

        {error && (
          <div className="mb-5 text-xs text-red-700 bg-red-50 border border-red-200/80 p-3 rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="name@pmm.gov"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <span>➔</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            ⚡ Quick Demo Accounts (1-Click Fill):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectAccount(acc.email)}
                className={`text-left p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center space-x-2 ${
                  email === acc.email
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600'
                }`}
              >
                <span>{acc.emoji}</span>
                <span className="truncate">{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
