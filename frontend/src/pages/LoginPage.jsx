import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  HardHat,
  Shield,
  AlertCircle,
  Zap,
  Droplets,
  Car,
  Flame,
  HeartPulse,
  Radio,
  Lock,
  LifeBuoy,
  Tent,
  Check
} from 'lucide-react';

export const LoginPage = () => {
  // activeTab: 'customer' | 'department' | 'admin'
  const [activeTab, setActiveTab] = useState('department');
  const [identifier, setIdentifier] = useState('ELECTRICITY');
  const [password, setPassword] = useState('password123');
  const [selectedDept, setSelectedDept] = useState('ELECTRICITY');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const departments = [
    { code: 'ELECTRICITY', name: 'Electricity', icon: Zap, color: 'text-amber-600', border: 'hover:border-amber-500', activeBg: 'border-amber-600 bg-amber-50/60 text-amber-900', email: 'electricity@resqgrid.demo' },
    { code: 'PWD', name: 'PWD / Road', icon: HardHat, color: 'text-orange-600', border: 'hover:border-orange-500', activeBg: 'border-orange-600 bg-orange-50/60 text-orange-900', email: 'pwd@resqgrid.demo' },
    { code: 'DRAINAGE', name: 'Drainage', icon: Droplets, color: 'text-sky-600', border: 'hover:border-sky-500', activeBg: 'border-sky-600 bg-sky-50/60 text-sky-900', email: 'drainage@resqgrid.demo' },
    { code: 'TRAFFIC', name: 'Traffic', icon: Car, color: 'text-indigo-600', border: 'hover:border-indigo-500', activeBg: 'border-indigo-600 bg-indigo-50/60 text-indigo-900', email: 'traffic@resqgrid.demo' },
    { code: 'FIRE_RESCUE', name: 'Fire & Rescue', icon: Flame, color: 'text-red-600', border: 'hover:border-red-500', activeBg: 'border-red-600 bg-red-50/60 text-red-900', email: 'fire@resqgrid.demo' },
    { code: 'MEDICAL', name: 'Medical', icon: HeartPulse, color: 'text-emerald-600', border: 'hover:border-emerald-500', activeBg: 'border-emerald-600 bg-emerald-50/60 text-emerald-900', email: 'medical@resqgrid.demo' },
    { code: 'SEARCH_RESCUE', name: 'Search & Rescue', icon: LifeBuoy, color: 'text-cyan-700', border: 'hover:border-cyan-500', activeBg: 'border-cyan-600 bg-cyan-50/60 text-cyan-900', email: 'sdrf@disaster.gov.demo' },
    { code: 'RELIEF', name: 'Relief & Shelter', icon: Tent, color: 'text-teal-700', border: 'hover:border-teal-500', activeBg: 'border-teal-600 bg-teal-50/60 text-teal-900', email: 'relief@district.gov.demo' }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'department') {
      setSelectedDept('ELECTRICITY');
      setIdentifier('ELECTRICITY');
      setPassword('password123');
    } else if (tab === 'customer') {
      setIdentifier('citizen@resqgrid.demo');
      setPassword('password123');
    } else if (tab === 'admin') {
      setIdentifier('command@resqgrid.demo');
      setPassword('password123');
    }
  };

  const handleSelectDepartment = (dept) => {
    setSelectedDept(dept.code);
    setIdentifier(dept.code);
    setPassword('password123');
    setError('');
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

            {/* Quick Citizen Account Selectors */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Choose Customer Account (or enter below):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('citizen@resqgrid.demo');
                    setPassword('password123');
                  }}
                  className={`p-2 rounded border text-left text-xs transition-all flex items-center gap-2 ${
                    identifier === 'citizen@resqgrid.demo'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs truncate">Rohan Sharma</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">citizen@resqgrid.demo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('citizen2@resqgrid.demo');
                    setPassword('password123');
                  }}
                  className={`p-2 rounded border text-left text-xs transition-all flex items-center gap-2 ${
                    identifier === 'citizen2@resqgrid.demo'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs truncate">Ananya Verma</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">citizen2@resqgrid.demo</div>
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
                  placeholder="e.g. citizen@resqgrid.demo or phone number"
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
        {/* TAB 2: DEPARTMENT LOGIN (WITH DEPARTMENT SELECTORS) */}
        {/* ============================================================== */}
        {activeTab === 'department' && (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                Department Operations Desk
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Sign in to Department Console</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your department desk or enter credentials to access your frontline response queue.
              </p>
            </div>

            {/* Department Selection Cards (Feature Requested by User) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                Select Your Department Desk:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  const isSelected = selectedDept === dept.code;
                  return (
                    <button
                      key={dept.code}
                      type="button"
                      onClick={() => handleSelectDepartment(dept)}
                      className={`p-2.5 rounded border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? dept.activeBg + ' shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white ' + dept.border + ' text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${dept.color}`} />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-semibold text-xs truncate text-slate-900">{dept.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{dept.code}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs pt-1 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Selected Department ID / Dispatch Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setSelectedDept(e.target.value);
                  }}
                  placeholder="e.g. ELECTRICITY or electricity@resqgrid.demo"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-600 outline-none font-mono"
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
                {loading ? 'Authenticating...' : `Sign In to ${selectedDept || 'Department'} Console`}
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

            {/* Quick Admin Role Selectors */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Select Administrative Role:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('command@resqgrid.demo');
                    setPassword('password123');
                  }}
                  className={`p-2.5 rounded border text-left transition-all flex items-center gap-2 ${
                    identifier === 'command@resqgrid.demo'
                      ? 'border-red-600 bg-red-50/70 text-red-950 font-semibold'
                      : 'border-slate-200 bg-white hover:border-red-400 text-slate-700'
                  }`}
                >
                  <Radio className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs truncate">Command Center</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">command@resqgrid.demo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@resqgrid.demo');
                    setPassword('password123');
                  }}
                  className={`p-2.5 rounded border text-left transition-all flex items-center gap-2 ${
                    identifier === 'admin@resqgrid.demo'
                      ? 'border-slate-800 bg-slate-100 text-slate-950 font-semibold'
                      : 'border-slate-200 bg-white hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <Lock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs truncate">System Administrator</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">admin@resqgrid.demo</div>
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
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs pt-1 border-t border-slate-100">
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
                {loading ? 'Authenticating...' : 'Sign In to Command Hub'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
