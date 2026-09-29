import { Resource } from '../models/index.js';

export const getResources = async (req, res, next) => {
  try {
    const { departmentCode, status, capability } = req.query;
    let query = {};
    if (departmentCode && departmentCode !== 'ALL') query.departmentCode = departmentCode;
    if (status && status !== 'ALL') query.status = status;

    let resources = await Resource.find(query);

    if (capability) {
      const cap = capability.toLowerCase();
      resources = resources.filter(r => 
        r.capabilities && r.capabilities.some(c => c.toLowerCase().includes(cap))
      );
    }

    res.json({ success: true, count: resources.length, resources });
  } catch (err) {
    next(err);
  }
};

export const matchResource = async (req, res, next) => {
  try {
    const { capability, departmentCode, targetLocation } = req.body;

    let candidates = await Resource.find({});

    if (departmentCode) {
      candidates = candidates.filter(r => r.departmentCode === departmentCode);
    }

    if (capability) {
      const cap = capability.toLowerCase();
      candidates = candidates.filter(r => 
        r.capabilities && r.capabilities.some(c => c.toLowerCase().includes(cap))
      );
    }

    // Rank candidates: Available first, then shortest distance, then lowest active task count
    candidates.sort((a, b) => {
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
      const distA = a.distanceKm || 5;
      const distB = b.distanceKm || 5;
      if (distA !== distB) return distA - distB;
      return (a.activeTaskCount || 0) - (b.activeTaskCount || 0);
    });

    const recommended = candidates.find(c => c.status === 'AVAILABLE') || candidates[0] || null;

    res.json({
      success: true,
      recommended,
      candidates
    });
  } catch (err) {
    next(err);
  }
};

export const updateResourceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, activeTaskCount, currentLocation } = req.body;

    const updated = await Resource.findByIdAndUpdate(id, {
      ...(status && { status }),
      ...(activeTaskCount !== undefined && { activeTaskCount }),
      ...(currentLocation && { location: currentLocation })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    res.json({ success: true, message: 'Resource updated.', resource: updated });
  } catch (err) {
    next(err);
  }
};

export default { getResources, matchResource, updateResourceStatus };
