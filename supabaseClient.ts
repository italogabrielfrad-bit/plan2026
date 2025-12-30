
import { createClient } from '@supabase/supabase-js';

// No contexto deste ambiente, as variáveis são injetadas ou mockadas.
// Substitua pelas suas credenciais reais do painel do Supabase se necessário.
// Hardcoded fallbacks to bypass Vercel configuration issues
const HARDCODED_URL = 'https://oyrqdovugaizczbjdpwv.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cnFkb3Z1Z2FpemN6YmpkcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjQ4ODUsImV4cCI6MjA4MjcwMDg4NX0.qfKJv5lJSe_Zn2cTs1ZGRyNv2xoMEjkirH8zfcZ8deA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || HARDCODED_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || HARDCODED_KEY;

console.log("--- ANTIGRAVITY ENV CHECK ---");
console.log("Using URL:", supabaseUrl);
// Don't log full key for security, just presence
console.log("Key Configured:", !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
