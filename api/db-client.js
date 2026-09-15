import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Export null when the database is not configured so dependent handlers
// can fall back to the local demo store instead of failing to import.
const supabase = url && key
  ? createClient(url, key, {
      global: {
        fetch: async (fetchUrl, options) => {
          const res = await fetch(fetchUrl, options);
          if (!res.ok && res.status >= 500) triggerRestore();
          return res;
        },
      },
    })
  : null;

export default supabase;
