
import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, Trash2, Plus, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface RecurringExpense {
    id: string;
    name: string;
    amount: number;
    due_day: number;
    type: 'SUBSCRIPTION' | 'INSTALLMENT';
    installments_remaining: number | null;
    total_installments?: number; // Optional strictly for UI if we had it, but will compute/mock
    is_active: boolean;
}

export const SubscriptionsView = () => {
    const [items, setItems] = useState<RecurringExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDay, setNewDay] = useState('');
    const [newType, setNewType] = useState<'SUBSCRIPTION' | 'INSTALLMENT'>('SUBSCRIPTION');
    const [newInstallments, setNewInstallments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('is_active', true)
                .order('due_day', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async () => {
        if (!newName || !newAmount || !newDay) return;
        setSubmitting(true);
        try {
            const payload = {
                name: newName,
                amount: parseFloat(newAmount.replace(',', '.')),
                due_day: parseInt(newDay),
                type: newType,
                installments_remaining: newType === 'INSTALLMENT' ? parseInt(newInstallments) : null,
                is_active: true
            };

            const { error } = await supabase.from('recurring_expenses').insert([payload]);
            if (error) throw error;

            // Reset and Refresh
            setShowAdd(false);
            setNewName('');
            setNewAmount('');
            setNewDay('');
            setNewInstallments('');
            fetchItems();
        } catch (e) {
            alert('Erro ao adicionar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover este item?')) return;
        try {
            // Soft delete or hard delete? User "Excluir". Soft delete is safer usually.
            const { error } = await supabase.from('recurring_expenses').update({ is_active: false }).eq('id', id);
            if (error) throw error;
            fetchItems();
        } catch (e) {
            alert('Erro ao remover');
        }
    };

    // Derived Stats
    const totalMonthly = items.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24 space-y-6">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Custos Fixos</h2>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="p-2 bg-cyan-500 rounded-full text-slate-900 shadow-lg shadow-cyan-500/20 active:scale-90 transition-transform"
                >
                    {showAdd ? <X size={20} /> : <Plus size={20} />}
                </button>
            </div>

            {/* Summary Card */}
            <div className="glass p-6 rounded-[2rem] border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Total Comprometido</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-sm font-bold text-slate-500 mb-1">/ mês</span>
                </div>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="glass p-6 rounded-[2rem] border-cyan-500/30 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Novo Custo</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <input className="input-field" placeholder="Nome (Ex: Netflix)" value={newName} onChange={e => setNewName(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <input className="input-field" type="number" placeholder="Valor (R$)" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                            <input className="input-field" type="number" placeholder="Dia Venc." value={newDay} onChange={e => setNewDay(e.target.value)} />
                        </div>

                        <div className="flex bg-slate-900 rounded-xl p-1">
                            <button
                                onClick={() => setNewType('SUBSCRIPTION')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${newType === 'SUBSCRIPTION' ? 'bg-cyan-500 text-slate-900' : 'text-slate-500'}`}
                            >Assinatura</button>
                            <button
                                onClick={() => setNewType('INSTALLMENT')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${newType === 'INSTALLMENT' ? 'bg-cyan-500 text-slate-900' : 'text-slate-500'}`}
                            >Parcelado</button>
                        </div>

                        {newType === 'INSTALLMENT' && (
                            <input
                                className="input-field"
                                type="number"
                                placeholder="Parcelas Restantes"
                                value={newInstallments}
                                onChange={e => setNewInstallments(e.target.value)}
                            />
                        )}

                        <button
                            onClick={handleAdd}
                            disabled={submitting}
                            className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-cyan-50 transition-colors"
                        >
                            {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Salvar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Lists */}
            <div className="space-y-6">

                {/* Section: Subscriptions */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <Calendar size={14} /> Assinaturas Mensais
                    </h3>
                    <div className="space-y-3">
                        {items.filter(i => i.type === 'SUBSCRIPTION').map(item => (
                            <div key={item.id} className="glass p-4 rounded-2xl border-slate-800 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                                        {item.due_day}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <p className="text-xs text-slate-500">Todo dia {item.due_day}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-white">R$ {item.amount.toLocaleString()}</span>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {items.filter(i => i.type === 'SUBSCRIPTION').length === 0 && (
                            <p className="text-center text-xs text-slate-600 py-4">Nenhuma assinatura cadastrada.</p>
                        )}
                    </div>
                </div>

                {/* Section: Installments */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <CreditCard size={14} /> Parcelamentos
                    </h3>
                    <div className="space-y-3">
                        {items.filter(i => i.type === 'INSTALLMENT').map(item => (
                            <div key={item.id} className="glass p-5 rounded-2xl border-slate-800 relative overflow-hidden">
                                {/* Simulated Progress Bar based on 'remaining' vs some assumed total or just visual decay */}
                                {/* Since we don't have total, we'll just show 'Restantes' clearly */}

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded-md">
                                            Vence dia {item.due_day}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-rose-400 text-lg">R$ {item.amount.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Por Mês</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 relative z-10">
                                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                                        {/* Since we don't know total, let's create a visual that represents 'Something is there' */}
                                        {/* Or just full bar? Let's assume standard 10x or 12x context isn't known, so just show a 'Remaining' indicator */}
                                        <div className="h-full bg-rose-500 w-full opacity-50"></div>
                                    </div>
                                    <span className="text-xs font-bold text-rose-300 whitespace-nowrap">
                                        Faltam {item.installments_remaining}x
                                    </span>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <style>
                {`
                .input-field {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #06b6d4;
                    background: rgba(6, 182, 212, 0.05);
                }
                `}
            </style>
        </div>
    );
};
