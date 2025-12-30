
import React, { useState } from 'react';
import { Rocket, Wallet, Target, AlertCircle, CheckCircle2, ChevronRight, X, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface OnboardingViewProps {
    onFinish: () => void;
}

export const OnboardingView = ({ onFinish }: OnboardingViewProps) => {
    const [step, setStep] = useState(1);

    // --- DATA STATE ---
    // Step 1: Base (Garantido)
    const [salaryHe, setSalaryHe] = useState('');
    const [salaryShe, setSalaryShe] = useState('');
    const [fixedCost, setFixedCost] = useState('');

    // Step 2: Acelerador (Potencial)
    const [incomeFreelocal, setIncomeFreelocal] = useState('');
    const [incomeExtra, setIncomeExtra] = useState('');
    const [isAcceleratedNow, setIsAcceleratedNow] = useState(false); // Toggle

    // Step 3: Dívidas
    const [debts, setDebts] = useState<{ id: string, name: string, total: number, monthly: number, isEstimated: boolean }[]>([]);
    const [newDebtName, setNewDebtName] = useState('');
    const [newDebtTotal, setNewDebtTotal] = useState('');
    const [newDebtMonthly, setNewDebtMonthly] = useState('');
    const [newDebtEstimated, setNewDebtEstimated] = useState(false);
    const [bravoParcel, setBravoParcel] = useState('');

    // Step 4: Sonhos
    const [goalCar, setGoalCar] = useState('');
    const [goalMoto, setGoalMoto] = useState('');
    const [goalTravel, setGoalTravel] = useState('');

    const [loading, setLoading] = useState(false);

    // --- CALCULATIONS ---
    const val = (s: string) => parseFloat(s) || 0;

    // 1. Guaranteed Logic
    const totalGuaranteedIncome = val(salaryHe) + val(salaryShe);
    const totalDebtMonthly = debts.reduce((acc, d) => acc + d.monthly, 0);
    const totalSurvivalCost = val(fixedCost) + totalDebtMonthly; // Fixed + Debt Commitments
    const safeSurplus = totalGuaranteedIncome - totalSurvivalCost;

    // 2. Accelerated Logic
    const totalPotentialIncome = val(incomeFreelocal) + val(incomeExtra);
    const totalAcceleratedIncome = totalGuaranteedIncome + totalPotentialIncome;
    const acceleratedSurplus = safeSurplus + totalPotentialIncome;

    // 3. Debts & Dreams
    const totalDebtAmount = debts.reduce((acc, d) => acc + d.total, 0);
    const totalDreamsAmount = val(goalCar) + val(goalMoto) + val(goalTravel);

    // 4. Projections (Months to Freedom)
    // Scenario Safe
    const capacitySafe = safeSurplus + val(bravoParcel); // Bravo is investment
    const monthsFreedomSafe = capacitySafe > 0 ? totalDebtAmount / capacitySafe : 999;
    const dateFreedomSafe = addMonths(new Date(), monthsFreedomSafe);

    // Scenario Turbo
    const capacityTurbo = acceleratedSurplus + val(bravoParcel);
    const monthsFreedomTurbo = capacityTurbo > 0 ? totalDebtAmount / capacityTurbo : 999;
    const dateFreedomTurbo = addMonths(new Date(), monthsFreedomTurbo);

    // Dreams Dates (After Freedom)
    const monthsDreamsSafe = capacitySafe > 0 ? totalDreamsAmount / capacitySafe : 999;
    const dateDreamsSafe = addMonths(dateFreedomSafe, monthsDreamsSafe);

    const monthsDreamsTurbo = capacityTurbo > 0 ? totalDreamsAmount / capacityTurbo : 999;
    const dateDreamsTurbo = addMonths(dateFreedomTurbo, monthsDreamsTurbo);


    function addMonths(date: Date, months: number) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + Math.ceil(months));
        return d;
    }

    const handleAddDebt = () => {
        if (!newDebtName || !newDebtTotal) return;
        setDebts([...debts, {
            id: Date.now().toString(),
            name: newDebtName,
            total: val(newDebtTotal),
            monthly: val(newDebtMonthly),
            isEstimated: newDebtEstimated
        }]);
        setNewDebtName('');
        setNewDebtTotal('');
        setNewDebtMonthly('');
        setNewDebtEstimated(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save Goals
            const goalsPayload = [
                { slug: 'debt', name: 'Dívidas Totais', target_amount: totalDebtAmount, priority: 1, current_amount: 0 },
                { slug: 'car', name: 'Carro Novo', target_amount: val(goalCar), priority: 2, current_amount: 0 },
                { slug: 'moto', name: 'Moto', target_amount: val(goalMoto), priority: 3, current_amount: 0 },
                { slug: 'travel', name: 'Viagem', target_amount: val(goalTravel), priority: 4, current_amount: 0 },
            ];
            await supabase.from('goals').upsert(goalsPayload);

            // Save Fixed Cost Placeholder
            if (fixedCost) {
                await supabase.from('recurring_expenses').upsert([{
                    name: 'Sobrevivência (Base)', amount: val(fixedCost), type: 'SUBSCRIPTION', due_day: 5, is_active: true
                }], { onConflict: 'name' }); // Simple dedup by name for now
            }

            // We are NOT saving the incomes to DB yet because user might not want to commit to 'finance_wallet' updates yet.
            // But we will fulfill the contract of "Lançar Sistema" by saving the Goals which is the core output.

            onFinish();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto font-sans">
            <div className="max-w-md mx-auto min-h-screen py-10 px-6 flex flex-col pt-20">

                {/* Progress Bar */}
                <div className="fixed top-0 left-0 w-full h-1 bg-slate-900 z-50">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
                </div>

                {/* --- STEPS --- */}

                {/* STEP 1: BASE SÓLIDA */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Base Sólida</h2>
                            <p className="text-slate-400 text-sm mt-2">Vamos começar pelo que é certo.<br />O que cai na conta todo mês sem falta?</p>
                        </div>

                        <div className="space-y-4">
                            <InputGroup label="Renda Fixa (Ele)" value={salaryHe} setValue={setSalaryHe} />
                            <InputGroup label="Renda Fixa (Ela)" value={salaryShe} setValue={setSalaryShe} />
                            <InputGroup label="Sobrevivência (Custos Fixos Casa)" value={fixedCost} setValue={setFixedCost} />
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-500 ${safeSurplus > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                                {safeSurplus > 0 ? 'Sobra Garantida' : 'Déficit Atual'} (Antes Dívidas)
                            </span>
                            <div className={`text-3xl font-black mt-1 ${safeSurplus > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                R$ {safeSurplus.toLocaleString()}
                            </div>
                        </div>

                        <NavButton onClick={() => setStep(2)} />
                    </div>
                )}

                {/* STEP 2: ACELERADOR */}
                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <Zap className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Acelerador</h2>
                            <p className="text-slate-400 text-sm mt-2">Agora, o potencial.<br />O que estamos construindo para 2026?</p>
                        </div>

                        <div className="space-y-4">
                            <InputGroup label="Previsão Freelocal (Conservadora)" value={incomeFreelocal} setValue={setIncomeFreelocal} />
                            <InputGroup label="Extras / Bicos (Média)" value={incomeExtra} setValue={setIncomeExtra} />
                        </div>

                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase max-w-[150px]">Estes valores já estão acontecendo?</span>
                            <button
                                onClick={() => setIsAcceleratedNow(!isAcceleratedNow)}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${isAcceleratedNow ? 'bg-amber-500 text-slate-900 shadow-amber-500/20 shadow-lg' : 'bg-slate-800 text-slate-500'}`}
                            >
                                {isAcceleratedNow ? 'Sim, Confirmado' : 'Não, é Meta'}
                            </button>
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center opacity-70">
                            <span className="text-[10px] uppercase font-bold text-amber-500">Potencial Extra</span>
                            <div className="text-2xl font-black text-amber-200">
                                + R$ {totalPotentialIncome.toLocaleString()}
                            </div>
                        </div>

                        <NavButton onClick={() => setStep(3)} />
                    </div>
                )}

                {/* STEP 3: DÍVIDAS (MAPA DE GUERRA) */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Mapa de Guerra</h2>
                            <p className="text-slate-400 text-sm mt-2">Dívidas Individuais & Parcelas</p>
                        </div>

                        {/* Debt List */}
                        <div className="space-y-3">
                            {debts.map(debt => (
                                <div key={debt.id} className="flex justify-between items-center bg-rose-950/20 p-3 rounded-xl border border-rose-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        <div>
                                            <p className="text-sm font-bold text-rose-200">{debt.name}</p>
                                            {debt.isEstimated && <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold">Estimado</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <div className="text-sm font-bold text-white">R$ {debt.total}</div>
                                            <div className="text-[10px] text-rose-400">-{debt.monthly}/mês</div>
                                        </div>
                                        <button onClick={() => setDebts(debts.filter(d => d.id !== debt.id))} className="text-slate-600 hover:text-rose-500"><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Debt Form */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-3">
                            <input className="w-full bg-transparent border-b border-white/10 p-2 text-sm text-white focus:outline-none focus:border-rose-500 placeholder:text-slate-600 font-bold"
                                placeholder="Nome (Ex: Visa Dele)" value={newDebtName} onChange={e => setNewDebtName(e.target.value)} />
                            <div className="grid grid-cols-2 gap-3">
                                <input className="bg-transparent border-b border-white/10 p-2 text-sm text-white focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                                    type="number" placeholder="Total Restante" value={newDebtTotal} onChange={e => setNewDebtTotal(e.target.value)} />
                                <input className="bg-transparent border-b border-white/10 p-2 text-sm text-white focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                                    type="number" placeholder="Parcela Mensal" value={newDebtMonthly} onChange={e => setNewDebtMonthly(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${newDebtEstimated ? 'bg-rose-500 border-rose-500' : 'border-slate-600'}`}
                                        onClick={() => setNewDebtEstimated(!newDebtEstimated)}>
                                        {newDebtEstimated && <CheckCircle2 size={10} className="text-white" />}
                                    </div>
                                    Valor Incerto / Estimado?
                                </label>
                                <button onClick={handleAddDebt} className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase rounded-lg hover:bg-rose-500">Adicionar</button>
                            </div>
                        </div>

                        {/* Bravo Parcel Check */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Rocket size={14} /> Parcela Bravo</h3>
                            <InputGroup label="Valor Investimento Mensal (Alvo)" value={bravoParcel} setValue={setBravoParcel} placeholder="1000" />
                        </div>

                        <NavButton onClick={() => setStep(4)} />
                    </div>
                )}

                {/* STEP 4: SONHOS */}
                {step === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Órbita 2026</h2>
                            <p className="text-slate-400 text-sm mt-2">Onde queremos chegar?</p>
                        </div>

                        <div className="space-y-4">
                            <InputGroup label="Carro Novo (Valor)" value={goalCar} setValue={setGoalCar} />
                            <InputGroup label="Moto (Valor)" value={goalMoto} setValue={setGoalMoto} />
                            <InputGroup label="Viagem (Valor)" value={goalTravel} setValue={setGoalTravel} />
                        </div>

                        <div className="p-6 bg-cyan-900/20 rounded-2xl border border-cyan-500/20 text-center">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Custo da Órbita Completa</span>
                            <div className="text-4xl font-black text-white mt-2">
                                R$ {totalDreamsAmount.toLocaleString()}
                            </div>
                        </div>

                        <NavButton onClick={() => setStep(5)} label="Calcular Rotas" />
                    </div>
                )}

                {/* STEP 5: RESULTADO DUPLO */}
                {step === 5 && (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-20">
                        <div className="text-center">
                            <Rocket className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Plano de Voo</h2>
                            <p className="text-slate-400 text-sm mt-2">Duas rotas possíveis para vocês.</p>
                        </div>

                        {/* Scenario A: Safe */}
                        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20"><ShieldCheck size={48} /></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Cenário Padrão (Seguro)</h3>

                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Capacidade de Ataque</p>
                                    <p className="text-2xl font-black text-white">R$ {capacitySafe.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    {monthsFreedomSafe < 60 ? (
                                        <>
                                            <p className="text-[10px] text-slate-400 uppercase">Dívidas Zero</p>
                                            <p className="text-lg font-bold text-emerald-400">{dateFreedomSafe.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase()}</p>
                                        </>
                                    ) : <span className="text-rose-500 text-xs font-bold">Risco Crítico</span>}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                                Só com salários, vocês realizam os sonhos em <strong className="text-white">{monthsDreamsSafe < 99 ? dateDreamsSafe.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : "---"}</strong>.
                            </div>
                        </div>

                        {/* Scenario B: Turbo */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-500/30 relative overflow-hidden shadow-2xl shadow-cyan-900/20">
                            <div className="absolute top-0 right-0 p-3 opacity-30 text-cyan-300"><Zap size={48} /></div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-4">Cenário Acelerado (Turbo)</h3>

                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] text-cyan-200/70 uppercase">Capacidade de Ataque</p>
                                    <p className="text-3xl font-black text-white">R$ {capacityTurbo.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-cyan-200/70 uppercase">Dívidas Zero</p>
                                    <p className="text-xl font-bold text-white">{dateFreedomTurbo.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-cyan-500/30 text-xs text-cyan-100/80">
                                Batendo as metas extras, vocês antecipam tudo para <strong className="text-white text-sm bg-cyan-500/20 px-2 py-0.5 rounded">{dateDreamsTurbo.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>!
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-5 bg-white hover:bg-slate-200 text-slate-950 font-black uppercase tracking-[0.2em] rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : 'LANÇAR SISTEMA 🚀'}
                        </button>
                    </div>
                )}


            </div>
        </div>
    );
};

// UI Components Helpers
const InputGroup = ({ label, value, setValue, placeholder = "0" }: any) => (
    <div className="block">
        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block pl-2">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
            <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white font-bold outline-none focus:border-cyan-500 transition-colors"
            />
        </div>
    </div>
);

const NavButton = ({ onClick, label = "Próximo" }: any) => (
    <button onClick={onClick} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 mt-4">
        {label} <ChevronRight size={16} />
    </button>
);
