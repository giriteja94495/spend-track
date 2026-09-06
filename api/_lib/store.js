import { transactions as seedTransactions } from '../../src/data/transactions.js';

const KV_KEY = 'finance:transactions';
const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

function seed() {
  return seedTransactions.map((t, i) => ({ id: i + 1, ...t }));
}

let memory = null;

export async function getTransactions() {
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get(KV_KEY);
    if (Array.isArray(data) && data.length) return data;
    const initial = seed();
    await kv.set(KV_KEY, initial);
    return initial;
  }
  if (!memory) memory = seed();
  return memory;
}

export async function saveTransactions(next) {
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, next);
    return next;
  }
  memory = next;
  return next;
}