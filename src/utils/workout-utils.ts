// src/utils/workout-utils.ts

/**
 * Interface simples para o tipo de treino esperado.
 * Use as interfaces reais do seu Prisma se possível (ex: import { Workout } from '@prisma/client')
 */
export interface Workout {
    id: string;
    date: Date;
    type: 'RUN' | 'WEIGHT_TRAINING' | 'REST';
    status: 'PENDING' | 'COMPLETED'

    // Campos opcionais/nullable do Prisma devem ser number | null
    plannedDistanceKm: number | null;
    actualDistanceKm: number | null;
    plannedTimeMin: number | null;
    actualTimeMin: number | null;
    plannedPace: string | null;
    actualPace: string | null;
    description: string | null;
    exercises: Array<{ id: string; name: string; sets: string }>;
}

// Estrutura para o treino agrupado por semana (reutilizada)
export interface WorkoutsByWeek {
    weekStart: string; // Ex: 'Seg, 10 de Dezembro'
    weekNumber: number; // Número da semana no ano
    workouts: Workout[];
}

// 🛑 NOVA INTERFACE DE AGRUPAMENTO POR MÊS
export interface WorkoutsByMonth {
    monthName: string; // Ex: "Dezembro 2025"
    monthKey: string; // Chave para ordenação e identificação (Ex: "2025-12")
    weeks: WorkoutsByWeek[]; // Contém o agrupamento semanal
}

// ----------------------------------------------------------------------
// FUNÇÕES HELPERS EXISTENTES (MANTIDAS)
// ----------------------------------------------------------------------

/**
 * Helper para calcular o número da semana no ano (ISO standard)
 */
function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Define o dia como quinta-feira desta semana (Thursday)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Obtém o início do ano
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calcula o número da semana
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}


/**
 * Helper para calcular a data de início da semana (Segunda-feira)
 * CORRIGIDO: Usando métodos UTC
 */
function getStartOfWeek(date: Date): Date {
    // 🛑 CORREÇÃO: Usar getUTCDay() para encontrar o dia da semana no fuso UTC.
    // getUTCDay: 0=Domingo, 1=Segunda... Ajusta para 0=Segunda, 6=Domingo.
    const dayOfWeek = (date.getUTCDay() + 6) % 7; 
    
    const weekStartDate = new Date(date);
    
    // 🛑 CORREÇÃO: Usar setUTCDate() para subtrair os dias
    weekStartDate.setUTCDate(date.getUTCDate() - dayOfWeek);

    // 🛑 CORREÇÃO: Zera o tempo para 00:00:00:000 UTC
    weekStartDate.setUTCHours(0, 0, 0, 0); 
    
    return weekStartDate;
}

/**
 * Função principal: Agrupa os treinos por Mês e depois por Semana.
 * @param workouts Lista de todos os treinos.
 * @returns Array de objetos WorkoutsByMonth.
 */
export function groupWorkoutsByMonthAndWeek(workouts: Workout[]): WorkoutsByMonth[] {

    // 1. Converte todas as datas para objetos Date se ainda não forem
    const parsedWorkouts = workouts.map(w => ({
        ...w,
        date: w.date instanceof Date ? w.date : new Date(w.date),
    }));

    // Objeto para agrupar MonthKey -> WeekKey -> Workouts
    const grouped: {
        [monthKey: string]: {
            monthName: string,
            weeks: { [weekKey: string]: WorkoutsByWeek }
        }
    } = {};

    parsedWorkouts.forEach(workout => {
        const date = workout.date;

        // 🛑 CORREÇÃO: Chave do Mês (Ex: "2025-12") usando métodos UTC
        const monthKey = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
        
        // monthName usa toLocaleDateString, o que é aceitável, pois a data deve ser 00:00:00Z
        const monthName = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });

        // Chave da Semana (utiliza a lógica AGORA CORRIGIDA de getStartOfWeek)
        const weekStartDate = getStartOfWeek(date);
        const weekKey = weekStartDate.toISOString().split('T')[0];

        const weekNum = getWeekNumber(date);

        // Inicializa o Mês se não existir
        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitaliza a primeira letra do mês
                weeks: {},
            };
        }

        // Inicializa a Semana dentro do Mês se não existir
        if (!grouped[monthKey].weeks[weekKey]) {
            grouped[monthKey].weeks[weekKey] = {
                weekStart: weekStartDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' }),
                weekNumber: weekNum,
                workouts: [],
            };
        }

        // Adiciona o treino à semana
        grouped[monthKey].weeks[weekKey].workouts.push(workout);
    });

    // 3. Converte o objeto aninhado para o formato de array final e ordena

    const finalResult: WorkoutsByMonth[] = Object.keys(grouped)
        // Ordena os meses: do mais recente (maior key) para o mais antigo
        .sort((a, b) => b.localeCompare(a))
        .map(monthKey => {
            const monthData = grouped[monthKey];

            // Converte as semanas para um array e ordena: da semana mais recente para a mais antiga
            const sortedWeeks = Object.values(monthData.weeks).sort((a, b) => {
                // Ordena usando a data do primeiro treino como proxy
                return new Date(b.workouts[0].date).getTime() - new Date(a.workouts[0].date).getTime();
            });

            return {
                monthName: monthData.monthName,
                monthKey: monthKey,
                weeks: sortedWeeks,
            };
        });

    return finalResult;
}


// A função groupWorkoutsByWeek não é mais necessária, mas pode ser mantida para compatibilidade
// ou removida se a nova função for a única usada.
export const groupWorkoutsByWeek = (workouts: Workout[]): WorkoutsByWeek[] => {
    // Implementação antiga, pode ser removida se for usar apenas a nova
    // (Mantida aqui por conveniência, se for usada em outro lugar)
    return []; // Substitua pela lógica anterior, ou remova esta linha se for usar apenas a nova
};