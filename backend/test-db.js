const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const requests = await prisma.visitRequest.findMany();
  console.log('--- USERS ---');
  console.log(users);
  console.log('--- REQUESTS ---');
  console.log(requests);
}

main().catch(console.error).finally(() => prisma.$disconnect());
