import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const HandoffCenter = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHandoffs = async () => {
    try {
      const res = await api.getTasks({});
      if (res.success) {
        // Collect all tasks that had handoffs or reassignments
        const withHandoffs = (res.tasks || []).filter(t => 
          (t.handoffHistory && t.handoffHistory.length > 0) || 
          t.status === 'REJECTED' ||
          t.responsibilityGap
        );
        setTasks(withHandoffs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoffs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/command" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Inter-Agency Handoffs & Reassignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of tasks transferred between municipal squads and mutual aid agencies.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Reassignment Events & Responsibility Gaps ({tasks.length})
          </h3>
          <span className="text-xs text-slate-500">Live Telemetry</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading handoffs...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active task reassignments or responsibility gaps recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task._id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{task.caseId}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge level={task.priorityLevel} score={task.priorityScore} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                {/* Handoff Progression Timeline */}
                {task.handoffHistory && task.handoffHistory.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {task.handoffHistory.map((h, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                        <div className="flex flex-wrap items-center gap-2 font-medium text-slate-800 mb-1">
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[11px]">
                            {h.fromTeam}
                          </span>
                          <span className="text-slate-400">➔ Cannot handle ➔</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px]">
                            {h.toTeam} (Accepted)
                          </span>
                          <span className="text-slate-400 text-[10px] ml-auto">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          <strong>Reassignment Reason:</strong> {h.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 mb-3">
                    <strong>Pending Reassignment / Gap: </strong> {task.gapReason || 'Initial squad rejected work; awaiting secondary dispatch.'}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Link
                    to={`/cases/${task.caseId}`}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    View Case Graph & Timeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandoffCenter;
