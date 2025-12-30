
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  TrendingUp, Zap, Target, Car, Home, Plane, AlertCircle, ShieldCheck,
  BrainCircuit, Lock, Fuel, Utensils, Scissors, ArrowRightLeft, Clock,
  Shield, Wallet, Coins, Map, ShieldAlert, Sword, Flame, Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabaseClient.ts';

import { BottomNav, Tab } from './components/BottomNav.tsx';
import { SideNav } from './components/SideNav.tsx';
import { WalletView } from './components/WalletView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SubscriptionsView } from './components/SubscriptionsView.tsx';
import { OnboardingView } from './components/OnboardingView.tsx';

import { getMotivationalMessage, calculateViability, calculateGoalProgress, ProcessedGoal } from './utils/financialEngine.ts';
import { SetupView } from './components/SetupView.tsx';
import { GoalsView } from './components/GoalsView.tsx';
import { GoalsSummary } from './components/GoalsSummary.tsx';
import { GoalAmplifier } from './components/GoalAmplifier.tsx';
import { LoginView } from './components/LoginView.tsx';
import { DailyChallenge } from './utils/amplifier.ts';

// --- Types ---
type PlanMode = 'A' | 'B' | 'C';

interface Goal {
  slug: string;
  name: string;
  current_amount: number;
  target_amount: number;
  priority: number;
}

interface AppState {
  wallet: number;
  vault: number;
  goals: ProcessedGoal[];
  currentPlan: PlanMode;
  loading: boolean;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    wallet: 0,
    vault: 0,
    goals: [],
    currentPlan: 'B',
    loading: true
  });
  const [advice, setAdvice] = useState<string>("Sincronizando com a rede...");
  const [activeTab, setActiveTab] = useState<Tab>('home'); // Default back to home 'home' usually, but user testing 'onboarding' before. Resetting to 'home' maybe? Or keep existing.
  // Actually, let's keep 'onboarding' if it was the last edit, BUT user wants to see the Amplifier which is on Dashboard.
  // So I'll switch default to 'home' to facilitate testing the new feature.

  // Wallet Preload State
  const [walletPreload, setWalletPreload] = useState<DailyChallenge | null>(null);

  // Auth State
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      // 1. Buscar Metas
      const { data: goalsData } = await supabase.from('goals').select('*').order('priority', { ascending: true });

      // 2. Buscar Estratégia Ativa
      const { data: stratData } = await supabase.from('strategies').select('mode').eq('active', true).single();

      // 3. Buscar Alocações de Cofre
      const { data: vaultData } = await supabase.from('vault_allocations').select('*');

      const wallet = vaultData?.find(v => v.type === 'LIQUIDITY')?.amount || 0;
      const vault = vaultData?.find(v => v.type === 'INVESTMENT')?.amount || 0;

      // Calculate Goals Progress dynamically
      const { data: txData } = await supabase.from('finance_entries').select('*');
      const processedGoals = calculateGoalProgress(goalsData || [], txData || []);

      setState({
        wallet,
        vault,
        goals: processedGoals,
        currentPlan: (stratData?.mode as PlanMode) || 'B',
        loading: false
      });

      // Atualizar conselho com Motor Financeiro (Sem IA)
      generateStaticAdvice(wallet, vault, processedGoals);
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updatePlan = async (mode: PlanMode) => {
    try {
      // Desativa todos e ativa o novo (em produção usaria uma RPC/Trigger)
      await supabase.from('strategies').update({ active: false }).neq('mode', mode);
      await supabase.from('strategies').update({ active: true }).eq('mode', mode);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const generateStaticAdvice = (wallet: number, vault: number, goals: any[]) => {
    // Calculate total progress
    const totalTarget = goals.reduce((acc: number, g: any) => acc + g.target_amount, 0) || 1;
    const totalCurrent = goals.reduce((acc: number, g: any) => acc + g.current_amount, 0);
    const progress = (totalCurrent / totalTarget) * 100;

    // Calculate "days remaining" to 2026 (approx Jan 1st 2026)
    const targetDate = new Date('2026-01-01');
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Is behind? (Simplificacao: se devia ter 50% hoje mas tem menos)
    const isBehind = (diffDays < 365 && progress < 50);

    const message = getMotivationalMessage(progress, diffDays, isBehind);
    setAdvice(message);
  };

  useEffect(() => { fetchData(); }, []);

  const freedomPercentage = useMemo(() => {
    if (state.goals.length === 0) return 0;
    const total = state.goals.reduce((acc, g) => acc + g.target_amount, 0);
    const curr = state.goals.reduce((acc, g) => acc + g.current_amount, 0);
    return Math.round((curr / total) * 100);
  }, [state.goals]);

  if (state.loading && session) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-950">
      <Loader2 className="animate-spin text-cyan-400" size={48} />
      <span className="text-xs font-black tracking-[0.5em] text-slate-500">INIT_SYTEM_ANTIGRAVITY_v2</span>
    </div>
  );

  if (!session) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Desktop SideNav */}
      <SideNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="md:ml-64 p-4 pb-32 md:p-8 md:pb-10 max-w-7xl mx-auto transition-all duration-500">

        {/* -- HOME VIEW -- */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* GOAL AMPLIFIER (DAILY QUEST) */}
            <GoalAmplifier
              goals={state.goals}
              onAccept={(challenge) => {
                setWalletPreload(challenge);
                setActiveTab('wallet');
              }}
            />

            {/* Header / Hero */}
            <header className={`glass p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 border-cyan-500/20 glow-cyan transition-all duration-500 ${state.currentPlan === 'A' ? 'border-amber-500/40 shadow-amber-500/10' : state.currentPlan === 'C' ? 'border-rose-500/40 shadow-rose-500/10' : ''}`}>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 mb-2 font-bold">Protocolo Ativo</h1>
                <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight">Antigravity</h2>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <svg className="w-32 h-32 transform -rotate-90 relative z-10 drop-shadow-2xl">
                    <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/50" />
                    <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={282} strokeDashoffset={282 - (freedomPercentage / 100) * 282} strokeLinecap="round" className="text-cyan-400 transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                  </svg>
                  <div className="absolute flex flex-col items-center z-20">
                    <span className="text-2xl font-black text-white">{freedomPercentage}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-bold">Altitude</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">T-MINUS 2026</span>
                <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums tracking-tighter shadow-cyan-500/20 drop-shadow-lg">425D <span className="text-slate-600">:</span> 14H</div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider mt-2 transition-all shadow-lg ${state.currentPlan === 'A' ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : state.currentPlan === 'B' ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'}`}>
                  MODO {state.currentPlan === 'A' ? 'FÊNIX' : state.currentPlan === 'B' ? 'CRUZEIRO' : 'BUNKER'}
                </div>
              </div>
            </header>

            {/* Vaults Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-8 rounded-[2.5rem] border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><Wallet size={20} /></div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Disponível</h3>
                  </div>
                  <p className="text-5xl font-black text-white tracking-tighter">R$ {state.wallet.toLocaleString()}</p>
                </div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">+R$ {(state.vault * 0.0003).toFixed(2)}/dia</div>
                </div>
                <div className="relative z-10 mt-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Shield size={20} /></div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Reserva / Invest</h3>
                  </div>
                  <p className="text-5xl font-black text-white tracking-tighter">R$ {state.vault.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Placeholder or Mini Goals */}
            <GoalsSummary goals={state.goals} />
          </div>
        )}

        {/* -- WALLET VIEW -- */}
        {activeTab === 'wallet' && (
          <WalletView
            onSuccess={() => {
              fetchData();
              setWalletPreload(null); // Clear preload after success
            }}
            initialData={walletPreload}
          />
        )}

        {/* -- GOALS VIEW -- */}
        {activeTab === 'goals' && (
          <GoalsView />
        )}

        {/* -- REPORTS VIEW -- */}
        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {/* -- FIXED / SUBSCRIPTIONS VIEW -- */}
        {activeTab === 'fixed' && (
          <SubscriptionsView />
        )}

        {/* -- SETUP VIEW -- */}
        {activeTab === 'setup' && (
          <SetupView />
        )}

        {/* -- ONBOARDING / WIZARD -- */}
        {activeTab === 'onboarding' && (
          <OnboardingView onFinish={() => setActiveTab('home')} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
