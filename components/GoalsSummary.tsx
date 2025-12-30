
import React from 'react';
import { Target, AlertCircle } from 'lucide-react';
import { ProcessedGoal } from '../utils/financialEngine';

interface GoalsSummaryProps {
    goals: ProcessedGoal[];
}

export const GoalsSummary = ({ goals }: GoalsSummaryProps) => {
    // Show only top 4 or all? Layout supports 4 well.
    const displayGoals = goals.sort((a, b) => a.priority - b.priority).slice(0, 4);

    if (displayGoals.length === 0) return (
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col items-center justify-center text-center gap-2 py-8 min-h-[200px]">
            <Target className="text-slate-700 mb-2" size={32} />
            <p className="text-xs font-bold text-slate-500">Nenhuma meta configurada</p>
        </div>
    );

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-xs uppercase tracking-[0.4em] text-slate-500 font-bold">Progresso Estratégico</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {displayGoals.map((goal) => {
                    const isDebt = goal.slug === 'debt';
                    const percent = goal.percentage;
                    // Visual percent logic same as GoalsView
                    const visualPercent = isDebt ? 100 - percent : percent;

                    return (
                        <div key={goal.slug} className="glass p-4 rounded-[1.5rem] border-slate-800/50 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px]">
                                    {goal.name}
                                </span>
                                {isDebt && <AlertCircle size={10} className="text-rose-500" />}
                            </div>

                            <div className="flex items-end gap-1">
                                <span className={`text-xl font-black ${isDebt ? 'text-rose-500' : 'text-cyan-400'}`}>
                                    {Math.round(percent)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 mb-1">%</span>
                            </div>

                            <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isDebt ? 'bg-rose-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${Math.max(visualPercent, 5)}%` }} // Min 5% for visibility
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
