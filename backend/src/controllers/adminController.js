import { User, Department, Agency, Resource, Capability, PriorityRule, Jurisdiction } from '../models/index.js';
import { logAudit } from '../services/auditService.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const users = await User.find({});
    const departments = await Department.find({});
    const agencies = await Agency.find({});
    const resources = await Resource.find({});
    const capabilities = await Capability.find({});
    const priorityRule = await PriorityRule.findOne({ active: true });
    const jurisdictions = await Jurisdiction.find({});

    res.json({
      success: true,
      users: users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, departmentCode: u.departmentCode })),
      departments,
      agencies,
      resources,
      capabilities,
      priorityRule: priorityRule || {
        weights: {
          severity: 0.25,
          safetyRisk: 0.25,
          peopleAffected: 0.15,
          urgency: 0.15,
          publicImpact: 0.10,
          dependencyFactor: 0.10,
          disasterMultiplier: 1.25
        }
      },
      jurisdictions
    });
  } catch (err) {
    next(err);
  }
};

export const updatePriorityWeights = async (req, res, next) => {
  try {
    const { weights } = req.body;
    let rule = await PriorityRule.findOne({ active: true });
    if (rule) {
      rule = await PriorityRule.findByIdAndUpdate(rule._id, { weights, updatedAt: new Date().toISOString() });
    } else {
      rule = await PriorityRule.create({
        name: 'Default Master Priority Config',
        weights,
        active: true,
        createdAt: new Date().toISOString()
      });
    }

    await logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'ADMIN_PRIORITY_WEIGHTS_UPDATED',
      details: 'Dynamic priority engine weights updated by system administrator.'
    });

    res.json({ success: true, message: 'Priority weights updated.', rule });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, contactPhone, email, jurisdiction, capabilities } = req.body;
    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      contactPhone,
      email,
      jurisdiction: jurisdiction || 'Central Metropolitan District',
      capabilities: capabilities || [],
      active: true,
      createdAt: new Date().toISOString()
    });

    await logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'ADMIN_DEPARTMENT_CREATED',
      details: `Created new department: ${dept.name} (${dept.code})`
    });

    res.status(201).json({ success: true, department: dept });
  } catch (err) {
    next(err);
  }
};

export const toggleDepartmentActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    const updated = await Department.findByIdAndUpdate(id, { active: !dept.active });
    res.json({ success: true, department: updated });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const { name, departmentCode, capabilities, status = 'AVAILABLE', location, distanceKm } = req.body;
    const resource = await Resource.create({
      name,
      departmentCode,
      capabilities: Array.isArray(capabilities) ? capabilities : [capabilities],
      status,
      location: location || { lat: 12.9716, lng: 77.5946, areaName: 'Central Depot' },
      distanceKm: distanceKm || 4.5,
      activeTaskCount: 0,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, resource });
  } catch (err) {
    next(err);
  }
};

export default { getAdminOverview, updatePriorityWeights, createDepartment, toggleDepartmentActive, createResource };
