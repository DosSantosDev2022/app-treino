// src/types/workout.ts

// --- ENUMS ---
// Tipagem dos Enums como String Literals (refletindo os valores do Prisma)

/**
 * Representa os tipos de atividade definidos no schema.prisma.
 * Valores: 'RUN', 'WEIGHT_TRAINING', 'REST'
 */
export type ActivityType = 'RUN' | 'WEIGHT_TRAINING' | 'REST';

/**
 * Representa o status de um treino definido no schema.prisma.
 * Valores: 'PENDING', 'COMPLETED'
 */
export type Status = 'PENDING' | 'COMPLETED';


// --- SUB-MODELO ---
// Tipagem para a criação de um Exercício (usado dentro da WorkoutAction)

/**
 * Interface para os dados de um exercício a ser criado ou atualizado.
 */
export interface ExerciseData {
  id?: string; // Opcional se for criação
  name: string;
  sets: string;
}


// --- DADOS DA ACTION (Entrada) ---
// Tipagem que você usa nas suas Server Actions (ex: createWorkout)

/**
 * Interface para os dados necessários para criar ou atualizar um Workout.
 * Usa as String Literals para os campos type e status.
 */
export interface WorkoutActionData {
  date: Date;
  type: ActivityType; // Usando o nosso tipo ActivityType
  status: Status;     // Usando o nosso tipo Status
  description?: string;

  plannedDistanceKm?: number;
  actualDistanceKm?: number;

  plannedTimeMin?: number;
  actualTimeMin?: number;

  plannedPace?: string;
  actualPace?: string;

  // Dados de exercícios só são necessários para WEIGHT_TRAINING
  exercises?: ExerciseData[];
}