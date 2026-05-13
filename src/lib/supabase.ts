import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  const missingVars = [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean);
  console.warn(
    `Variáveis de ambiente do Supabase não encontradas (${missingVars.join(
      ', '
    )}). O app não vai conseguir se conectar ao Supabase.`
  );
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '') as any;
