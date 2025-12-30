
import { createClient } from '@supabase/supabase-js';

// No contexto deste ambiente, as variáveis são injetadas ou mockadas.
// Substitua pelas suas credenciais reais do painel do Supabase se necessário.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
