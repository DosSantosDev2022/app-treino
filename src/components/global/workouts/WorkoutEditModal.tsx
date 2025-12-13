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
  // 🛑 Inicializa o hook aqui, passando o treino para edição
  const { handleDelete } = useWorkoutForm(workout);

  // Estado para controlar se o modal está aberto, útil para fechar após o sucesso
  const [isOpen, setIsOpen] = React.useState(false);

  // Função a ser chamada após a submissão bem-sucedida do formulário de EDIÇÃO
  const handleSuccessfulSubmit = () => {
    setIsOpen(false);
    toast.success("Treino atualizado com sucesso!");
  };

  // Função a ser chamada após a exclusão bem-sucedida
  const handleSuccessfulDelete = () => {
    setIsOpen(false); // Fecha o modal
    // Recarrega o cache do Next.js. O revalidatePath nas actions garante o refresh.
    // O `router.refresh()` é o método ideal para forçar um refresh sem full page reload.
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Treino</DialogTitle>
          <DialogDescription>
            Ajuste os detalhes do seu treino de {workout.type} na data {new Date(workout.date).toLocaleDateString('pt-BR')}.
          </DialogDescription>
        </DialogHeader>

        {/* 🛑 Passamos os handlers de exclusão e o initialData */}
        <WorkoutForm
          initialData={workout}
          onSuccessfulSubmit={handleSuccessfulSubmit}
          // 🛑 Injetando o handler de exclusão do hook
          onDelete={handleDelete}
          onSuccessfulDelete={handleSuccessfulDelete}
        />
      </DialogContent>
    </Dialog>
  );
}

export { WorkoutEditModal }