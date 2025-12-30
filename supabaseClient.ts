
import { createClient } from '@supabase/supabase-js';

// No contexto deste ambiente, as variáveis são injetadas ou mockadas.
// Substitua pelas suas credenciais reais do painel do Supabase se necessário.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase keys are missing in environment variables. Check .env.local or Vercel settings.");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
