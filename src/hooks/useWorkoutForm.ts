// src/hooks/useWorkoutForm.ts
import { useState, useCallback } from 'react';
import { deleteWorkout } from '@/actions/workout'; // Importação da Server Action de exclusão
// O tipo Workout precisa incluir os exercícios para o mapeamento funcionar.
/**
 * @typedef {Object} PrismaWorkout - Representação de um objeto Workout vindo do banco de dados (Prisma).
 * @property {string} id - ID único do treino.
 * @property {Date} date - A data do treino.
 * @property {'RUN' | 'WEIGHT_TRAINING' | 'REST'} type - Tipo de atividade.
 * @property {'PENDING' | 'COMPLETED'} status - Status do treino.
 * @property {number | null} plannedDistanceKm - Distância planejada em quilômetros.
 * @property {number | null} actualDistanceKm - Distância real em quilômetros.
 * @property {number | null} plannedTimeMin - Tempo planejado em minutos.
 * @property {number | null} actualTimeMin - Tempo real em minutos.
 * @property {string | null} plannedPace - Ritmo planejado.
 * @property {string | null} actualPace - Ritmo real.
 * @property {string | null} description - Descrição do treino.
 * @property {Array<{ name: string; sets: string }>} exercises - Lista de exercícios associados (Musculação).
 */
interface PrismaWorkout {
  id: string;
  date: Date;
  type: 'RUN' | 'WEIGHT_TRAINING' | 'REST';
  status: 'PENDING' | 'COMPLETED';
  plannedDistanceKm: number | null;
  actualDistanceKm: number | null;
  plannedTimeMin: number | null;
  actualTimeMin: number | null;
  plannedPace: string | null;
  actualPace: string | null;
  description: string | null;
  exercises: Array<{ id: string, name: string; sets: string }>; 
}
type Workout = PrismaWorkout; // Usaremos esta como a tipagem para `initialWorkout`

/**
 * @typedef {Object} WorkoutFormData - Estrutura de dados para o estado do formulário (todos os campos como string para inputs).
 * @property {string} date - Data do treino no formato YYYY-MM-DD.
 * @property {'RUN' | 'WEIGHT_TRAINING' | 'REST'} type - Tipo de atividade.
 * @property {'PENDING' | 'COMPLETED'} status - Status do treino.
 * @property {string} plannedDistanceKm - Distância planejada.
 * @property {string} actualDistanceKm - Distância real.
 * @property {string} plannedTimeMin - Tempo planejado.
 * @property {string} actualTimeMin - Tempo real.
 * @property {string} plannedPace - Ritmo planejado.
 * @property {string} actualPace - Ritmo real.
 * @property {string} description - Descrição do treino.
 * @property {Array<{ name: string; sets: string }>} weightExercises - Lista de exercícios para musculação.
 */
export interface WorkoutFormData {
  date: string;
  type: 'RUN' | 'WEIGHT_TRAINING' | 'REST';
  status: 'PENDING' | 'COMPLETED';
  plannedDistanceKm: string;
  actualDistanceKm: string;
  plannedTimeMin: string;
  actualTimeMin: string;
  plannedPace: string;
  actualPace: string;
  description: string;
  weightExercises: Array<{ id: string; name: string; sets: string }>;
}

/**
 * Função utilitária para formatar a data no fuso horário local para YYYY-MM-DD.
 * Isso resolve o problema de fuso horário que causa o desvio de um dia.
 */
const getLocalDateFormat = (date: Date): string => {
    // Offset para a data local
    const offset = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date.getTime() - offset);
    // Formata para YYYY-MM-DD
    return localTime.toISOString().split('T')[0];
}

// Valores iniciais Padrão para o formulário (Novo Registo)
const initialFormState: WorkoutFormData = {
  date: getLocalDateFormat(new  Date()),
  type: 'RUN',
  status: 'PENDING',
  plannedDistanceKm: '',
  actualDistanceKm: '',
  plannedTimeMin: '',
  actualTimeMin: '',
  plannedPace: '',
  actualPace: '',
  description: '',
  weightExercises: [{ id: '', name: '', sets: '' }],
};

/**
 * Mapeia o objeto Workout (do banco de dados) para o estado do formulário (strings).
 * @param {Workout} workout - O objeto Workout vindo do banco de dados.
 * @returns {WorkoutFormData} Os dados mapeados para o estado do formulário.
 */
const mapWorkoutToFormData = (workout: Workout): WorkoutFormData => {
  // Garante que a data seja formatada como string YYYY-MM-DD para o input[type="date"]
  const dateString = workout.date instanceof Date
    ? workout.date.toISOString().split('T')[0]
    : new Date(workout.date).toISOString().split('T')[0];

  return {
    date: dateString,
    type: workout.type,
    status: workout.status as 'PENDING' | 'COMPLETED', // Cast seguro

    // Converte números ou null/undefined para string vazia
    plannedDistanceKm: (workout.plannedDistanceKm || '').toString(),
    actualDistanceKm: (workout.actualDistanceKm || '').toString(),
    plannedTimeMin: (workout.plannedTimeMin || '').toString(),
    actualTimeMin: (workout.actualTimeMin || '').toString(),

    // Paces e Descrição
    plannedPace: workout.plannedPace || '',
    actualPace: workout.actualPace || '',
    description: workout.description || '',

    // Exercícios: usa os exercícios existentes ou um array vazio
    weightExercises: workout.exercises.length > 0
      ? workout.exercises.map(ex => ({ id: ex.id , name: ex.name, sets: ex.sets }))
      : initialFormState.weightExercises,
  };
};

/**
 * Um hook customizado para gerenciar o estado e a lógica do formulário de treino.
 * Ele lida com a inicialização de dados (para criação ou edição), validação e gestão
 * das Server Actions de exclusão.
 * * @param {Workout} [initialWorkout] - O objeto de treino existente para inicializar o formulário (Modo Edição).
 * @returns {Object} Um objeto contendo o estado do formulário, handlers, funções de validação e a função de exclusão.
 * @property {WorkoutFormData} formData - Os dados atuais do formulário.
 * @property {string | undefined} workoutId - O ID do treino (se estiver em modo de edição).
 * @property {Function} handleChange - Handler genérico para mudanças de input.
 * @property {Function} handleTypeChange - Handler específico para mudança do tipo de treino.
 * @property {Function} validate - Função de validação do formulário.
 * @property {boolean} isSubmitting - Estado de submissão.
 * @property {Function} setIsSubmitting - Setter para o estado de submissão.
 * @property {string | null} error - Mensagem de erro.
 * @property {Function} setError - Setter para a mensagem de erro.
 * @property {Function} resetForm - Reseta o formulário para o estado inicial/treino original.
 * @property {Function} addExercise - Adiciona um novo exercício à lista.
 * @property {Function} updateExercise - Atualiza um exercício existente.
 * @property {Function} removeExercise - Remove um exercício pelo índice.
 * @property {Function} handleDelete - **NOVA:** Lida com a exclusão do treino.
 */
export function useWorkoutForm(initialWorkout?: Workout) {
  // 🛑 Inicializa o estado com o treino existente ou com o estado padrão
  const initialData = initialWorkout ? mapWorkoutToFormData(initialWorkout) : initialFormState;

  // 🛑 Exporta o ID para uso nas Server Actions
  const [workoutId] = useState<string | undefined>(initialWorkout?.id);

  const [formData, setFormData] = useState<WorkoutFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Função genérica para lidar com mudanças em campos de texto/data
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Função para lidar com a mudança do tipo de treino (resetando campos irrelevantes)
  const handleTypeChange = useCallback((newType: 'RUN' | 'WEIGHT_TRAINING' | 'REST') => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      // REINICIA TODOS OS CAMPOS DE CORRIDA E MUSCULAÇÃO AO MUDAR O TIPO
      plannedDistanceKm: newType === 'RUN' ? prev.plannedDistanceKm : '',
      actualDistanceKm: newType === 'RUN' ? prev.actualDistanceKm : '',
      plannedTimeMin: newType === 'RUN' ? prev.plannedTimeMin : '',
      actualTimeMin: newType === 'RUN' ? prev.actualTimeMin : '',
      plannedPace: newType === 'RUN' ? prev.plannedPace : '',
      actualPace: newType === 'RUN' ? prev.actualPace : '',
      weightExercises: newType === 'WEIGHT_TRAINING' ? prev.weightExercises : initialFormState.weightExercises,
    }));
  }, []);

  // Função de validação simples
  const validate = (): boolean => {
    setError(null);
    if (!formData.date || !formData.type) {
      setError("Data e Tipo de Atividade são obrigatórios.");
      return false;
    }
    // Validação específica para o status COMPLETED
    if (formData.status === 'COMPLETED') {
      if (formData.type === 'RUN' && !formData.actualDistanceKm) {
        setError("Treino de Corrida concluído deve ter a Distância Real preenchida.");
        return false;
      }
    }
    return true;
  };

  // Funções para gerir exercícios de musculação (simplificado)
  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      weightExercises: [...prev.weightExercises, { id:crypto.randomUUID(), name: '', sets: '' }],
    }));
  };

  const updateExercise = (index: number, key: keyof (typeof initialFormState.weightExercises)[0], value: string) => {
    const newExercises = formData.weightExercises.map((ex, i) =>
      i === index ? { ...ex, [key]: value } : ex
    );
    setFormData(prev => ({ ...prev, weightExercises: newExercises }));
  };

  // Remove um exercício pelo índice
  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weightExercises: prev.weightExercises.filter((_, i) => i !== index),
    }));
  };

  // A função de reset agora volta ao estado inicial OU ao treino original
  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  /**
   * Função para lidar com a exclusão do treino usando a Server Action.
   * Só é executada se o treinoId estiver definido (Modo Edição).
   * @async
   * @returns {Promise<boolean>} Retorna true se a exclusão for bem-sucedida, false caso contrário.
   */
  const handleDelete = useCallback(async () => {
    if (!workoutId) {
        setError("Não é possível excluir: ID do treino não encontrado.");
        return false;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
        const result = await deleteWorkout(workoutId);

        if (result.success) {
            // O sucesso aqui geralmente significa que o usuário será redirecionado
            // ou a lista será revalidada automaticamente pelo `revalidatePath`.
            console.log(`Treino ${workoutId} excluído com sucesso.`);
            return true;
        } else {
            setError(result.error || "Ocorreu um erro desconhecido ao excluir o treino.");
            return false;
        }

    } catch (err) {
        console.error("Erro fatal ao excluir:", err);
        setError("Falha na comunicação com o servidor.");
        return false;
    } finally {
        // Mantenha o setIsSubmitting no final
        setIsSubmitting(false);
    }
  }, [workoutId]); // Dependência apenas do ID do treino

  return {
    formData,
    workoutId, 
    handleChange,
    handleTypeChange,
    validate,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    resetForm,
    addExercise,
    updateExercise,
    removeExercise,
    handleDelete, // 🚀 NOVO: Função para exclusão
  };
}