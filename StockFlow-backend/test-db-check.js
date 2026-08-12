const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  console.log('--- Checking DB Models & Values ---');
  const movements = await prisma.stockMovement.findMany({ include: { product: true } });
  console.log('Stock Movements Count:', movements.length);
  movements.forEach((m) => {
    console.log(`  Product: ${m.product.name} | Source: ${m.source} | BalanceAfter: ${m.balanceAfter} | Note: ${m.note}`);
  });

  const challan = await prisma.challan.findFirst({ include: { items: true } });
  console.log(`\nChallan: ${challan.challanNo} | TotalQty: ${challan.totalQty} | TotalAmount: ${challan.totalAmount.toString()}`);

  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(`\nUsers Count: ${users.length}`);
  users.forEach((u) => console.log(`  User: ${u.email} | Role: ${u.role.name}`));
}

checkDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
