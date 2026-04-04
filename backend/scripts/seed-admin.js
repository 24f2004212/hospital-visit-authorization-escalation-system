const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'gharishankarvel@gmail.com';
  const password = '240806';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Super Admin',
      },
    });
    console.log('Root admin created:', admin.email);
  } catch (err) {
    if (err.code === 'P2002') {
       console.log('Admin already exists, updating...');
       await prisma.user.update({
         where: { email },
         data: { password: hashedPassword, role: 'ADMIN' }
       });
       console.log('Admin updated.');
    } else {
       console.error('ERROR during seed:', err);
       process.exit(1);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
