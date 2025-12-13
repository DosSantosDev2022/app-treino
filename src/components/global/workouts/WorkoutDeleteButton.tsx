// src/components/WorkoutDeleteButton.tsx
'use client'

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner' // Usando sonner, conforme o seu código

/**
 * @typedef {Object} WorkoutDeleteButtonProps - Propriedades para o componente de exclusão.
 * @property {string} workoutId - O ID do treino a ser excluído.
 * @property {() => Promise<boolean>} onDelete - A função assínrona para lidar com a exclusão (virá do useWorkoutForm via modal).
 * @property {() => void} onSuccessfulDelete - Função a ser chamada após o sucesso (ex: fechar modal).
 */
interface WorkoutDeleteButtonProps {
    workoutId: string;
    onDelete: () => Promise<boolean>;
    onSuccessfulDelete: () => void;
}

/**
 * Componente que exibe um botão de exclusão com um diálogo de confirmação (AlertDialog).
 * Usa a função onDelete fornecida pelo hook de formulário.
 */
export function WorkoutDeleteButton({ workoutId, onDelete, onSuccessfulDelete }: WorkoutDeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteClick = async () => {
        // Não é necessário setIsLoading aqui, pois o onDelete (do hook) já controla o isSubmitting
        // No entanto, manteremos o controle de estado local aqui para o botão específico do Dialog
        setIsLoading(true);
        try {
            const success = await onDelete();

            if (success) {
                toast("Treino excluído com sucesso");
                onSuccessfulDelete(); // Fechará o modal
            } else {
                // Se falhar, o hook já deve ter exibido o erro, mas podemos dar um aviso genérico
                toast("Ocorreu um erro ao excluir o treino. Verifique os logs.");
            }
        } catch (error) {
            toast("Falha na comunicação com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="w-full" // Adicionado margem para separação
                    aria-label={`Excluir treino ${workoutId}`}
                    disabled={isLoading}
                >

                    {isLoading ? "Excluíndo treino..." : "Excluir treino"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso removerá permanentemente o seu registro de treino (ID: **{workoutId}**) e todos os dados associados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-red-700"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Excluindo...
                            </div>
                        ) : (
                            "Sim, excluir treino"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}