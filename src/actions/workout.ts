// app/_actions/workout.ts
'use server'
import { db } from '@/lib/prisma';
import { ActivityType, Status } from '@prisma/client';
import { revalidatePath } from 'next/cache'

/**
 * @typedef {Object} CreateWorkoutData - Estrutura de dados para criar ou atualizar um treino.
 * @property {Date} date - A data do treino.
 * @property {'RUN' | 'WEIGHT_TRAINING' | 'REST'} type - O tipo de atividade (Corrida, Musculação, ou Descanso).
 * @property {'PENDING' | 'COMPLETED'} status - O status do treino (Pendente ou Concluído).
 * @property {string} [description] - Uma descrição opcional para o treino.
 * @property {number} [plannedDistanceKm] - Distância planejada em quilômetros (relevante para 'RUN').
 * @property {number} [actualDistanceKm] - Distância real percorrida em quilômetros (relevante para 'RUN').
 * @property {number} [plannedTimeMin] - Tempo planejado em minutos (relevante para 'RUN').
 * @property {number} [actualTimeMin] - Tempo real em minutos (relevante para 'RUN').
 * @property {string} [plannedPace] - Ritmo planejado (ex: '5:00/km') (relevante para 'RUN').
 * @property {string} [actualPace] - Ritmo real (ex: '4:50/km') (relevante para 'RUN').
 * @property {Array<{name: string, sets: string}>} [exercises] - Lista de exercícios com nome e séries (relevante para 'WEIGHT_TRAINING').
 */
interface CreateWorkoutData {
  date: Date;
  type: 'RUN' | 'WEIGHT_TRAINING' | 'REST';
  status: 'PENDING' | 'COMPLETED';
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
 * Mapeia os valores de string de 'type' e 'status' para os Enums do Prisma.
 * Associa exercícios se o tipo for 'WEIGHT_TRAINING'.
 * * @param {CreateWorkoutData} data - Os dados do novo treino.
 * @returns {Promise<{success: true, data: import('@prisma/client').Workout} | {success: false, error: string}>} Um objeto com o status da operação e os dados do treino criado ou uma mensagem de erro.
 */
export async function createWorkout(data: CreateWorkoutData) {
  try {

    // Mapeamento de String para Objeto Enum do Prisma
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

      // Inicialização para evitar o erro de tipagem anterior
      plannedDistanceKm: data.plannedDistanceKm,
      actualDistanceKm: data.actualDistanceKm,
      plannedTimeMin: data.plannedTimeMin,
      actualTimeMin: data.actualTimeMin,
      plannedPace: data.plannedPace,
      actualPace: data.actualPace,
    };

    // 2. NENHUMA LÓGICA DE 'if (data.type === 'RUN')' É NECESSÁRIA AQUI, 
    // POIS OS CAMPOS JÁ ESTÃO TODOS NO OBJETO COM VALORES DE ENTRADA.

    // 3. Cria o registro no banco
    const newWorkout = await db.workout.create({
      data: {
        ...workoutData,
        // Se for musculação e tiver exercícios, cria eles na mesma transação
        exercises: data.type === 'WEIGHT_TRAINING' && data.exercises
          ? {
            create: data.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets
            }))
          }
          : undefined
      },
    });

    // 4. Revalida o cache
    revalidatePath('/');

    return { success: true, data: newWorkout };

  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return { success: false, error: "Erro ao salvar o treino." };
  }
}


/**
 * Atualiza um registro de treino existente no banco de dados.
 * Utiliza uma transação do Prisma (db.$transaction) para garantir que
 * os exercícios antigos sejam excluídos e os novos criados atomicamente, 
 * caso o tipo de treino seja 'WEIGHT_TRAINING'.
 * * @param {string} id - O ID do treino a ser atualizado.
 * @param {CreateWorkoutData} data - Os novos dados do treino.
 * @returns {Promise<{success: true, data: import('@prisma/client').Workout} | {success: false, error: string}>} Um objeto com o status da operação e os dados do treino atualizado ou uma mensagem de erro.
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
    if (data.type === 'WEIGHT_TRAINING' && data.exercises) {

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
 * Exclui um registro de treino existente do banco de dados, junto com seus exercícios associados (se houver).
 * @param {string} id - O ID do treino a ser excluído.
 * @returns {Promise<{success: true, data: import('@prisma/client').Workout} | {success: false, error: string}>} Um objeto com o status da operação e os dados do treino excluído ou uma mensagem de erro.
 */
export async function deleteWorkout(id: string) {
    try {
        // A exclusão é geralmente simples. Se a relação no seu schema for
        // configurada com `onDelete: Cascade` para os exercícios,
        // o Prisma cuidará da exclusão dos exercícios automaticamente.
        // Se não for, você precisará de uma transação para excluir
        // os exercícios primeiro. Assumiremos `onDelete: Cascade` aqui
        // por ser uma boa prática para relacionamentos "um para muitos".

        const deletedWorkout = await db.workout.delete({
            where: { id },
        });

        // Revalida o cache para atualizar a UI
        revalidatePath('/');

        return { success: true, data: deletedWorkout };

    } catch (error) {
        // O erro mais comum aqui é se o ID não for encontrado (P2025)
        console.error(`Erro ao excluir treino ${id}:`, error);
        return { success: false, error: "Não foi possível excluir o treino. Ele pode não existir mais." };
    }
}