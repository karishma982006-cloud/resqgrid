import { Report, DisasterEvent } from '../models/index.js';
import { decomposeReport } from '../services/problemDecompositionEngine.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const createReport = async (req, res, next) => {
  try {
    const {
      description,
      address,
      latitude,
      longitude,
      affectedPeople,
      immediateDanger,
      severityHint,
      imageUrl,
      mode: clientMode
    } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Incident description is required.' });
    }

    // Check if active disaster mode is enabled globally
    const activeDisaster = await DisasterEvent.findOne({ active: true });
    const mode = clientMode || (activeDisaster ? 'DISASTER' : 'NORMAL');

    const reportCount = await Report.countDocuments();
    const reportCode = `REP-${1000 + reportCount + 1}`;

    const report = await Report.create({
      reportCode,
      citizenId: req.user.id,
      citizenName: req.user.name,
      citizenPhone: req.user.phone || '',
      description: description.trim(),
      location: {
        address: address || 'Main Commercial Road & 4th Cross',
        lat: latitude ? parseFloat(latitude) : 12.9716,
        lng: longitude ? parseFloat(longitude) : 77.5946
      },
      affectedPeople: parseInt(affectedPeople) || 10,
      immediateDanger: Boolean(immediateDanger),
      severityHint: severityHint || 'HIGH',
      imageUrl: imageUrl || null,
      mode,
      disasterEventId: activeDisaster ? activeDisaster._id : null,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    });

    await logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CITIZEN_REPORT_SUBMITTED',
      details: `Report ${reportCode} submitted: "${description.substring(0, 80)}..."`,
      metadata: { reportId: report._id, mode }
    });

    await createNotification({
      userId: req.user.id,
      role: 'citizen',
      title: 'Report Received',
      message: `Your report ${reportCode} has been logged and is undergoing automated triage.`,
      type: 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      report
    });
  } catch (err) {
    next(err);
  }
};

export const previewAnalysis = async (req, res, next) => {
  try {
    const { description, mode = 'NORMAL', affectedPeople = 10, immediateDanger = false } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: 'Description text is required for analysis.' });
    }

    const decomposed = await decomposeReport(description, mode, { affectedPeople, immediateDanger });
    
    res.json({
      success: true,
      analysisSteps: [
        { step: 1, label: 'Reading report text', status: 'COMPLETED' },
        { step: 2, label: 'Identifying distinct problems', status: 'COMPLETED', count: decomposed.length },
        { step: 3, label: 'Identifying affected municipal & emergency services', status: 'COMPLETED' },
        { step: 4, label: 'Mapping responsible departments & capabilities', status: 'COMPLETED' },
        { step: 5, label: 'Checking severity & safety hazards', status: 'COMPLETED' },
        { step: 6, label: 'Calculating dynamic priority scores', status: 'COMPLETED' },
        { step: 7, label: 'Checking dependencies & blocking constraints', status: 'COMPLETED' }
      ],
      problems: decomposed
    });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query = { citizenId: req.user.id };
    }
    const reports = await Report.find(query);
    reports.sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    next(err);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

export default { createReport, previewAnalysis, getReports, getReportById };
