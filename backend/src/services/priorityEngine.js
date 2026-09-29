import { PriorityRule } from '../models/index.js';

// Default configuration weights
const DEFAULT_WEIGHTS = {
  severity: 0.25,
  safetyRisk: 0.25,
  peopleAffected: 0.15,
  urgency: 0.15,
  publicImpact: 0.10,
  dependencyFactor: 0.10,
  disasterMultiplier: 1.25
};

export const calculatePriority = async ({
  category = '',
  severity = 'MEDIUM', // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  safetyRisk = 5, // 1 to 10
  peopleAffected = 10, // number
  urgency = 5, // 1 to 10
  publicImpact = 5, // 1 to 10
  isBlockingOthers = false,
  isDisasterMode = false,
  customFactors = {}
}) => {
  // Load custom weights from DB if set
  let weights = { ...DEFAULT_WEIGHTS };
  try {
    const customRule = await PriorityRule.findOne({ active: true });
    if (customRule && customRule.weights) {
      weights = { ...weights, ...customRule.weights };
    }
  } catch (err) {
    // fallback
  }

  // Convert severity to normalized score (0 - 100)
  const severityScoreMap = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 80,
    CRITICAL: 100
  };
  const severityVal = severityScoreMap[severity] || 50;
  const safetyVal = Math.min(10, Math.max(1, safetyRisk)) * 10;
  
  // People affected score: 1-10 -> 20, 11-50 -> 50, 51-200 -> 80, >200 -> 100
  let peopleVal = 30;
  if (peopleAffected > 500) peopleVal = 100;
  else if (peopleAffected > 100) peopleVal = 85;
  else if (peopleAffected > 25) peopleVal = 65;
  else if (peopleAffected > 5) peopleVal = 45;

  const urgencyVal = Math.min(10, Math.max(1, urgency)) * 10;
  const impactVal = Math.min(10, Math.max(1, publicImpact)) * 10;
  const dependencyVal = isBlockingOthers ? 90 : 30;

  // Base raw score
  let rawScore = 
    (severityVal * weights.severity) +
    (safetyVal * weights.safetyRisk) +
    (peopleVal * weights.peopleAffected) +
    (urgencyVal * weights.urgency) +
    (impactVal * weights.publicImpact) +
    (dependencyVal * weights.dependencyFactor);

  if (isDisasterMode) {
    rawScore = rawScore * weights.disasterMultiplier;
    // Boost critical disaster categories
    if (['Trapped People', 'Injuries & Medical Emergency', 'Fire Hazard'].includes(category)) {
      rawScore = Math.max(rawScore, 92);
    }
  }

  const finalScore = Math.min(100, Math.round(rawScore));

  // Determine Level
  let level = 'LOW';
  if (finalScore >= 80) level = 'CRITICAL';
  else if (finalScore >= 60) level = 'HIGH';
  else if (finalScore >= 40) level = 'MEDIUM';

  // Generate clear reason explanation
  const reasons = [];
  if (safetyVal >= 80) reasons.push('Immediate life safety and severe electrocution/structural risk');
  else if (safetyVal >= 60) reasons.push('Elevated hazard to pedestrians and nearby property');

  if (isBlockingOthers) reasons.push('Key dependency: Blocks downstream road clearance and emergency transit');
  if (peopleAffected >= 50) reasons.push(`High public exposure: Affects ${peopleAffected}+ residents and commuters`);
  if (urgencyVal >= 80) reasons.push('Critical urgency requiring prompt frontline response');
  if (isDisasterMode) reasons.push('Active Disaster Mode priority override in effect');

  if (reasons.length === 0) {
    reasons.push('Standard municipal infrastructure maintenance threshold');
  }

  return {
    score: finalScore,
    level,
    reasons,
    summaryReason: reasons.slice(0, 2).join(' • '),
    breakdown: {
      severity: severityVal,
      safetyRisk: safetyVal,
      peopleAffected: peopleVal,
      urgency: urgencyVal,
      publicImpact: impactVal,
      isBlockingOthers,
      isDisasterMode
    }
  };
};

export default { calculatePriority, DEFAULT_WEIGHTS };
