import { Task, Case, Problem, Dependency, Resource } from '../models/index.js';
import { onTaskCompleted } from '../services/dependencyEngine.js';
import { handleTaskRejection } from '../services/reassignmentEngine.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getDepartmentTasks = async (req, res, next) => {
  try {
    const { departmentCode, status, priority } = req.query;
    const targetDept = req.user.role === 'department' ? req.user.departmentCode : departmentCode;

    let query = {};
    if (targetDept && targetDept !== 'ALL') {
      query.departmentCode = targetDept;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (priority && priority !== 'ALL') {
      query.priorityLevel = priority;
    }

    const tasks = await Task.find(query);

    // Recommended sort order: priorityScore descending, then createdAt ascending
    tasks.sort((a, b) => {
      const pDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentPriorityQueue = async (req, res, next) => {
  try {
    const { departmentCode, filter = 'ALL', sortBy = 'recommended' } = req.query;
    const targetDept = req.user.role === 'department' ? req.user.departmentCode : departmentCode;

    let query = {};
    if (targetDept && targetDept !== 'ALL') {
      query.departmentCode = targetDept;
    }

    if (filter !== 'ALL') {
      query.priorityLevel = filter;
    }

    let tasks = await Task.find(query);

    // Sort options
    if (sortBy === 'recommended') {
      tasks.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    } else if (sortBy === 'distance') {
      tasks.sort((a, b) => ((a.distanceKm || 5) - (b.distanceKm || 5)));
    } else if (sortBy === 'created') {
      tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'severity') {
      const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      tasks.sort((a, b) => (rank[b.priorityLevel] || 0) - (rank[a.priorityLevel] || 0));
    }

    // Assign work order ranks (#1, #2, #3...)
    const queue = tasks.map((t, index) => ({
      workOrderRank: index + 1,
      ...t
    }));

    res.json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Fetch related dependencies
    const blockers = await Dependency.find({ dependentTaskId: task._id });
    const downstream = await Dependency.find({ blockingTaskId: task._id });

    // Fetch other tasks in the same case
    const peerTasks = await Task.find({ caseId: task.caseId, _id: { $ne: task._id } });

    // Fetch master case info
    const masterCase = await Case.findOne({ caseId: task.caseId });

    res.json({
      success: true,
      task,
      blockers,
      downstream,
      peerTasks,
      masterCase
    });
  } catch (err) {
    next(err);
  }
};

export const acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const now = new Date().toISOString();
    const updated = await Task.findByIdAndUpdate(task._id, {
      status: 'ACCEPTED',
      workProgressStatus: 'Task accepted by department',
      latestProgressNote: `${task.departmentName} has accepted the work order and assigned ${task.assignedTeamName || 'field response team'}.`,
      lastProgressUpdateAt: now,
      acceptedAt: now,
      acceptedBy: req.user.name
    });

    // Sync linked Problem status
    if (task.problemId) {
      await Problem.findByIdAndUpdate(task.problemId, { status: 'ACCEPTED' });
    }

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TASK_ACCEPTED',
      details: `${task.departmentName} accepted task: '${task.title}' (Assigned to: ${task.assignedTeamName || 'Field Unit'}).`
    });

    // Notify Citizen
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `${task.departmentName} Accepted Task`,
        message: `${task.departmentName} has accepted '${task.title}' and assigned ${task.assignedTeamName || 'field crew'}.`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'info'
      });
    }

    await createNotification({
      userId: null,
      role: 'command_center',
      title: 'Task Accepted',
      message: `${task.departmentName} accepted task '${task.title}' for Case ${task.caseId}.`,
      caseId: task.caseId,
      taskId: task._id,
      type: 'info'
    });

    res.json({ success: true, message: 'Task accepted.', task: updated });
  } catch (err) {
    next(err);
  }
};

export const startTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const now = new Date().toISOString();
    const history = task.progressHistory || [];
    history.push({
      status: 'Work started',
      notes: 'Field crew arrived on site and commenced active response operations.',
      updatedBy: req.user.name,
      timestamp: now
    });

    const updated = await Task.findByIdAndUpdate(task._id, {
      status: 'IN_PROGRESS',
      workProgressStatus: 'Work started',
      latestProgressNote: 'Field crew arrived on site and commenced active response operations.',
      lastProgressUpdateAt: now,
      startedAt: now,
      progressHistory: history
    });

    // Sync linked Problem status
    if (task.problemId) {
      await Problem.findByIdAndUpdate(task.problemId, { status: 'IN_PROGRESS' });
    }

    // Also update parent case status to IN_PROGRESS if not already
    await Case.updateOne({ caseId: task.caseId, status: 'ACTIVE' }, { status: 'IN_PROGRESS' });

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TASK_STARTED',
      details: `Field crew started active on-site work on '${task.title}'.`
    });

    // Notify Citizen
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `Field Work Started: ${task.title}`,
        message: `${task.departmentName} field squad (${task.assignedTeamName || 'Crew'}) has started on-site response.`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'info'
      });
    }

    res.json({ success: true, message: 'Task work started.', task: updated });
  } catch (err) {
    next(err);
  }
};

export const updateTaskProgress = async (req, res, next) => {
  try {
    const { workProgressStatus, progressNotes } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const now = new Date().toISOString();
    const history = task.progressHistory || [];
    history.push({
      status: workProgressStatus,
      notes: progressNotes || '',
      updatedBy: req.user.name,
      timestamp: now
    });

    const updated = await Task.findByIdAndUpdate(task._id, {
      workProgressStatus,
      latestProgressNote: progressNotes || `Milestone reached: ${workProgressStatus}`,
      lastProgressUpdateAt: now,
      progressHistory: history
    });

    // Sync linked Problem status
    if (task.problemId) {
      await Problem.findByIdAndUpdate(task.problemId, {
        status: workProgressStatus === 'Work completed' ? 'RESOLVED' : 'IN_PROGRESS'
      });
    }

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TASK_PROGRESS_UPDATED',
      details: `[${task.departmentName}] Field status: "${workProgressStatus}" - Notes: ${progressNotes || 'N/A'}`
    });

    // Notify citizen about milestone and crew notes
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `Update on ${task.title}: ${workProgressStatus}`,
        message: progressNotes ? `Crew notes: "${progressNotes}"` : `Field status updated to "${workProgressStatus}"`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'info'
      });
    }

    res.json({ success: true, message: 'Work progress updated.', task: updated });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { completionNotes, evidenceUrl } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const now = new Date().toISOString();
    const evidenceList = task.evidence || [];
    if (evidenceUrl) {
      evidenceList.push({
        url: evidenceUrl,
        uploadedAt: now,
        uploadedBy: req.user.name,
        notes: completionNotes || 'Proof of completed on-site repair'
      });
    }

    const history = task.progressHistory || [];
    history.push({
      status: 'Work completed',
      notes: completionNotes || 'Work completed according to municipal safety protocols.',
      updatedBy: req.user.name,
      timestamp: now
    });

    const completed = await Task.findByIdAndUpdate(task._id, {
      status: 'COMPLETED',
      workProgressStatus: 'Work completed',
      latestProgressNote: completionNotes || 'Work completed according to municipal safety protocols.',
      lastProgressUpdateAt: now,
      completedAt: now,
      completedBy: req.user.name,
      completionNotes: completionNotes || 'Work completed according to municipal safety protocols.',
      evidence: evidenceList,
      progressHistory: history
    });

    // Sync linked Problem status
    if (task.problemId) {
      await Problem.findByIdAndUpdate(task.problemId, { status: 'RESOLVED' });
    }

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TASK_COMPLETED',
      details: `${task.departmentName} completed '${task.title}'. Notes: ${completionNotes || 'None'}`
    });

    // Notify citizen
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `${task.departmentName} Task Completed`,
        message: `'${task.title}' has been finished. Notes: ${completionNotes || 'Resolved'}`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'info'
      });
    }

    // Trigger dependency engine to unblock any waiting tasks!
    await onTaskCompleted(completed);

    // Check if ALL tasks for this master case are now completed
    const remainingTasks = await Task.find({
      caseId: task.caseId,
      status: { $ne: 'COMPLETED' }
    });

    if (remainingTasks.length === 0) {
      // All tasks complete! Set case to WAITING_VERIFICATION
      await Case.updateOne(
        { caseId: task.caseId },
        { status: 'WAITING_VERIFICATION' }
      );

      await logAudit({
        caseId: task.caseId,
        actorName: 'RESQ-GRID Coordinator',
        actorRole: 'system',
        action: 'ALL_TASKS_COMPLETED_AWAITING_VERIFICATION',
        details: `All ${task.caseId} department responsibilities completed. Awaiting citizen and coordinator verification.`
      });

      if (masterCase && masterCase.userId) {
        await createNotification({
          userId: masterCase.userId,
          role: 'citizen',
          title: `Action Required: Verify Resolution for ${task.caseId}`,
          message: 'All responding departments have completed their tasks. Please confirm whether the issue is resolved.',
          caseId: task.caseId,
          type: 'warning'
        });
      }
    }

    res.json({
      success: true,
      message: 'Task marked as COMPLETED.',
      task: completed,
      caseAwaitingVerification: remainingTasks.length === 0
    });
  } catch (err) {
    next(err);
  }
};

export const rejectTask = async (req, res, next) => {
  try {
    const { rejectionReason, customNotes } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const reason = rejectionReason || customNotes || 'No team available';

    // Trigger reassignment engine
    const result = await handleTaskRejection({
      taskId: task._id,
      departmentCode: task.departmentCode,
      departmentName: task.departmentName,
      rejectedBy: req.user.name,
      rejectionReason: reason,
      actorRole: req.user.role
    });

    res.json({
      success: true,
      message: result.reassigned
        ? `Task reassigned to alternative team: ${result.alternativeTeam.name}`
        : 'Responsibility gap detected. Task automatically escalated to Command Center.',
      result
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getDepartmentTasks,
  getDepartmentPriorityQueue,
  getTaskById,
  acceptTask,
  startTask,
  updateTaskProgress,
  completeTask,
  rejectTask
};
