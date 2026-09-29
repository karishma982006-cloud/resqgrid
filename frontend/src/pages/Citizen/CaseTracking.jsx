import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  Image,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CaseTracking = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [problems, setProblems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());

  // Expanded task milestone histories
  const [expandedTasks, setExpandedTasks] = useState({});

  // Verification state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState('');

  const fetchDetails = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.getCaseById(caseId);
      if (res.success) {
        setCaseData(res.case);
        setTasks(res.tasks || []);
        setProblems(res.problems || []);
        setAuditLogs(res.auditLogs || []);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error('Failed to load case tracking:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // Auto-poll every 2.5 seconds to display real-time department updates and track changes
    const interval = setInterval(() => {
      fetchDetails(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [caseId]);

  const toggleTaskHistory = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleVerify = async (isResolved) => {
    setVerifying(true);
    try {
      const res = await api.verifyCase(caseId, isResolved, verificationNotes);
      if (res.success) {
        setVerificationSuccess(
          isResolved
            ? 'Thank you! Case verified as RESOLVED. The audit log is officially closed.'
            : 'Case flagged as NOT RESOLVED. Escalated to Command Center coordinator for re-inspection.'
        );
        await fetchDetails();
      }
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
        Connecting to RESQ-GRID live tracking server...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Case Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">The requested case {caseId} does not exist.</p>
        <Link to="/citizen" className="text-xs font-semibold text-blue-700 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isAwaitingVerification =
    caseData.status === 'WAITING_VERIFICATION' ||
    (tasks.length > 0 && completedCount === tasks.length && caseData.status !== 'RESOLVED');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Top Breadcrumb & Live Sync Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
        <Link
          to="/citizen"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Citizen Portal
        </Link>

        {/* Live Auto-Refresh & Pulse Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Auto-Sync Active</span>
          </div>

          <span className="text-[11px] text-slate-400">
            Last updated: {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          <button
            onClick={() => fetchDetails(true)}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1 rounded hover:bg-slate-50 transition-colors shadow-2xs"
            title="Force refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{caseData.caseId}</h1>
              <PriorityBadge level={caseData.priorityLevel || caseData.severity} />
              <StatusBadge status={caseData.status} />
            </div>
            <div className="text-xs text-slate-500">
              Reported on {new Date(caseData.createdAt).toLocaleString()} • {caseData.location?.address}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
              Overall Resolution Progress
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">{progressPercent}%</span>
            <span className="text-xs text-slate-500 block">
              ({completedCount} of {tasks.length} tasks finished)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full transition-all duration-500 ${
              caseData.status === 'RESOLVED' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
          <span className="font-semibold text-slate-900 block mb-0.5">Your Incident Report:</span>
          "{caseData.description}"
        </div>
      </div>

      {/* Citizen Verification Card (Prompt Requirement 39) */}
      {isAwaitingVerification && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-md p-6 shadow-sm mb-6 font-sans">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-purple-900">
                Action Required: Confirm On-Site Resolution
              </h3>
              <p className="text-xs text-purple-800 mt-1 mb-3">
                All responding municipal departments have reported completion of field work for your report. Please inspect your location and confirm if the problems have been resolved.
              </p>

              {verificationSuccess ? (
                <div className="p-3 bg-white border border-purple-200 text-purple-900 text-xs rounded font-medium">
                  {verificationSuccess}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Optional feedback: e.g. 'Pole replaced and water cleared. Road is accessible again.'"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded text-xs focus:ring-1 focus:ring-purple-600 outline-none"
                  ></textarea>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerify(true)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" /> YES — RESOLVED
                    </button>
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerify(false)}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" /> NO — STILL A PROBLEM
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Citizen Task Tracking Cards with Real-time Notes & Milestones */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Department Response & Real-Time Field Updates
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {tasks.length} Coordinated Department Work Orders
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks.map((task, idx) => {
            const isDone = task.status === 'COMPLETED';
            const isCurrent = ['IN_PROGRESS', 'ACCEPTED'].includes(task.status);
            const isBlocked = task.status === 'BLOCKED';
            const isEscalated = task.status === 'ESCALATED' || task.responsibilityGap;
            const history = task.progressHistory || [];
            const hasHistory = history.length > 0;
            const isExpanded = !!expandedTasks[task._id];

            return (
              <div key={task._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {task.departmentName}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3">{task.description}</p>

                {/* Assigned Unit & Current Milestone Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500" />
                    <span>
                      Assigned Crew:{' '}
                      <strong className="text-slate-900">{task.assignedTeamName || 'Fast Response Squad'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDone ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Completed ({task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'})
                      </span>
                    ) : isCurrent ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Active On-Site ({task.workProgressStatus || 'In Progress'})
                      </span>
                    ) : isBlocked ? (
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Waiting for prerequisite clearance
                      </span>
                    ) : isEscalated ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Escalated to Command Center
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Scheduled & Dispatched
                      </span>
                    )}
                  </div>
                </div>

                {/* Prominently Displayed Latest Field Crew Note */}
                {(task.latestProgressNote || task.completionNotes || task.workProgressStatus) && (
                  <div className="mb-3 p-3 bg-blue-50/80 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-700" /> Latest Field Crew Update:
                      </span>
                      {task.lastProgressUpdateAt && (
                        <span className="text-[10px] text-blue-600 font-mono">
                          {new Date(task.lastProgressUpdateAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-950 font-medium italic">
                      "{task.latestProgressNote || task.completionNotes || task.workProgressStatus}"
                    </p>
                  </div>
                )}

                {/* Reassignment Alert Banner (If squad was reassigned) */}
                {task.handoffHistory && task.handoffHistory.length > 0 && (
                  <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Crew Reassigned: </span>
                      Transferred from <em>{task.handoffHistory[task.handoffHistory.length - 1].fromTeam}</em> to{' '}
                      <strong>{task.handoffHistory[task.handoffHistory.length - 1].toTeam}</strong>.
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Reason: {task.handoffHistory[task.handoffHistory.length - 1].reason}
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Attachment Proof (If uploaded) */}
                {task.evidence && task.evidence.length > 0 && (
                  <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-emerald-700" />
                      <span>
                        <strong>Work Completion Proof Attached: </strong>
                        {task.evidence[0].notes || 'Photo verified by field engineer'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      Verified
                    </span>
                  </div>
                )}

                {/* Expandable Step-by-Step Milestone History */}
                {hasHistory && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleTaskHistory(task._id)}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Hide Milestone Progression ({history.length} updates)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> View Milestone Progression ({history.length} updates)
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 pl-3 border-l-2 border-blue-200 space-y-2 text-xs">
                        {history.map((step, sIdx) => (
                          <div key={sIdx} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold text-slate-800">{step.status}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {step.notes && (
                              <p className="text-slate-600 text-[11px] italic">"{step.notes}"</p>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1">Logged by {step.updatedBy}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DEDICATED LIVE FIELD RESPONSE & TRACK CHANGES STREAM */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Track Changes & Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {auditLogs.length} Timestamped Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No track changes recorded yet. Updates will appear in real time as crews take action.
          </div>
        ) : (
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => {
              const isProgress = log.action === 'TASK_PROGRESS_UPDATED';
              const isAccepted = log.action === 'TASK_ACCEPTED';
              const isStarted = log.action === 'TASK_STARTED';
              const isCompleted = log.action === 'TASK_COMPLETED';
              const isReassigned = log.action === 'TASK_REASSIGNED';
              const isVerified = log.action.includes('VERIFIED');
              const isReopened = log.action.includes('REOPENED');

              return (
                <div
                  key={log._id}
                  className={`p-3 rounded-md border text-xs flex items-start gap-3 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : isProgress
                      ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                      : isReassigned
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : isReopened
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isProgress ? (
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    ) : isReassigned ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : isStarted ? (
                      <Truck className="w-4 h-4 text-blue-600" />
                    ) : isAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900">
                        {log.actorName || log.actorRole}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-normal leading-relaxed">{log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseTracking;
