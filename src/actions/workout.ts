// app/_actions/workout.ts
'use server'
import { ActivityType, Status } from '@/@types/workout';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'

interface CreateWorkoutData {
  date: Date;
  type: ActivityType
  status: Status
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
 */
export async function createWorkout(data: CreateWorkoutData) {
  try {

    const workoutData = {
      date: data.date,
      type: data.type,
      status: data.status,
      description: data.description,

      plannedDistanceKm: data.plannedDistanceKm,
      actualDistanceKm: data.actualDistanceKm,
      plannedTimeMin: data.plannedTimeMin,
      actualTimeMin: data.actualTimeMin,
      plannedPace: data.plannedPace,
      actualPace: data.actualPace,
    };

    const newWorkout = await db.workout.create({
      data: {
        ...workoutData,
        exercises: data.type === "WEIGHT_TRAINING" && data.exercises // 💡 Usando a string literal para a comparação
          ? {
            create: data.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets
            }))
          }
          : undefined
      },
    });

    revalidatePath('/');

    // 💡 A tipagem de retorno agora é do Prisma, mas o TypeScript pode inferir
    return { success: true, data: newWorkout }; // Usando o tipo Workout importado

  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return { success: false, error: "Erro ao salvar o treino." };
  }
}


/**
 * Atualiza um registro de treino existente no banco de dados.
 */
export async function updateWorkout(id: string, data: CreateWorkoutData) {
  try {
    if (!data.status || !data.type) {
      return { success: false, error: "O Tipo e o Status de Atividade devem ser selecionados." };
    }
    const workoutData = {
      date: data.date,
      type: data.type,
      status: data.status,
      description: data.description,

      plannedDistanceKm: data.plannedDistanceKm,
      actualDistanceKm: data.actualDistanceKm,
      plannedTimeMin: data.plannedTimeMin,
      actualTimeMin: data.actualTimeMin,
      plannedPace: data.plannedPace,
      actualPace: data.actualPace,
    };

    // --- GESTÃO DE TRANSAÇÃO ---

    if (data.type === "WEIGHT_TRAINING" && data.exercises) { // 💡 Usando a string literal para a comparação

      const deleteOldExercises = db.exercise.deleteMany({
        where: { workoutId: id },
      });

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
 */
export async function deleteWorkout(id: string) {
  try {
    const deletedWorkout = await db.workout.delete({
      where: { id },
    });

    revalidatePath('/');

    return { success: true, data: deletedWorkout };

  } catch (error) {
    console.error(`Erro ao excluir treino ${id}:`, error);
    return { success: false, error: "Não foi possível excluir o treino. Ele pode não existir mais." };
  }
}