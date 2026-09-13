import supabase from './db-client.js';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const id = req.method === 'GET' ? req.query.id : req.body?.id;
    if (!uuid.test(id || '')) return res.status(400).json({ error: 'Invalid cart session.' });
    const { data: stored, error: getError } = await supabase.from('nexus_carts').select('*').eq('id', id).maybeSingle();
    if (getError) throw getError;
    const cart = stored || { id, items: [], saved_items: [] };
    if (req.method === 'GET') return res.status(200).json(cart);
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
    const { action, product_id, quantity } = req.body;
    if (!Number.isInteger(product_id)) return res.status(400).json({ error: 'Choose a valid product.' });
    const { data: product, error } = await supabase.from('nexus_products').select('id, stock').eq('id', product_id).single();
    if (error || !product) return res.status(400).json({ error: 'This product is no longer available.' });
    let items = [...cart.items];
    let saved = [...cart.saved_items];
    const existing = items.find(item => item.product_id === product_id);
    if (action === 'add' || action === 'quantity') {
      const next = action === 'add' ? (existing?.quantity || 0) + 1 : quantity;
      if (!Number.isInteger(next) || next < 1 || next > Math.min(product.stock, 10)) return res.status(400).json({ error: 'You can add up to ' + Math.min(product.stock, 10) + ' of this item.' });
      if (existing) items = items.map(item => item.product_id === product_id ? { ...item, quantity: next } : item);
      else items.push({ product_id, quantity: next });
    } else if (action === 'remove') items = items.filter(item => item.product_id !== product_id);
    else if (action === 'save') saved = saved.includes(product_id) ? saved.filter(item => item !== product_id) : [...saved, product_id];
    else return res.status(400).json({ error: 'Invalid cart action.' });
    const { data, error: writeError } = await supabase.from('nexus_carts').upsert({ id, items, saved_items: saved, updated_at: new Date().toISOString() }).select().single();
    if (writeError) throw writeError;
    return res.status(200).json(data);
  } catch (err) { console.error('Cart error:', err); return res.status(500).json({ error: 'Your cart could not be updated. Please try again.' }); }
}
