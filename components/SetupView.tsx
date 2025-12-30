
import React, { useState } from 'react';
import { Save, Calculator, Target, Car, Plane, AlertCircle, Check, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { calculateViability, GoalType } from '../utils/financialEngine';

export const SetupView = () => {
    // --- State for Goals ---
    const [goals, setGoals] = useState({
        car: { amount: '', slug: 'car', name: 'Carro Novo', icon: Car },
        moto: { amount: '', slug: 'moto', name: 'Moto', icon: Target },
        travel: { amount: '', slug: 'travel', name: 'Viagem dos Sonhos', icon: Plane },
        debt: { amount: '', slug: 'debt', name: 'Quitar Dívidas', icon: AlertCircle }
    });

    // --- State for Income ---
    const [income, setIncome] = useState({
        mySalary: '',
        herSalary: '',
        freelocal: '',
        extras: '',
        fixedExpenses: ''
    });

    // --- Simulation State ---
    const [simulationResult, setSimulationResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // --- Calculations ---
    const totalIncome = (parseFloat(income.mySalary || '0') + parseFloat(income.herSalary || '0') + parseFloat(income.freelocal || '0') + parseFloat(income.extras || '0'));
    const totalExpenses = parseFloat(income.fixedExpenses || '0');
    const potentialSavings = totalIncome - totalExpenses;

    const handleSimulation = () => {
        // Simple simulation: Can we buy the Car in 2026?
        // Assuming deadline Dec 2026
        const deadline = new Date('2026-12-31');
        const carGoal = parseFloat(goals.car.amount || '0');

        const result = calculateViability(carGoal, 0, potentialSavings, deadline);

        if (result.possible) {
            setSimulationResult(`✅ Com R$ ${potentialSavings.toLocaleString()}/mês, vocês conseguem o Carro e ainda sobra!`);
        } else {
            setSimulationResult(`⚠️ Para o Carro, ${result.message}`);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Upsert Goals
            const updates = Object.values(goals).map(g => ({
                slug: g.slug,
                name: g.name,
                target_amount: parseFloat(g.amount || '0'),
                current_amount: 0, // Reset or keep? For setup, maybe reset or fetch existing. Assuming reset/init for now.
                priority: 1 // Default
            }));

            const { error } = await supabase.from('goals').upsert(updates, { onConflict: 'slug' });
            if (error) throw error;

            alert('Configuração Salva com Sucesso!');
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Configuração do Plano 2026</h2>

            {/* Income Calculator */}
            <section className="glass p-6 rounded-[2rem] border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Calculator size={16} /> Renda Conjunta Mensal
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="Meu Salário" value={income.mySalary} onChange={v => setIncome({ ...income, mySalary: v })} />
                    <Input label="Salário Dela" value={income.herSalary} onChange={v => setIncome({ ...income, herSalary: v })} />
                    <Input label="Prev. Freelocal" value={income.freelocal} onChange={v => setIncome({ ...income, freelocal: v })} />
                    <Input label="Extras/Bicos" value={income.extras} onChange={v => setIncome({ ...income, extras: v })} />
                </div>
                <div className="mb-6">
                    <Input label="Gastos Fixos Essenciais (Total)" value={income.fixedExpenses} onChange={v => setIncome({ ...income, fixedExpenses: v })} isExpense />
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${potentialSavings > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                    <span className="text-xs font-bold text-slate-400 uppercase">Sobra Potencial</span>
                    <span className={`text-xl font-black ${potentialSavings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        R$ {potentialSavings.toLocaleString()}
                    </span>
                </div>
            </section>

            {/* Goal Inputs */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Definição de Metas (Valores Totais)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(goals).map(([key, goal]) => {
                        const Icon = goal.icon;
                        return (
                            <div key={key} className="glass p-5 rounded-[1.5rem] border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{goal.name}</label>
                                    <input
                                        type="number"
                                        placeholder="R$ 0,00"
                                        value={goal.amount}
                                        onChange={e => setGoals({ ...goals, [key]: { ...goal, amount: e.target.value } })}
                                        className="w-full bg-transparent text-lg font-bold text-white placeholder:text-slate-700 outline-none"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Action Buttons */}
            <div className="space-y-4">
                {/* Simulation Result */}
                {simulationResult && (
                    <div className="p-4 bg-slate-800 rounded-xl text-sm text-slate-300 border border-slate-700 animate-in fade-in">
                        {simulationResult}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={handleSimulation}
                        className="flex-1 py-4 bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-cyan-900/40 transition-colors"
                    >
                        Simular Cenário
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Salvar Plano
                    </button>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, isExpense = false }: { label: string, value: string, onChange: (v: string) => void, isExpense?: boolean }) => (
    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 focus-within:border-slate-600 transition-colors">
        <label className={`text-[9px] font-bold uppercase block mb-1 ${isExpense ? 'text-rose-400' : 'text-slate-500'}`}>{label}</label>
        <div className="flex items-center gap-1">
            <span className="text-slate-600 text-xs font-bold">R$</span>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-200 outline-none"
                placeholder="0"
            />
        </div>
    </div>
);
