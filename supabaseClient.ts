
import { createClient } from '@supabase/supabase-js';

// No contexto deste ambiente, as variáveis são injetadas ou mockadas.
// Substitua pelas suas credenciais reais do painel do Supabase se necessário.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("--- ANTIGRAVITY ENV CHECK ---");
console.log("VITE_SUPABASE_URL exists:", !!supabaseUrl);
console.log("VITE_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
if (supabaseUrl) console.log("URL Preview:", supabaseUrl.substring(0, 10) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase keys are missing. Application will fail.");
    // Force a visual error on the DOM if possible, or just rely on console.
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
