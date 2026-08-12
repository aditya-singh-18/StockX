function hasPermission(userPermissions, requiredPermission, mode = 'ALL') {
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (Array.isArray(requiredPermission)) {
    if (requiredPermission.length === 0) return true;
    if (mode === 'ANY') {
      return requiredPermission.some((p) => userPermissions.includes(p));
    }
    return requiredPermission.every((p) => userPermissions.includes(p));
  }
  return userPermissions.includes(requiredPermission);
}

const TEST_USERS = [
  { role: 'Admin', email: 'admin@test.com', password: 'Test@1234' },
  { role: 'Sales', email: 'sales@test.com', password: 'Test@1234' },
  { role: 'Warehouse', email: 'warehouse@test.com', password: 'Test@1234' },
  { role: 'Accounts', email: 'accounts@test.com', password: 'Test@1234' },
];

const NAV_MATRIX = [
  { name: 'Overview', requiredPermission: null },
  { name: 'Customers', requiredPermission: 'customer:read' },
  { name: 'Inventory', requiredPermission: 'product:read' },
  { name: 'Challans', requiredPermission: 'challan:read' },
  { name: 'Settings', requiredPermission: 'user:manage' },
];

async function runRBACTests() {
  console.log('===============================================================');
  console.log('       STOCKFLOW RBAC PERMISSION MATRIX VERIFICATION TEST      ');
  console.log('===============================================================\n');

  for (const account of TEST_USERS) {
    console.log(`[Testing Role: ${account.role}] Logging in as ${account.email}...`);

    const loginRes = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });

    if (!loginRes.ok) {
      console.error(`❌ Login failed for ${account.email}: ${loginRes.status}`);
      continue;
    }

    const { user } = await loginRes.json();
    const permissions = user.permissions || [];

    console.log(`  ✓ Authenticated as: ${user.name} (${user.role})`);
    console.log(`  ✓ Granted Permissions (${permissions.length}): [${permissions.join(', ')}]`);

    // Evaluate sidebar items using hasPermission()
    const visibleItems = [];
    const hiddenItems = [];

    for (const item of NAV_MATRIX) {
      const allowed = !item.requiredPermission || hasPermission(permissions, item.requiredPermission);
      if (allowed) {
        visibleItems.push(item.name);
      } else {
        hiddenItems.push(item.name);
      }
    }

    console.log(`  🟢 Visible Nav Items in Sidebar:  [ ${visibleItems.join(' | ')} ]`);
    if (hiddenItems.length > 0) {
      console.log(`  🔴 Hidden Nav Items (Gated Out):  [ ${hiddenItems.join(' | ')} ]`);
    } else {
      console.log(`  🟢 Hidden Nav Items (Gated Out):  [ None - All 5 Unlocked ]`);
    }
    console.log('---------------------------------------------------------------\n');
  }
}

runRBACTests();
