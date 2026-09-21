import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Daftar Pengguna:");
  console.table(users.map(u => ({ id: u.id, nama: u.nama, email: u.email, role: u.role })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
