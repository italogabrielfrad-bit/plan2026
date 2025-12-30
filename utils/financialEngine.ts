
/**
 * Financial Engine - Antigravity Project
 * Regras de negócio e lógica matemática pura para substituir IA.
 */

// --- 3. Estrutura de Metas Fixas ---
export enum GoalType {
    CAR_PURCHASE = 'CAR_PURCHASE',
    MOTORCYCLE_PURCHASE = 'MOTORCYCLE_PURCHASE',
    TRAVEL_GOAL = 'TRAVEL_GOAL',
    DEBT_CLEARANCE = 'DEBT_CLEARANCE',
    HOUSE_PURCHASE = 'HOUSE_PURCHASE',
    OTHER = 'OTHER'
}

export interface ProcessedGoal {
    slug: string;
    name: string;
    target_amount: number;
    current_amount: number; // Calculated from transactions
    percentage: number;
    priority: number;
    icon?: any; // For UI mapping if needed
}

export interface Transaction {
    amount: number;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    origin?: string;
}

/**
 * 1. A Lógica de Mensagens (O "Coach" Estático)
 * Retorna uma mensagem motivacional baseada no progresso e prazo.
 * 
 * @param progressPercent Porcentagem atual do objetivo (0 a 100)
 * @param daysRemaining Dias restantes para o prazo final
 * @param isBehindSchedule (Opcional) Flag manual se o usuário já sabe que está atrasado
 */
export const getMotivationalMessage = (
    progressPercent: number,
    daysRemaining: number,
    isBehindSchedule: boolean = false
): string => {
    // Regras de Prioridade

    // 1. Atraso (Crítico)
    if (isBehindSchedule || daysRemaining < 0) {
        return "⚠️ Atenção: Estamos atrasados na meta. Hora de ativar o Modo Bunker?";
    }

    // 2. Início da Jornada
    if (progressPercent < 10) {
        return "O início é a parte mais difícil. Mantenham o foco no Plano!";
    }

    // 3. Meio do Caminho
    if (progressPercent > 50 && progressPercent < 80) {
        return "Metade do caminho já foi! A gravidade está diminuindo.";
    }

    // 4. Quase lá (Reta Final)
    if (progressPercent >= 80 && progressPercent < 100) {
        return "🚀 Voando baixo! Continuem assim que 2026 é nosso.";
    }

    // 5. Concluído
    if (progressPercent >= 100) {
        return "Missão Cumprida! A gravidade foi superada.";
    }

    // Fallback (Progresso entre 10% e 50% sem atraso explícito)
    return "Consistência é a chave. Continue acumulando.";
};

/**
 * Resultado da Calculadora de Viabilidade
 */
interface ViabilityResult {
    possible: boolean;
    message: string;
    requiredMonthlyContribution: number;
}

/**
 * 2. A Calculadora de Viabilidade
 * Verifica se é possível atingir a meta com os parâmetros atuais.
 * 
 * @param goalAmount Valor total da meta
 * @param currentSaved Valor já salvo
 * @param monthlyContribution Quanto o usuário guarda por mês atualmente
 * @param deadlineDate Data limite (Objeto Date)
 */
export const calculateViability = (
    goalAmount: number,
    currentSaved: number,
    monthlyContribution: number,
    deadlineDate: Date
): ViabilityResult => {
    const today = new Date();

    // Diferença em meses (aproximada)
    const yearsDiff = deadlineDate.getFullYear() - today.getFullYear();
    const monthsDiff = deadlineDate.getMonth() - today.getMonth();
    const monthsRemaining = (yearsDiff * 12) + monthsDiff;

    // Se já passou do prazo ou é o mesmo mês
    if (monthsRemaining <= 0) {
        if (currentSaved >= goalAmount) {
            return { possible: true, message: "Prazo finalizado. Meta atingida!", requiredMonthlyContribution: 0 };
        }
        return { possible: false, message: "O prazo já expirou.", requiredMonthlyContribution: 0 };
    }

    const remainingAmount = goalAmount - currentSaved;
    const projectedTotal = currentSaved + (monthlyContribution * monthsRemaining);

    // Cenário 1: Vai dar certo com a contribuição atual?
    if (projectedTotal >= goalAmount) {
        // Cálculo de quanto sobra ou se está "em cima"
        const surplus = projectedTotal - goalAmount;
        return {
            possible: true,
            message: surplus > 0
                ? `Sucesso! Você excederá a meta em R$ ${surplus.toLocaleString('pt-BR')} nesse ritmo.`
                : "Você atingirá a meta exatamente no prazo.",
            requiredMonthlyContribution: monthlyContribution
        };
    }

    // Cenário 2: Não vai dar. Quanto precisa?
    const requiredMonthly = remainingAmount / monthsRemaining;
    const shortfall = requiredMonthly - monthlyContribution;

    return {
        possible: false,
        message: `Faltam R$ ${shortfall.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês para bater a meta a tempo.`,
        requiredMonthlyContribution: requiredMonthly
    };
};

/**
 * 3. Calculadora de Progresso das Metas
 * Processa as transações para calcular o saldo atual de cada meta.
 * - Soma entradas específicas para metas.
 * - Redireciona "Economia Parcela Bravo" para a meta de maior prioridade (ex: Dívidas).
 */
export const calculateGoalProgress = (
    goals: any[],
    transactions: Transaction[]
): ProcessedGoal[] => {
    // 1. Calculate Total "Bravo Savings" (The magic bucket)
    const bravoSavingsTotal = transactions
        .filter(t => t.category === 'BRAVO_SAVINGS' && t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

    // 2. Identify Highest Priority Goal (Lowest number = Highest priority)
    // usually Debt (1) or Car (2)
    const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);
    const highestPriorityGoalSlug = sortedGoals.length > 0 ? sortedGoals[0].slug : null;

    // 3. Process each goal
    return goals.map(goal => {
        // Base amount from direct contributions (if any specific category existed, logic would be here)
        // For now, let's assume goals might have a 'current_amount' in DB or we use specific categories.
        // As per instruction: "Dinheiro Guardado + Economia Parcela Bravo = Saldo da Meta"
        // Let's assume 'current_amount' from DB is the "Dinheiro Guardado" (Manual updates).

        let calculatedAmount = goal.current_amount || 0;

        // Add Bravo Savings if this is the priority goal
        if (goal.slug === highestPriorityGoalSlug) {
            calculatedAmount += bravoSavingsTotal;
        }

        // Calculate Percentage
        let percentage = 0;
        if (goal.target_amount > 0) {
            // Debt Logic is purely visual in UI, backend value is just 'amount paid/accumulated'
            percentage = (calculatedAmount / goal.target_amount) * 100;
        }

        return {
            ...goal,
            current_amount: calculatedAmount,
            percentage: Math.min(percentage, 100) // UI treats 100% as full usually
        };
    });
};
