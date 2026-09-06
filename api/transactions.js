import { isAuthed } from './_lib/auth.js';
import { getTransactions, saveTransactions } from './_lib/store.js';

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    res.json(await getTransactions());
    return;
  }

  if (req.method === 'POST') {
    const t = req.body || {};
    if (!t.date || !t.description || t.amount === undefined) {
      res.status(400).json({ error: 'date, description and amount are required' });
      return;
    }
    const db = await getTransactions();
    const next = {
      id: db.reduce((m, x) => Math.max(m, x.id), 0) + 1,
      date: String(t.date),
      description: String(t.description).trim(),
      category: t.category || 'Miscellaneous',
      amount: Number(t.amount),
      paymentMode: t.paymentMode || 'UPI',
      type: t.type || 'Need',
      notes: t.notes || '',
    };
    await saveTransactions([...db, next]);
    res.status(201).json(next);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}