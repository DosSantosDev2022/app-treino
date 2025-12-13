'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { WorkoutForm } from './workout-form' // O seu formulário existente

/**
 * Componente que exibe o formulário de treino dentro de um Modal/Dialog.
 * Adiciona a funcionalidade de fechar o modal ao submeter com sucesso.
 */
const RegisterWorkoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Função passada para o formulário para fechar o modal após o sucesso
  const handleClose = () => {
    setIsOpen(false);
    // Nota: O revalidatePath já é feito na Server Action, atualizando o Dashboard
  }

  return (
    // 1. O DialogTrigger envolve o botão que abre o modal
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto">
          <PlusCircle className="h-5 w-5 mr-2" /> Registrar Novo Treino
        </Button>
      </DialogTrigger>

      {/* 2. O DialogContent contém o formulário */}
      <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 bg-secondary border-b">
          <DialogTitle className="text-2xl text-foreground">Novo Treino da Semana</DialogTitle>
        </DialogHeader>
        <div className="p-4 sm:p-6 pt-0">
          <WorkoutForm onSuccessfulSubmit={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { RegisterWorkoutModal }