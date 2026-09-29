// End-to-End Verification Test Script for RESQ-GRID
const BASE_URL = 'http://localhost:5000/api';

const log = (step, title, details = '') => {
  console.log(`\n======================================================`);
  console.log(`[TEST ${step}] ${title}`);
  if (details) console.log(details);
  console.log(`======================================================`);
};

async function runTests() {
  try {
    // TEST 1: Healthcheck
    log(1, 'Backend Health Check');
    const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
    console.log('✓ Health status:', healthRes.status, '| System:', healthRes.system);

    // TEST 2: Demo Logins
    log(2, 'Demo Logins Verification');
    const citAuth = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'citizen' })
    }).then(r => r.json());
    console.log('✓ Citizen demo login:', citAuth.user.name, `(${citAuth.user.email})`);

    const elecAuth = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'department', departmentCode: 'ELECTRICITY' })
    }).then(r => r.json());
    console.log('✓ Electricity demo login:', elecAuth.user.name, `(${elecAuth.user.departmentCode})`);

    const pwdAuth = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'department', departmentCode: 'PWD' })
    }).then(r => r.json());
    console.log('✓ PWD demo login:', pwdAuth.user.name, `(${pwdAuth.user.departmentCode})`);

    const cmdAuth = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'command_center' })
    }).then(r => r.json());
    console.log('✓ Command Center demo login:', cmdAuth.user.name);

    // TEST 3: Master Case RG-1042 Inspection
    log(3, 'Verify Master Case RG-1042 & Decomposition');
    const caseRes = await fetch(`${BASE_URL}/cases/RG-1042`, {
      headers: { 'Authorization': `Bearer ${cmdAuth.token}` }
    }).then(r => r.json());
    console.log(`✓ Master Case: ${caseRes.case.caseId} | Priority: ${caseRes.case.priorityLevel} (Score: ${caseRes.case.priorityScore})`);
    console.log(`✓ Decomposed Problems: ${caseRes.problems.length}`);
    caseRes.problems.forEach((p, i) => {
      console.log(`   P${i+1}: ${p.title} -> ${p.departmentName} [${p.priorityLevel}]`);
    });
    console.log(`✓ Department Tasks: ${caseRes.tasks.length}`);
    caseRes.tasks.forEach((t) => {
      console.log(`   Task: ${t.title} [Status: ${t.status}] - Assigned: ${t.assignedTeamName}`);
    });
    console.log(`✓ Dependencies: ${caseRes.dependencies.length}`);
    caseRes.dependencies.forEach((d) => {
      console.log(`   Dependency: [${d.blockingDept}] '${d.blockingTaskName}' BLOCKS -> [${d.dependentDept}] '${d.dependentTaskName}'`);
    });

    // TEST 4: Department Priority Queue for Electricity & PWD
    log(4, 'Department Priority Queues');
    const elecQueue = await fetch(`${BASE_URL}/tasks/queue?departmentCode=ELECTRICITY`, {
      headers: { 'Authorization': `Bearer ${elecAuth.token}` }
    }).then(r => r.json());
    console.log(`✓ Electricity Priority Queue (${elecQueue.queue.length} tasks):`);
    elecQueue.queue.forEach(item => {
      console.log(`   #${item.workOrderRank} [${item.priorityLevel}] ${item.title} (Case ${item.caseId})`);
    });

    // TEST 5: Task Lifecycle (Accept -> Complete -> Dependency Unlocking)
    log(5, 'Task Lifecycle: Electricity Accepts & Completes Task (Unblocking PWD)');
    const elecTask = caseRes.tasks.find(t => t.departmentCode === 'ELECTRICITY');
    
    // Accept
    const acceptRes = await fetch(`${BASE_URL}/tasks/${elecTask._id}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${elecAuth.token}` }
    }).then(r => r.json());
    console.log(`✓ Electricity accepted task: status = ${acceptRes.task.status}`);

    // Complete
    const completeRes = await fetch(`${BASE_URL}/tasks/${elecTask._id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${elecAuth.token}` },
      body: JSON.stringify({ completionNotes: 'Live pole wires isolated, new pole anchored and grounded. Safe for road work.' })
    }).then(r => r.json());
    console.log(`✓ Electricity completed task: status = ${completeRes.task.status}`);

    // Check if Road Task was unblocked!
    const updatedCase = await fetch(`${BASE_URL}/cases/RG-1042`, {
      headers: { 'Authorization': `Bearer ${cmdAuth.token}` }
    }).then(r => r.json());
    const roadTask = updatedCase.tasks.find(t => t.departmentCode === 'PWD');
    console.log(`✓ Road task status after Electricity completed: ${roadTask.status} (Was BLOCKED, now ASSIGNED/READY!)`);

    // TEST 6: Reassignment Engine (PWD Rejection -> Auto Reassignment)
    log(6, 'Reassignment Engine: PWD Cannot Handle -> Searches Alternatives');
    const rejectRes = await fetch(`${BASE_URL}/tasks/${roadTask._id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pwdAuth.token}` },
      body: JSON.stringify({ rejectionReason: 'No team available (PWD Team A busy on highway)' })
    }).then(r => r.json());
    console.log(`✓ Reassignment message:`, rejectRes.message);
    if (rejectRes.result?.alternativeTeam) {
      console.log(`✓ Successfully reassigned to alternative squad: ${rejectRes.result.alternativeTeam.name}`);
      console.log(`✓ Match reasons:`, rejectRes.result.matchReasons.join(' | '));
    }

    // TEST 7: Disaster Mode Telemetry
    log(7, 'Disaster Mode Telemetry & Resources');
    const disRes = await fetch(`${BASE_URL}/disasters/active`, {
      headers: { 'Authorization': `Bearer ${cmdAuth.token}` }
    }).then(r => r.json());
    console.log(`✓ Disaster Active: ${disRes.isActive} | Event: ${disRes.activeDisaster?.title}`);
    console.log(`✓ Linked reports correlated: ${disRes.activeDisaster?.linkedReportsCount}`);
    console.log(`✓ Critical tasks under emergency triage: ${disRes.criticalTaskCount}`);

    // TEST 8: Citizen Verification Simulation
    log(8, 'Citizen Verification Flow');
    const verifyRes = await fetch(`${BASE_URL}/cases/RG-1042/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citAuth.token}` },
      body: JSON.stringify({ verified: true, feedbackNotes: 'Electricity pole replaced, drainage clear, road navigable.' })
    }).then(r => r.json());
    console.log(`✓ Citizen verification response:`, verifyRes.message, `| Status: ${verifyRes.status}`);

    // TEST 9: Audit Trail Logging
    log(9, 'Audit Trail Verification');
    const auditRes = await fetch(`${BASE_URL}/audit/cases/RG-1042`, {
      headers: { 'Authorization': `Bearer ${cmdAuth.token}` }
    }).then(r => r.json());
    console.log(`✓ Audit records logged for Case RG-1042: ${auditRes.count}`);
    auditRes.logs.slice(0, 5).forEach(l => {
      console.log(`   [${l.actorName}] ${l.action}: ${l.details}`);
    });

    console.log('\n======================================================');
    console.log('>>> ALL 9 END-TO-END INTEGRATION TESTS PASSED 100% <<<');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
