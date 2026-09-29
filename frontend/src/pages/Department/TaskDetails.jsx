import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { useDisaster } from '../../context/DisasterContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  XCircle,
  Truck,
  RotateCcw,
  Upload,
  Eye,
  Layers,
  MapPin,
  Clock,
  Camera,
  X,
  Image as ImageIcon
} from 'lucide-react';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDisasterMode, activeDisaster } = useDisaster();

  const [task, setTask] = useState(null);
  const [masterCase, setMasterCase] = useState(null);
  const [blockers, setBlockers] = useState([]);
  const [peerTasks, setPeerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Work Progress Update State
  const [workStatus, setWorkStatus] = useState('Team dispatched');
  const [progressNotes, setProgressNotes] = useState('');

  // Complete Work State
  const [completionNotes, setCompletionNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const fileEvidenceInputRef = useRef(null);

  // Cannot Handle Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('No team available');
  const [rejectCustomNotes, setRejectCustomNotes] = useState('');
  const [reassignResult, setReassignResult] = useState(null);

  const fetchTaskDetails = async () => {
    try {
      const res = await api.getTaskById(id);
      if (res.success) {
        setTask(res.task);
        setMasterCase(res.masterCase);
        setBlockers(res.blockers || []);
        setPeerTasks(res.peerTasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const res = await api.acceptTask(id);
      if (res.success) {
        setFeedbackMsg('Task status updated to ACCEPTED.');
        await fetchTaskDetails();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await api.startTask(id);
      if (res.success) {
        setFeedbackMsg('Field response started: IN PROGRESS.');
        await fetchTaskDetails();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updateTaskProgress(id, workStatus, progressNotes);
      if (res.success) {
        setFeedbackMsg(`Progress updated: ${workStatus}`);
        setProgressNotes('');
        await fetchTaskDetails();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.completeTask(id, completionNotes, evidenceUrl);
      if (res.success) {
        setFeedbackMsg('Task marked as COMPLETED. Downstream dependencies unlocked!');
        await fetchTaskDetails();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvidenceFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Image file size must be less than 15MB.');
      return;
    }
    setEvidenceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setEvidenceUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEvidence = () => {
    setEvidenceUrl('');
    setEvidenceFileName('');
    if (fileEvidenceInputRef.current) {
      fileEvidenceInputRef.current.value = '';
    }
  };

  const handleRejectCannotHandle = async () => {
    setActionLoading(true);
    try {
      const res = await api.rejectTask(id, rejectReason, rejectCustomNotes);
      setReassignResult(res.result);
      await fetchTaskDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Loading task details...</div>;
  }

  if (!task) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Task record not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/department"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Department Console
          </Link>
          {isDisasterMode ? (
            <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
              🚨 DISASTER PROTOCOL ACTIVE
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              NORMAL MUNICIPAL OPERATIONS
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-slate-500">Case ID: {task.caseId}</span>
      </div>

      {/* Emergency Disaster Protocol Banner */}
      {isDisasterMode && (
        <div className="mb-6 p-4 bg-red-700 text-white rounded-md flex items-center justify-between text-xs font-semibold shadow-sm border border-red-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide">
                🚨 EMERGENCY DISASTER WORK ORDER — DISASTER PROTOCOL ACTIVE
              </div>
              <div className="text-red-100 text-xs font-normal mt-0.5">
                Frontline unit must expedite dispatch and update arrival notes. Life-safety response protocol in effect.
              </div>
            </div>
          </div>
          <span className="bg-red-900/80 text-amber-200 text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
            CRITICAL DISASTER QUEUE
          </span>
        </div>
      )}

      {feedbackMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {feedbackMsg}
          </span>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Responsibility Gap / Escalated Notice */}
      {task.responsibilityGap && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-md text-red-900 text-xs font-sans">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold block">RESPONSIBILITY GAP DETECTED</strong>
              <p className="mt-1">
                {task.gapReason || 'No capable available resource found in local department fleet.'}
              </p>
              <p className="mt-1 font-semibold text-red-800">
                Automatic Level {task.escalationLevel || 2} Escalation triggered to District & Command Center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Task Header & Status Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Task #{task._id.substring(task._id.length - 6)}
              </span>
              <PriorityBadge level={task.priorityLevel} score={task.priorityScore} showScore={true} />
              <StatusBadge status={task.status} />
              <span className="text-xs font-semibold text-slate-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {task.departmentName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {task.location?.address} • Assigned Unit:{' '}
              <strong className="text-slate-800">{task.assignedTeamName}</strong>
            </div>
          </div>

          {/* Primary Lifecycle Action Buttons (Prompt Requirement 19, 20, 21) */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {task.status === 'ASSIGNED' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> ACCEPT TASK
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> CANNOT HANDLE
                </button>
              </>
            )}

            {task.status === 'ACCEPTED' && (
              <>
                <button
                  onClick={handleStartWork}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" /> START WORK
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                >
                  Cannot Handle / Reassign
                </button>
              </>
            )}

            {task.status === 'BLOCKED' && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Waiting for prerequisite: {task.blockedBy?.departmentName}
              </div>
            )}
          </div>
        </div>

        {/* Priority Reason Explanation Box */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
          <div className="font-semibold text-slate-900 mb-1">Priority Calculation Factors:</div>
          <p className="text-slate-700 mb-2">
            {task.prioritySummaryReason || (task.priorityReasons && task.priorityReasons.join(' • '))}
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Safety Score: {task.priorityScore}/100 • Capability Required: {task.requiredCapability}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Context & Peer Tasks */}
        <div className="md:col-span-2 space-y-6">
          {/* Incident Report Context */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Citizen Incident Report Summary
            </h3>
            <blockquote className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 italic mb-3">
              "{masterCase?.description || task.description}"
            </blockquote>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <strong className="text-slate-800">Affected Civilians:</strong> ~{task.affectedPeople} residents/commuters
              </div>
              <div>
                <strong className="text-slate-800">Operational Category:</strong> {task.category}
              </div>
            </div>
          </div>

          {/* Upstream Dependencies */}
          {blockers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Dependency Requirements
              </h3>
              <div className="space-y-2 text-xs">
                {blockers.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
                    <strong>Prerequisite Step: </strong>
                    {b.blockingDept} must complete <em>'{b.blockingTaskName}'</em> before this work can safely conclude.
                    <div className="text-[11px] text-amber-700 mt-1 italic">Reason: {b.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Peer Tasks in the Same Master Case */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Other Department Tasks for Case {task.caseId}
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {peerTasks.map((pt) => (
                <div key={pt._id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800">{pt.departmentName}: </span>
                    <span className="text-slate-600">{pt.title}</span>
                  </div>
                  <StatusBadge status={pt.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Uploaded */}
          {task.evidence && task.evidence.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Uploaded Evidence & Completion Proof ({task.evidence.length})
              </h3>
              <div className="space-y-2 text-xs">
                {task.evidence.map((ev, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{ev.notes || 'Field Completion Photo'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ev.url}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Execution & Work Updates */}
        <div className="space-y-6">
          {/* Work Status Update Form (Prompt Requirement 20) */}
          {['IN_PROGRESS', 'ACCEPTED'].includes(task.status) && (
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-700" /> Update Field Status
              </h3>

              <form onSubmit={handleUpdateProgress} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Work Milestone</label>
                  <select
                    value={workStatus}
                    onChange={(e) => setWorkStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                  >
                    <option value="Team dispatched">Team dispatched</option>
                    <option value="Team arrived">Team arrived</option>
                    <option value="Work started">Work started</option>
                    <option value="Work partially completed">Work partially completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Field Crew Notes</label>
                  <textarea
                    rows={2}
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="e.g. Utility vehicle on-site. Securing electrical pole line."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs transition-colors"
                >
                  Record Milestone
                </button>
              </form>
            </div>
          )}

          {/* Complete Work Form (Prompt Requirement 20) */}
          {task.status !== 'COMPLETED' ? (
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Complete Task & Submit Proof
              </h3>

              <form onSubmit={handleComplete} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Completion Summary</label>
                  <textarea
                    required
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="e.g. Broken pole isolated and replaced. Power restored. Safe for road work."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" /> Work Completion Photo / Proof Upload
                    </span>
                    {evidenceUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveEvidence}
                        className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-0.5 font-normal"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </label>

                  <input
                    ref={fileEvidenceInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEvidenceFileSelect}
                  />

                  {!evidenceUrl ? (
                    <div
                      onClick={() => fileEvidenceInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/40 rounded p-4 text-center cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mx-auto mb-2 text-slate-600 group-hover:text-emerald-700 transition-colors">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                        Upload Work Completion Photo
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Capture with phone camera or choose image file (PNG, JPG, max 15MB)
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-emerald-200 rounded p-2.5 bg-emerald-50/50 flex items-center gap-3">
                      <img
                        src={evidenceUrl}
                        alt="Completion proof"
                        className="w-16 h-16 object-cover rounded border border-emerald-300 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-semibold text-emerald-950 truncate">
                          {evidenceFileName || 'Completion Proof Photo'}
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          ✓ Photo ready for submission & verification audit
                        </div>
                        <button
                          type="button"
                          onClick={() => fileEvidenceInputRef.current?.click()}
                          className="mt-1 text-[11px] text-emerald-800 font-semibold hover:underline"
                        >
                          Change photo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Optional URL input fallback */}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={evidenceUrl && !evidenceUrl.startsWith('data:') ? evidenceUrl : ''}
                      onChange={(e) => {
                        setEvidenceUrl(e.target.value);
                        setEvidenceFileName('');
                      }}
                      placeholder="Or paste image URL if hosted externally..."
                      className="w-full px-2.5 py-1 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-emerald-600 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  MARK WORK COMPLETED
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-5 text-xs text-emerald-900 font-sans">
              <div className="flex items-center gap-1.5 font-bold text-sm mb-1 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Task Fully Completed
              </div>
              <p>Completed by {task.completedBy || 'Department Crew'} on {new Date(task.completedAt).toLocaleString()}.</p>
              {task.completionNotes && (
                <p className="mt-2 text-slate-700 italic">"{task.completionNotes}"</p>
              )}
              {task.evidence && task.evidence.length > 0 && task.evidence[0].url && (
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <span className="font-semibold text-emerald-950 block mb-1.5 flex items-center gap-1 text-[11px]">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-700" /> Completion Proof Photo:
                  </span>
                  <img
                    src={task.evidence[0].url}
                    alt="Work completion proof"
                    className="max-h-52 rounded border border-emerald-300 object-cover shadow-2xs cursor-pointer hover:opacity-95"
                    onClick={() => window.open(task.evidence[0].url, '_blank')}
                  />
                  <div className="text-[10px] text-emerald-700 mt-1">
                    Uploaded by {task.evidence[0].uploadedBy || 'Crew'} on {new Date(task.evidence[0].uploadedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CANNOT HANDLE / REASSIGNMENT MODAL (Prompt Requirement 21, 22, 23) */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full shadow-lg text-xs font-sans">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cannot Handle Task — Request Reassignment
            </h3>
            <p className="text-slate-500 mb-4">
              Indicate why your unit cannot execute this work. RESQ-GRID's reassignment engine will automatically search alternative capable squads or trigger escalation.
            </p>

            {!reassignResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Primary Reason:</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                  >
                    <option value="No team available">No team available (Current crews occupied)</option>
                    <option value="Equipment unavailable">Equipment unavailable (Heavy machinery required)</option>
                    <option value="Outside jurisdiction">Outside jurisdiction / boundary limit</option>
                    <option value="Already handling another critical task">Already handling another critical task</option>
                    <option value="Other">Other operational constraint</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Notes (Optional):</label>
                  <textarea
                    rows={2}
                    value={rejectCustomNotes}
                    onChange={(e) => setRejectCustomNotes(e.target.value)}
                    placeholder="e.g. PWD Team A engaged on bridge emergency; requesting standby Team B dispatch."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleRejectCannotHandle}
                    className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold shadow-sm"
                  >
                    {actionLoading ? 'Evaluating Fleet...' : 'SUBMIT & SEARCH ALTERNATIVES'}
                  </button>
                </div>
              </div>
            ) : (
              /* Display Reassignment Match Breakdown (Prompt Requirement 22 & 23) */
              <div className="space-y-4">
                {reassignResult.reassigned ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                    <strong className="block font-bold mb-1">
                      ✓ Alternative Team Found & Reassigned!
                    </strong>
                    <div className="text-xs mb-2">
                      New Assigned Unit: <strong>{reassignResult.alternativeTeam?.name}</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-emerald-200 text-[11px] text-slate-700 space-y-1">
                      <span className="font-semibold text-slate-900 block">MATCH REASON EVALUATION:</span>
                      {reassignResult.matchReasons?.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-emerald-700">
                          <Check className="w-3.5 h-3.5" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900">
                    <strong className="block font-bold mb-1">
                      RESPONSIBILITY GAP DETECTED
                    </strong>
                    <p className="mb-2">
                      {reassignResult.gapReason || 'No capable available resource found in department registry.'}
                    </p>
                    <div className="text-[11px] bg-white p-2 rounded border border-red-200 text-slate-700">
                      Escalation #{reassignResult.escalation?._id?.substring(0, 6)} generated and routed to District Command Center.
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setReassignResult(null);
                    }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
