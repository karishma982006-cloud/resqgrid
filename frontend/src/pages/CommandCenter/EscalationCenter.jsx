import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const EscalationCenter = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEscalations = async () => {
    try {
      const res = await api.getEscalations();
      if (res.success) setEscalations(res.escalations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedEscalation) return;
    setSubmitting(true);
    try {
      const res = await api.resolveEscalation(selectedEscalation._id, resolutionNotes);
      if (res.success) {
        setSelectedEscalation(null);
        setResolutionNotes('');
        await fetchEscalations();
      }
    } catch (err) {
      alert('Failed to resolve escalation: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/command" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Level Escalation Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational bottlenecks, responsibility gaps, and command intervention queue.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active & Historical Escalations ({escalations.length})
          </h3>
          <span className="text-xs text-slate-500">Level 1 → Level 2 → Level 3 Command</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading escalations...</div>
        ) : escalations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active escalations recorded. Operations running normally.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {escalations.map((esc) => (
              <div key={esc._id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      {esc.levelName || `Level ${esc.escalationLevel}`}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">{esc.caseId}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{esc.taskTitle}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(esc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <StatusBadge status={esc.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-700 mb-2">
                  <strong className="text-slate-900">Escalation Trigger:</strong> {esc.reason}
                </p>

                <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div>
                    Department: <strong className="text-slate-700">{esc.departmentName || esc.departmentCode}</strong> • Escalated By:{' '}
                    <strong className="text-slate-700">{esc.escalatedBy}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {esc.status === 'ACTIVE' && (
                      <button
                        onClick={() => setSelectedEscalation(esc)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                      >
                        Intervene & Resolve
                      </button>
                    )}
                    <Link
                      to={`/cases/${esc.caseId}`}
                      className="text-xs text-blue-700 hover:underline font-semibold"
                    >
                      Inspect Case →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Intervention Modal */}
      {selectedEscalation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full shadow-lg text-xs font-sans">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Command Center Operational Intervention
            </h3>
            <p className="text-slate-500 mb-4">
              Authorize resource override or allocate mutual aid reserve squad for Case {selectedEscalation.caseId}.
            </p>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Directives & Coordinator Notes:
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Authorized deployment of Regional Reserve Equipment Unit. Task restored to active queue."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEscalation(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-sm"
                >
                  {submitting ? 'Executing Intervention...' : 'AUTHORIZE & RESOLVE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalationCenter;
