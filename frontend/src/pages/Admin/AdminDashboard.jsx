import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { Sliders, Shield, Building, Users, Wrench, Plus, Check, ArrowLeft } from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weights, setWeights] = useState({
    severity: 0.25,
    safetyRisk: 0.25,
    peopleAffected: 0.15,
    urgency: 0.15,
    publicImpact: 0.10,
    dependencyFactor: 0.10,
    disasterMultiplier: 1.25
  });
  const [weightsSaved, setWeightsSaved] = useState(false);

  // New Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    contactPhone: '',
    email: '',
    jurisdiction: 'Central Metropolitan District'
  });

  const fetchOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      if (res.success) {
        setData(res);
        if (res.priorityRule && res.priorityRule.weights) {
          setWeights(res.priorityRule.weights);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    setWeightsSaved(false);
  };

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updatePriorityWeights(weights);
      if (res.success) {
        setWeightsSaved(true);
        setTimeout(() => setWeightsSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update weights: ' + err.message);
    }
  };

  const handleToggleDept = async (id) => {
    try {
      await api.toggleDepartmentActive(id);
      await fetchOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createDepartment(deptForm);
      if (res.success) {
        setShowDeptModal(false);
        setDeptForm({ name: '', code: '', contactPhone: '', email: '', jurisdiction: 'Central Metropolitan District' });
        await fetchOverview();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/command" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">System Administration & Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic priority weights, manage frontline departments, and inspect registered squads.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading admin parameters...</div>
      ) : (
        <div className="space-y-8">
          {/* Priority Rules Configuration Engine (Prompt Requirement 15 & 43) */}
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Core Algorithm Configuration</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-700" /> Dynamic Priority Engine Weights
                </h3>
              </div>
              {weightsSaved && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Saved & Active in Triage
                </span>
              )}
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Severity Weight (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.severity}
                    onChange={(e) => handleWeightChange('severity', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.25</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Safety Risk Weight (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.safetyRisk}
                    onChange={(e) => handleWeightChange('safetyRisk', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.25 (Electrocution / Trauma)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    People Affected Weight (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.peopleAffected}
                    onChange={(e) => handleWeightChange('peopleAffected', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.15 (Civilian volume)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Frontline Urgency Weight (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.urgency}
                    onChange={(e) => handleWeightChange('urgency', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.15 (Response timeline)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Public Impact Weight (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.publicImpact}
                    onChange={(e) => handleWeightChange('publicImpact', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.10 (Thoroughfare / grid)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Dependency Factor (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={weights.dependencyFactor}
                    onChange={(e) => handleWeightChange('dependencyFactor', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: 0.10 (Blocks downstream tasks)</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs shadow-sm transition-colors"
                >
                  SAVE & APPLY PRIORITY WEIGHTS
                </button>
              </div>
            </form>
          </div>

          {/* Departments Directory & Management */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden font-sans">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Frontline Departments & Capabilities ({data.departments?.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Manage agency activation, capabilities, and jurisdictions.
                </span>
              </div>
              <button
                onClick={() => setShowDeptModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Department
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Department Name</th>
                    <th className="py-2.5 px-4">Core Capabilities</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.departments?.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{dept.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{dept.name}</td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                        {Array.isArray(dept.capabilities) ? dept.capabilities.join(', ') : 'Standard'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{dept.contactPhone}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          dept.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dept.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleDept(dept._id)}
                          className="text-xs text-blue-700 hover:underline font-semibold"
                        >
                          {dept.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full shadow-lg text-xs font-sans">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Frontline Department</h3>
            <p className="text-slate-500 mb-4">Register a new public agency in the RESQ-GRID coordination registry.</p>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Water Supply & Sewage Board"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. WATER"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Dispatch Contact</label>
                <input
                  type="text"
                  value={deptForm.contactPhone}
                  onChange={(e) => setDeptForm({ ...deptForm, contactPhone: e.target.value })}
                  placeholder="+91 80 2233 4465"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow-sm"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
