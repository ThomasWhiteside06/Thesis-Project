import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL,
    },
  },
});
