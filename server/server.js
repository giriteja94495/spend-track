import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transactions as seedTransactions } from '../src/data/transactions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA_FILE = path.join(__dirname, 'data.json');

const APP_PASSWORD = process.env.APP_PASSWORD || 'Bournville@50';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PORT = process.env.PORT || 4000;

const sessions = new Map();

let db = [];

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  const seeded = seedTransactions.map((t, i) => ({ id: i + 1, ...t }));
  saveData(seeded);
  return seeded;
}

function saveData(next = db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2));
}

db = loadData();

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

function authRequired(req, res, next) {
  const sid = req.cookies && req.cookies.ft_session;
  const session = sid && sessions.get(sid);
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/me', (req, res) => {
  const sid = req.cookies && req.cookies.ft_session;
  const session = sid && sessions.get(sid);
  res.json({ authenticated: !!(session && session.expires > Date.now()) });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, { expires: Date.now() + SESSION_TTL_MS });
  res.cookie('ft_session', sid, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
  });
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const sid = req.cookies && req.cookies.ft_session;
  if (sid) sessions.delete(sid);
  res.clearCookie('ft_session');
  res.json({ ok: true });
});

app.get('/api/transactions', authRequired, (req, res) => {
  res.json(db);
});

app.post('/api/transactions', authRequired, (req, res) => {
  const t = req.body || {};
  if (!t.date || !t.description || t.amount === undefined || !Number.isFinite(Number(t.amount))) {
    return res.status(400).json({ error: 'date, description and amount are required' });
  }
  const next = {
    id: db.reduce((m, x) => Math.max(m, x.id), 0) + 1,
    date: t.date,
    description: String(t.description).trim(),
    category: t.category || 'Miscellaneous',
    amount: Number(t.amount),
    paymentMode: t.paymentMode || 'UPI',
    type: t.type || 'Need',
    notes: t.notes || '',
  };
  db = [...db, next];
  saveData();
  res.status(201).json(next);
});

app.put('/api/transactions/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const idx = db.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const t = req.body || {};
  const existing = db[idx];
  db[idx] = {
    id,
    date: t.date || existing.date,
    description: t.description !== undefined ? String(t.description).trim() : existing.description,
    category: t.category || existing.category,
    amount: t.amount !== undefined ? Number(t.amount) : existing.amount,
    paymentMode: t.paymentMode || existing.paymentMode,
    type: t.type || existing.type,
    notes: t.notes !== undefined ? t.notes : existing.notes,
  };
  saveData();
  res.json(db[idx]);
});

app.delete('/api/transactions/:id', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const next = db.filter((x) => x.id !== id);
  if (next.length === db.length) return res.status(404).json({ error: 'Not found' });
  db = next;
  saveData();
  res.json({ ok: true });
});

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Finance Tracker server running on http://localhost:${PORT}`);
});