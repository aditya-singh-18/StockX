const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {});
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'GET',
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function runAuthTests() {
  console.log('🚀 Bootstrapping NestJS App in-process for verification...');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  await app.listen(3002);
  const baseUrl = 'http://localhost:3002';
  console.log(' NestJS App listening on ' + baseUrl);

  try {
    // 1. Test Login
    console.log('\n--- 1. Testing POST /auth/login ---');
    const loginRes = await post(`${baseUrl}/auth/login`, {
      email: 'admin@test.com',
      password: 'Test@1234',
    });
    console.log('Status:', loginRes.status);
    console.log('Has Access Token:', !!loginRes.data.accessToken);
    console.log('Has Refresh Token:', !!loginRes.data.refreshToken);
    console.log('User Name:', loginRes.data.user?.name, '| Role:', loginRes.data.user?.role);
    console.log('Permissions Count:', loginRes.data.user?.permissions?.length);

    if (loginRes.status !== 200 || !loginRes.data.accessToken || !loginRes.data.refreshToken) {
      throw new Error('Login failed or missing tokens');
    }

    const initialAccessToken = loginRes.data.accessToken;
    const initialRefreshToken = loginRes.data.refreshToken;

    // 2. Test GET /auth/me
    console.log('\n--- 2. Testing GET /auth/me with Access Token ---');
    const meRes = await get(`${baseUrl}/auth/me`, initialAccessToken);
    console.log('Status:', meRes.status);
    console.log('Me Email:', meRes.data?.email, '| Permissions:', meRes.data?.permissions?.length);
    if (meRes.status !== 200) throw new Error('GET /auth/me failed');

    // 3. Test Refresh Token with Rotation
    console.log('\n--- 3. Testing POST /auth/refresh (Token Rotation) ---');
    const refreshRes = await post(`${baseUrl}/auth/refresh`, {
      refreshToken: initialRefreshToken,
    });
    console.log('Status:', refreshRes.status);
    console.log('New Access Token Issued:', !!refreshRes.data.accessToken);
    console.log('New Refresh Token Rotated:', !!refreshRes.data.refreshToken);
    if (refreshRes.status !== 200 || !refreshRes.data.accessToken || !refreshRes.data.refreshToken) {
      throw new Error('Refresh failed');
    }

    const rotatedAccessToken = refreshRes.data.accessToken;
    const rotatedRefreshToken = refreshRes.data.refreshToken;

    // 4. Test Replay of Old Revoked Refresh Token (Should Fail with 401)
    console.log('\n--- 4. Testing Replay of Old Revoked Refresh Token (Expect 401) ---');
    const replayRes = await post(`${baseUrl}/auth/refresh`, {
      refreshToken: initialRefreshToken,
    });
    console.log('Status:', replayRes.status, '| Message:', replayRes.data?.message);
    if (replayRes.status !== 401) {
      throw new Error('Expected 401 on revoked token re-use');
    }

    // 5. Test Single Session Logout
    console.log('\n--- 5. Testing POST /auth/logout (Single Session Revocation) ---');
    const logoutRes = await post(
      `${baseUrl}/auth/logout`,
      { refreshToken: rotatedRefreshToken },
      rotatedAccessToken,
    );
    console.log('Status:', logoutRes.status);
    if (logoutRes.status !== 204) throw new Error('Expected 204 on logout');

    // 6. Test Refreshing with the Logged-out Token (Should Fail with 401)
    console.log('\n--- 6. Testing Refresh after Logout (Expect 401) ---');
    const postLogoutRefresh = await post(`${baseUrl}/auth/refresh`, {
      refreshToken: rotatedRefreshToken,
    });
    console.log('Status:', postLogoutRefresh.status, '| Message:', postLogoutRefresh.data?.message);
    if (postLogoutRefresh.status !== 401) {
      throw new Error('Expected 401 on logged out token');
    }

    // 7. Test Logout All Devices
    console.log('\n--- 7. Testing POST /auth/logout-all (Revoke All User Sessions) ---');
    // Log in twice to create two concurrent sessions
    const session1 = await post(`${baseUrl}/auth/login`, {
      email: 'sales@test.com',
      password: 'Test@1234',
    });
    const session2 = await post(`${baseUrl}/auth/login`, {
      email: 'sales@test.com',
      password: 'Test@1234',
    });

    console.log('Created Session 1 Refresh Token:', session1.data.refreshToken?.substring(0, 10) + '...');
    console.log('Created Session 2 Refresh Token:', session2.data.refreshToken?.substring(0, 10) + '...');

    // Call logout-all using session1's access token
    const logoutAllRes = await post(`${baseUrl}/auth/logout-all`, {}, session1.data.accessToken);
    console.log('Logout-all Status:', logoutAllRes.status);

    // Verify both session tokens are now rejected
    const testSession1 = await post(`${baseUrl}/auth/refresh`, {
      refreshToken: session1.data.refreshToken,
    });
    const testSession2 = await post(`${baseUrl}/auth/refresh`, {
      refreshToken: session2.data.refreshToken,
    });
    console.log('Session 1 Refresh after logout-all Status:', testSession1.status);
    console.log('Session 2 Refresh after logout-all Status:', testSession2.status);

    if (testSession1.status !== 401 || testSession2.status !== 401) {
      throw new Error('Logout all failed to revoke all tokens');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL AUTH & REFRESH TOKEN VERIFICATION TESTS PASSED!');
    console.log('======================================================');
  } finally {
    await app.close();
  }
}

runAuthTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
