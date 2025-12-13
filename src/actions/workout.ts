// app/_actions/workout.ts
'use server'
import { db } from '@/lib/prisma';
// 💡 CORREÇÃO APLICADA AQUI: Removemos os Enums da importação 'type'
// Eles devem ser importados como valores abaixo para serem usados no runtime.
// import type { ActivityType, Status } from '@prisma/client'; // LINHA REMOVIDA/MODIFICADA
import { revalidatePath } from 'next/cache'

// 💡 NOVA IMPORTAÇÃO DOS ENUMS COMO VALORES PARA USO NO RUNTIME
import { ActivityType, Status, Workout } from '@prisma/client';


// --- TIPAGEM ---
// Note que você pode simplificar a tipagem da interface usando os Enums importados.
interface CreateWorkoutData {
  date: Date;
  // Usando os Enums importados (que são exportados como strings) para tipagem
  type: ActivityType;
  status: Status;
  description?: string;
  plannedDistanceKm?: number;
  actualDistanceKm?: number;
  plannedTimeMin?: number;
  actualTimeMin?: number;
  plannedPace?: string;
  actualPace?: string;
  exercises?: { name: string; sets: string }[];
}

/**
 * Cria um novo registro de treino no banco de dados.
 * @param {CreateWorkoutData} data - Os dados do novo treino.
 * @returns {Promise<{success: true, data: Workout} | {success: false, error: string}>}
 */
export async function createWorkout(data: CreateWorkoutData) {
  try {

    // 💡 Mapeamento de String para Objeto Enum do Prisma (mantido)
    // O TypeScript já garante que data.status e data.type são strings válidas dos Enums.
    const prismaStatus = Status[data.status as keyof typeof Status];
    const prismaType = ActivityType[data.type as keyof typeof ActivityType];

    // Se por algum motivo a string for inválida (embora a validação do hook deva evitar isso)
    if (!prismaStatus || !prismaType) {
      return { success: false, error: "Tipo ou Status de Atividade inválido." };
    }

    // 1. Prepara o objeto base do treino, usando AGORA o OBJETO ENUM mapeado
    const workoutData = {
      date: data.date,
      type: prismaType,
      status: prismaStatus,
      description: data.description,

      // Campos de corrida
      plannedDistanceKm: data.plannedDistanceKm,
      actualDistanceKm: data.actualDistanceKm,
      plannedTimeMin: data.plannedTimeMin,
      actualTimeMin: data.actualTimeMin,
      plannedPace: data.plannedPace,
      actualPace: data.actualPace,
    };

    // 2. Cria o registro no banco
    const newWorkout = await db.workout.create({
      data: {
        ...workoutData,
        // Se for musculação e tiver exercícios, cria eles na mesma transação
        exercises: data.type === ActivityType.WEIGHT_TRAINING && data.exercises
          ? {
            create: data.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets
            }))
          }
          : undefined
      },
    });

    // 3. Revalida o cache
    revalidatePath('/');

    return { success: true, data: newWorkout };

  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return { success: false, error: "Erro ao salvar o treino." };
  }
}


/**
 * Atualiza um registro de treino existente no banco de dados.
 * @param {string} id - O ID do treino a ser atualizado.
 * @param {CreateWorkoutData} data - Os novos dados do treino.
 * @returns {Promise<{success: true, data: Workout} | {success: false, error: string}>}
 */
export async function updateWorkout(id: string, data: CreateWorkoutData) {
  try {
    // Validação básica
    if (!data.status || !data.type) {
      return { success: false, error: "O Tipo e o Status de Atividade devem ser selecionados." };
    }

    // Mapeamento de String para Objeto Enum (REUTILIZADO)
    const prismaStatus = Status[data.status as keyof typeof Status];
    const prismaType = ActivityType[data.type as keyof typeof ActivityType];

    if (!prismaStatus || !prismaType) {
      return { success: false, error: "Falha interna no mapeamento dos tipos de atividade." };
    }

    // 1. Prepara o objeto de dados de atualização
    const workoutData = {
      date: data.date,
      type: prismaType,
      status: prismaStatus,
      description: data.description,

      // Campos de corrida
      plannedDistanceKm: data.plannedDistanceKm,
      actualDistanceKm: data.actualDistanceKm,
      plannedTimeMin: data.plannedTimeMin,
      actualTimeMin: data.actualTimeMin,
      plannedPace: data.plannedPace,
      actualPace: data.actualPace,
    };

    // --- 2. GESTÃO DE TRANSAÇÃO (OPCIONAL, MAS RECOMENDADO PARA EXERCÍCIOS) ---

    // Se for musculação e tiver exercícios, precisamos de uma transação
    if (data.type === ActivityType.WEIGHT_TRAINING && data.exercises) { // 💡 Uso do Enum como Valor

      // a) Deleta todos os exercícios antigos associados a este treino
      const deleteOldExercises = db.exercise.deleteMany({
        where: { workoutId: id },
      });

      // b) Cria os novos exercícios
      const createNewExercises = db.workout.update({
        where: { id },
        data: {
          ...workoutData,
          exercises: {
            create: data.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets
            })),
          },
        },
      });

      // Executa ambas as operações em uma transação para garantir atomicidade
      const [_, updatedWorkout] = await db.$transaction([
        deleteOldExercises,
        createNewExercises
      ]);

      revalidatePath('/');
      return { success: true, data: updatedWorkout };

    } else {
      // 3. Se não for musculação, atualiza diretamente
      const updatedWorkout = await db.workout.update({
        where: { id },
        data: {
          ...workoutData,
          // Garante que a lista de exercícios é limpa se mudou de WEIGHT_TRAINING para outro tipo
          exercises: {
            deleteMany: {}, // Limpa qualquer exercício remanescente no banco
          },
        },
      });

      revalidatePath('/');
      return { success: true, data: updatedWorkout };
    }

  } catch (error) {
    console.error(`Erro ao atualizar treino ${id}:`, error);
    return { success: false, error: "Erro ao salvar as alterações do treino." };
  }
}

/**
 * Exclui um registro de treino existente do banco de dados.
 * @param {string} id - O ID do treino a ser excluído.
 * @returns {Promise<{success: true, data: Workout} | {success: false, error: string}>}
 */
export async function deleteWorkout(id: string) {
  try {
    const deletedWorkout = await db.workout.delete({
      where: { id },
    });

    // Revalida o cache para atualizar a UI
    revalidatePath('/');

    return { success: true, data: deletedWorkout };

  } catch (error) {
    console.error(`Erro ao excluir treino ${id}:`, error);
    return { success: false, error: "Não foi possível excluir o treino. Ele pode não existir mais." };
  }
}