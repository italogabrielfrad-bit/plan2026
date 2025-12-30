
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Rocket, AlertCircle, Loader2 } from 'lucide-react';

export const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Session handling happens in index.tsx onAuthStateChange
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-cyan-500/30">

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Logo */}
                <div className="text-center">
                    <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                    <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                        Antigravity
                    </h1>
                    <p className="text-slate-500 text-sm tracking-[0.2em] font-bold">PROTOCOLO 2026</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700 font-medium"
                                placeholder="piloto@antigravity.app"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-xs text-rose-300">
                                <AlertCircle size={16} />
                                {error === "Invalid login credentials" ? "Credenciais inválidas." : error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-[0.1em] py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Iniciar Sistema'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
                    Acesso Restrito &copy; 2025
                </p>
            </div>
        </div>
    );
};
