import { getTransactions, saveTransactions } from '../_lib/store.js';

export default async function handler(req, res) {
  const id = Number(req.query.id);
  const db = await getTransactions();
  const idx = db.findIndex((x) => x.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  if (req.method === 'PUT') {
    const t = req.body || {};
    const existing = db[idx];
    const updated = {
      id,
      date: t.date || existing.date,
      description: t.description !== undefined ? String(t.description).trim() : existing.description,
      category: t.category || existing.category,
      amount: t.amount !== undefined ? Number(t.amount) : existing.amount,
      paymentMode: t.paymentMode || existing.paymentMode,
      type: t.type || existing.type,
      notes: t.notes !== undefined ? t.notes : existing.notes,
    };
    db[idx] = updated;
    await saveTransactions(db);
    res.json(updated);
    return;
  }

  if (req.method === 'DELETE') {
    await saveTransactions(db.filter((x) => x.id !== id));
    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}