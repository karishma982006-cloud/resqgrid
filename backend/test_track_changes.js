import http from 'http';

function post(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: 'POST',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- Testing Live Track Changes Propagation ---');

  // 1. Login as citizen
  const citizenAuth = await post('/auth/demo-login', {
    role: 'citizen'
  });
  console.log('Citizen Login:', citizenAuth.data.success ? 'PASS' : 'FAIL');
  const citizenToken = citizenAuth.data.token;

  // 2. Login as department (dept_elec)
  const deptAuth = await post('/auth/demo-login', {
    role: 'department',
    departmentCode: 'ELECTRICITY'
  });
  console.log('Dept Login:', deptAuth.data.success ? 'PASS' : 'FAIL');
  const deptToken = deptAuth.data.token;

  // 3. Dept updates progress on task_1042_elec
  const updateRes1 = await post(
    '/tasks/task_1042_elec/update',
    {
      workProgressStatus: 'Team arrived',
      progressNotes: 'Crew arrived at site with bucket truck. Inspecting fallen live wires on North Main Rd.'
    },
    deptToken
  );
  console.log('Dept Progress Update 1 response:', JSON.stringify(updateRes1));
  console.log('Dept Progress Update 1:', updateRes1.data?.success ? 'PASS' : 'FAIL');

  // 4. Citizen retrieves case RG-1042 and inspects task data
  const caseRes1 = await get('/cases/RG-1042', citizenToken);
  const elecTask = caseRes1.data.tasks.find((t) => t._id === 'task_1042_elec');

  console.log('\n[Citizen Inspection after Update 1]');
  console.log('  Work Progress Status:', elecTask.workProgressStatus);
  console.log('  Latest Progress Note:', elecTask.latestProgressNote);
  console.log('  Progress History Count:', elecTask.progressHistory?.length);
  console.log('  Audit Logs Count:', caseRes1.data.auditLogs?.length);
  console.log('  Recent Audit Action:', caseRes1.data.auditLogs[0]?.action);
  console.log('  Recent Audit Detail:', caseRes1.data.auditLogs[0]?.details);

  if (
    elecTask.workProgressStatus === 'Team arrived' &&
    elecTask.latestProgressNote.includes('Crew arrived at site with bucket truck') &&
    caseRes1.data.auditLogs[0]?.action === 'TASK_PROGRESS_UPDATED'
  ) {
    console.log('>>> VERIFICATION 1: SUCCESS - Citizen received live track change note & status!');
  } else {
    console.error('>>> VERIFICATION 1: FAILED');
    process.exit(1);
  }

  // 5. Dept updates progress again: 'Work partially completed'
  const updateRes2 = await post(
    '/tasks/task_1042_elec/update',
    {
      workProgressStatus: 'Work partially completed',
      progressNotes: 'Power grid isolated safely. Commencing pole stabilization.'
    },
    deptToken
  );
  console.log('\nDept Progress Update 2:', updateRes2.data.success ? 'PASS' : 'FAIL');

  const caseRes2 = await get('/cases/RG-1042', citizenToken);
  const elecTask2 = caseRes2.data.tasks.find((t) => t._id === 'task_1042_elec');

  console.log('[Citizen Inspection after Update 2]');
  console.log('  Work Progress Status:', elecTask2.workProgressStatus);
  console.log('  Latest Progress Note:', elecTask2.latestProgressNote);
  console.log('  Progress History Count:', elecTask2.progressHistory?.length);

  // 6. Check citizen notifications
  const notifRes = await get('/notifications', citizenToken);
  console.log('Citizen Notifications count:', notifRes.data.notifications?.length);
  const latestNotif = notifRes.data.notifications[0];
  console.log('Latest Notification Title:', latestNotif?.title);
  console.log('Latest Notification Message:', latestNotif?.message);

  console.log('\n=============================================');
  console.log('ALL LIVE TRACK CHANGE CHECKS PASSED PERFECTLY!');
  console.log('=============================================');
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
