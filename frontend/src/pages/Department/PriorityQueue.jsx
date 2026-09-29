import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, ArrowUpDown, Filter, AlertTriangle, ArrowRight, Shield } from 'lucide-react';

export const PriorityQueue = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster } = useDisaster();
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartmentPriorityQueue({
        departmentCode: user?.departmentCode || 'ELECTRICITY',
        filter,
        sortBy
      });
      if (res.success) {
        setQueue(res.queue || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user, filter, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Emergency Alert Banner when Disaster Mode is active */}
      {isDisasterMode && (
        <div className="mb-6 p-4 bg-red-700 text-white rounded-md flex items-center justify-between text-xs font-semibold shadow-sm border border-red-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide">
                🚨 DISASTER PROTOCOL ACTIVE — {activeDisaster?.disasterCode || 'EQ-2026-001'}: {activeDisaster?.title || 'Emergency Operations Active'}
              </div>
              <div className="text-red-100 text-xs font-normal mt-0.5">
                Frontline squads must prioritize life-safety work orders. Non-critical tasks are temporarily deprioritized.
              </div>
            </div>
          </div>
          <span className="bg-red-900/80 text-amber-200 text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
            EMERGENCY PRIORITY ENGAGED
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/department" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            {isDisasterMode ? (
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                🚨 DISASTER PRIORITY ACTIVE
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                NORMAL MUNICIPAL OPERATIONS
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MY PRIORITY QUEUE</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational triage dispatch for {user?.departmentName || 'your department'}.
          </p>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
            >
              <option value="recommended">Recommended Priority</option>
              <option value="distance">Distance / Proximity</option>
              <option value="created">Created Time</option>
              <option value="severity">Severity Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Listing */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading priority queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No tasks match the selected filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((task) => (
              <div
                key={task._id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      #{task.workOrderRank}
                    </span>
                    <PriorityBadge level={task.priorityLevel} score={task.priorityScore} showScore={true} />
                    <span className="font-mono text-xs font-bold text-blue-700">{task.caseId}</span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{task.title}</h3>
                  <div className="text-xs text-slate-600 mb-2">
                    {task.location?.address} • Est. Distance: {task.distanceKm || 4.2} km
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mb-2">
                    <strong className="text-slate-900">Why this priority: </strong>
                    {task.prioritySummaryReason || (task.priorityReasons && task.priorityReasons.join(' • '))}
                  </div>

                  {task.blockedBy && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        <strong>BLOCKED:</strong> Waiting for {task.blockedBy.departmentName} ({task.blockedBy.reason})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0">
                  <Link
                    to={`/department/task/${task._id}`}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm text-center w-full transition-colors flex items-center justify-center gap-1"
                  >
                    View Task Details <ArrowRight className="w-3.5 h-3.5" />
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

export default PriorityQueue;
