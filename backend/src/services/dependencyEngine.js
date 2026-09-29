import { Task, Dependency } from '../models/index.js';
import { logAudit } from './auditService.js';
import { createNotification } from './notificationService.js';

export const establishDependencies = async (caseId, tasks) => {
  // Common dependency rules:
  // 1. Electricity hazard must be isolated before Road repair or Drainage work
  // 2. Road repair must be completed before Traffic vehicle access is restored
  // 3. Fire must be suppressed before search & rescue in building or structural repair
  const deps = [];

  const elecTask = tasks.find(t => t.departmentCode === 'ELECTRICITY');
  const roadTask = tasks.find(t => t.departmentCode === 'PWD');
  const drainTask = tasks.find(t => t.departmentCode === 'DRAINAGE');
  const trafficTask = tasks.find(t => t.departmentCode === 'TRAFFIC');
  const fireTask = tasks.find(t => t.departmentCode === 'FIRE_RESCUE');
  const rescueTask = tasks.find(t => t.departmentCode === 'SEARCH_RESCUE');

  // Rule 1: Fire blocks Rescue
  if (fireTask && rescueTask) {
    deps.push({
      caseId,
      blockingTaskId: fireTask._id,
      blockingTaskName: fireTask.title,
      blockingDept: fireTask.departmentName,
      dependentTaskId: rescueTask._id,
      dependentTaskName: rescueTask.title,
      dependentDept: rescueTask.departmentName,
      reason: 'Fire suppression and thermal isolation required before extrication'
    });
  }

  // Rule 2: Electricity blocks Road work
  if (elecTask && roadTask) {
    deps.push({
      caseId,
      blockingTaskId: elecTask._id,
      blockingTaskName: elecTask.title,
      blockingDept: elecTask.departmentName,
      dependentTaskId: roadTask._id,
      dependentTaskName: roadTask.title,
      dependentDept: roadTask.departmentName,
      reason: 'Live electrical wire safety isolation required before road excavation'
    });
  }

  // Rule 3: Electricity blocks Drainage if in close proximity
  if (elecTask && drainTask) {
    deps.push({
      caseId,
      blockingTaskId: elecTask._id,
      blockingTaskName: elecTask.title,
      blockingDept: elecTask.departmentName,
      dependentTaskId: drainTask._id,
      dependentTaskName: drainTask.title,
      dependentDept: drainTask.departmentName,
      reason: 'Power grid isolation needed before operating pumping and de-clogging equipment'
    });
  }

  // Rule 4: Road repair blocks Traffic clearance
  if (roadTask && trafficTask) {
    deps.push({
      caseId,
      blockingTaskId: roadTask._id,
      blockingTaskName: roadTask.title,
      blockingDept: roadTask.departmentName,
      dependentTaskId: trafficTask._id,
      dependentTaskName: trafficTask.title,
      dependentDept: trafficTask.departmentName,
      reason: 'Road surface backfilling and structural repair must complete before resuming normal vehicle traffic'
    });
  }

  for (const dep of deps) {
    await Dependency.create(dep);
  }

  // Mark dependent tasks that have blocking prerequisites as BLOCKED
  for (const dep of deps) {
    const dependent = await Task.findById(dep.dependentTaskId);
    if (dependent && dependent.status !== 'COMPLETED') {
      await Task.findByIdAndUpdate(dep.dependentTaskId, {
        status: 'BLOCKED',
        blockedBy: {
          taskId: dep.blockingTaskId,
          departmentName: dep.blockingDept,
          reason: dep.reason
        }
      });
    }
  }

  return deps;
};

export const onTaskCompleted = async (completedTask) => {
  const caseId = completedTask.caseId;
  const taskId = completedTask._id;

  // Find all dependencies where this task was blocking others
  const downstream = await Dependency.find({ blockingTaskId: taskId });

  for (const dep of downstream) {
    const otherBlockers = await Dependency.find({
      dependentTaskId: dep.dependentTaskId,
      blockingTaskId: { $ne: taskId }
    });

    let stillBlocked = false;
    let nextBlocker = null;

    for (const ob of otherBlockers) {
      const bTask = await Task.findById(ob.blockingTaskId);
      if (bTask && bTask.status !== 'COMPLETED') {
        stillBlocked = true;
        nextBlocker = ob;
        break;
      }
    }

    if (!stillBlocked) {
      // Unblock dependent task
      const updated = await Task.findByIdAndUpdate(dep.dependentTaskId, {
        status: 'ASSIGNED',
        blockedBy: null
      });

      await logAudit({
        caseId,
        taskId: dep.dependentTaskId,
        actorName: 'Dependency Engine',
        actorRole: 'system',
        action: 'DEPENDENCY_UNBLOCKED',
        details: `Task '${updated.title}' unblocked because prerequisite '${completedTask.title}' was completed by ${completedTask.departmentName}.`
      });

      await createNotification({
        departmentCode: updated.departmentCode,
        role: 'department',
        title: 'Task Unblocked & Ready for Work',
        message: `Task '${updated.title}' is no longer blocked. Prerequisite completed by ${completedTask.departmentName}.`,
        caseId,
        taskId: dep.dependentTaskId,
        type: 'success'
      });
    } else if (nextBlocker) {
      await Task.findByIdAndUpdate(dep.dependentTaskId, {
        blockedBy: {
          taskId: nextBlocker.blockingTaskId,
          departmentName: nextBlocker.blockingDept,
          reason: nextBlocker.reason
        }
      });
    }
  }
};

export default { establishDependencies, onTaskCompleted };
