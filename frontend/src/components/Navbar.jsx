import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import NotificationDropdown from './NotificationDropdown';
import { Shield, AlertTriangle, LogOut, User as UserIcon, Radio } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDisasterMode, activeDisaster, activateDisaster, deactivateDisaster } = useDisaster();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Disaster Mode Global Warning Bar if Active (Visible only after login) */}
      {isDisasterMode && user && (
        <div className="bg-red-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 animate-pulse text-amber-300" />
            <span>DISASTER MODE: ACTIVE — {activeDisaster?.disasterCode || 'EQ-2026-001'}: {activeDisaster?.title || 'Emergency Operations Active'}</span>
            {(user.role === 'command_center' || user.role === 'admin') && (
              <Link
                to="/command/disaster"
                className="ml-auto underline hover:text-amber-200 text-[11px] font-mono whitespace-nowrap"
              >
                Emergency Command Center →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to={user ? "/" : "/login"} className="flex items-center gap-2 text-slate-900 group">
              <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                RG
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900">RESQ-GRID</span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 font-normal border-l border-slate-300 pl-2">
                  Public Service & Disaster Coordination
                </span>
              </div>
            </Link>

            {/* Role Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600">
                {user.role === 'citizen' && (
                  <>
                    <Link
                      to="/citizen"
                      className={`px-3 py-1.5 rounded-md ${isActive('/citizen') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/citizen/report"
                      className={`px-3 py-1.5 rounded-md ${isActive('/citizen/report') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Report a Problem
                    </Link>
                    <Link
                      to="/citizen/cases"
                      className={`px-3 py-1.5 rounded-md ${isActive('/citizen/cases') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      My Reports & Tracking
                    </Link>
                  </>
                )}

                {user.role === 'department' && (
                  <>
                    <Link
                      to="/department"
                      className={`px-3 py-1.5 rounded-md ${isActive('/department') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/department/queue"
                      className={`px-3 py-1.5 rounded-md ${isActive('/department/queue') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      My Priority Queue
                    </Link>
                    <Link
                      to="/department/dependencies"
                      className={`px-3 py-1.5 rounded-md ${isActive('/department/dependencies') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Dependencies
                    </Link>
                  </>
                )}

                {(user.role === 'command_center' || user.role === 'admin') && (
                  <>
                    <Link
                      to="/command"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Command Hub
                    </Link>
                    <Link
                      to="/command/incidents"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/incidents') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Live Incidents
                    </Link>
                    <Link
                      to="/command/map"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/map') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      City Map
                    </Link>
                    <Link
                      to="/command/disaster"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/disaster') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Disaster Mode
                    </Link>
                    <Link
                      to="/command/handoffs"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/handoffs') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Handoffs & Gaps
                    </Link>
                    <Link
                      to="/command/escalations"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/escalations') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Escalations
                    </Link>
                    <Link
                      to="/command/analytics"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/analytics') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/command/audit"
                      className={`px-3 py-1.5 rounded-md ${isActive('/command/audit') ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Audit Trail
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className={`px-3 py-1.5 rounded-md ${isActive('/admin') ? 'bg-blue-50 text-blue-800 font-semibold' : 'hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        Admin Settings
                      </Link>
                    )}
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Header: Profile, Notifications, Login / Logout */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Disaster Mode Quick Toggle available across all portal logins */}
                {user && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (isDisasterMode) {
                        if (window.confirm('Deactivate Disaster Mode and return all departments to Normal Municipal Operations?')) {
                          await deactivateDisaster();
                        }
                      } else {
                        if (window.confirm('ACTIVATE EMERGENCY DISASTER MODE? This will alert all department consoles and elevate priority queues.')) {
                          await activateDisaster({
                            title: 'Seismic Magnitude 6.4 Urban Center Earthquake',
                            disasterType: 'Earthquake',
                            epicenter: 'District Fault Line 3',
                            affectedRadiusKm: 25,
                            estimatedImpactPopulation: 150000,
                            description: 'Structural collapses, trapped citizens, electrical line breaks, and roadway blockages.'
                          });
                        }
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs ${
                      isDisasterMode
                        ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                    title={isDisasterMode ? "Click to Deactivate Disaster Mode" : "Click to Activate Disaster Mode"}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isDisasterMode ? 'DISASTER MODE: ON' : 'DISASTER MODE: OFF'}</span>
                  </button>
                )}

                <NotificationDropdown />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                      {user.role === 'department' ? `${user.departmentCode} DEPT` : user.role.replace('_', ' ')}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm"
                >
                  Sign In to Access Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
