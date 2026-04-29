import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;

  if (!hex || hex.length !== 64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is not set or invalid. Data cannot be stored safely.');
    }
    return null; // dev/test: encryption is skipped, data stored as plaintext
  }

  return Buffer.from(hex, 'hex');
}

/** Encrypts a plaintext string. Returns base64-encoded iv+tag+ciphertext. */
export function encrypt(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext; // no-op if key not configured

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Pack as: iv (12) | tag (16) | ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts a value previously encrypted with `encrypt`.
 * Gracefully returns the original value if it cannot be decrypted
 * (handles existing plaintext rows written before encryption was enabled).
 */
export function decrypt(value: string): string {
  const key = getKey();
  if (!key) return value;

  try {
    const buf = Buffer.from(value, 'base64');
    if (buf.length < IV_LENGTH + TAG_LENGTH + 1) return value; // too short — plaintext

    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return value; // not encrypted (legacy plaintext) — return as-is
  }
}

// ─── Per-model helpers ────────────────────────────────────────────────────────

type Nullable<T> = T | null | undefined;

function enc(v: Nullable<string>): string | null | undefined {
  if (v == null) return v;
  return encrypt(v);
}

function dec(v: Nullable<string>): string | null | undefined {
  if (v == null) return v;
  return decrypt(v);
}

// Incident

export interface IncidentEncryptedFields {
  behaviorText?: Nullable<string>;
  notes?: Nullable<string>;
  locationText?: Nullable<string>;
}

export function encryptIncidentFields<T extends IncidentEncryptedFields>(data: T): T {
  return {
    ...data,
    behaviorText: enc(data.behaviorText),
    notes: enc(data.notes),
    locationText: enc(data.locationText),
  };
}

export function decryptIncidentFields<T extends IncidentEncryptedFields>(data: T): T {
  return {
    ...data,
    behaviorText: dec(data.behaviorText),
    notes: dec(data.notes),
    locationText: dec(data.locationText),
  };
}

// Food

export interface FoodEncryptedFields {
  foodItem?: Nullable<string>;
  amountConsumed?: Nullable<string>;
  notes?: Nullable<string>;
}

export function encryptFoodFields<T extends FoodEncryptedFields>(data: T): T {
  return {
    ...data,
    foodItem: enc(data.foodItem),
    amountConsumed: enc(data.amountConsumed),
    notes: enc(data.notes),
  };
}

export function decryptFoodFields<T extends FoodEncryptedFields>(data: T): T {
  return {
    ...data,
    foodItem: dec(data.foodItem),
    amountConsumed: dec(data.amountConsumed),
    notes: dec(data.notes),
  };
}

// Poop

export interface PoopEncryptedFields {
  consistency?: Nullable<string>;
  notes?: Nullable<string>;
}

export function encryptPoopFields<T extends PoopEncryptedFields>(data: T): T {
  return {
    ...data,
    consistency: enc(data.consistency),
    notes: enc(data.notes),
  };
}

export function decryptPoopFields<T extends PoopEncryptedFields>(data: T): T {
  return {
    ...data,
    consistency: dec(data.consistency),
    notes: dec(data.notes),
  };
}

// Child

export interface ChildEncryptedFields {
  name?: Nullable<string>;
}

export function encryptChildFields<T extends ChildEncryptedFields>(data: T): T {
  return { ...data, name: enc(data.name) };
}

export function decryptChildFields<T extends ChildEncryptedFields>(data: T): T {
  return { ...data, name: dec(data.name) };
}
