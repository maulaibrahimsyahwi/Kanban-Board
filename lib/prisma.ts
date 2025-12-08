import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

try {
  const url = new URL(connectionString);
  console.log(`[DB Config] Connecting to Host: ${url.hostname}`);
  console.log(`[DB Config] Connecting to Port: ${url.port}`);
  console.log(`[DB Config] Database Name: ${url.pathname.split("/")[1]}`);
  console.log(`[DB Config] SSL Mode: ${process.env.NODE_ENV === "production"}`);
} catch (e) {
  console.error("[DB Config] Failed to parse DATABASE_URL string");
}

const pool = new Pool({
  connectionString,
  max: 1, // Serverless harus 1
  allowExitOnIdle: true,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
