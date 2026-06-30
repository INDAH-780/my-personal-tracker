import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("mytracker123@", 12);
  const user = await prisma.user.upsert({
    where: { email: "mbahindah780@gmail.com" },
    update: {},
    create: {
      email: "mbahindah780@gmail.com",
      name: "Mbah Indah",
      hashedPassword: password,
    },
  });
  console.log("Created user:", user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
