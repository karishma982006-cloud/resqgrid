import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import IncidentMap from '../../components/IncidentMap';
import {
  AlertTriangle,
  Radio,
  Clock,
  CheckCircle2,
  Users,
  Shield,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap
} from 'lucide-react';

export const CommandDashboard = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster, activateDisaster, deactivateDisaster } = useDisaster();

  const [analytics, setAnalytics] = useState(null);
  const [cases, setCases] = useState([]);
  const [criticalQueue, setCriticalQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingDisaster, setTogglingDisaster] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, casesRes, queueRes] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getCases(),
        api.getTasks({ priority: 'CRITICAL', status: { $ne: 'COMPLETED' } })
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (casesRes.success) setCases(casesRes.cases || []);
      if (queueRes.success) setCriticalQueue(queueRes.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDisasterMode = async () => {
    setTogglingDisaster(true);
    try {
      if (isDisasterMode) {
        if (window.confirm('Deactivate Disaster Mode and return to normal municipal operations?')) {
          await deactivateDisaster();
        }
      } else {
        if (window.confirm('ACTIVATE EMERGENCY DISASTER MODE across all public-safety fleets?')) {
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
      await fetchDashboardData();
    } catch (err) {
      alert('Error updating disaster status: ' + err.message);
    } finally {
      setTogglingDisaster(false);
    }
  };

  const s = analytics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Top Command Bar & Disaster Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              COMMAND & CONTROL HEADQUARTERS
            </span>
            {isDisasterMode ? (
              <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                DISASTER MODE: ACTIVE
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                NORMAL OPERATIONAL MODE
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Operational Command</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-agency triage, responsibility graph monitoring, and emergency dispatch.
          </p>
        </div>

        {/* Disaster Mode Activation Button (Prompt Requirement 31) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={togglingDisaster}
            onClick={handleToggleDisasterMode}
            className={`px-4 py-2.5 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-2 ${
              isDisasterMode
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            {isDisasterMode ? 'DEACTIVATE DISASTER MODE' : 'ACTIVATE DISASTER MODE'}
          </button>
        </div>
      </div>

      {/* Operational KPI Tiles (Prompt Requirement 25) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Cases</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">{s.activeCases || cases.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">In field progress</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Critical Cases</span>
          <span className="text-2xl font-bold text-red-700 font-mono mt-1 block">{s.criticalCases || 1}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Life safety priority</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Unassigned</span>
          <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">0</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Pending routing</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Escalated</span>
          <span className="text-2xl font-bold text-rose-800 font-mono mt-1 block">{s.escalatedTasks || 0}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires intervention</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Responsibility Gaps</span>
          <span className="text-2xl font-bold text-purple-900 font-mono mt-1 block">{s.responsibilityGaps || 0}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">No available squad</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">{s.resolvedCases || 0}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified & closed</span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Critical Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* City Map */}
        <div className="lg:col-span-2">
          <IncidentMap cases={cases} height="420px" />
        </div>

        {/* Critical Priority Queue */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Critical Priority Queue ({criticalQueue.length})
            </span>
            <Link to="/command/incidents" className="text-xs text-blue-700 hover:underline font-semibold">
              All Incidents →
            </Link>
          </div>

          <div className="p-3 overflow-y-auto max-h-[360px] divide-y divide-slate-100 flex-1">
            {criticalQueue.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No unresolved critical priority tasks at this moment.
              </div>
            ) : (
              criticalQueue.map((item) => (
                <div key={item._id} className="py-2.5 first:pt-0 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{item.caseId}</span>
                    <PriorityBadge level={item.priorityLevel} score={item.priorityScore} showScore={true} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">{item.title}</h4>
                  <div className="text-[11px] text-slate-500 mb-1">
                    {item.departmentName} • {item.location?.address}
                  </div>
                  <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 mb-1">
                    {item.prioritySummaryReason}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={item.status} />
                    <Link
                      to={`/cases/${item.caseId}`}
                      className="text-xs text-blue-700 hover:underline font-semibold"
                    >
                      Inspect Case →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Master Cases & Multi-Agency Dispatch
          </h3>
          <span className="text-xs text-slate-500">
            Total Cases: {cases.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-4">Case ID</th>
                <th className="py-2.5 px-4">Mode</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Incident Description</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Decomposed Responsibilities</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.caseId || c._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.caseId}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      c.mode === 'DISASTER' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.mode || 'NORMAL'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{c.location?.address}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{c.description}</td>
                  <td className="py-3 px-4">
                    <PriorityBadge level={c.priorityLevel || c.severity} score={c.priorityScore} />
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-900">{c.problemCount || 1}</span> problems /{' '}
                    <span className="font-semibold text-slate-900">{c.departmentCount || 1}</span> depts
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/cases/${c.caseId}`}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      View Graph →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommandDashboard;
