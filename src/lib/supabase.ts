import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Modo desenvolvimento - sem Supabase real
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: any;

if (!supabaseUrl || !supabaseAnonKey) {
  // Mock do Supabase para desenvolvimento
  const mockSupabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        }),
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          })
        })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null })
      }
    })
  };
  
  supabaseClient = mockSupabase;
} else {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
