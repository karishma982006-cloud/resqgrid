import bcrypt from 'bcryptjs';
import {
  User,
  Department,
  Agency,
  Resource,
  Capability,
  Report,
  Case,
  Problem,
  Task,
  Dependency,
  Escalation,
  DisasterEvent,
  PriorityRule,
  Jurisdiction,
  AuditLog,
  Notification
} from '../models/index.js';

export const seedDatabase = async () => {
  console.log('[SEED] Seeding RESQ-GRID demo database...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Agency.deleteMany({}),
    Resource.deleteMany({}),
    Capability.deleteMany({}),
    Report.deleteMany({}),
    Case.deleteMany({}),
    Problem.deleteMany({}),
    Task.deleteMany({}),
    Dependency.deleteMany({}),
    Escalation.deleteMany({}),
    DisasterEvent.deleteMany({}),
    PriorityRule.deleteMany({}),
    Jurisdiction.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Users
  const users = await User.insertMany([
    {
      _id: 'user_cit_1',
      name: 'Rohan Sharma (Citizen 1)',
      email: 'citizen@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 98765 43210',
      address: 'House #42, 5th Cross, Indiranagar',
      location: { lat: 12.9716, lng: 77.5946, areaName: 'Central District' },
      role: 'citizen'
    },
    {
      _id: 'user_cit_2',
      name: 'Ananya Verma (Citizen 2)',
      email: 'citizen2@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 98765 43211',
      address: 'Flat 304, Green Heights, North Ward',
      location: { lat: 12.9916, lng: 77.5846, areaName: 'North Ward' },
      role: 'citizen'
    },
    {
      _id: 'user_cit_3',
      name: 'Vikram Patel (Citizen 3)',
      email: 'citizen3@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 98765 43212',
      address: 'Plot 12, Industrial Suburb',
      location: { lat: 12.9516, lng: 77.6146, areaName: 'South-East Zone' },
      role: 'citizen'
    },
    {
      _id: 'user_dept_elec',
      name: 'Electricity Dispatch Desk',
      email: 'electricity@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4455',
      role: 'department',
      departmentCode: 'ELECTRICITY',
      departmentName: 'Electricity Department'
    },
    {
      _id: 'user_dept_pwd',
      name: 'PWD Operations Desk',
      email: 'pwd@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4456',
      role: 'department',
      departmentCode: 'PWD',
      departmentName: 'PWD / Road Department'
    },
    {
      _id: 'user_dept_drain',
      name: 'Drainage & Stormwater Desk',
      email: 'drainage@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4457',
      role: 'department',
      departmentCode: 'DRAINAGE',
      departmentName: 'Drainage Department'
    },
    {
      _id: 'user_dept_traffic',
      name: 'Traffic Control Division',
      email: 'traffic@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4458',
      role: 'department',
      departmentCode: 'TRAFFIC',
      departmentName: 'Traffic Department'
    },
    {
      _id: 'user_dept_med',
      name: 'Medical Emergency Dispatch',
      email: 'medical@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4459',
      role: 'department',
      departmentCode: 'MEDICAL',
      departmentName: 'Medical Department'
    },
    {
      _id: 'user_dept_fire',
      name: 'Fire & Rescue HQ',
      email: 'fire@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2233 4460',
      role: 'department',
      departmentCode: 'FIRE_RESCUE',
      departmentName: 'Fire & Rescue'
    },
    {
      _id: 'user_cmd',
      name: 'Command Center Officer',
      email: 'command@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2299 0001',
      role: 'command_center'
    },
    {
      _id: 'user_admin',
      name: 'Chief System Administrator',
      email: 'admin@resqgrid.demo',
      password: defaultPassword,
      phone: '+91 80 2299 0000',
      role: 'admin'
    }
  ]);

  // 2. Departments
  const departments = await Department.insertMany([
    {
      code: 'ELECTRICITY',
      name: 'Electricity Department',
      description: 'Power grid maintenance, high-voltage isolation, transformer repairs, street lighting.',
      contactPhone: '1912 / +91 80 2233 4455',
      email: 'dispatch@electricity.gov.demo',
      jurisdiction: 'Metropolitan Grid Zone 1-4',
      capabilities: ['Electrical Hazard Isolation', 'Power Line Repair', 'Transformer Servicing', 'Grid Grounding'],
      active: true
    },
    {
      code: 'PWD',
      name: 'PWD / Road Department',
      description: 'Road structural repair, asphalt paving, culvert bridges, heavy excavation.',
      contactPhone: '+91 80 2233 4456',
      email: 'roads@pwd.gov.demo',
      jurisdiction: 'Central & Peripheral Arterial Roads',
      capabilities: ['Road Surface & Structural Repair', 'Debris Clearing', 'Trench Backfilling', 'Bridge Maintenance'],
      active: true
    },
    {
      code: 'DRAINAGE',
      name: 'Drainage Department',
      description: 'Stormwater management, de-silting, pump deployment, sewer overflow response.',
      contactPhone: '+91 80 2233 4457',
      email: 'drainage@municipal.gov.demo',
      jurisdiction: 'City Stormwater Basin Network',
      capabilities: ['Stormwater & Drainage Clearance', 'High-Capacity Pumping', 'Culvert De-clogging'],
      active: true
    },
    {
      code: 'TRAFFIC',
      name: 'Traffic Department',
      description: 'Traffic diversion, lane barricades, corridor clearance, congestion management.',
      contactPhone: '+91 80 2233 4458',
      email: 'traffic@police.gov.demo',
      jurisdiction: 'Urban Transit Grid',
      capabilities: ['Traffic Diversion & Route Clearance', 'Emergency Green Corridor Creation', 'Signage Deployment'],
      active: true
    },
    {
      code: 'FIRE_RESCUE',
      name: 'Fire & Rescue',
      description: 'Fire suppression, hazmat containment, chemical isolation, thermal rescue.',
      contactPhone: '101 / +91 80 2233 4460',
      email: 'control@firerescue.gov.demo',
      jurisdiction: 'Greater District Sector',
      capabilities: ['Fire Suppression & Hazardous Containment', 'Thermal Imaging Extrication', 'Hazmat Isolation'],
      active: true
    },
    {
      code: 'MEDICAL',
      name: 'Medical Department',
      description: 'Trauma triage, advanced life support ambulances, mobile clinic dispatch.',
      contactPhone: '108 / +91 80 2233 4459',
      email: 'ems@health.gov.demo',
      jurisdiction: 'District Healthcare Network',
      capabilities: ['Emergency Trauma & Paramedic Transport', 'Field Triage', 'Mass Casualty Evacuation'],
      active: true
    },
    {
      code: 'SEARCH_RESCUE',
      name: 'Search & Rescue',
      description: 'Specialized structural collapse extrication, acoustic listening, canine search.',
      contactPhone: '+91 80 2233 4461',
      email: 'sdrf@disaster.gov.demo',
      jurisdiction: 'Regional Disaster Response Zone',
      capabilities: ['Urban Search & Extrication', 'Canine Search Unit', 'Hydraulic Shoring'],
      active: true
    },
    {
      code: 'RELIEF',
      name: 'Relief & Shelter',
      description: 'Community relief camps, dry rations, temporary bedding, drinking water tankers.',
      contactPhone: '+91 80 2233 4462',
      email: 'relief@district.gov.demo',
      jurisdiction: 'Municipal Relief Centers',
      capabilities: ['Emergency Relief & Temporary Housing', 'Clean Water Distribution', 'Rations Distribution'],
      active: true
    },
    {
      code: 'SAFETY',
      name: 'Public Safety & Police',
      description: 'Perimeter cordoning, crowd management, security patrols, hazard exclusion zones.',
      contactPhone: '100 / +91 80 2233 4463',
      email: 'safety@police.gov.demo',
      jurisdiction: 'All Wards',
      capabilities: ['Perimeter Security & Public Safety', 'Evacuation Cordoning', 'Crowd Control'],
      active: true
    }
  ]);

  // 3. Resources (Crews & Equipment)
  const resources = await Resource.insertMany([
    // Electricity
    {
      name: 'Electricity Quick Crew Alpha',
      departmentCode: 'ELECTRICITY',
      departmentName: 'Electricity Department',
      capabilities: ['Electrical Hazard Isolation', 'Power Line Repair'],
      status: 'AVAILABLE',
      distanceKm: 2.1,
      activeTaskCount: 0,
      location: { lat: 12.9720, lng: 77.5950, areaName: 'Central Substation' }
    },
    {
      name: 'Electricity Heavy Line Unit 3',
      departmentCode: 'ELECTRICITY',
      departmentName: 'Electricity Department',
      capabilities: ['Transformer Servicing', 'High-Voltage Grid Grounding'],
      status: 'AVAILABLE',
      distanceKm: 4.8,
      activeTaskCount: 1,
      location: { lat: 12.9810, lng: 77.5810, areaName: 'West Transformer Yard' }
    },
    // PWD / Road Teams
    {
      name: 'PWD Team A (Heavy Asphalt Unit)',
      departmentCode: 'PWD',
      departmentName: 'PWD / Road Department',
      capabilities: ['Road Surface & Structural Repair', 'Debris Clearing'],
      status: 'BUSY', // Marked BUSY to support Reassignment scenario!
      distanceKm: 3.2,
      activeTaskCount: 2,
      location: { lat: 12.9640, lng: 77.6020, areaName: 'South Arterial Flyover' }
    },
    {
      name: 'PWD Team B (Emergency Road Clearance)',
      departmentCode: 'PWD',
      departmentName: 'PWD / Road Department',
      capabilities: ['Road Surface & Structural Repair', 'Debris Clearing', 'Trench Backfilling'],
      status: 'AVAILABLE', // Target for smooth Reassignment!
      distanceKm: 3.5,
      activeTaskCount: 0,
      location: { lat: 12.9750, lng: 77.5980, areaName: 'Central Depot Ward 4' }
    },
    {
      name: 'PWD Team C (Regional Highway Squad)',
      departmentCode: 'PWD',
      departmentName: 'PWD / Road Department',
      capabilities: ['Road Surface & Structural Repair'],
      status: 'AVAILABLE',
      distanceKm: 18.4, // Far distance
      activeTaskCount: 0,
      location: { lat: 13.0500, lng: 77.5500, areaName: 'Outer Ring Highway Post' }
    },
    // Drainage Teams
    {
      name: 'Drainage Stormwater Unit 1',
      departmentCode: 'DRAINAGE',
      departmentName: 'Drainage Department',
      capabilities: ['Stormwater & Drainage Clearance', 'High-Capacity Pumping'],
      status: 'AVAILABLE',
      distanceKm: 2.8,
      activeTaskCount: 0,
      location: { lat: 12.9730, lng: 77.5920, areaName: 'Central Stormwater Sump' }
    },
    // Traffic Teams
    {
      name: 'Traffic Mobile Interceptor 4',
      departmentCode: 'TRAFFIC',
      departmentName: 'Traffic Department',
      capabilities: ['Traffic Diversion & Route Clearance', 'Signage Deployment'],
      status: 'AVAILABLE',
      distanceKm: 1.5,
      activeTaskCount: 0,
      location: { lat: 12.9710, lng: 77.5930, areaName: 'Main Junction 4' }
    },
    // Medical / Ambulances
    {
      name: 'Ambulance Unit A (ALS-01)',
      departmentCode: 'MEDICAL',
      departmentName: 'Medical Department',
      capabilities: ['Emergency Trauma & Paramedic Transport'],
      status: 'BUSY',
      distanceKm: 1.2,
      activeTaskCount: 1,
      location: { lat: 12.9700, lng: 77.5900, areaName: 'City General Hospital' }
    },
    {
      name: 'Ambulance Unit B (ALS-02)',
      departmentCode: 'MEDICAL',
      departmentName: 'Medical Department',
      capabilities: ['Emergency Trauma & Paramedic Transport'],
      status: 'AVAILABLE',
      distanceKm: 4.1,
      activeTaskCount: 0,
      location: { lat: 12.9850, lng: 77.6050, areaName: 'North Triage Center' }
    },
    {
      name: 'Ambulance Unit C (BLS-03)',
      departmentCode: 'MEDICAL',
      departmentName: 'Medical Department',
      capabilities: ['Emergency Trauma & Paramedic Transport'],
      status: 'AVAILABLE',
      distanceKm: 9.3,
      activeTaskCount: 0,
      location: { lat: 12.9400, lng: 77.6300, areaName: 'South Suburb Dispensary' }
    },
    // Fire Engines
    {
      name: 'Fire Engine 1 (Water Tender Heavy)',
      departmentCode: 'FIRE_RESCUE',
      departmentName: 'Fire & Rescue',
      capabilities: ['Fire Suppression & Hazardous Containment'],
      status: 'AVAILABLE',
      distanceKm: 3.1,
      activeTaskCount: 0,
      location: { lat: 12.9780, lng: 77.5910, areaName: 'Central Fire Station' }
    },
    // Search & Rescue
    {
      name: 'Search & Rescue Squad Alpha',
      departmentCode: 'SEARCH_RESCUE',
      departmentName: 'Search & Rescue',
      capabilities: ['Urban Search & Extrication', 'Canine Search Unit'],
      status: 'AVAILABLE',
      distanceKm: 5.2,
      activeTaskCount: 0,
      location: { lat: 12.9650, lng: 77.5850, areaName: 'Disaster Relief Base' }
    }
  ]);

  // 4. Priority Configuration Rule
  await PriorityRule.create({
    name: 'Master Hackathon Multi-Factor Engine',
    weights: {
      severity: 0.25,
      safetyRisk: 0.25,
      peopleAffected: 0.15,
      urgency: 0.15,
      publicImpact: 0.10,
      dependencyFactor: 0.10,
      disasterMultiplier: 1.25
    },
    active: true,
    createdAt: new Date().toISOString()
  });

  // 5. DEMO SCENARIO 1: Master Case RG-1042
  console.log('[SEED] Creating Master Case RG-1042 demo scenario...');

  const report1042 = await Report.create({
    _id: 'rep_1042',
    reportCode: 'REP-1042',
    citizenId: 'user_cit_1',
    citizenName: 'Rohan Sharma (Citizen 1)',
    citizenPhone: '+91 98765 43210',
    description: 'There is a damaged electrical pole near my street. The drainage system is damaged, water is accumulating on the road, the road is damaged and vehicles cannot cross properly.',
    location: {
      address: 'Main Commercial Road & 4th Cross, Indiranagar',
      lat: 12.9716,
      lng: 77.5946
    },
    affectedPeople: 45,
    immediateDanger: true,
    severityHint: 'HIGH',
    mode: 'NORMAL',
    status: 'CONVERTED_TO_CASE',
    caseId: 'RG-1042',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  });

  const probElec = await Problem.create({
    _id: 'prob_1042_1',
    caseId: 'RG-1042',
    reportId: report1042._id,
    problemNumber: 1,
    title: 'Electrical Hazard & Pole Damage',
    description: 'Damaged electrical pole leaning into transit corridor with overhead wires at hazard risk.',
    category: 'Electrical Damage',
    severity: 'CRITICAL',
    safetyRisk: 9,
    urgency: 9,
    affectedPeople: 45,
    departmentCode: 'ELECTRICITY',
    departmentName: 'Electricity Department',
    requiredCapability: 'Electrical Hazard Isolation',
    priorityScore: 92,
    priorityLevel: 'CRITICAL',
    priorityReasons: [
      'Immediate electrocution and live overhead line threat',
      'Key dependency: Blocks downstream road clearance and excavation'
    ],
    status: 'IDENTIFIED',
    createdAt: new Date(Date.now() - 3550000).toISOString()
  });

  const probRoad = await Problem.create({
    _id: 'prob_1042_2',
    caseId: 'RG-1042',
    reportId: report1042._id,
    problemNumber: 2,
    title: 'Road Surface & Structural Damage',
    description: 'Pavement caved in and eroded by pooled water, creating deep craters.',
    category: 'Road Damage',
    severity: 'HIGH',
    safetyRisk: 7,
    urgency: 7,
    affectedPeople: 45,
    departmentCode: 'PWD',
    departmentName: 'PWD / Road Department',
    requiredCapability: 'Road Surface & Structural Repair',
    priorityScore: 78,
    priorityLevel: 'HIGH',
    priorityReasons: [
      'Arterial surface collapse impassable for civilian traffic',
      'Depends on electrical line isolation before structural work can proceed'
    ],
    status: 'IDENTIFIED',
    createdAt: new Date(Date.now() - 3550000).toISOString()
  });

  const probDrain = await Problem.create({
    _id: 'prob_1042_3',
    caseId: 'RG-1042',
    reportId: report1042._id,
    problemNumber: 3,
    title: 'Drainage Clog & Waterlogging',
    description: 'Underground culvert blocked, overflowing stormwater onto road surface.',
    category: 'Drainage Damage',
    severity: 'MEDIUM',
    safetyRisk: 5,
    urgency: 6,
    affectedPeople: 30,
    departmentCode: 'DRAINAGE',
    departmentName: 'Drainage Department',
    requiredCapability: 'Stormwater & Drainage Clearance',
    priorityScore: 62,
    priorityLevel: 'MEDIUM',
    priorityReasons: [
      'Stormwater pooling weakening pavement foundation',
      'Requires power line de-energization for suction equipment operation'
    ],
    status: 'IDENTIFIED',
    createdAt: new Date(Date.now() - 3550000).toISOString()
  });

  const probTraffic = await Problem.create({
    _id: 'prob_1042_4',
    caseId: 'RG-1042',
    reportId: report1042._id,
    problemNumber: 4,
    title: 'Vehicle Access & Route Obstruction',
    description: 'Vehicles completely blocked from crossing 4th cross junction; gridlock building up.',
    category: 'Vehicle Access Problem',
    severity: 'HIGH',
    safetyRisk: 6,
    urgency: 8,
    affectedPeople: 80,
    departmentCode: 'TRAFFIC',
    departmentName: 'Traffic Department',
    requiredCapability: 'Traffic Diversion & Route Clearance',
    priorityScore: 75,
    priorityLevel: 'HIGH',
    priorityReasons: [
      'Urban transit stoppage affecting commercial thoroughfare',
      'Waiting for road repair and clearing to reopen traffic flow'
    ],
    status: 'IDENTIFIED',
    createdAt: new Date(Date.now() - 3550000).toISOString()
  });

  // Tasks for RG-1042
  const taskElec = await Task.create({
    _id: 'task_1042_elec',
    caseId: 'RG-1042',
    problemId: probElec._id,
    title: 'Electrical Hazard & Pole Damage',
    description: probElec.description,
    category: 'Electrical Damage',
    departmentCode: 'ELECTRICITY',
    departmentName: 'Electricity Department',
    requiredCapability: 'Electrical Hazard Isolation',
    priorityScore: 92,
    priorityLevel: 'CRITICAL',
    priorityReasons: probElec.priorityReasons,
    prioritySummaryReason: 'Immediate life safety & blocks downstream road crew',
    status: 'ASSIGNED',
    assignedTeamId: 'res_elec_1',
    assignedTeamName: 'Electricity Quick Crew Alpha',
    location: report1042.location,
    affectedPeople: 45,
    evidence: [],
    createdAt: new Date(Date.now() - 3500000).toISOString()
  });

  const taskRoad = await Task.create({
    _id: 'task_1042_road',
    caseId: 'RG-1042',
    problemId: probRoad._id,
    title: 'Road Surface & Structural Damage',
    description: probRoad.description,
    category: 'Road Damage',
    departmentCode: 'PWD',
    departmentName: 'PWD / Road Department',
    requiredCapability: 'Road Surface & Structural Repair',
    priorityScore: 78,
    priorityLevel: 'HIGH',
    priorityReasons: probRoad.priorityReasons,
    prioritySummaryReason: 'Arterial surface breakdown & transit blockage',
    status: 'BLOCKED',
    assignedTeamId: 'res_pwd_1',
    assignedTeamName: 'PWD Team A (Heavy Asphalt Unit)', // Initially assigned to Team A which is BUSY
    blockedBy: {
      taskId: taskElec._id,
      departmentName: 'Electricity Department',
      reason: 'Live electrical wire safety isolation required before road excavation'
    },
    location: report1042.location,
    affectedPeople: 45,
    evidence: [],
    createdAt: new Date(Date.now() - 3500000).toISOString()
  });

  const taskDrain = await Task.create({
    _id: 'task_1042_drain',
    caseId: 'RG-1042',
    problemId: probDrain._id,
    title: 'Drainage Clog & Waterlogging',
    description: probDrain.description,
    category: 'Drainage Damage',
    departmentCode: 'DRAINAGE',
    departmentName: 'Drainage Department',
    requiredCapability: 'Stormwater & Drainage Clearance',
    priorityScore: 62,
    priorityLevel: 'MEDIUM',
    priorityReasons: probDrain.priorityReasons,
    prioritySummaryReason: 'Stormwater pooling & culvert blockage',
    status: 'BLOCKED',
    assignedTeamName: 'Drainage Stormwater Unit 1',
    blockedBy: {
      taskId: taskElec._id,
      departmentName: 'Electricity Department',
      reason: 'Power grid isolation needed before operating pumping equipment'
    },
    location: report1042.location,
    affectedPeople: 30,
    evidence: [],
    createdAt: new Date(Date.now() - 3500000).toISOString()
  });

  const taskTraffic = await Task.create({
    _id: 'task_1042_traffic',
    caseId: 'RG-1042',
    problemId: probTraffic._id,
    title: 'Vehicle Access & Route Obstruction',
    description: probTraffic.description,
    category: 'Vehicle Access Problem',
    departmentCode: 'TRAFFIC',
    departmentName: 'Traffic Department',
    requiredCapability: 'Traffic Diversion & Route Clearance',
    priorityScore: 75,
    priorityLevel: 'HIGH',
    priorityReasons: probTraffic.priorityReasons,
    prioritySummaryReason: 'Major thoroughfare blockage requiring diversion',
    status: 'BLOCKED',
    assignedTeamName: 'Traffic Mobile Interceptor 4',
    blockedBy: {
      taskId: taskRoad._id,
      departmentName: 'PWD / Road Department',
      reason: 'Road surface backfilling and structural repair must complete before resuming normal vehicle traffic'
    },
    location: report1042.location,
    affectedPeople: 80,
    evidence: [],
    createdAt: new Date(Date.now() - 3500000).toISOString()
  });

  // Dependencies
  await Dependency.insertMany([
    {
      caseId: 'RG-1042',
      blockingTaskId: taskElec._id,
      blockingTaskName: taskElec.title,
      blockingDept: taskElec.departmentName,
      dependentTaskId: taskRoad._id,
      dependentTaskName: taskRoad.title,
      dependentDept: taskRoad.departmentName,
      reason: 'Live electrical wire safety isolation required before road excavation'
    },
    {
      caseId: 'RG-1042',
      blockingTaskId: taskElec._id,
      blockingTaskName: taskElec.title,
      blockingDept: taskElec.departmentName,
      dependentTaskId: taskDrain._id,
      dependentTaskName: taskDrain.title,
      dependentDept: taskDrain.departmentName,
      reason: 'Power grid isolation needed before operating pumping equipment'
    },
    {
      caseId: 'RG-1042',
      blockingTaskId: taskRoad._id,
      blockingTaskName: taskRoad.title,
      blockingDept: taskRoad.departmentName,
      dependentTaskId: taskTraffic._id,
      dependentTaskName: taskTraffic.title,
      dependentDept: taskTraffic.departmentName,
      reason: 'Road surface backfilling and structural repair must complete before resuming normal vehicle traffic'
    }
  ]);

  // Master Case RG-1042
  await Case.create({
    _id: 'case_rg_1042',
    caseId: 'RG-1042',
    reportId: report1042._id,
    userId: 'user_cit_1',
    citizenName: 'Rohan Sharma (Citizen 1)',
    citizenPhone: '+91 98765 43210',
    location: report1042.location,
    description: report1042.description,
    mode: 'NORMAL',
    severity: 'CRITICAL',
    priorityLevel: 'CRITICAL',
    priorityScore: 92,
    problemCount: 4,
    departmentCount: 4,
    departments: ['ELECTRICITY', 'PWD', 'DRAINAGE', 'TRAFFIC'],
    status: 'ACTIVE',
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
    createdAt: new Date(Date.now() - 3500000).toISOString()
  });

  // Additional standalone cases for realistic department queues (#2 and #3)
  // Case RG-1051: HIGH Power Infrastructure Damage
  await Case.create({
    _id: 'case_rg_1051',
    caseId: 'RG-1051',
    userId: 'user_cit_2',
    citizenName: 'Ananya Verma (Citizen 2)',
    location: { address: 'North Ring Road Substation 8', lat: 12.9850, lng: 77.5810 },
    description: 'Substation transformer overheating and buzzing loudly, emitting burnt odor.',
    mode: 'NORMAL',
    severity: 'HIGH',
    priorityLevel: 'HIGH',
    priorityScore: 82,
    problemCount: 1,
    departmentCount: 1,
    departments: ['ELECTRICITY'],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  });

  await Task.create({
    _id: 'task_1051_elec',
    caseId: 'RG-1051',
    title: 'Power Infrastructure Damage',
    description: 'Substation transformer overheating with burnt dielectric oil odor.',
    category: 'Electrical Damage',
    departmentCode: 'ELECTRICITY',
    departmentName: 'Electricity Department',
    requiredCapability: 'Transformer Servicing',
    priorityScore: 82,
    priorityLevel: 'HIGH',
    priorityReasons: ['Equipment degradation risk', 'Potential feeder trip affecting 2,000 homes'],
    prioritySummaryReason: 'High-voltage transformer thermal anomaly',
    status: 'ASSIGNED',
    assignedTeamName: 'Electricity Heavy Line Unit 3',
    location: { address: 'North Ring Road Substation 8', lat: 12.9850, lng: 77.5810 },
    affectedPeople: 200,
    evidence: [],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  });

  // Case RG-1060: MEDIUM Streetlight Failure
  await Case.create({
    _id: 'case_rg_1060',
    caseId: 'RG-1060',
    userId: 'user_cit_3',
    citizenName: 'Vikram Patel (Citizen 3)',
    location: { address: '14th Avenue Residential Sector 2', lat: 12.9450, lng: 77.6200 },
    description: 'Entire row of 8 streetlights dark for the past two nights.',
    mode: 'NORMAL',
    severity: 'MEDIUM',
    priorityLevel: 'MEDIUM',
    priorityScore: 54,
    problemCount: 1,
    departmentCount: 1,
    departments: ['ELECTRICITY'],
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  });

  await Task.create({
    _id: 'task_1060_elec',
    caseId: 'RG-1060',
    title: 'Streetlight Failure',
    description: '8 consecutive municipal street lamps inoperative along pedestrian lane.',
    category: 'Electrical Damage',
    departmentCode: 'ELECTRICITY',
    departmentName: 'Electricity Department',
    requiredCapability: 'Electrical Hazard Isolation & Repair',
    priorityScore: 54,
    priorityLevel: 'MEDIUM',
    priorityReasons: ['Pedestrian visibility impairment', 'Standard municipal maintenance threshold'],
    prioritySummaryReason: 'Pedestrian corridor illumination failure',
    status: 'ASSIGNED',
    assignedTeamName: 'Electricity Quick Crew Alpha',
    location: { address: '14th Avenue Residential Sector 2', lat: 12.9450, lng: 77.6200 },
    affectedPeople: 60,
    evidence: [],
    createdAt: new Date(Date.now() - 14400000).toISOString()
  });

  // 6. DISASTER DEMO SCENARIO: Earthquake EQ-2026-001
  console.log('[SEED] Creating Disaster Mode Earthquake EQ-2026-001 demo scenario...');

  const disasterEvent = await DisasterEvent.create({
    _id: 'disaster_eq_2026_001',
    disasterCode: 'EQ-2026-001',
    title: 'Seismic Magnitude 6.4 Urban Center Earthquake',
    disasterType: 'Earthquake',
    epicenter: 'District Seismic Fault Line 3 (12 km depth)',
    affectedRadiusKm: 25,
    estimatedImpactPopulation: 150000,
    description: 'High-magnitude tremor causing structural collapse, trapped citizens, electrical line rupture, active ground-floor gas fire, and major road blockages across Central and South Zones.',
    active: false,
    activatedAt: null,
    activatedBy: 'Command Center Officer',
    linkedReportsCount: 47,
    emergencyStatus: 'LEVEL_1_MAXIMUM_RESPONSE',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  });

  // Disaster Case: RG-2001 (Multi-problem disaster scenario)
  const disasterCase = await Case.create({
    _id: 'case_rg_2001',
    caseId: 'RG-2001',
    userId: 'user_cit_2',
    citizenName: 'Ananya Verma (Citizen 2)',
    location: { address: 'Sector 4 Commercial Plaza, East District', lat: 12.9816, lng: 77.6046 },
    description: 'Severe earthquake collapse: building partially collapsed, people trapped under rubble, 5 injured people bleeding, small fire on ground floor, road blocked by debris, and live power line snapped on the ground.',
    mode: 'DISASTER',
    disasterEventId: disasterEvent._id,
    severity: 'CRITICAL',
    priorityLevel: 'CRITICAL',
    priorityScore: 98,
    problemCount: 6,
    departmentCount: 6,
    departments: ['SEARCH_RESCUE', 'MEDICAL', 'FIRE_RESCUE', 'PWD', 'ELECTRICITY', 'RELIEF'],
    status: 'ACTIVE',
    recoveryPhase: {
      active: true,
      status: 'EMERGENCY_RESPONSE',
      items: [
        { name: 'Structural Search & Life Safety Extrication', completed: false },
        { name: 'Emergency Trauma Transport & Medical Triage', completed: false },
        { name: 'Gas & Structural Fire Suppression', completed: false },
        { name: 'Arterial Emergency Corridor Debris Clearance', completed: false },
        { name: 'High-Voltage Grid Isolation', completed: true },
        { name: 'Temporary Relief Camp & Shelter Setup', completed: false }
      ]
    },
    createdAt: new Date(Date.now() - 1700000).toISOString()
  });

  // Disaster Problems & Tasks
  const dTasks = [
    {
      id: 'dtask_rescue',
      title: 'Trapped People in Collapsed Structure',
      category: 'Trapped People',
      deptCode: 'SEARCH_RESCUE',
      deptName: 'Search & Rescue',
      score: 98,
      level: 'CRITICAL',
      status: 'IN_PROGRESS',
      reason: 'Immediate life hazard: Civilians buried beneath structural rubble with compromised air pockets',
      team: 'Search & Rescue Squad Alpha'
    },
    {
      id: 'dtask_med',
      title: 'Severe Injuries & Trauma Casualties',
      category: 'Injuries & Medical Emergency',
      deptCode: 'MEDICAL',
      deptName: 'Medical Department',
      score: 95,
      level: 'CRITICAL',
      status: 'ASSIGNED',
      reason: 'Life-critical trauma triage and paramedic stabilization needed for 5 injured victims',
      team: 'Ambulance Unit B (ALS-02)'
    },
    {
      id: 'dtask_fire',
      title: 'Active Ground Floor Fire & Hazmat',
      category: 'Fire Hazard',
      deptCode: 'FIRE_RESCUE',
      deptName: 'Fire & Rescue',
      score: 92,
      level: 'CRITICAL',
      status: 'IN_PROGRESS',
      reason: 'Flames threatening adjacent structural columns and gas piping',
      team: 'Fire Engine 1 (Water Tender Heavy)'
    },
    {
      id: 'dtask_road',
      title: 'Blocked Emergency Access Road',
      category: 'Road Damage',
      deptCode: 'PWD',
      deptName: 'PWD / Road Department',
      score: 84,
      level: 'HIGH',
      status: 'ASSIGNED',
      reason: 'Fallen masonry and debris blocking ambulance route to Sector 4 plaza',
      team: 'PWD Team B (Emergency Road Clearance)'
    },
    {
      id: 'dtask_elec',
      title: 'Live High-Voltage Wire Snapped',
      category: 'Electrical Damage',
      deptCode: 'ELECTRICITY',
      deptName: 'Electricity Department',
      score: 82,
      level: 'HIGH',
      status: 'COMPLETED', // Already isolated
      reason: 'Electrocution hazard across emergency vehicle pathway',
      team: 'Electricity Quick Crew Alpha'
    },
    {
      id: 'dtask_shelter',
      title: 'Displaced Citizens & Shelter Management',
      category: 'Emergency Shelter Requirement',
      deptCode: 'RELIEF',
      deptName: 'Relief & Shelter',
      score: 68,
      level: 'MEDIUM',
      status: 'ASSIGNED',
      reason: '40+ residents evacuated from destabilized building require emergency shelter and rations',
      team: 'Relief & Shelter Unit 2'
    }
  ];

  for (const dt of dTasks) {
    await Problem.create({
      caseId: 'RG-2001',
      title: dt.title,
      description: dt.reason,
      category: dt.category,
      severity: dt.level,
      safetyRisk: 10,
      urgency: 10,
      affectedPeople: 50,
      departmentCode: dt.deptCode,
      departmentName: dt.deptName,
      priorityScore: dt.score,
      priorityLevel: dt.level,
      priorityReasons: [dt.reason],
      status: dt.status === 'COMPLETED' ? 'RESOLVED' : 'IDENTIFIED',
      createdAt: new Date(Date.now() - 1650000).toISOString()
    });

    await Task.create({
      _id: dt.id,
      caseId: 'RG-2001',
      title: dt.title,
      description: dt.reason,
      category: dt.category,
      departmentCode: dt.deptCode,
      departmentName: dt.deptName,
      requiredCapability: dt.category,
      priorityScore: dt.score,
      priorityLevel: dt.level,
      priorityReasons: [dt.reason],
      prioritySummaryReason: dt.reason,
      status: dt.status,
      assignedTeamName: dt.team,
      location: disasterCase.location,
      affectedPeople: 50,
      evidence: [],
      createdAt: new Date(Date.now() - 1650000).toISOString()
    });
  }

  // Audit Logs for initial seed
  await AuditLog.insertMany([
    {
      caseId: 'RG-1042',
      actorName: 'Rohan Sharma (Citizen 1)',
      actorRole: 'citizen',
      action: 'REPORT_CREATED',
      details: 'Report REP-1042 submitted: "There is a damaged electrical pole near my street..."',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      caseId: 'RG-1042',
      actorName: 'RESQ-GRID Triage AI Engine',
      actorRole: 'system',
      action: 'ANALYSIS_COMPLETED',
      details: 'Automated decomposition into 4 problems: Electrical, Road, Drainage, Vehicle Access.',
      timestamp: new Date(Date.now() - 3590000).toISOString()
    },
    {
      caseId: 'RG-1042',
      actorName: 'Responsibility Mapping Engine',
      actorRole: 'system',
      action: 'DEPARTMENTS_MAPPED',
      details: 'Mapped to Electricity Department, PWD / Road, Drainage Department, and Traffic Division.',
      timestamp: new Date(Date.now() - 3580000).toISOString()
    },
    {
      caseId: 'RG-1042',
      actorName: 'Dynamic Priority Engine',
      actorRole: 'system',
      action: 'PRIORITY_CALCULATED',
      details: 'Calculated priorities: Electricity (CRITICAL 92), Road (HIGH 78), Traffic (HIGH 75), Drainage (MEDIUM 62).',
      timestamp: new Date(Date.now() - 3570000).toISOString()
    },
    {
      caseId: 'RG-1042',
      actorName: 'Dependency Engine',
      actorRole: 'system',
      action: 'DEPENDENCIES_ESTABLISHED',
      details: 'Road repair blocked pending Electricity safety isolation. Traffic blocked pending Road surface repair.',
      timestamp: new Date(Date.now() - 3560000).toISOString()
    },
    {
      caseId: 'RG-2001',
      actorName: 'Command Center Officer',
      actorRole: 'command_center',
      action: 'DISASTER_MODE_ACTIVATED',
      details: 'Earthquake EQ-2026-001 declared active. Mass multi-agency coordination protocol initiated.',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  // Notifications
  await Notification.insertMany([
    {
      userId: 'user_cit_1',
      role: 'citizen',
      title: 'Report Received & Case Assigned',
      message: 'Your report RG-1042 has been received and 4 department units have been notified.',
      caseId: 'RG-1042',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 3500000).toISOString()
    },
    {
      departmentCode: 'ELECTRICITY',
      role: 'department',
      title: 'CRITICAL Priority Task: Case RG-1042',
      message: 'Electrical Hazard & Pole Damage at Main Commercial Road & 4th Cross. Immediate safety hazard.',
      caseId: 'RG-1042',
      taskId: 'task_1042_elec',
      type: 'urgent',
      read: false,
      createdAt: new Date(Date.now() - 3500000).toISOString()
    },
    {
      role: 'command_center',
      title: 'DISASTER MODE: EQ-2026-001 Active',
      message: '47 citizen reports linked to Earthquake epicenter. Life safety priorities deployed.',
      caseId: 'RG-2001',
      type: 'urgent',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  console.log('[SEED] Demo database seeded successfully with Master Case RG-1042 and Disaster EQ-2026-001!');
};

export default { seedDatabase };
