import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Predefined Admin User ──────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'botanicalbinary@gmail.com' },
    update: {
      password: adminPassword,
      isApproved: true,
    },
    create: {
      email: 'botanicalbinary@gmail.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      phoneNumber: '+91 9000000000',
      isApproved: true,
    },
  });
  console.log(`✅ Admin seeded: ${admin.email} (id: ${admin.id})`);

  // ── 2. Test Admin User ────────────────────────────────────
  const testAdminPassword = await bcrypt.hash('admin123', 10);
  const testAdmin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: testAdminPassword },
    create: {
      email: 'admin@test.com',
      password: testAdminPassword,
      name: 'Test Admin',
      role: 'ADMIN',
      isApproved: true,
    },
  });
  console.log(`✅ Test Admin seeded: ${testAdmin.email} (id: ${testAdmin.id})`);

  // ── 3. Dummy Guard Users ──────────────────────────────────
  const guardPassword = await bcrypt.hash('Guard@123', 10);
  const guards = [
    { name: 'Rajesh Kumar',  email: 'guard1@caresync.edu', phone: '+91 9876543001' },
    { name: 'Suresh Babu',   email: 'guard2@caresync.edu', phone: '+91 9876543002' },
    { name: 'Anil Sharma',   email: 'guard3@caresync.edu', phone: '+91 9876543003' },
    { name: 'Karthik Nair',  email: 'guard4@caresync.edu', phone: '+91 9876543004' },
    { name: 'Manoj Patel',   email: 'guard5@caresync.edu', phone: '+91 9876543005' },
  ];

  for (const g of guards) {
    const guard = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        password: guardPassword,
        name: g.name,
        role: 'GUARD',
        phoneNumber: g.phone,
        isApproved: true,
      },
    });
    console.log(`✅ Guard seeded: ${guard.name} (${guard.email})`);
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
