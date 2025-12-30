
import React, { useState } from 'react';
import { Fuel, Zap, ArrowRightLeft, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient.ts';

interface QuickActionsProps {
  onSuccess: () => void;
}

export const QuickActions = ({ onSuccess }: QuickActionsProps) => {
  const [activeModal, setActiveModal] = useState<'bravo' | 'freelocal' | 'transfer' | null>(null);
  const [value, setValue] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (activeModal === 'bravo') {
        await supabase.from('finance_entries').insert([{
          amount: value,
          category: 'BRAVO_FUEL',
          origin: 'PERSONAL',
          type: 'EXPENSE',
          description: 'Abastecimento Bravo'
        }]);
      } else if (activeModal === 'freelocal') {
        await supabase.from('finance_entries').insert([{
          amount: value,
          category: 'SUBSCRIPTION',
          origin: 'FREELOCAL',
          type: 'INCOME',
          description: 'Nova Venda Freelocal'
        }]);
      } else if (activeModal === 'transfer') {
        // Logica simplificada de transferencia
        // Num app real, usaria uma RPC ou transação
        alert("Transferindo R$ " + value + " da Carteira para o Cofre...");
      }
      onSuccess();
      setActiveModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4 font-bold flex items-center gap-2">Comandos de Operação</h3>
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setActiveModal('bravo')} className="flex-1 glass p-4 rounded-3xl border-cyan-500/20 hover:border-cyan-500/50 transition-all flex flex-col items-center gap-2 group">
          <Fuel className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-[10px] font-bold uppercase">Abasteci o Bravo</span>
        </button>
        <button onClick={() => setActiveModal('freelocal')} className="flex-1 glass p-4 rounded-3xl border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2 group">
          <Zap className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-[10px] font-bold uppercase">Entrada Freelocal</span>
        </button>
        <button onClick={() => setActiveModal('transfer')} className="flex-1 glass p-4 rounded-3xl border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col items-center gap-2 group">
          <ArrowRightLeft className="text-amber-400 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-[10px] font-bold uppercase">Mover p/ Cofre</span>
        </button>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold uppercase tracking-tighter">
                {activeModal === 'bravo' ? 'Log de Combustível' : activeModal === 'freelocal' ? 'Receita SaaS' : 'Injeção no Cofre'}
              </h4>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Valor: R$ {value}</label>
                <input type="range" min="10" max="1000" step="10" value={value} onChange={(e) => setValue(parseInt(e.target.value))} className="w-full" />
              </div>
              
              <button 
                onClick={handleAction} 
                disabled={loading}
                className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />} 
                {loading ? 'PROCESSANDO...' : 'EXECUTAR COMANDO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
