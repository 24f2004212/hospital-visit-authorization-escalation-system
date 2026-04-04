const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!student) {
      console.log('No student found to test with');
      return;
    }
    console.log('Testing create for student:', student.id);
    const res = await prisma.visitRequest.create({
      data: {
        studentId: student.id,
        reason: 'Test Reason',
        description: 'Test Description',
        urgency: 'NORMAL',
        preferredDate: '2026-04-05',
        preferredTime: '10:00',
        hospitalName: 'Test Hospital',
        proctorEmail: 'proctor@test.com',
        parentEmail: 'parent@test.com',
        parentPhone: '1234567890'
      }
    });
    console.log('Success:', res.id);
  } catch (err) {
    console.error('PRISMA ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
