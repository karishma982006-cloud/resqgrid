import { DisasterEvent, Case, Report, Task, Department } from '../models/index.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getDisasters = async (req, res, next) => {
  try {
    const disasters = await DisasterEvent.find({});
    disasters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: disasters.length, disasters });
  } catch (err) {
    next(err);
  }
};

export const getActiveDisaster = async (req, res, next) => {
  try {
    const active = await DisasterEvent.findOne({ active: true });
    
    let linkedCases = [];
    let linkedReports = [];
    let criticalTasks = [];

    if (active) {
      linkedCases = await Case.find({ disasterEventId: active._id });
      linkedReports = await Report.find({ disasterEventId: active._id });
      criticalTasks = await Task.find({
        caseId: { $in: linkedCases.map(c => c.caseId) },
        priorityLevel: 'CRITICAL',
        status: { $ne: 'COMPLETED' }
      });
    }

    res.json({
      success: true,
      activeDisaster: active || null,
      isActive: Boolean(active),
      linkedCaseCount: linkedCases.length,
      linkedReportCount: linkedReports.length,
      criticalTaskCount: criticalTasks.length,
      criticalTasks
    });
  } catch (err) {
    next(err);
  }
};

export const activateDisaster = async (req, res, next) => {
  try {
    const { title, disasterType, epicenter, affectedRadiusKm, estimatedImpactPopulation, description } = req.body;

    // Check if an existing disaster is already active, if so update
    let disaster = await DisasterEvent.findOne({ active: true });

    if (disaster) {
      disaster = await DisasterEvent.findByIdAndUpdate(disaster._id, {
        title: title || disaster.title,
        description: description || disaster.description,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Find existing inactive disaster or create new
      const existing = await DisasterEvent.findOne({});
      if (existing) {
        disaster = await DisasterEvent.findByIdAndUpdate(existing._id, {
          active: true,
          activatedAt: new Date().toISOString(),
          activatedBy: req.user.name,
          title: title || existing.title,
          description: description || existing.description,
          emergencyStatus: 'LEVEL_1_MAXIMUM_RESPONSE',
          updatedAt: new Date().toISOString()
        });
      } else {
        const disasterCode = `EQ-${new Date().getFullYear()}-001`;
        disaster = await DisasterEvent.create({
          disasterCode,
          title: title || 'Major Earthquake & Infrastructure Breach',
          disasterType: disasterType || 'Earthquake',
          epicenter: epicenter || 'District Seismic Fault Line 3',
          affectedRadiusKm: affectedRadiusKm || 25,
          estimatedImpactPopulation: estimatedImpactPopulation || 150000,
          description: description || 'High-magnitude tremor causing structural damage, trapped civilians, ruptured electrical lines, and debris blockages across major metropolitan sectors.',
          active: true,
          activatedAt: new Date().toISOString(),
          activatedBy: req.user.name,
          linkedReportsCount: 47,
          emergencyStatus: 'LEVEL_1_MAXIMUM_RESPONSE',
          createdAt: new Date().toISOString()
        });
      }
    }

    await logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DISASTER_MODE_ACTIVATED',
      details: `DISASTER MODE: ACTIVE - ${disaster.title} (${disaster.disasterCode}). Emergency protocols engaged.`
    });

    // Broadcast emergency notification to all departments
    const depts = await Department.find({});
    for (const d of depts) {
      await createNotification({
        departmentCode: d.code,
        role: 'department',
        title: `🚨 EMERGENCY: Disaster Mode Activated by Command Center`,
        message: `${disaster.disasterCode}: ${disaster.title}. Emergency priority protocol engaged for ${d.name}. Frontline squads must prioritize life-safety work orders.`,
        type: 'urgent'
      });
    }

    await createNotification({
      role: 'all',
      title: 'CRITICAL: Disaster Mode Activated',
      message: `${disaster.disasterCode}: ${disaster.title} declared active. All emergency units prioritize life-safety queues.`,
      type: 'urgent'
    });

    res.json({
      success: true,
      message: 'Disaster mode activated and reported to all departments.',
      disaster
    });
  } catch (err) {
    next(err);
  }
};

export const deactivateDisaster = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = id ? await DisasterEvent.findById(id) : await DisasterEvent.findOne({ active: true });

    if (!target) {
      return res.status(404).json({ success: false, message: 'No active disaster event found to close.' });
    }

    const updated = await DisasterEvent.findByIdAndUpdate(target._id, {
      active: false,
      closedAt: new Date().toISOString(),
      closedBy: req.user.name
    });

    await logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DISASTER_MODE_DEACTIVATED',
      details: `Disaster mode closed for ${target.disasterCode}. Normal municipal operations resumed.`
    });

    // Notify all departments about return to normal operations
    const depts = await Department.find({});
    for (const d of depts) {
      await createNotification({
        departmentCode: d.code,
        role: 'department',
        title: `Disaster Mode Deactivated — Normal Operations Resumed`,
        message: `Command Center has concluded disaster protocols for ${target.disasterCode}. Standard operational triage restored for ${d.name}.`,
        type: 'info'
      });
    }

    await createNotification({
      role: 'all',
      title: 'Disaster Mode Deactivated',
      message: `Disaster operations for ${target.disasterCode} concluded. Transitioning to recovery phase.`,
      type: 'info'
    });

    res.json({ success: true, message: 'Disaster mode deactivated. Normal operations resumed.', disaster: updated });
  } catch (err) {
    next(err);
  }
};

export default { getDisasters, getActiveDisaster, activateDisaster, deactivateDisaster };
