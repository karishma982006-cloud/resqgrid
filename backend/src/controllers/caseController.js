import { Case, Problem, Task, Report, Dependency, AuditLog, DisasterEvent, Resource } from '../models/index.js';
import { decomposeReport } from '../services/problemDecompositionEngine.js';
import { calculatePriority } from '../services/priorityEngine.js';
import { establishDependencies } from '../services/dependencyEngine.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const analyzeAndCreateCase = async (req, res, next) => {
  try {
    const { reportId } = req.body;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Check if case already created for this report
    const existingCase = await Case.findOne({ reportId: report._id });
    if (existingCase) {
      return res.json({ success: true, message: 'Case already exists for this report.', case: existingCase });
    }

    const mode = report.mode || 'NORMAL';
    const isDisasterMode = mode === 'DISASTER';

    // Step 1: Decompose report into individual problems
    const rawProblems = await decomposeReport(report.description, mode, {
      affectedPeople: report.affectedPeople,
      immediateDanger: report.immediateDanger
    });

    const caseCount = await Case.countDocuments();
    const caseNumber = 1042 + caseCount;
    const caseId = `RG-${caseNumber}`;

    // Step 2: Calculate Priority & Create Tasks for each problem
    const createdProblems = [];
    const createdTasks = [];
    const departmentCodes = new Set();

    let maxCaseScore = 0;
    let highestSeverity = 'LOW';

    for (let i = 0; i < rawProblems.length; i++) {
      const p = rawProblems[i];
      departmentCodes.add(p.departmentCode);

      // Check if this problem is likely to block others (e.g. electrical hazard or fire)
      const isBlocking = p.category === 'Electrical Damage' || p.category === 'Fire Hazard';

      // Priority Engine calculation
      const priorityResult = await calculatePriority({
        category: p.category,
        severity: p.severity,
        safetyRisk: p.safetyRisk,
        peopleAffected: report.affectedPeople || 15,
        urgency: p.urgency,
        publicImpact: p.safetyRisk >= 8 ? 8 : 6,
        isBlockingOthers: isBlocking,
        isDisasterMode
      });

      if (priorityResult.score > maxCaseScore) {
        maxCaseScore = priorityResult.score;
        highestSeverity = priorityResult.level;
      }

      // Create Problem in DB
      const problemDoc = await Problem.create({
        caseId,
        reportId: report._id,
        problemNumber: i + 1,
        title: p.problemTitle,
        description: p.problemDescription,
        category: p.category,
        severity: priorityResult.level,
        safetyRisk: p.safetyRisk,
        urgency: p.urgency,
        affectedPeople: report.affectedPeople || 10,
        departmentCode: p.departmentCode,
        departmentName: p.departmentName,
        requiredCapability: p.requiredCapability,
        priorityScore: priorityResult.score,
        priorityLevel: priorityResult.level,
        priorityReasons: priorityResult.reasons,
        status: 'IDENTIFIED',
        createdAt: new Date().toISOString()
      });
      createdProblems.push(problemDoc);

      // Attempt to assign a default resource team
      const matchingResource = await Resource.findOne({
        departmentCode: p.departmentCode,
        status: 'AVAILABLE'
      });

      // Create Task for Department
      const taskDoc = await Task.create({
        caseId,
        problemId: problemDoc._id,
        title: p.problemTitle,
        description: p.problemDescription,
        category: p.category,
        departmentCode: p.departmentCode,
        departmentName: p.departmentName,
        requiredCapability: p.requiredCapability,
        priorityScore: priorityResult.score,
        priorityLevel: priorityResult.level,
        priorityReasons: priorityResult.reasons,
        prioritySummaryReason: priorityResult.summaryReason,
        status: 'ASSIGNED', // 'UNASSIGNED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'REJECTED', 'ESCALATED'
        assignedTeamId: matchingResource ? matchingResource._id : null,
        assignedTeamName: matchingResource ? matchingResource.name : `${p.departmentName} Fast Response Unit 1`,
        location: report.location,
        affectedPeople: report.affectedPeople || 10,
        evidence: [],
        createdAt: new Date().toISOString()
      });
      createdTasks.push(taskDoc);
    }

    // Step 3: Create Master Case
    const masterCase = await Case.create({
      caseId,
      reportId: report._id,
      userId: report.citizenId,
      citizenName: report.citizenName,
      citizenPhone: report.citizenPhone,
      location: report.location,
      description: report.description,
      imageUrl: report.imageUrl || null,
      mode,
      disasterEventId: report.disasterEventId || null,
      severity: highestSeverity,
      priorityLevel: highestSeverity,
      priorityScore: maxCaseScore,
      problemCount: createdProblems.length,
      departmentCount: departmentCodes.size,
      departments: Array.from(departmentCodes),
      status: 'ACTIVE', // 'NEW', 'ANALYZING', 'ACTIVE', 'IN_PROGRESS', 'WAITING_VERIFICATION', 'RESOLVED', 'REOPENED', 'CLOSED'
      recoveryPhase: {
        active: false,
        status: 'PENDING',
        items: [
          { name: 'Road Surface & Debris Clearance', completed: false },
          { name: 'Power Line Grid Restoration', completed: false },
          { name: 'Stormwater Culvert Clearing', completed: false },
          { name: 'Traffic Signals & Signage Re-activation', completed: false }
        ]
      },
      createdAt: new Date().toISOString()
    });

    // Step 4: Establish Dependencies between tasks
    await establishDependencies(caseId, createdTasks);

    // Update Report status
    await Report.findByIdAndUpdate(report._id, {
      status: 'CONVERTED_TO_CASE',
      caseId
    });

    // Step 5: Audit Trail Logging
    await logAudit({
      caseId,
      actorName: 'RESQ-GRID Triage AI Engine',
      actorRole: 'system',
      action: 'CASE_ANALYZED_AND_CREATED',
      details: `Decomposed report into ${createdProblems.length} problems across ${departmentCodes.size} departments. Master priority: ${highestSeverity} (score ${maxCaseScore}).`
    });

    for (const task of createdTasks) {
      await logAudit({
        caseId,
        taskId: task._id,
        actorName: 'Assignment Engine',
        actorRole: 'system',
        action: 'TASK_ASSIGNED',
        details: `Assigned '${task.title}' to ${task.departmentName} (${task.assignedTeamName}). Priority: ${task.priorityLevel}.`
      });

      await createNotification({
        departmentCode: task.departmentCode,
        role: 'department',
        title: `New ${task.priorityLevel} Priority Task: Case ${caseId}`,
        message: `${task.title} at ${report.location.address}. Reason: ${task.prioritySummaryReason}`,
        caseId,
        taskId: task._id,
        type: task.priorityLevel === 'CRITICAL' ? 'urgent' : 'warning'
      });
    }

    await createNotification({
      userId: report.citizenId,
      role: 'citizen',
      title: `Case ${caseId} Dispatched`,
      message: `Your report has been analyzed. ${createdProblems.length} specialized department tasks have been coordinated.`,
      caseId,
      type: 'info'
    });

    res.status(201).json({
      success: true,
      message: `Case ${caseId} created and dispatched to departments.`,
      case: masterCase,
      problems: createdProblems,
      tasks: createdTasks
    });
  } catch (err) {
    next(err);
  }
};

export const getCases = async (req, res, next) => {
  try {
    const { status, mode, priority, search } = req.query;
    let query = {};

    if (req.user.role === 'citizen') {
      query.userId = req.user.id;
    }

    if (status && status !== 'ALL') query.status = status;
    if (mode && mode !== 'ALL') query.mode = mode;
    if (priority && priority !== 'ALL') query.priorityLevel = priority;

    let cases = await Case.find(query);
    cases.sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      cases = cases.filter(c => 
        (c.caseId && c.caseId.toLowerCase().includes(s)) ||
        (c.description && c.description.toLowerCase().includes(s)) ||
        (c.location && c.location.address && c.location.address.toLowerCase().includes(s))
      );
    }

    res.json({ success: true, count: cases.length, cases });
  } catch (err) {
    next(err);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let caseItem = await Case.findOne({ $or: [{ _id: id }, { caseId: id }] });
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    if (!caseItem.imageUrl && caseItem.reportId) {
      const rep = await Report.findById(caseItem.reportId);
      if (rep && rep.imageUrl) {
        caseItem = { ...caseItem, imageUrl: rep.imageUrl };
      }
    }

    const problems = await Problem.find({ caseId: caseItem.caseId });
    const tasks = await Task.find({ caseId: caseItem.caseId });
    const dependencies = await Dependency.find({ caseId: caseItem.caseId });
    const auditLogs = await AuditLog.find({ caseId: caseItem.caseId });
    auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      case: caseItem,
      problems,
      tasks,
      dependencies,
      auditLogs
    });
  } catch (err) {
    next(err);
  }
};

export const verifyCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified, feedbackNotes } = req.body; // verified: true/false

    const caseItem = await Case.findOne({ $or: [{ _id: id }, { caseId: id }] });
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    if (verified) {
      await Case.findByIdAndUpdate(caseItem._id, {
        status: 'RESOLVED',
        citizenVerification: {
          verified: true,
          resolvedAt: new Date().toISOString(),
          notes: feedbackNotes || 'Citizen confirmed all problems successfully resolved on-site.'
        }
      });

      await logAudit({
        caseId: caseItem.caseId,
        actorId: req.user.id,
        actorName: req.user.name,
        actorRole: 'citizen',
        action: 'CITIZEN_VERIFIED_RESOLVED',
        details: `Citizen confirmed incident resolution: "YES — RESOLVED". Case officially closed.`
      });

      await createNotification({
        userId: caseItem.userId,
        role: 'citizen',
        title: `Case ${caseItem.caseId} Fully Resolved`,
        message: 'Thank you for verifying. The municipal audit trail is now closed.',
        caseId: caseItem.caseId,
        type: 'success'
      });

      return res.json({ success: true, message: 'Case verified and resolved.', status: 'RESOLVED' });
    } else {
      // Reopen case
      await Case.findByIdAndUpdate(caseItem._id, {
        status: 'REOPENED',
        citizenVerification: {
          verified: false,
          notes: feedbackNotes || 'Citizen reported issue is still not resolved.'
        }
      });

      await logAudit({
        caseId: caseItem.caseId,
        actorId: req.user.id,
        actorName: req.user.name,
        actorRole: 'citizen',
        action: 'CITIZEN_REJECTED_REOPENED',
        details: `Citizen flagged unresolved condition: "NO — STILL A PROBLEM". Feedback: ${feedbackNotes || 'None'}`
      });

      // Notify Command Center
      await createNotification({
        role: 'command_center',
        title: `Case ${caseItem.caseId} Reopened by Citizen`,
        message: `Citizen reported problem persists: ${feedbackNotes || 'Requires secondary inspection'}`,
        caseId: caseItem.caseId,
        type: 'urgent'
      });

      return res.json({ success: true, message: 'Case reopened for secondary review.', status: 'REOPENED' });
    }
  } catch (err) {
    next(err);
  }
};

export const updateRecovery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { recoveryPhase, active, status } = req.body;

    const caseItem = await Case.findOne({ $or: [{ _id: id }, { caseId: id }] });
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    const currentRecovery = caseItem.recoveryPhase || {};
    const updatedRecovery = {
      ...currentRecovery,
      active: active !== undefined ? active : true,
      status: status || currentRecovery.status || 'IN_PROGRESS',
      items: recoveryPhase?.items || currentRecovery.items || []
    };

    await Case.findByIdAndUpdate(caseItem._id, {
      recoveryPhase: updatedRecovery
    });

    await logAudit({
      caseId: caseItem.caseId,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'RECOVERY_PHASE_UPDATED',
      details: `Recovery phase updated to ${updatedRecovery.status}. Items tracked: ${updatedRecovery.items.length}`
    });

    res.json({ success: true, recoveryPhase: updatedRecovery });
  } catch (err) {
    next(err);
  }
};

export default { analyzeAndCreateCase, getCases, getCaseById, verifyCase, updateRecovery };
