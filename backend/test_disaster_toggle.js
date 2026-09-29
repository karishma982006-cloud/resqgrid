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
  console.log('--- Testing Disaster Mode Dynamic Toggle & Department Alerts ---');

  // 1. Logins
  const cmdLogin = await post('/auth/demo-login', { role: 'command_center' });
  const pwdLogin = await post('/auth/demo-login', { role: 'department', departmentCode: 'PWD' });
  const cmdToken = cmdLogin.data.token;
  const pwdToken = pwdLogin.data.token;

  // 2. Initial state: Disaster Mode should be INACTIVE
  const initialStatus = await get('/disasters/active', pwdToken);
  console.log('Initial Disaster Mode Active:', initialStatus.data.isActive);
  if (initialStatus.data.isActive !== false) {
    throw new Error('Expected initial state to be false (Normal Mode)!');
  }

  // 3. Admin / Command Center ACTIVATES Disaster Mode
  console.log('\n[Action] Command Center activates Disaster Mode...');
  const activateRes = await post(
    '/disasters/activate',
    {
      title: 'Seismic Magnitude 6.4 Urban Center Earthquake',
      disasterType: 'Earthquake'
    },
    cmdToken
  );
  console.log('Activation response:', activateRes.data.message);

  // 4. Department checks disaster status and notifications
  const activeStatus = await get('/disasters/active', pwdToken);
  console.log('Disaster Mode Active on Department:', activeStatus.data.isActive);
  console.log('Active Disaster Code:', activeStatus.data.activeDisaster?.disasterCode);

  const pwdNotifs1 = await get('/notifications', pwdToken);
  const latestNotif1 = pwdNotifs1.data.notifications[0];
  console.log('PWD Alert Received:', latestNotif1?.title);
  console.log('PWD Alert Message:', latestNotif1?.message);

  if (!activeStatus.data.isActive || !latestNotif1.title.includes('Disaster Mode Activated')) {
    throw new Error('Department failed to receive Disaster Activation!');
  }

  // 5. Admin / Command Center DEACTIVATES Disaster Mode
  console.log('\n[Action] Command Center deactivates Disaster Mode...');
  const deactivateRes = await post('/disasters/deactivate', {}, cmdToken);
  console.log('Deactivation response:', deactivateRes.data.message);

  // 6. Department checks disaster status again
  const finalStatus = await get('/disasters/active', pwdToken);
  console.log('Disaster Mode Active after deactivation:', finalStatus.data.isActive);

  const pwdNotifs2 = await get('/notifications', pwdToken);
  const latestNotif2 = pwdNotifs2.data.notifications[0];
  console.log('PWD Deactivation Notice Received:', latestNotif2?.title);

  if (finalStatus.data.isActive !== false || !latestNotif2.title.includes('Normal Operations Resumed')) {
    throw new Error('Department failed to return to Normal Mode!');
  }

  console.log('\n======================================================');
  console.log('SUCCESS: Disaster mode toggling & department alerts work perfectly!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
