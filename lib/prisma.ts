import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

// Optional: Log database connection details for debugging
// try {
//   const url = new URL(connectionString);
//   console.log(`[DB Config] Connecting to Host: ${url.hostname}`);
//   console.log(`[DB Config] Connecting to Port: ${url.port}`);
//   console.log(`[DB Config] Database Name: ${url.pathname.split("/")[1]}`);
//   console.log(`[DB Config] SSL Mode: ${process.env.NODE_ENV === "production"}`);
// } catch (e) {
//   console.error("[DB Config] Failed to parse DATABASE_URL string");
// }

const pool = new Pool({
  connectionString,
  max: (() => {
    const raw = process.env.PG_POOL_MAX;
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return process.env.NODE_ENV === "production" ? 10 : 5;
  })(),
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
