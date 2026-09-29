import { mapProblemToDepartment } from './responsibilityMappingService.js';

export const decomposeReport = async (reportText, mode = 'NORMAL', extraDetails = {}) => {
  const text = reportText || '';
  const lower = text.toLowerCase();
  const problems = [];

  // Define problem pattern matchers
  const detectors = [
    {
      category: 'Electrical Damage',
      triggers: ['pole', 'wire', 'electric', 'power', 'transformer', 'spark', 'current', 'cable', 'blackout', 'shock', 'power line'],
      title: 'Electrical Hazard & Pole Damage',
      defaultDesc: 'Damaged electrical pole and overhead wires creating hazardous current risk.',
      severity: 'HIGH',
      safetyRisk: 9,
      urgency: 9
    },
    {
      category: 'Drainage Damage',
      triggers: ['drain', 'drainage', 'sewer', 'waterlogging', 'accumulating', 'water accumulating', 'overflow', 'clogged'],
      title: 'Drainage Clog & Waterlogging',
      defaultDesc: 'Blocked drainage channel causing persistent stormwater pooling on road.',
      severity: 'MEDIUM',
      safetyRisk: 5,
      urgency: 6
    },
    {
      category: 'Road Damage',
      triggers: ['road', 'pavement', 'asphalt', 'crater', 'pothole', 'caved', 'cracking', 'broken road', 'tar'],
      title: 'Road Surface & Structural Damage',
      defaultDesc: 'Cracked, caved or eroded roadway impeding safe transit.',
      severity: 'HIGH',
      safetyRisk: 6,
      urgency: 7
    },
    {
      category: 'Vehicle Access Problem',
      triggers: ['vehicle', 'cross', 'cannot cross', 'traffic', 'blocked road', 'jam', 'congestion', 'cars', 'impassable'],
      title: 'Vehicle Access & Route Obstruction',
      defaultDesc: 'Complete or partial thoroughfare blockage preventing vehicle passage.',
      severity: 'HIGH',
      safetyRisk: 7,
      urgency: 8
    },
    // Disaster specific
    {
      category: 'Trapped People',
      triggers: ['trapped', 'under rubble', 'collapsed', 'buried', 'debris', 'underneath', 'stuck inside', 'building collapse'],
      title: 'Structural Collapse & Trapped Civilians',
      defaultDesc: 'Civilians trapped beneath collapsed structure requiring immediate extrication.',
      severity: 'CRITICAL',
      safetyRisk: 10,
      urgency: 10
    },
    {
      category: 'Injuries & Medical Emergency',
      triggers: ['injury', 'injured', 'bleeding', 'casualty', 'unconscious', 'fracture', 'burn', 'ambulance', 'paramedic'],
      title: 'Mass Casualty & Trauma Response',
      defaultDesc: 'Injured individuals in immediate need of triage and hospital transport.',
      severity: 'CRITICAL',
      safetyRisk: 10,
      urgency: 10
    },
    {
      category: 'Fire Hazard',
      triggers: ['fire', 'flame', 'smoke', 'gas leak', 'explosion', 'burning', 'ignited'],
      title: 'Active Fire & Hazmat Threat',
      defaultDesc: 'Active flames and smoke threatening nearby buildings and public safety.',
      severity: 'CRITICAL',
      safetyRisk: 10,
      urgency: 10
    },
    {
      category: 'Emergency Shelter Requirement',
      triggers: ['shelter', 'displaced', 'homeless', 'evacuate', 'evacuation', 'camp', 'displaced people'],
      title: 'Displaced Population & Shelter Support',
      defaultDesc: 'Displaced citizens requiring emergency accommodation, rations, and hygiene support.',
      severity: 'HIGH',
      safetyRisk: 6,
      urgency: 7
    }
  ];

  for (const detector of detectors) {
    const hasTrigger = detector.triggers.some(trig => lower.includes(trig));
    if (hasTrigger) {
      // Find matching sentences or clauses for context
      const sentences = text.split(/[.;,\n]/).filter(s => s.trim().length > 3);
      const matchingSentence = sentences.find(s => detector.triggers.some(trig => s.toLowerCase().includes(trig))) || text;
      
      const mapping = await mapProblemToDepartment(detector.title, matchingSentence, mode);

      problems.push({
        problemTitle: detector.title,
        problemDescription: matchingSentence.trim() || detector.defaultDesc,
        category: detector.category,
        departmentCode: mapping.departmentCode,
        departmentName: mapping.departmentName,
        requiredCapability: mapping.capability,
        severity: mode === 'DISASTER' && ['Trapped People', 'Injuries & Medical Emergency', 'Fire Hazard'].includes(detector.category)
          ? 'CRITICAL'
          : detector.severity,
        safetyRisk: detector.safetyRisk,
        urgency: detector.urgency
      });
    }
  }

  // If no specific patterns detected, provide a unified infrastructure incident
  if (problems.length === 0) {
    const mapping = await mapProblemToDepartment('Public Infrastructure Incident', text, mode);
    problems.push({
      problemTitle: 'Reported Public Infrastructure Incident',
      problemDescription: text.trim() || 'General public service issue requiring inspection.',
      category: 'General Infrastructure',
      departmentCode: mapping.departmentCode,
      departmentName: mapping.departmentName,
      requiredCapability: mapping.capability,
      severity: 'MEDIUM',
      safetyRisk: 5,
      urgency: 5
    });
  }

  return problems;
};

export default { decomposeReport };
