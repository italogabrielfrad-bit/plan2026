
import { ProcessedGoal } from './financialEngine';

export interface DailyChallenge {
    title: string;
    message: string;
    amount: number;
    category: string;
    description: string;
    type: 'INCOME' | 'EXPENSE'; // Usually Expense (Saving) or Income (Bravo)? 
    // Logic: Proactive saving is spending money INTO the savings account or allocating income?
    // User flow: "Confirma o pagamento". Usually implies "Expense" from Wallet -> Vault. Or "Income" to Goal?
    // In this app, "Bravo Savings" is an INCOME category (Source of funds allocated to goals).
    // But if the user is "spending" from their daily wallet to save, it's effectively a transfer.
    // However, the WalletView uses "Economia Parcela Bravo" as an INCOME (Money found/saved).
    // Let's stick to that pattern: It's an INCOME entry (Found money/Extra saving).
}

export const generateDailyChallenge = (goals: ProcessedGoal[]): DailyChallenge | null => {
    // 1. Filter active goals
    const activeGoals = goals.filter(g => g.current_amount < g.target_amount).sort((a, b) => a.priority - b.priority);

    // Fallback if no goals (so user ALWAYS sees the Amplifier)
    if (activeGoals.length === 0) {
        return {
            title: "Desafio Inicial",
            message: "Que tal começar seu Fundo de Emergência?",
            amount: 50,
            category: 'BRAVO_SAVINGS',
            description: "Primeiro passo da liberdade",
            type: 'INCOME'
        };
    }

    const targetGoal = activeGoals[0]; // Highest priority
    const today = new Date();
    const day = today.getDate();
    const weekDay = today.getDay(); // 0 = Sunday, 5 = Friday

    // 2. Determine Context
    const isPayDay = (day === 5 || day === 20);
    const isFriday = (weekDay === 5);
    const isWeekend = (weekDay === 0 || weekDay === 6);

    // 3. Calculate "Gap"
    // Simple logic: We need to save X per day.
    // Let's assume deadline is 2026.
    const deadline = new Date('2026-01-01');
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / msPerDay);
    const remaining = targetGoal.target_amount - targetGoal.current_amount;

    // Safety check div/0
    const safeDays = daysLeft > 0 ? daysLeft : 1;
    let baseDaily = remaining / safeDays;

    // Minimum reasonable challenge
    if (baseDaily < 5) baseDaily = 5;

    let challenge: DailyChallenge = {
        title: "Missão do Dia",
        message: "Vamos manter o foco.",
        amount: Math.ceil(baseDaily),
        category: 'BRAVO_SAVINGS',
        description: `Boost: ${targetGoal.name}`,
        type: 'INCOME' // Treated as "Economia"
    };

    // 4. Boost Logic ( The "Pulo do Gato" )
    if (isPayDay) {
        challenge.title = "🔥 Boost de Pagamento";
        challenge.message = `Hoje é dia de avançar forte no objetivo ${targetGoal.name}!`;
        challenge.amount = Math.ceil(baseDaily * 5); // 5x on paydays
    } else if (isFriday) {
        challenge.title = "🚀 Sextou no Foco";
        challenge.message = "Antes de gastar no final de semana, garanta o sonho.";
        challenge.amount = Math.ceil(baseDaily * 2); // 2x on Fridays
    } else if (isWeekend) {
        challenge.title = "🛡️ Desafio do Fim de Semana";
        challenge.message = "Que tal trocar um gasto supérfluo por liberdade?";
        challenge.amount = 30; // Fixed small challenge
    } else {
        // Normal Day
        challenge.title = "☕ Desafio do Café";
        challenge.message = `Uma pequena economia hoje para o ${targetGoal.name} amanhã.`;
        challenge.amount = Math.ceil(baseDaily); // Normal daily
        if (challenge.amount < 15) challenge.amount = 15; // Min floor
    }

    // Round to nice numbers (5 or 0)
    challenge.amount = Math.ceil(challenge.amount / 5) * 5;

    return challenge;
};
