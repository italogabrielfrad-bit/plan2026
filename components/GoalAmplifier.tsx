
import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, X } from 'lucide-react';
import { ProcessedGoal } from '../utils/financialEngine';
import { generateDailyChallenge, DailyChallenge } from '../utils/amplifier';

interface GoalAmplifierProps {
    goals: ProcessedGoal[];
    onAccept: (challenge: DailyChallenge) => void;
}

export const GoalAmplifier = ({ goals, onAccept }: GoalAmplifierProps) => {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Generate challenge on mount
        const c = generateDailyChallenge(goals);

        // Minimal Logic to check "Skip" state (Local Storage simulation)
        // In a real app we would check localStorage.getItem('last_skip_date')
        // For this demo, always show if valid.

        if (c) setChallenge(c);
    }, [goals]);

    if (!challenge || !isVisible) return null;

    const handleSkip = () => {
        setIsVisible(false);
        // Save skip timestamp
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] p-6 mb-8 group animate-in slide-in-from-top duration-700">
            {/* Backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-600 opacity-90 transition-all duration-300 group-hover:scale-105"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                            <Zap size={10} className="fill-white" /> {challenge.title}
                        </span>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight drop-shadow-md">
                        {challenge.message}
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white tracking-tighter drop-shadow-xl">
                            R$ {challenge.amount}
                        </span>
                        <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                            Meta do Dia
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-3 rounded-xl bg-black/20 text-white/70 text-xs font-bold uppercase hover:bg-black/30 transition-colors"
                    >
                        Hoje não
                    </button>
                    <button
                        onClick={() => onAccept(challenge)}
                        className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-white text-rose-600 text-sm font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                    >
                        Aceitar <ArrowRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
