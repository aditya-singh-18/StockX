import { PrismaClient, CustomerType, CustomerStatus, StockMovementType, MovementSource, ChallanStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for StockFlow...');

  // 1. Clean existing data (in correct order of foreign key dependencies)
  console.log('🧹 Cleaning up old records...');
  await prisma.refreshToken.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // 2. Create Permissions
  console.log('🔑 Creating Permissions...');
  const permissionsList = [
    { key: 'customer:create', description: 'Create new customers' },
    { key: 'customer:read', description: 'View customers and customer details' },
    { key: 'customer:update', description: 'Update customer details' },
    { key: 'product:create', description: 'Create new products' },
    { key: 'product:read', description: 'View product catalog and stock levels' },
    { key: 'product:update', description: 'Update product information' },
    { key: 'product:stock-adjust', description: 'Perform manual stock adjustments IN/OUT' },
    { key: 'challan:create', description: 'Create sales challans' },
    { key: 'challan:read', description: 'View sales challans and challan details' },
    { key: 'challan:confirm', description: 'Confirm sales challans and deduct stock atomically' },
    { key: 'challan:cancel', description: 'Cancel draft or active sales challans' },
    { key: 'user:manage', description: 'Manage users and role assignments' },
  ];

  const createdPermissions = new Map<string, string>();
  for (const perm of permissionsList) {
    const p = await prisma.permission.create({
      data: perm,
    });
    createdPermissions.set(p.key, p.id);
  }

  // 3. Create 4 Roles
  console.log('👥 Creating Roles...');
  const adminRole = await prisma.role.create({
    data: { name: 'Admin', description: 'Full system administrator with all permissions' },
  });

  const salesRole = await prisma.role.create({
    data: { name: 'Sales', description: 'Sales executive managing CRM and Challans' },
  });

  const warehouseRole = await prisma.role.create({
    data: { name: 'Warehouse', description: 'Warehouse operator managing inventory and stock movements' },
  });

  const accountsRole = await prisma.role.create({
    data: { name: 'Accounts', description: 'Accounts executive viewing reports and challans' },
  });

  // 4. Assign Permissions to Roles (Capability Matrix)
  console.log('🔗 Assigning Role Permissions...');
  const rolePermissionsMap: Record<string, string[]> = {
    Admin: Array.from(createdPermissions.keys()), // All permissions
    Sales: [
      'customer:create',
      'customer:read',
      'customer:update',
      'product:read',
      'challan:create',
      'challan:read',
      'challan:confirm',
      'challan:cancel',
    ],
    Warehouse: [
      'product:read',
      'product:update',
      'product:stock-adjust',
      'challan:read',
    ],
    Accounts: [
      'customer:read',
      'product:read',
      'challan:read',
    ],
  };

  const rolesObj: Record<string, typeof adminRole> = {
    Admin: adminRole,
    Sales: salesRole,
    Warehouse: warehouseRole,
    Accounts: accountsRole,
  };

  for (const [roleName, permKeys] of Object.entries(rolePermissionsMap)) {
    const role = rolesObj[roleName];
    for (const key of permKeys) {
      const permId = createdPermissions.get(key);
      if (permId) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }
  }

  // 5. Create Test Users (Password: Test@1234 with 10 salt rounds)
  console.log('👤 Creating Test Users...');
  const hashedPassword = await bcrypt.hash('Test@1234', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Aditya Admin',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales',
      email: 'sales@test.com',
      passwordHash: hashedPassword,
      roleId: salesRole.id,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warren Warehouse',
      email: 'warehouse@test.com',
      passwordHash: hashedPassword,
      roleId: warehouseRole.id,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Alex Accounts',
      email: 'accounts@test.com',
      passwordHash: hashedPassword,
      roleId: accountsRole.id,
    },
  });

  // 6. Create Demo Customers
  console.log('🏢 Creating Demo Customers...');
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      mobile: '+91 9876543210',
      email: 'rajesh@sharmatraders.in',
      businessName: 'Sharma Traders Pvt Ltd',
      gstNumber: '27AABCS1429B1Z0',
      type: CustomerType.WHOLESALE,
      address: '102 Industrial Area, Phase 2, Pune, MH',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Amit Patel',
      mobile: '+91 9123456789',
      email: 'amit@pateldistro.com',
      businessName: 'Patel Distribution Hub',
      gstNumber: '24AAACP9012K1Z5',
      type: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, GIDC Estate, Ahmedabad, GJ',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      mobile: '+91 9988776655',
      email: 'vikram@mehtaretail.com',
      businessName: 'Mehta Electronics & Supplies',
      gstNumber: '07AAAFM1234C1ZU',
      type: CustomerType.RETAIL,
      address: 'Shop 12, Main Market, Lajpat Nagar, New Delhi',
      status: CustomerStatus.ACTIVE,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Suresh Verma',
      mobile: '+91 9822001122',
      email: 'suresh.verma@example.com',
      businessName: 'Verma Enterprises',
      type: CustomerType.WHOLESALE,
      address: 'Sector 18, Noida, UP',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Add Customer Follow-up Notes
  console.log('📝 Creating Demo Follow-up Notes...');
  await prisma.customerNote.create({
    data: {
      note: 'Discussed bulk discount for next quarter. Interested in 500 units of Industrial Power Supply.',
      customerId: customer1.id,
      createdById: salesUser.id,
    },
  });

  await prisma.customerNote.create({
    data: {
      note: 'Initial inquiry received via trade exhibition. Follow-up scheduled for catalog demonstration.',
      customerId: customer4.id,
      createdById: salesUser.id,
    },
  });

  // 8. Create Demo Products & Initial Stock Movements
  console.log('📦 Creating Demo Products & Stock...');
  const productsData = [
    {
      name: 'Industrial SMPS 24V 10A',
      sku: 'PWR-24V-10A',
      category: 'Power Electronics',
      unitPrice: 2450.0,
      currentStock: 150,
      minStock: 20,
      location: 'Rack A-12, Pune Central Warehouse',
    },
    {
      name: 'Digital Multimeter Pro 6000',
      sku: 'TOOL-DMM-6000',
      category: 'Test & Measurement',
      unitPrice: 1200.0,
      currentStock: 80,
      minStock: 15,
      location: 'Rack B-04, Pune Central Warehouse',
    },
    {
      name: 'Cat6 Shielded Ethernet Cable 305m',
      sku: 'NET-CAT6-305M',
      category: 'Networking',
      unitPrice: 6500.0,
      currentStock: 45,
      minStock: 10,
      location: 'Aisle 3, Bulk Storage Bay',
    },
    {
      name: 'Heavy Duty Relay Module 8CH',
      sku: 'REL-8CH-10A',
      category: 'Automation',
      unitPrice: 480.0,
      currentStock: 300,
      minStock: 50,
      location: 'Bin C-18, Component Shelf',
    },
    {
      name: 'Industrial Ethernet Switch 8-Port PoE',
      sku: 'NET-SW-8POE',
      category: 'Networking',
      unitPrice: 8900.0,
      currentStock: 5, // Low stock for alert demonstration!
      minStock: 15,
      location: 'High-Value Locker 1',
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: p,
    });
    createdProducts.push(product);

    // Initial stock movement log entry (Audit Trail) with new source and balanceAfter
    await prisma.stockMovement.create({
      data: {
        quantity: p.currentStock,
        type: StockMovementType.IN,
        source: MovementSource.PURCHASE_RECEIVED,
        note: 'Initial inward inventory stock',
        balanceAfter: p.currentStock,
        productId: product.id,
        createdById: warehouseUser.id,
      },
    });
  }

  // 9. Create Sample Draft Challan with totalAmount
  console.log('📋 Creating Demo Draft Challan...');
  const challanNo = 'CH-2026-00001';
  const totalAmount = 15 * 2450.0 + 10 * 1200.0; // 36750 + 12000 = 48750.00
  const challan = await prisma.challan.create({
    data: {
      challanNo,
      status: ChallanStatus.DRAFT,
      totalQty: 25,
      totalAmount: totalAmount,
      customerId: customer1.id,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productNameSnapshot: createdProducts[0].name,
            unitPriceSnapshot: createdProducts[0].unitPrice,
            quantity: 15,
          },
          {
            productId: createdProducts[1].id,
            productNameSnapshot: createdProducts[1].name,
            unitPriceSnapshot: createdProducts[1].unitPrice,
            quantity: 10,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Credentials Summary:');
  console.log('  👑 Admin:     admin@test.com     | Test@1234 (All permissions)');
  console.log('  💼 Sales:     sales@test.com     | Test@1234 (CRM & Challans)');
  console.log('  🏭 Warehouse: warehouse@test.com | Test@1234 (Products & Stock)');
  console.log('  📊 Accounts:  accounts@test.com  | Test@1234 (Read-only reports)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
