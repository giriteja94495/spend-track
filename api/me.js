import { isAuthed } from './_lib/auth.js';

export default function handler(req, res) {
  res.json({ authenticated: isAuthed(req) });
}