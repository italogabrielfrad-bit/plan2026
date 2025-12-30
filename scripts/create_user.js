
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oyrqdovugaizczbjdpwv.supabase.co';
// Using the anon key is enough for signUp if email confirmation is disabled or if we just want to trigger the email.
// If RLS is strict, this is fine because signUp is public.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cnFkb3Z1Z2FpemN6YmpkcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjQ4ODUsImV4cCI6MjA4MjcwMDg4NX0.qfKJv5lJSe_Zn2cTs1ZGRyNv2xoMEjkirH8zfcZ8deA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
    console.log("Criando usuário italogabrielfrad@gmail.com...");

    const { data, error } = await supabase.auth.signUp({
        email: 'italogabrielfrad@gmail.com',
        password: 'FraD@0101',
    });

    if (error) {
        console.error("Erro ao criar usuário:", error.message);
    } else {
        console.log("Sucesso! Usuário criado/logado:", data.user?.id);
        console.log("Nota: Se o Confirm Email estiver ligado no Supabase, verifique sua caixa de entrada.");
    }
}

createUser();
