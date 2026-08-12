async function test() {
  console.log('=== Step 1: Login via Next.js Route Handler ===');
  const loginRes = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'Test@1234' })
  });
  console.log('Login Status:', loginRes.status);
  const cookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('Cookies string length:', cookieHeader.length);

  console.log('\n=== Step 2: Request /dashboard Server Component ===');
  const dashRes = await fetch('http://localhost:3000/dashboard', {
    headers: { 'Cookie': cookieHeader }
  });
  console.log('Dashboard HTTP Status:', dashRes.status);
  const html = await dashRes.text();

  console.log('\n=== Step 3: Inspect Rendered HTML ===');
  console.log('Has Customer count 4:', html.includes('4</div>'));
  console.log('Has Product count 8:', html.includes('8</div>'));
  console.log('Has Low-Stock count 2:', html.includes('2</div>'));
  console.log('Has Challan count 5:', html.includes('5</div>'));
  console.log('Has Real Challan CH-2026-00005:', html.includes('CH-2026-00005'));
  console.log('Has Real Challan CH-2026-00004:', html.includes('CH-2026-00004'));
  console.log('Has Real Challan CH-2026-00003:', html.includes('CH-2026-00003'));
  console.log('Has Orange Left Accent:', html.includes('border-l-4 border-l-brand-500'));
  console.log('Has Orange Table Header:', html.includes('border-brand-500/30'));
}

test();
