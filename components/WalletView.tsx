
import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Check, Loader2, Car, Coffee, Play, Globe, Briefcase, Zap, PlusCircle, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface WalletViewProps {
    onSuccess: () => void;
    initialData?: {
        amount: number;
        category: string;
        description: string;
        type: 'INCOME' | 'EXPENSE';
    } | null;
}

export const WalletView = ({ onSuccess, initialData }: WalletViewProps) => {
    // State
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
    const [loading, setLoading] = useState(false);
    const [bravoSavings, setBravoSavings] = useState(false);

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'reward' } | null>(null);

    const incomeCategories = [
        { id: 'SALARY', label: 'Salário', icon: Briefcase },
        { id: 'FREELOCAL', label: 'Freelocal', icon: Zap },
        { id: 'EXTRA', label: 'Renda Extra', icon: PlusCircle },
    ];

    const expenseCategories = [
        { id: 'BRAVO_FUEL', label: 'Combustível Bravo', icon: Car },
        { id: 'FOOD', label: 'Alimentação', icon: Coffee },
        { id: 'LEISURE', label: 'Lazer', icon: Play },
        { id: 'OTHER', label: 'Outros', icon: Globe },
    ];

    const toggleBravoSavings = () => {
        const newState = !bravoSavings;
        setBravoSavings(newState);
        if (newState) {
            setType('INCOME');
            setCategory('BRAVO_SAVINGS');
            setDescription('Economia Parcela Bravo');
        } else {
            setType('EXPENSE');
            setCategory('');
            setDescription('');
        }
    };

    const showNotification = (msg: string, type: 'success' | 'error' | 'reward') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async () => {
        if (!amount || !category) return;
        setLoading(true);
        setNotification(null);

        try {
            const payload = {
                amount: parseFloat(amount.replace(',', '.')),
                category: category,
                origin: 'MANUAL',
                type: type,
                description: description || category,
                transaction_date: date, // Custom date
            };

            const { error } = await supabase.from('finance_entries').insert([payload]);
            if (error) throw error;

            let successMsg = 'Transação Registrada!';

            // --- REWARD UNLOCK CHECK (Gamification) ---
            if (type === 'INCOME') {
                // 1. Check Locked Rewards
                const { data: lockedRewards } = await supabase
                    .from('milestone_rewards')
                    .select('*')
                    .eq('is_unlocked', false);

                if (lockedRewards && lockedRewards.length > 0) {
                    // 2. Calculate New Total Balance (Liquid + Invest)
                    // Note: We need a reliable way to get this. 
                    // Ideally we summed 'transactions' or read 'vault_allocations'.
                    // For this interaction, let's grab 'vault_allocations' as the base, 
                    // BUT 'finance_entries' updates don't auto-update 'vault_allocations' in this app logic yet (manual sync).
                    // However, ReportsView uses 'vault_allocations'. 
                    // Let's assume for REWARD purposes, we rely on the User keeping Vault updated OR 
                    // we query 'finance_entries' sum. Querying sum is heavy but accurate.

                    // Optimized: Just check if this income pushed us over?
                    // Let's assume user manually manages "Vault".
                    // If reward trigger is "Poupar X", it usually implies "Ter X guardado".
                    // Let's check 'vault_allocations' sum.

                    const { data: vaultData } = await supabase.from('vault_allocations').select('*');
                    const totalSaved = (vaultData?.reduce((acc, v) => acc + v.amount, 0) || 0);

                    // Check against logic
                    let unlockedCount = 0;
                    for (const reward of lockedRewards) {
                        const target = parseInt(reward.trigger_condition.replace(/\D/g, '')) || 0;
                        if (target > 0 && totalSaved >= target) {
                            await supabase.from('milestone_rewards').update({ is_unlocked: true }).eq('id', reward.id);
                            showNotification(`🏆 Conquista Desbloqueada: ${reward.title}!`, 'reward');
                            unlockedCount++;
                        }
                    }

                    if (unlockedCount === 0) showNotification('Entrada Registrada!', 'success');
                } else {
                    showNotification('Entrada Registrada!', 'success');
                }
            } else {
                showNotification('Despesa Registrada!', 'success');
            }

            // Reset form
            setAmount('');
            setCategory('');
            setDescription('');
            setBravoSavings(false);
            setDate(new Date().toISOString().split('T')[0]); // Reset to today

            onSuccess();
        } catch (e) {
            console.error(e);
            showNotification('Erro ao salvar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24 relative">

            {/* Custom Notification Toast */}
            {notification && (
                <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${notification.type === 'reward' ? 'bg-amber-500 text-amber-950 border-2 border-amber-300' :
                    notification.type === 'error' ? 'bg-rose-500 text-white' :
                        'bg-emerald-500 text-slate-900 border border-emerald-400'
                    }`}>
                    {notification.type === 'reward' ? <Trophy size={24} className="animate-bounce" /> : <Check size={24} />}
                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-wider">{notification.type === 'reward' ? 'Nova Conquista!' : 'Sucesso'}</h4>
                        <p className="font-bold text-sm">{notification.message}</p>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-center mb-6 uppercase tracking-widest text-slate-500">Nova Transação</h2>

            {/* Giant Toggle */}
            <div className="flex bg-slate-900/50 p-1 rounded-[2rem] border border-white/5 mb-8 relative h-16">
                <div
                    className={`absolute top-1 bottom-1 w-1/2 rounded-[1.7rem] transition-all duration-300 shadow-xl ${type === 'INCOME' ? 'left-1 bg-emerald-500 shadow-emerald-500/20' : 'left-[50%] bg-rose-500 shadow-rose-500/20'}`}
                />

                <button
                    onClick={() => { setType('INCOME'); setBravoSavings(false); }}
                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-colors ${type === 'INCOME' ? 'text-slate-900' : 'text-slate-500 hover:text-white'}`}
                >
                    <ArrowUpCircle size={20} /> Entrada
                </button>
                <button
                    onClick={() => { setType('EXPENSE'); setBravoSavings(false); }}
                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-colors ${type === 'EXPENSE' ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    <ArrowDownCircle size={20} /> Saída
                </button>
            </div>

            {/* Inputs Container */}
            <div className="mb-8 grid grid-cols-2 gap-4">
                {/* Amount Input */}
                <div className="col-span-2 md:col-span-1 glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-center flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Valor</label>
                    <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-slate-600">R$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className={`bg-transparent text-4xl font-black text-center w-32 outline-none placeholder:text-slate-800 transition-colors ${type === 'INCOME' ? 'text-emerald-400 selection:bg-emerald-500/30' : 'text-rose-500 selection:bg-rose-500/30'}`}
                        />
                    </div>
                </div>

                {/* Date Input */}
                <div className="col-span-2 md:col-span-1 glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-center flex-col relative overflow-hidden">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
                        <Calendar size={12} /> Data
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-white font-bold text-xl text-center w-full focus:outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="mb-10">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 block text-center">Categoria</label>
                <div className="grid grid-cols-2 gap-3">
                    {(type === 'INCOME' ? incomeCategories : expenseCategories).map(cat => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-200 active:scale-95 ${isSelected
                                    ? (type === 'INCOME' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-500')
                                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                            >
                                <Icon size={24} />
                                <span className="text-xs font-bold uppercase">{cat.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Description Optional */}
            <div className="mb-6">
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição (Opcional)"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-center focus:border-cyan-500/50 outline-none transition-colors"
                />
            </div>

            {/* Bravo Savings Special */}
            <button
                onClick={toggleBravoSavings}
                className={`w-full p-4 mb-8 rounded-2xl border border-dashed flex items-center justify-center gap-3 transition-all ${bravoSavings
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
            >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${bravoSavings ? 'border-cyan-400 bg-cyan-400 text-slate-900' : 'border-slate-600'}`}>
                    {bravoSavings && <Check size={12} strokeWidth={4} />}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Economia Parcela Bravo</span>
            </button>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || !amount || !category}
                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${!amount || !category ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                    listing => loading ? 'bg-slate-800 text-white' :
                        type === 'INCOME' ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20 hover:scale-[1.02] active:scale-95' :
                            'bg-rose-600 text-white shadow-rose-500/20 hover:scale-[1.02] active:scale-95'
                    }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                {loading ? 'Processando...' : 'Confirmar Lançamento'}
            </button>
        </div>
    );
};
