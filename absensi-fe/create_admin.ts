import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "admin@jetson.ai";
  const password = "admin";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "admin",
      password: hashedPassword
    },
    create: {
      nama: "Administrator",
      email: email,
      password: hashedPassword,
      role: "admin"
    }
  });

  console.log(`Berhasil membuat/memperbarui Admin!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
