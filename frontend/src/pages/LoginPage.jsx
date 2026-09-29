import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, HardHat, Shield, KeyRound, AlertCircle, Zap, Droplets, Car, Flame, HeartPulse, Radio, Lock } from 'lucide-react';

export const LoginPage = () => {
  // activeTab: 'customer' | 'department' | 'admin'
  const [activeTab, setActiveTab] = useState('customer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setIdentifier('');
    setPassword('');
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      redirectUser(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role, departmentCode = null) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(role, departmentCode);
      redirectUser(user);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (!user) return;
    if (user.role === 'citizen') navigate('/citizen');
    else if (user.role === 'department') navigate('/department');
    else if (user.role === 'command_center') navigate('/command');
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-blue-700 text-white font-bold text-lg mb-3 shadow-xs">
            RG
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">RESQ-GRID Portal Access</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your designated public service or disaster coordination console.
          </p>
        </div>

        {/* 3 Role Selection Tabs (Customer, Department, Admin) */}
        <div className="bg-white border border-slate-200 rounded-md p-1 grid grid-cols-3 gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'customer'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('department')}
            className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'department'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Department</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CUSTOMER LOGIN */}
        {/* ============================================================== */}
        {activeTab === 'customer' && (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                Customer / Citizen Access
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Sign in to Citizen Portal</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit natural incident reports, track live response progress, and verify on-site completion.
              </p>
            </div>

            {/* Quick 1-Click Demo Buttons for Customer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-700" /> 1-Click Demo Customer Logins:
                </span>
                <span className="font-mono text-[10px]">pwd: password123</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-blue-600 rounded text-left transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Rohan Sharma (Citizen 1)</div>
                    <div className="text-[10px] text-slate-500">citizen@resqgrid.demo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-blue-600 rounded text-left transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Ananya Verma (Citizen 2)</div>
                    <div className="text-[10px] text-slate-500">citizen2@resqgrid.demo</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Email or Registered Phone
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. citizen@resqgrid.demo or +91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-xs transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In as Customer'}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
              New customer?{' '}
              <Link to="/register" className="text-blue-700 hover:underline font-semibold">
                Register a Citizen Account
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DEPARTMENT LOGIN */}
        {/* ============================================================== */}
        {activeTab === 'department' && (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                Department Operations Desk
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Sign in to Department Console</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frontline operations queue. Departments only view tasks matching their capabilities.
              </p>
            </div>

            {/* Quick 1-Click Agency Selectors */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-700" /> 1-Click Department Selectors:
                </span>
                <span className="font-mono text-[10px]">pwd: password123</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'ELECTRICITY')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-amber-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Electricity</div>
                    <div className="text-[10px] text-slate-500 font-mono">ELECTRICITY</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'PWD')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-orange-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <HardHat className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">PWD / Road</div>
                    <div className="text-[10px] text-slate-500 font-mono">PWD</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'DRAINAGE')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-sky-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Drainage</div>
                    <div className="text-[10px] text-slate-500 font-mono">DRAINAGE</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'TRAFFIC')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-indigo-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <Car className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Traffic</div>
                    <div className="text-[10px] text-slate-500 font-mono">TRAFFIC</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'FIRE_RESCUE')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-red-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Fire & Rescue</div>
                    <div className="text-[10px] text-slate-500 font-mono">FIRE_RESCUE</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('department', 'MEDICAL')}
                  disabled={loading}
                  className="p-2 bg-white border border-slate-200 hover:border-emerald-600 rounded text-left transition-colors flex items-center gap-1.5"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Medical</div>
                    <div className="text-[10px] text-slate-500 font-mono">MEDICAL</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department ID or Dispatch Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ELECTRICITY or electricity@resqgrid.demo"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs shadow-xs transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In to Department Console'}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ADMIN & COMMAND CENTER LOGIN */}
        {/* ============================================================== */}
        {activeTab === 'admin' && (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                Command & Administrative Hub
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Sign in to Command Center</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central operational triage, city GIS map, disaster mode management, and priority algorithm configuration.
              </p>
            </div>

            {/* Quick 1-Click Selectors for Command/Admin */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-red-700" /> 1-Click Administrative Access:
                </span>
                <span className="font-mono text-[10px]">pwd: password123</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('command_center')}
                  disabled={loading}
                  className="p-2.5 bg-white border border-slate-200 hover:border-red-600 rounded text-left transition-colors flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Command Center Officer</div>
                    <div className="text-[10px] text-slate-500">command@resqgrid.demo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  disabled={loading}
                  className="p-2.5 bg-white border border-slate-200 hover:border-slate-800 rounded text-left transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">System Administrator</div>
                    <div className="text-[10px] text-slate-500">admin@resqgrid.demo</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administrator ID or Official Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. command@resqgrid.demo or admin@resqgrid.demo"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded text-xs shadow-xs transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
