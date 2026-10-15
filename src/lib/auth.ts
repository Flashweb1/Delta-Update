const encoder = new TextEncoder();

export const SESSION_COOKIE = "du_newsroom";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(now: number = Date.now()): Promise<string | null> {
  const secret = getAuthSecret();
  if (!secret) return null;
  const expiresAt = now + SESSION_TTL_MS;
  const signature = await hmacHex(secret, String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function isSessionValid(token: string | undefined | null): Promise<boolean> {
  const secret = getAuthSecret();
  if (!secret || !token) return false;
  const separator = token.indexOf(".");
  if (separator <= 0) return false;
  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d{1,15}$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now()) return false;
  const expected = await hmacHex(secret, expiresAt);
  return timingSafeEqual(signature, expected);
}

export async function verifyPassword(input: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([sha256Hex(input), sha256Hex(expected)]);
  return timingSafeEqual(a, b);
}
