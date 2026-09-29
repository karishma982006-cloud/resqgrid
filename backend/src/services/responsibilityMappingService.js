import { Department, Capability } from '../models/index.js';

// Default built-in mapping definitions fallback
const DEFAULT_RULES = [
  {
    category: 'Electrical Damage',
    keywords: ['electric', 'pole', 'wire', 'power', 'transformer', 'spark', 'current', 'cable', 'shock', 'blackout', 'grid'],
    departmentCode: 'ELECTRICITY',
    departmentName: 'Electricity Department',
    capability: 'Electrical Hazard Isolation & Repair',
    safetyRisk: 9,
    baseUrgency: 8
  },
  {
    category: 'Road Damage',
    keywords: ['road', 'pavement', 'asphalt', 'crater', 'pothole', 'crack', 'caved', 'culvert', 'bridge', 'paving', 'tar'],
    departmentCode: 'PWD',
    departmentName: 'PWD / Road Department',
    capability: 'Road Surface & Structural Repair',
    safetyRisk: 6,
    baseUrgency: 6
  },
  {
    category: 'Drainage Damage',
    keywords: ['drain', 'drainage', 'sewer', 'waterlogging', 'accumulating', 'flood', 'overflow', 'clogged', 'blocked water', 'stagnant'],
    departmentCode: 'DRAINAGE',
    departmentName: 'Drainage Department',
    capability: 'Stormwater & Drainage Clearance',
    safetyRisk: 5,
    baseUrgency: 5
  },
  {
    category: 'Vehicle Access Problem',
    keywords: ['vehicle', 'traffic', 'cross', 'blocked road', 'jam', 'congestion', 'cars', 'commute', 'passage', 'access blocked', 'cannot cross'],
    departmentCode: 'TRAFFIC',
    departmentName: 'Traffic Department',
    capability: 'Traffic Diversion & Route Clearance',
    safetyRisk: 7,
    baseUrgency: 7
  },
  // Disaster specific categories
  {
    category: 'Trapped People',
    keywords: ['trapped', 'under rubble', 'collapsed', 'buried', 'debris', 'underneath', 'stuck inside', 'building collapse'],
    departmentCode: 'SEARCH_RESCUE',
    departmentName: 'Search & Rescue',
    capability: 'Urban Search & Extrication',
    safetyRisk: 10,
    baseUrgency: 10
  },
  {
    category: 'Injuries & Medical Emergency',
    keywords: ['injury', 'injured', 'bleeding', 'casualty', 'unconscious', 'fracture', 'burn', 'ambulance', 'medic', 'patient', 'hospital'],
    departmentCode: 'MEDICAL',
    departmentName: 'Medical / Ambulance Services',
    capability: 'Emergency Trauma & Paramedic Transport',
    safetyRisk: 10,
    baseUrgency: 10
  },
  {
    category: 'Fire Hazard',
    keywords: ['fire', 'flame', 'smoke', 'gas leak', 'explosion', 'burning', 'ignited'],
    departmentCode: 'FIRE_RESCUE',
    departmentName: 'Fire & Rescue Department',
    capability: 'Fire Suppression & Hazardous Containment',
    safetyRisk: 10,
    baseUrgency: 10
  },
  {
    category: 'Emergency Shelter Requirement',
    keywords: ['shelter', 'displaced', 'homeless', 'evacuate', 'evacuation', 'camp', 'food', 'blanket', 'drinking water'],
    departmentCode: 'RELIEF',
    departmentName: 'Relief & Shelter Administration',
    capability: 'Emergency Relief & Temporary Housing',
    safetyRisk: 6,
    baseUrgency: 7
  },
  {
    category: 'Public Safety Hazard',
    keywords: ['crowd', 'looting', 'law', 'order', 'stampede', 'security', 'cordon', 'unstable structure'],
    departmentCode: 'SAFETY',
    departmentName: 'Public Safety & Police',
    capability: 'Perimeter Security & Public Safety',
    safetyRisk: 7,
    baseUrgency: 7
  }
];

export const getMappingRules = async () => {
  return DEFAULT_RULES;
};

export const mapProblemToDepartment = async (problemTitle, problemDescription, mode = 'NORMAL') => {
  const text = `${problemTitle} ${problemDescription}`.toLowerCase();
  const rules = await getMappingRules();

  // If in disaster mode, prioritize search & rescue / medical / fire rules if matching
  let bestMatch = null;
  let maxScore = 0;

  for (const rule of rules) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    if (matchCount > maxScore) {
      maxScore = matchCount;
      bestMatch = rule;
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      departmentCode: bestMatch.departmentCode,
      departmentName: bestMatch.departmentName,
      capability: bestMatch.capability,
      safetyRisk: bestMatch.safetyRisk,
      baseUrgency: bestMatch.baseUrgency,
      category: bestMatch.category
    };
  }

  // Fallback default
  return {
    departmentCode: 'PWD',
    departmentName: 'PWD / Road Department',
    capability: 'General Public Infrastructure',
    safetyRisk: 5,
    baseUrgency: 5,
    category: 'General Infrastructure'
  };
};

export default { getMappingRules, mapProblemToDepartment, DEFAULT_RULES };
