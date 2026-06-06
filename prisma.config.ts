import { config as loadDotenv } from "dotenv";
import { defineConfig } from "@prisma/config";

// Load .env.local before Prisma reads the config
loadDotenv({ path: ".env.local" });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  schema: "prisma/schema.prisma",
});
