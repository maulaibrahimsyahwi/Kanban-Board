import { defineConfig } from "@prisma/config";
import "dotenv/config";
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not defined. Please check your .env file.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: url,
  },
});
