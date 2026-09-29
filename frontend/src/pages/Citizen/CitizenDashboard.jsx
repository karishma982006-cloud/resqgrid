import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { FileText, Clock, CheckCircle2, Bell, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    try {
      const [repRes, caseRes] = await Promise.all([
        api.getReports(),
        api.getCases()
      ]);
      if (repRes.success) setReports(repRes.reports || []);
      if (caseRes.success) setCases(caseRes.cases || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeCases = cases.filter(c => ['ACTIVE', 'IN_PROGRESS', 'WAITING_VERIFICATION'].includes(c.status));
  const resolvedCases = cases.filter(c => c.status === 'RESOLVED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Welcome & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name || 'Citizen'}</h1>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Registered Citizen Portal • {user?.address || 'Central District'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/citizen/report"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> REPORT A PROBLEM
          </Link>
          <Link
            to="/citizen/cases"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            TRACK CASES
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">My Reports</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total submitted incidents</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active Cases</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCases.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">In dispatch / on-site response</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{resolvedCases.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Successfully resolved & verified</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Verification Due</span>
            <AlertTriangle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {cases.filter(c => c.status === 'WAITING_VERIFICATION').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting citizen confirmation</div>
        </div>
      </div>

      {/* Active Cases & Tracking Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Citizen Cases & Coordination
          </h2>
          <Link to="/citizen/cases" className="text-xs text-blue-700 hover:underline font-semibold">
            View All ({cases.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500 mb-3">You have not submitted any incidents yet.</p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            >
              Submit your first report →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Case ID</th>
                  <th className="py-2.5 px-4">Incident Summary</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Decomposed Tasks</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.caseId}</td>
                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="text-slate-800 font-medium truncate">{c.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.location?.address}</div>
                    </td>
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
                        to={`/citizen/track/${c.caseId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                      >
                        Track Progress <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
