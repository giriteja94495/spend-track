import crypto from 'node:crypto';

export const PASSWORD = process.env.APP_PASSWORD || 'Bournville@50';
export const SECRET = process.env.AUTH_SECRET || 'local-dev-secret-change-this';

export const COOKIE_NAME = 'ft_session';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function verifyPassword(pw) {
  if (!pw) return false;
  const given = Buffer.from(String(pw));
  const expected = Buffer.from(PASSWORD);
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

export function issueToken() {
  const expires = String(Date.now() + TTL_MS);
  const sig = crypto.createHmac('sha256', SECRET).update(expires).digest('base64url');
  return `${expires}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return false;
  const expires = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(expires).digest('base64url');
  if (sig.length !== expected.length) return false;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return ok && Number(expires) > Date.now();
}

export function readCookie(req) {
  const header = req.headers.cookie || '';
  const matches = header.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return matches ? decodeURIComponent(matches[1]) : null;
}

export function isAuthed(req) {
  const token = readCookie(req);
  return token ? verifyToken(token) : false;
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}