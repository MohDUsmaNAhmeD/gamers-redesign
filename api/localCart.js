import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { MOCK_PRODUCTS } from './mockData.js';

const STORE_PATH = join(tmpdir(), 'nexus-carts-local.json');

async function readStore() {
  try {
    return JSON.parse(await readFile(STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function writeStore(store) {
  await writeFile(STORE_PATH, JSON.stringify(store), 'utf8');
}

export async function localGetCart(id) {
  const store = await readStore();
  return store[id] || { id, items: [], saved_items: [] };
}

export async function localMutateCart(id, action, product_id, quantity) {
  const store = await readStore();
  const cart = store[id] || { id, items: [], saved_items: [] };
  const product = MOCK_PRODUCTS.find(p => p.id === product_id);
  if (!product) return { error: 'This product is no longer available.' };

  let items = [...cart.items];
  let saved = [...cart.saved_items];
  const existing = items.find(item => item.product_id === product_id);

  if (action === 'add' || action === 'quantity') {
    const next = action === 'add' ? (existing?.quantity || 0) + 1 : quantity;
    if (!Number.isInteger(next) || next < 1 || next > Math.min(product.stock, 10)) {
      return { error: 'You can add up to ' + Math.min(product.stock, 10) + ' of this item.' };
    }
    if (existing) items = items.map(item => item.product_id === product_id ? { ...item, quantity: next } : item);
    else items.push({ product_id, quantity: next });
  } else if (action === 'remove') {
    items = items.filter(item => item.product_id !== product_id);
  } else if (action === 'save') {
    saved = saved.includes(product_id) ? saved.filter(item => item !== product_id) : [...saved, product_id];
  } else {
    return { error: 'Invalid cart action.' };
  }

  const updated = { id, items, saved_items: saved, updated_at: new Date().toISOString() };
  store[id] = updated;
  await writeStore(store);
  return { cart: updated };
}
