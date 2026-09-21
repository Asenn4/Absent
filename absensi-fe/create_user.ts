import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "user@jetson.ai";
  const password = "user";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "user",
      password: hashedPassword
    },
    create: {
      nama: "Tester Biasa",
      email: email,
      password: hashedPassword,
      role: "user"
    }
  });

  console.log(`Berhasil membuat/memperbarui Tester Biasa!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
