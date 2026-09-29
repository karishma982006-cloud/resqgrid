import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import ResponsibilityGraph from '../components/ResponsibilityGraph';
import DependencyList from '../components/DependencyList';
import { ArrowLeft, RefreshCw, Clock, MapPin, Users, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export const CaseDetailsView = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCase = async () => {
    try {
      const res = await api.getCaseById(id);
      if (res.success) {
        setCaseData(res.case);
        setProblems(res.problems || []);
        setTasks(res.tasks || []);
        setDependencies(res.dependencies || []);
        setAuditLogs(res.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Loading master case details...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Case {id} not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/command" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-mono">{caseData.caseId}</h1>
            <PriorityBadge level={caseData.priorityLevel || caseData.severity} score={caseData.priorityScore} showScore={true} />
            <StatusBadge status={caseData.status} />
          </div>
        </div>

        <button
          onClick={() => { setRefreshing(true); fetchCase(); }}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded bg-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Case Context Summary Card */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Location & Landmark:</span>
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {caseData.location?.address}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Operational Mode:</span>
            <span className="font-mono font-bold text-slate-800">
              {caseData.mode || 'NORMAL'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Reporting Citizen:</span>
            <span className="font-semibold text-slate-900">
              {caseData.citizenName || 'Rohan Sharma'} ({caseData.citizenPhone || '+91 98765 43210'})
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
          <strong className="text-slate-900 block mb-1">Citizen Narrative:</strong>
          "{caseData.description}"
        </div>
      </div>

      {/* Responsibility Graph (Prompt Requirement 28) */}
      <div className="mb-6">
        <ResponsibilityGraph caseId={caseData.caseId} problems={problems} tasks={tasks} />
      </div>

      {/* Dependencies Engine View (Prompt Requirement 14) */}
      <div className="mb-6">
        <DependencyList dependencies={dependencies} tasks={tasks} />
      </div>

      {/* Audit Trail for this Case (Prompt Requirement 41) */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm font-sans mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Case Lifecycle Audit Trail ({auditLogs.length} events recorded)
          </h3>
          <span className="text-xs text-slate-500">Immutable Chronological Log</span>
        </div>

        <div className="space-y-2.5 font-mono text-[11px]">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="font-bold text-slate-900 mr-2">[{log.actorName}]</span>
                <span className="font-semibold text-blue-800 mr-2">{log.action}:</span>
                <span className="text-slate-700 font-sans">{log.details}</span>
              </div>
              <span className="text-slate-400 whitespace-nowrap text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsView;
