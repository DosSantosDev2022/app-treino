// src/components/global/WorkoutForm.tsx
'use client'

import {
  createWorkout,
  updateWorkout
} from '@/actions/workout'; // Importar apenas create/update
import { useWorkoutForm, WorkoutFormData } from '@/hooks/useWorkoutForm';
import { Workout } from '@/utils/workout-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WorkoutDeleteButton } from './WorkoutDeleteButton'; // Importa o botão de exclusão

// 🛑 Tipos de props ajustados. O onDelete agora vem do modal (que extraiu do hook).
interface WorkoutFormProps {
  initialData?: Workout; // O treino se estiver em modo de edição
  onSuccessfulSubmit: () => void; // Função para fechar o modal ou resetar após criação/edição
  onDelete?: () => Promise<boolean>; // Handler de exclusão do useWorkoutForm
  onSuccessfulDelete?: () => void; // Ação após exclusão (ex: fechar modal e recarregar lista)
}

const WorkoutForm = ({ initialData, onSuccessfulSubmit, onDelete, onSuccessfulDelete }: WorkoutFormProps) => {


  const {
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
  } = useWorkoutForm(initialData);

  // Helper para converter o formulário (strings) para o tipo da Server Action (números/objetos)
  const mapFormDataToSend = (data: WorkoutFormData) => {
    return {
      date: new Date(`${data.date}T00:00:00.000Z`),
      type: data.type,
      status: data.status,
      description: data.description || undefined,

      // Converte strings para number ou undefined
      plannedDistanceKm: data.plannedDistanceKm ? parseFloat(data.plannedDistanceKm) : undefined,
      actualDistanceKm: data.actualDistanceKm ? parseFloat(data.actualDistanceKm) : undefined,
      plannedTimeMin: data.plannedTimeMin ? parseInt(data.plannedTimeMin) : undefined,
      actualTimeMin: data.actualTimeMin ? parseInt(data.actualTimeMin) : undefined,

      plannedPace: data.plannedPace || undefined,
      actualPace: data.actualPace || undefined,

      // Exercícios
      exercises: data.type === 'WEIGHT_TRAINING' ? data.weightExercises.filter(ex => ex.name && ex.sets) : undefined,
    };
  };

  // 🛑 Função de submissão unificada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = mapFormDataToSend(formData);
      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
      let result;

      if (workoutId) {
        // 🛑 MODO DE EDIÇÃO: Chama updateWorkout
        result = await updateWorkout(workoutId, dataToSend as any);
      } else {
        // 🛑 MODO DE CRIAÇÃO: Chama createWorkout
        result = await createWorkout(dataToSend as any);
      }

      if (result.success) {
        console.log(`Treino ${workoutId ? 'atualizado' : 'criado'} com sucesso!`, result.data);
        onSuccessfulSubmit();

        if (!workoutId) {
          resetForm();
        }

      } else {
        setError(result.error || `Falha ao ${workoutId ? 'atualizar' : 'criar'} o treino.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Erro de rede ou servidor ao ${workoutId ? 'atualizar' : 'criar'} o treino.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* ... CAMPOS DO FORMULÁRIO (1 a 5) ... */}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleTypeChange(value as 'RUN' | 'WEIGHT_TRAINING' | 'REST')}
            disabled={isSubmitting}
          >
            <SelectTrigger className='w-full' id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RUN">Corrida</SelectItem>
              <SelectItem value="WEIGHT_TRAINING">Musculação</SelectItem>
              <SelectItem value="REST">Descanso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange({ target: { name: 'status', value } } as React.ChangeEvent<HTMLSelectElement>)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">⏳ Pendente</SelectItem>
            <SelectItem value="COMPLETED">✅ Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'RUN' && (
        <fieldset className="space-y-4 p-4 border rounded-md">
          <legend className="text-sm font-semibold text-gray-700">Detalhes de Corrida</legend>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedDistanceKm">Distância Plan. (km)</Label>
              <Input type="number" step="0.1" id="plannedDistanceKm" name="plannedDistanceKm" value={formData.plannedDistanceKm} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualDistanceKm">Distância Real (km)</Label>
              <Input type="number" step="0.1" id="actualDistanceKm" placeholder='Ex: 10.5 km' name="actualDistanceKm" value={formData.actualDistanceKm} onChange={handleChange} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedTimeMin">Tempo Plan. (min)</Label>
              <Input type="number" id="plannedTimeMin" name="plannedTimeMin" value={formData.plannedTimeMin} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualTimeMin">Tempo Real (min)</Label>
              <Input type="number" id="actualTimeMin" name="actualTimeMin" placeholder='48 min' value={formData.actualTimeMin} onChange={handleChange} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedPace">Pace Plan.</Label>
              <Input type="text" id="plannedPace" name="plannedPace" value={formData.plannedPace} onChange={handleChange} disabled={isSubmitting} placeholder="Ex: 5:30 min/km" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualPace">Pace Real</Label>
              <Input type="text" id="actualPace" name="actualPace" value={formData.actualPace} onChange={handleChange} disabled={isSubmitting} placeholder="Ex: 5:15 min/km" />
            </div>
          </div>
        </fieldset>
      )}

      {formData.type === 'WEIGHT_TRAINING' && (
        <fieldset className="space-y-4 p-4 border rounded-md">
          <legend className="text-sm font-semibold text-gray-700 mb-4">Exercícios</legend>

          {formData.weightExercises.map((exercise, index) => (
            <div key={`${exercise.id}`} className="flex items-center space-x-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`ex-name-${index}`} className="sr-only">Nome do Exercício</Label>
                <Input
                  id={`ex-name-${index}`}
                  type="text"
                  placeholder="Nome do Exercício"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor={`ex-sets-${index}`} className="sr-only">Séries x Repetições</Label>
                <Input
                  id={`ex-sets-${index}`}
                  type="text"
                  placeholder="Séries x Repetições (Ex: 3x10)"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {formData.weightExercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(index)}
                  disabled={isSubmitting}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            onClick={addExercise}
            variant="outline"
            size="sm"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Exercício
          </Button>
        </fieldset>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Notas/Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder='Adicione observações do seu treino'
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {/* 6. BOTÕES DE AÇÃO */}
      <div className="grid grid-cols-2 gap-1.5 items-center">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? `Salvando...`
            : workoutId
              ? 'Atualizar Treino'
              : 'Registar Treino'
          }
        </Button>

        {/* 🛑 Botão de exclusão (Apenas visível em modo de edição) */}
        {workoutId && onDelete && onSuccessfulDelete && (
          <WorkoutDeleteButton
            workoutId={workoutId}
            onDelete={onDelete}
            onSuccessfulDelete={onSuccessfulDelete}
          />
        )}
      </div>
    </form>
  );
}

export { WorkoutForm }