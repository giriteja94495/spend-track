import { verifyPassword, issueToken, sessionCookie } from './_lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  const token = issueToken();
  res.setHeader('Set-Cookie', sessionCookie(token));
  res.json({ ok: true });
}