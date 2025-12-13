'use client'
// Recebe a interface do utilitário
import { Workout as WorkoutType } from '@/utils/workout-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { WorkoutEditModal } from './WorkoutEditModal'

// O restante do código do WorkoutCard é o seu código original.
// Certifique-se de exportar a função:
const WorkoutCard = ({ workout }: { workout: WorkoutType }) => {
  const isRun = workout.type === 'RUN'
  const isWeight = workout.type === 'WEIGHT_TRAINING'
  const isRest = workout.type === 'REST'
  const isCompleted = workout.status === 'COMPLETED'

  // 1. Cria um novo objeto Date a partir da string/data do treino.
  const dateObject = new Date(workout.date);

  // 2. Cria uma nova data corrigida para o fuso horário local.
  //    Isso garante que o dia exibido corresponda ao dia armazenado no banco (ex: 11/12/2025).
  const offset = dateObject.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObject.getTime() + offset);

  // 3. Formatação da data corrigida.
  const dateFormatted = localDate.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'long'
  })


  // Mapeamento das cores de destaque (border-l) para as variáveis chart
  const borderLColor = isRun
    ? 'border-l-chart-2' // Cor do tema para Corrida
    : isWeight
      ? 'border-l-chart-1' // Cor do tema para Musculação
      : 'border-l-chart-4'; // Cor do tema para Descanso


  return (
    <WorkoutEditModal workout={workout}>
      <Card className={`border-l-4 shadow-sm ${borderLColor}`}
        // Adiciona um hover/cursor para indicar que é clicável (edição futura)
        onClick={() => console.log('Abrir detalhes/edição do treino ' + workout.id)}
      >
        <CardHeader className="pb-2">
          {/* ... restante do código do CardHeader ... */}
          <div className="flex justify-between items-start">
            <div>
              {/* TEXTO DA DATA (Antigo: text-slate-500) */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarDays className="w-4 h-4" />
                <span className="capitalize">{dateFormatted}</span>
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isRun && <span>🏃 Corrida</span>}
                {isWeight && <span>🏋️ Musculação</span>}
                {isRest && <span>😴 Descanso</span>}
              </CardTitle>
            </div>
            {/* BADGE DE STATUS (Antigo: bg-green-600) */}
            <Badge variant={isCompleted ? "default" : "destructive"}>
              {isCompleted ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Circle className="w-3 h-3 mr-1" />}
              {isCompleted ? "Feito" : "Pendente"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* CONTEÚDO DE CORRIDA */}
          {isRun && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* DISTÂNCIA (Antigo: bg-slate-50, text-slate-500, text-slate-400) */}
              <div className="bg-muted p-2 rounded">
                <p className="text-muted-foreground text-xs">Distância</p>
                <p className="font-semibold">
                  {workout.actualDistanceKm ? `${workout.actualDistanceKm} km` : '-'}
                  {workout.plannedDistanceKm && <span className="text-muted-foreground/70 text-xs ml-1">/ {workout.plannedDistanceKm} km</span>}
                </p>
              </div>
              {/* TEMPO (Antigo: bg-slate-50, text-slate-500, text-slate-400) */}
              <div className="bg-muted p-2 rounded">
                <p className="text-muted-foreground text-xs">Tempo (min)</p>
                {/* Removemos o div flex para a exibição ficar parecida com a de Distância */}
                <p className="font-semibold">
                  {/* Exibe o tempo real ou o traço, se não houver tempo real */}
                  {workout.actualTimeMin ? `${workout.actualTimeMin}` : '-'}
                  {/* Se houver tempo planejado, exibe-o como meta em texto menor */}
                  {workout.plannedTimeMin && (
                    <span className="text-muted-foreground/70 text-xs ml-1">
                      / {workout.plannedTimeMin} min
                    </span>
                  )}
                </p>
              </div>
              {/* PACE (Antigo: bg-slate-50, text-slate-500, text-slate-400) */}
              <div className="bg-muted p-2 rounded col-span-2">
                <p className="text-muted-foreground text-xs">Pace (Min/Km)</p>
                <p className="font-semibold">
                  {workout.actualPace || '-'}
                  {workout.plannedPace && <span className="text-muted-foreground/70 text-xs ml-1">(Meta: {workout.plannedPace})</span>}
                </p>
              </div>
            </div>
          )}

          {/* CONTEÚDO DE MUSCULAÇÃO (Antigo: bg-slate-50, text-slate-700, text-slate-500) */}
          {isWeight && workout.exercises.length > 0 && (
            // ... conteúdo de musculação original ...
            <div className="bg-muted p-3 rounded text-sm space-y-2">
              <p className="font-semibold text-foreground mb-2 border-b pb-1">Série do Dia</p>
              <ul className="space-y-1">
                {workout.exercises.map((ex: any) => (
                  <li key={ex.id} className="flex justify-between">
                    <span>{ex.name}</span>
                    <span className="font-mono text-muted-foreground">{ex.sets}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DESCRIÇÃO / OBSERVAÇÕES (Antigo: text-slate-600, bg-yellow-50/50, border-yellow-100) */}
          {workout.description && (
            // ... descrição original ...
            <div className="text-muted-foreground italic bg-accent/50 p-2 rounded border border-border">
              "{workout.description}"
            </div>
          )}
        </CardContent>
      </Card>
    </WorkoutEditModal>
  )
}

export { WorkoutCard }