import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import GlobalFilters from './GlobalFilters';
import FloatingAiChat from '../common/FloatingAiChat';

const navItems = [
  { path: '/', label: 'Executive Dashboard', emoji: '📊' },
  { path: '/trs', label: 'Trade Facilitation (TRS)', emoji: '⏱️' },
  { path: '/revenue', label: 'Revenue Intelligence', emoji: '💰' },
  { path: '/enforcement', label: 'Enforcement & Security', emoji: '🛡️' },
  { path: '/org', label: 'Org Scorecard', emoji: '🏢' },
  { path: '/alerts', label: 'Alerts Center', emoji: '🔔' },
  { path: '/ai-copilot', label: 'AI Customs Copilot', emoji: '🤖' },
];

const adminItems = [
  { path: '/admin', label: 'Administration', emoji: '⚙️' },
  { path: '/audit', label: 'Audit Log', emoji: '📜' },
];

const Layout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sleek Modern Sidebar */}
      <aside className="w-68 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col shadow-2xl z-20 shrink-0 border-r border-slate-800/80">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
              🛃
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center space-x-1.5">
                <span>Customs PMM</span>
                <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">v2.0</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Performance Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Analytics
          </div>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/15 text-white font-semibold shadow-sm border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-md shadow-blue-500" />
                )}
                <span className="text-base group-hover:scale-110 transition-transform duration-200">
                  {item.emoji}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {user?.role_name === 'System Administrator' && (
            <>
              <div className="pt-4 pb-1 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Management
              </div>
              {adminItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/15 text-white font-semibold shadow-sm border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-md shadow-blue-500" />
                    )}
                    <span className="text-base group-hover:scale-110 transition-transform duration-200">
                      {item.emoji}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer User Profile Card */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow shrink-0">
                👤
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-[11px] text-blue-400 font-medium truncate">
                  {user?.role_name || 'Authorized'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 flex flex-wrap items-center justify-between px-6 py-3.5 shadow-xs z-10 shrink-0 gap-4">
          <GlobalFilters />
        </header>

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50/70">
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating Customs AI Intelligence Copilot */}
      <FloatingAiChat />
    </div>
  );
};

export default Layout;
