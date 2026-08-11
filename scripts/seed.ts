import { config } from "dotenv";
config(); // MUST be first — loads .env before Prisma

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user1 = await prisma.user.create({
    data: {
      email: "test@email.com",
      password: "password",
      firstName: "Thomas",
      lastname: "Whiteside"
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: "test_email@email.com",
      password: "password_test",
      firstName: "Ryan",
      lastname: "Sheng"
    }
  });

  console.log("Created users:");
  console.log(user1);
  console.log(user2);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect
  })