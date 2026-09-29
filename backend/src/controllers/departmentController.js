import { Department, Task } from '../models/index.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({});
    
    // Add real-time task counts to each department
    const enriched = await Promise.all(departments.map(async (dept) => {
      const activeCount = await Task.countDocuments({
        departmentCode: dept.code,
        status: { $in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED'] }
      });
      const criticalCount = await Task.countDocuments({
        departmentCode: dept.code,
        priorityLevel: 'CRITICAL',
        status: { $ne: 'COMPLETED' }
      });
      const completedCount = await Task.countDocuments({
        departmentCode: dept.code,
        status: 'COMPLETED'
      });

      return {
        ...dept,
        activeTasks: activeCount,
        criticalTasks: criticalCount,
        completedTasks: completedCount
      };
    }));

    res.json({ success: true, count: enriched.length, departments: enriched });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await Department.findOne({
      $or: [{ _id: req.params.id }, { code: req.params.id.toUpperCase() }]
    });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.json({ success: true, department: dept });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const updated = await Department.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.json({ success: true, department: updated });
  } catch (err) {
    next(err);
  }
};

export default { getDepartments, getDepartmentById, updateDepartment };
