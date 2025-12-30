
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    TrendingUp, Award, Lock, Unlock, Calendar, Download,
    ArrowUpCircle, ArrowDownCircle, Coffee, Car, Zap,
    Briefcase, PlusCircle, Globe, Play, CheckCircle2
} from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    created_at: string;
    transaction_date: string; // New field
}

interface Reward {
    id: string;
    title: string;
    cost_estimate: number;
    trigger_condition: string;
    is_unlocked: boolean;
    redeemed_date: string | null;
}

export const ReportsView = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [filterDate, setFilterDate] = useState<'CURRENT' | 'LAST'>('CURRENT');
    const [loading, setLoading] = useState(true);
    const [totalSavings, setTotalSavings] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Calculate Date Range
            const now = new Date();
            let startDate, endDate;

            if (filterDate === 'CURRENT') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
                endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
            }

            // 2. Fetch Transactions
            const { data: txData } = await supabase
                .from('finance_entries')
                .select('*')
                .gte('transaction_date', startDate)
                .lte('transaction_date', endDate)
                .order('transaction_date', { ascending: false });

            // 3. Fetch Rewards and Savings (for unlock logic)
            const { data: rewardData } = await supabase.from('milestone_rewards').select('*');
            const { data: vaultData } = await supabase.from('vault_allocations').select('*');

            // Calculate Total Savings (Liquid + Invest)
            const liquid = vaultData?.find(v => v.type === 'LIQUIDITY')?.amount || 0;
            const invest = vaultData?.find(v => v.type === 'INVESTMENT')?.amount || 0;
            const currentTotalSavings = liquid + invest;
            setTotalSavings(currentTotalSavings);

            setTransactions(txData || []);
            setRewards(rewardData || []);

            // 4. Auto-Unlock Logic
            if (rewardData) {
                rewardData.forEach(async (reward) => {
                    if (!reward.is_unlocked) {
                        // Attempt to parse number from trigger string "Poupar 10000" -> 10000
                        const triggerValue = parseInt(reward.trigger_condition.replace(/\D/g, '')) || 0;
                        if (triggerValue > 0 && currentTotalSavings >= triggerValue) {
                            // UNLOCK!
                            await supabase.from('milestone_rewards').update({ is_unlocked: true }).eq('id', reward.id);
                            // Refresh local state roughly
                            setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, is_unlocked: true } : r));
                        }
                    }
                });
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filterDate]);

    const handleRedeem = async (id: string) => {
        if (!confirm('Confirmar resgate dessa recompensa?')) return;
        await supabase.from('milestone_rewards').update({ redeemed_date: new Date().toISOString() }).eq('id', id);
        loadData();
    };

    const getIcon = (category: string) => {
        const map: any = {
            'SALARY': Briefcase, 'FREELOCAL': Zap, 'EXTRA': PlusCircle,
            'BRAVO_FUEL': Car, 'FOOD': Coffee, 'LEISURE': Play, 'OTHER': Globe
        };
        return map[category] || Globe;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24 space-y-8">

            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Análise & Recompensas</h2>
                <div className="flex bg-slate-900 rounded-lg p-1">
                    <button
                        onClick={() => setFilterDate('LAST')}
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-md transition-colors ${filterDate === 'LAST' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                    >Mês Passado</button>
                    <button
                        onClick={() => setFilterDate('CURRENT')}
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-md transition-colors ${filterDate === 'CURRENT' ? 'bg-cyan-900/40 text-cyan-400' : 'text-slate-500'}`}
                    >Atual</button>
                </div>
            </header>

            {/* --- STATEMENT SECTION --- */}
            <section className="glass rounded-[2rem] overflow-hidden border-slate-800">
                <div className="p-6 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> Extrato Detalhado
                    </h3>
                    {loading && <div className="text-[10px] text-cyan-500 animate-pulse">Atualizando...</div>}
                </div>

                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 text-xs">Nenhum registro neste período.</div>
                    ) : (
                        transactions.map(t => {
                            const Icon = getIcon(t.category);
                            const isIncome = t.type === 'INCOME';
                            return (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-10 text-slate-500">
                                            <span className="text-xs font-bold">{formatDate(t.transaction_date || t.created_at)}</span>
                                        </div>
                                        <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{t.description || t.category}</p>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-wider">{t.category}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>

            {/* --- TROPHY ROOM --- */}
            <section>
                <div className="flex items-center gap-3 mb-6 ml-2">
                    <Award className="text-amber-400" size={20} />
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-[0.3em]">Sala de Troféus</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map(reward => (
                        <div key={reward.id} className={`relative p-6 rounded-[2rem] border transition-all duration-500 ${reward.is_unlocked
                                ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30 shadow-lg shadow-amber-900/20'
                                : 'bg-slate-900/40 border-slate-800 grayscale opacity-70'
                            }`}>

                            <div className="flex justify-between items-start mb-4">
                                <h4 className={`text-lg font-black uppercase tracking-tight ${reward.is_unlocked ? 'text-amber-200' : 'text-slate-500'}`}>
                                    {reward.title}
                                </h4>
                                {reward.is_unlocked
                                    ? <Unlock size={20} className="text-amber-400 drop-shadow-lg" />
                                    : <Lock size={20} className="text-slate-600" />
                                }
                            </div>

                            <p className="text-xs text-slate-400 mb-6 flex items-center gap-2">
                                <span className="uppercase font-bold tracking-wider text-[9px] bg-slate-950 px-2 py-1 rounded">Missão</span>
                                {reward.trigger_condition}
                            </p>

                            {reward.is_unlocked ? (
                                reward.redeemed_date ? (
                                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 py-2 px-3 rounded-xl border border-emerald-500/20">
                                        <CheckCircle2 size={14} /> Resgatado em {formatDate(reward.redeemed_date)}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleRedeem(reward.id)}
                                        className="w-full py-3 bg-amber-500 text-amber-950 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 animate-pulse"
                                    >
                                        Resgatar Prêmio
                                    </button>
                                )
                            ) : (
                                <div className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-xs text-center border border-white/5 cursor-not-allowed">
                                    Bloqueado
                                </div>
                            )}
                        </div>
                    ))}
                    {rewards.length === 0 && (
                        <div className="col-span-full p-8 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                            Nenhuma recompensa configurada. Adicione na tabela `milestone_rewards`.
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};
