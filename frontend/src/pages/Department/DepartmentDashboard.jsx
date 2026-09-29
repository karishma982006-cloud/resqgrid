import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { ArrowRight, Zap, CheckCircle2, Clock, AlertTriangle, ArrowUpDown, Filter, Shield, Radio } from 'lucide-react';

export const DepartmentDashboard = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster, activateDisaster, deactivateDisaster } = useDisaster();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingDisaster, setTogglingDisaster] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.getDepartmentPriorityQueue({
        departmentCode: user?.departmentCode || 'ELECTRICITY',
        sortBy: 'recommended'
      });
      if (res.success) {
        setTasks(res.queue || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2500);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleDisaster = async () => {
    setTogglingDisaster(true);
    try {
      if (isDisasterMode) {
        if (window.confirm('Deactivate Disaster Mode and return to Normal Municipal Operations?')) {
          await deactivateDisaster();
          await fetchTasks();
        }
      } else {
        if (window.confirm('ACTIVATE EMERGENCY DISASTER MODE? This will alert all department consoles and prioritize life-safety queues.')) {
          await activateDisaster({
            title: 'Seismic Magnitude 6.4 Urban Center Earthquake',
            disasterType: 'Earthquake',
            epicenter: 'District Fault Line 3',
            affectedRadiusKm: 25,
            estimatedImpactPopulation: 150000,
            description: 'Structural collapses, trapped citizens, electrical line breaks, and roadway blockages.'
          });
          await fetchTasks();
        }
      }
    } catch (err) {
      alert('Error changing mode: ' + err.message);
    } finally {
      setTogglingDisaster(false);
    }
  };

  const criticalTasks = tasks.filter(t => t.priorityLevel === 'CRITICAL' && t.status !== 'COMPLETED');
  const highTasks = tasks.filter(t => t.priorityLevel === 'HIGH' && t.status !== 'COMPLETED');
  const mediumTasks = tasks.filter(t => t.priorityLevel === 'MEDIUM' && t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Prominent Emergency Alert Banner if Disaster Mode is Active */}
      {isDisasterMode && (
        <div className="mb-6 p-4 bg-red-700 text-white rounded-md flex items-center justify-between text-xs font-semibold shadow-sm border border-red-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide">
                🚨 EMERGENCY DISASTER PROTOCOL ENGAGED: DISASTER MODE ACTIVE
              </div>
              <div className="text-red-100 text-xs font-normal mt-0.5">
                Command Center has declared disaster operations. Priority multiplier applied. Department crews must prioritize life-safety emergencies.
              </div>
            </div>
          </div>
          <span className="bg-red-900/80 text-amber-200 text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
            DISASTER PROTOCOL ACTIVE
          </span>
        </div>
      )}

      {/* Interactive Mode Status & Disaster Toggle Card */}
      <div className={`p-4 rounded-md border mb-6 text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
        isDisasterMode
          ? 'bg-red-50 border-red-300 text-red-950'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-start gap-2.5">
          {isDisasterMode ? (
            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse flex-shrink-0 mt-0.5" />
          ) : (
            <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>{isDisasterMode ? 'DISASTER MODE IS CURRENTLY ACTIVE' : 'NORMAL MUNICIPAL OPERATIONS ACTIVE'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                isDisasterMode ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {isDisasterMode ? 'EMERGENCY PROTOCOL' : 'STANDARD TRIAGE'}
              </span>
            </div>
            <p className="mt-1 text-slate-700 text-xs">
              {isDisasterMode
                ? 'Emergency disaster protocol is active. Critical life-safety work orders are prioritized at the top of your queue.'
                : 'Routine municipal maintenance and service response queue. Tasks are prioritized by standard department safety impact.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={togglingDisaster}
          onClick={handleToggleDisaster}
          className={`px-3.5 py-2 rounded font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 ${
            isDisasterMode
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : 'bg-red-700 hover:bg-red-800 text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          {isDisasterMode ? 'Turn Off / Return to Normal Mode' : '🚨 Turn On Disaster Mode'}
        </button>
      </div>

      {/* Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {user?.departmentCode || 'ELECTRICITY'} OPERATIONS CONSOLE
            </span>
            {isDisasterMode ? (
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                DISASTER PRIORITY ACTIVE
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                NORMAL MUNICIPAL OPERATIONS
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.departmentName || 'Department Operations'}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated frontline task queue. Non-department records are filtered out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/department/queue"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            OPEN PRIORITY QUEUE <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar (Prompt Requirement 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Critical Tasks</div>
          <div className="text-2xl font-bold text-red-700 font-mono">{criticalTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires immediate response</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">High Priority</div>
          <div className="text-2xl font-bold text-amber-800 font-mono">{highTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Direct public impact</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1">Medium Priority</div>
          <div className="text-2xl font-bold text-yellow-800 font-mono">{mediumTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Routine maintenance</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Completed</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{completedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Finished & verified work</div>
        </div>
      </div>

      {/* RECOMMENDED WORK ORDER SECTION (Prompt Requirement 17) */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Operational Sequence</span>
            <h2 className="text-sm font-bold text-slate-900">
              {isDisasterMode ? '🚨 EMERGENCY DISASTER WORK ORDER (LIFE-SAFETY TRIAGE)' : 'RECOMMENDED WORK ORDER'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Dynamically sequenced by Safety Risk & Upstream Dependencies
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading work order...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No active tasks assigned to this department.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      #{task.workOrderRank}
                    </span>
                    <PriorityBadge level={task.priorityLevel} score={task.priorityScore} showScore={true} />
                    <span className="font-mono text-xs font-bold text-blue-700">{task.caseId}</span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{task.title}</h3>
                  <div className="text-xs text-slate-500 mb-2">
                    Location: <strong className="text-slate-700">{task.location?.address || 'Central District'}</strong> • Assigned Unit: <strong className="text-slate-700">{task.assignedTeamName}</strong>
                  </div>

                  {/* Priority Reason Explanation */}
                  <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 mb-2">
                    <span className="font-semibold text-slate-900 block mb-0.5">Priority Reason:</span>
                    {task.prioritySummaryReason || (task.priorityReasons && task.priorityReasons[0]) || 'Assigned based on municipal triage assessment.'}
                  </div>

                  {/* Dependency Warning */}
                  {task.blockedBy && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        <strong>WAITING FOR:</strong> {task.blockedBy.departmentName} ({task.blockedBy.reason})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0">
                  <Link
                    to={`/department/task/${task._id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-sm text-center w-full transition-colors"
                  >
                    Action Task →
                  </Link>
                  <Link
                    to={`/cases/${task.caseId}`}
                    className="text-xs text-blue-700 hover:underline text-center w-full"
                  >
                    View Master Case
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

export default DepartmentDashboard;
