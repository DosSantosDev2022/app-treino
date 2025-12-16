// components/workouts/WorkoutEditModal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Workout } from '@/utils/workout-utils';
import { WorkoutForm } from './workout-form';
import React from 'react';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WorkoutEditModalProps {
  workout: Workout;
  children: React.ReactNode;
}

const WorkoutEditModal = ({ workout, children }: WorkoutEditModalProps) => {
  const router = useRouter();
  const { handleDelete } = useWorkoutForm(workout);

  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccessfulSubmit = () => {
    setIsOpen(false);
    toast.success("Treino atualizado com sucesso!");
    router.refresh(); // Atualiza a lista após submissão bem-sucedida
  };

  const handleSuccessfulDelete = () => {
    setIsOpen(false);
    router.refresh();
  };

  const formatModalDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25 md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Treino</DialogTitle>
          <DialogDescription>
            Ajuste os detalhes do seu treino de {workout.type} na data {formatModalDate(workout.date)}.
          </DialogDescription>
        </DialogHeader>

        {/* Passamos os handlers de exclusão e o initialData */}
        <WorkoutForm
          initialData={workout}
          onSuccessfulSubmit={handleSuccessfulSubmit}
          onDelete={handleDelete}
          onSuccessfulDelete={handleSuccessfulDelete}
        />
      </DialogContent>
    </Dialog>
  );
}

export { WorkoutEditModal }