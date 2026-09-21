import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  let count = 0;

  for (const user of users) {
    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    if (!user.password.startsWith('$2')) {
      console.log(`Hashing password for user: ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      count++;
    }
  }

  console.log(`Successfully hashed ${count} plain-text passwords.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
