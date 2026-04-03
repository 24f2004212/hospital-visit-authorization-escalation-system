const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Wardens & Guards
  const warden = await prisma.user.create({
    data: { email: 'warden@hostel.edu', password: 'password123', name: 'Dr. Mehra', role: 'WARDEN' }
  });
  const guard = await prisma.user.create({
    data: { email: 'guard1@hostel.edu', password: 'password123', name: 'Rajesh Kumar', role: 'GUARD' }
  });

  // Create Students
  const student1 = await prisma.user.create({
    data: { email: 'ananya@hostel.edu', password: 'password', name: 'Ananya Verma', role: 'STUDENT', roomNumber: '102' }
  });
  
  // Create Requests
  await prisma.visitRequest.create({
    data: {
      studentId: student1.id, wardenId: warden.id, guardId: guard.id,
      reason: 'Fever / Cold / Flu', urgency: 'NORMAL', status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000)
    }
  });

  await prisma.visitRequest.create({
    data: {
      studentId: student1.id,
      reason: 'Dental Issue', urgency: 'NORMAL', status: 'PENDING',
      createdAt: new Date()
    }
  });

  console.log('Database seeded with test records!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
