import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      if (!req.query.email) return res.status(400).json({ error: 'Email required.' });
      const { data, error } = await supabase.from('nexus_subscribers').select('id').eq('email', String(req.query.email).toLowerCase()).maybeSingle();
      if (error) throw error;
      return res.status(200).json({ subscribed: Boolean(data) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const email = req.body?.email?.trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    const { error } = await supabase.from('nexus_subscribers').upsert({ email }, { onConflict: 'email' }).select();
    if (error) throw error;
    return res.status(201).json({ subscribed: true });
  } catch (err) { console.error('Newsletter error:', err); return res.status(500).json({ error: 'Could not save your subscription. Please try again.' }); }
}
