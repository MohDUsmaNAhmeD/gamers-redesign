import supabase from './db-client.js';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const [products, categories] = await Promise.all([
      supabase.from('nexus_products').select('*').order('id', { ascending: true }),
      supabase.from('nexus_categories').select('*').order('position', { ascending: true })
    ]);
    
    if (products.data && products.data.length > 0 && categories.data && categories.data.length > 0) {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
      return res.status(200).json({ products: products.data, categories: categories.data });
    }
    
    // Fallback to local high-resolution seed data
    return res.status(200).json({ products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES });
  } catch (err) {
    console.warn('Catalog DB fallback active:', err?.message || err);
    return res.status(200).json({ products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES });
  }
}

