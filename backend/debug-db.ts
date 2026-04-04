import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      isApproved: true,
      name: true
    }
  });
  console.log('Database Users:');
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main();
