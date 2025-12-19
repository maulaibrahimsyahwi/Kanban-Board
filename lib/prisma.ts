import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";
import path from "node:path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

function readCertificateFile(filePath: string) {
  const pem = fs.readFileSync(filePath, "utf8").trim();
  if (!pem.includes("BEGIN CERTIFICATE")) {
    throw new Error(`Invalid certificate file: ${filePath}`);
  }
  return pem;
}

// Supabase Postgres uses its own CA. Some Node runtimes (including Vercel) may not trust it
// by default, which can surface as: "self-signed certificate in certificate chain".
function getSupabaseRootCa() {
  const configuredPath = process.env.SUPABASE_CA_CERT_PATH?.trim();
  const certPath = configuredPath
    ? path.resolve(configuredPath)
    : path.join(process.cwd(), "supabase", "prod-ca-2021.crt");

  try {
    return readCertificateFile(certPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load Supabase CA certificate at "${certPath}". ` +
        `Make sure the file exists (or set SUPABASE_CA_CERT_PATH). ` +
        `Original error: ${message}`
    );
  }
}

function getDbHostname(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isSupabaseHostname(hostname: string) {
  return (
    hostname.endsWith(".supabase.co") || hostname.endsWith(".pooler.supabase.com")
  );
}

const dbHostname = getDbHostname(connectionString);
const isSupabaseDb = isSupabaseHostname(dbHostname);

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

const ssl = (() => {
  const modeRaw = process.env.PG_SSL_MODE;
  const mode = modeRaw?.trim().toLowerCase();

  if (!mode || mode === "auto") {
    if (isSupabaseDb) {
      return { rejectUnauthorized: true, ca: getSupabaseRootCa() };
    }

    return process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : undefined;
  }

  if (["disable", "off", "false", "0"].includes(mode)) return undefined;
  if (["no-verify", "require-no-verify"].includes(mode)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "PG_SSL_MODE=no-verify is not allowed in production. Use auto/verify-full and configure a trusted CA."
      );
    }
    return { rejectUnauthorized: false };
  }
  if (["verify", "verify-full", "require", "true", "1"].includes(mode)) {
    return isSupabaseDb
      ? { rejectUnauthorized: true, ca: getSupabaseRootCa() }
      : { rejectUnauthorized: true };
  }

  throw new Error(
    `Invalid PG_SSL_MODE value: "${modeRaw}". Expected auto|disable|no-verify|verify-full.`
  );
})();

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
  ...(ssl ? { ssl } : {}),
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
