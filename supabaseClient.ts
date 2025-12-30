
import { createClient } from '@supabase/supabase-js';

// No contexto deste ambiente, as variáveis são injetadas ou mockadas.
// Substitua pelas suas credenciais reais do painel do Supabase se necessário.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
