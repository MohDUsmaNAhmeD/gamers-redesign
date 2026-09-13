import supabase from './db-client.js';
import { randomUUID } from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { cart_id, email, full_name, address } = req.body || {};
    if (!cart_id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !full_name?.trim() || !address?.trim() || full_name.length > 100 || address.length > 500 || email.length > 254) return res.status(400).json({ error: 'Please enter a valid name, email, and delivery address.' });
    const { data: cart, error: cartError } = await supabase.from('nexus_carts').select('*').eq('id', cart_id).single();
    if (cartError || !cart?.items?.length) return res.status(400).json({ error: 'Your cart is empty.' });
    const { data: products, error } = await supabase.from('nexus_products').select('*').in('id', cart.items.map(item => item.product_id));
    if (error) throw error;
    let total = 0;
    const items = [];
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product || product.stock < item.quantity) return res.status(400).json({ error: 'An item is no longer in stock. Please review your cart.' });
      total += Number(product.price) * item.quantity;
      items.push({ product_id: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
    }
    const { data: order, error: orderError } = await supabase.from('nexus_orders').insert({ id: randomUUID(), cart_id, items, total, email: email.trim(), full_name: full_name.trim(), address: address.trim(), status: 'demo_confirmed' }).select('id, total, status, created_at').single();
    if (orderError) throw orderError;
    const { error: clearError } = await supabase.from('nexus_carts').update({ items: [], updated_at: new Date().toISOString() }).eq('id', cart_id).select();
    if (clearError) throw clearError;
    return res.status(201).json(order);
  } catch (err) { console.error('Order error:', err); return res.status(500).json({ error: 'We could not complete your demo order. Please try again.' }); }
}
