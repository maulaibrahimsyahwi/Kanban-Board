import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // recommended for GCM
const ENCRYPTED_PREFIX = "enc:v1:";

function loadEncryptionKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!raw) return null;

  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");

  try {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length === 32) return decoded;
  } catch {}

  if (Buffer.byteLength(raw, "utf8") === 32) return Buffer.from(raw, "utf8");

  throw new Error(
    "Invalid DATA_ENCRYPTION_KEY. Provide 32 bytes (base64), 64 hex chars, or a 32-char ASCII key."
  );
}

export function isEncryptedString(value: string) {
  return value.startsWith(ENCRYPTED_PREFIX);
}

export function encryptString(plaintext: string) {
  const key = loadEncryptionKey();
  if (!key) throw new Error("DATA_ENCRYPTION_KEY is not set.");

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString("hex")}:${ciphertext.toString("hex")}:${tag.toString("hex")}`;
}

export function decryptString(value: string) {
  const key = loadEncryptionKey();
  if (!key) throw new Error("DATA_ENCRYPTION_KEY is not set.");
  if (!isEncryptedString(value)) return value;

  const payload = value.slice(ENCRYPTED_PREFIX.length);
  const [ivHex, ciphertextHex, tagHex] = payload.split(":");
  if (!ivHex || !ciphertextHex || !tagHex) {
    throw new Error("Invalid encrypted payload format.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function maybeEncryptString(plaintext: string) {
  const key = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!key) return plaintext;
  if (isEncryptedString(plaintext)) return plaintext;
  return encryptString(plaintext);
}

export function maybeDecryptString(value: string) {
  if (!isEncryptedString(value)) return value;
  return decryptString(value);
}
