// app/_actions/workout.ts
'use server'

import { ActivityType, Status } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'

// Definindo a interface dos dados que esperamos receber do formulário
interface CreateWorkoutData {
  date: Date;
  type: ActivityType;
  status: Status;
  description?: string;
  
  // Corrida
  plannedDistanceKm?: number;
  actualDistanceKm?: number;
  plannedTimeMin?: number;
  actualTimeMin?: number;
  plannedPace?: string;
  actualPace?: string;

  // Musculação (Array de objetos simples)
  exercises?: { name: string; sets: string }[];
}

export async function createWorkout(data: CreateWorkoutData) {
  try {
    // 1. Prepara o objeto base do treino
    const workoutData: any = {
      date: data.date,
      type: data.type,
      status: data.status,
      description: data.description,
    };

    // 2. Se for Corrida, adiciona os campos específicos
    if (data.type === 'RUN') {
      workoutData.plannedDistanceKm = data.plannedDistanceKm;
      workoutData.actualDistanceKm = data.actualDistanceKm;
      workoutData.plannedTimeMin = data.plannedTimeMin;
      workoutData.actualTimeMin = data.actualTimeMin;
      workoutData.plannedPace = data.plannedPace;
      workoutData.actualPace = data.actualPace;
    }

    // 3. Cria o registro no banco
    const newWorkout = await prisma.workout.create({
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

    // 4. Revalida o cache da página inicial (Dashboard) para mostrar os dados novos imediatamente
    revalidatePath('/');
    
    return { success: true, data: newWorkout };

  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return { success: false, error: "Erro ao salvar o treino." };
  }
}