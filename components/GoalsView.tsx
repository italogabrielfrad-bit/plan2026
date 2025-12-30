
import React, { useEffect, useState } from 'react';
import { Target, Car, Plane, AlertCircle, TrendingDown, CheckCircle2, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { calculateGoalProgress, ProcessedGoal } from '../utils/financialEngine';

export const GoalsView = () => {
    const [goals, setGoals] = useState<ProcessedGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Goals
                const { data: goalsData } = await supabase.from('goals').select('*');

                // Fetch Transactions (for Bravo Savings calculation)
                const { data: txData } = await supabase.from('finance_entries').select('*');

                if (goalsData && txData) {
                    const processed = calculateGoalProgress(goalsData, txData);
                    // Sort by priority
                    setGoals(processed.sort((a, b) => a.priority - b.priority));
                }
            } catch (error) {
                console.error("Error loading goals:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'car': return Car;
            case 'moto': return Target;
            case 'travel': return Plane;
            case 'debt': return AlertCircle;
            default: return Target;
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando Metas...</div>;

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-24 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Metas Estratégicas</h2>
                <div className="px-3 py-1 bg-cyan-900/20 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    FY 2026
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {goals.map((goal) => {
                    const Icon = getIcon(goal.slug);
                    const isDebt = goal.slug === 'debt';
                    const remaining = goal.target_amount - goal.current_amount;
                    const percent = goal.percentage;

                    // Debt Visual Logic:
                    // If isDebt, bar should start Full (Red) and decrease as we pay (increase current_amount).
                    // Actually, let's invert the mental model for the User Interface as requested.
                    // "Começa cheia (vermelha) e ir diminuindo"
                    // Means the BAR represents the DEBT REMAINING.
                    // Debt Remaining % = 100 - (paid / total * 100).
                    const visualPercent = isDebt ? 100 - percent : percent;

                    return (
                        <div key={goal.slug} className={`glass p-6 rounded-[2rem] border-l-4 relative overflow-hidden transition-all group ${isDebt ? 'border-l-rose-500' : 'border-l-cyan-500'
                            }`}>
                            {/* Background Glow */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-all duration-700 ${isDebt ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-cyan-500 group-hover:bg-cyan-400'
                                }`} />

                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${isDebt ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-400'
                                        }`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${isDebt ? 'text-rose-400/70' : 'text-cyan-400/70'
                                            }`}>
                                            Prioridade 0{goal.priority}
                                        </span>
                                        <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${isDebt ? 'text-rose-500' : 'text-cyan-400'
                                        }`}>
                                        {Math.round(percent)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                                {/* The Bar */}
                                <div
                                    className={`h-full transition-all duration-1000 relative ${isDebt ? 'bg-rose-600' : 'bg-gradient-to-r from-cyan-600 to-blue-500'
                                        }`}
                                    style={{ width: `${Math.max(visualPercent, 5)}%` }} // Minimum 5% visibility
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>

                            {/* Motivational Text / Stats */}
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">
                                    {remaining <= 0
                                        ? "Meta Concluída!"
                                        : `Faltam R$ ${remaining.toLocaleString('pt-BR')}`
                                    }
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                                    {isDebt ? 'Restante' : 'Acumulado'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bravo Savings Context Info */}
            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-1">
                    <Lock size={16} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Motor Financeiro Ativo</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        Toda economia marcada como <strong>"Parcela Bravo"</strong> na carteira é automaticamente redirecionada para a meta de maior prioridade (ex: Quitar Dívidas ou Carro).
                    </p>
                </div>
            </div>
        </div>
    );
};
