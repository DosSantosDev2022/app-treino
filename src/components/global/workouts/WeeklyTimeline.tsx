// components/workouts/WeeklyTimeline.tsx
import { WorkoutCard } from './WorkoutCard';
import { Workout as WorkoutType } from '@/utils/workout-utils'
// Importação dos componentes do Accordion (usando a sua biblioteca de UI)
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';

// Ajuste a interface para refletir o novo agrupamento por mês
interface WorkoutsByWeek {
  weekStart: string; // Ex: "01/Dez"
  weekNumber: number;
  workouts: WorkoutType[];
}

interface WorkoutsByMonth {
  monthName: string; // Ex: "Dezembro 2025"
  monthKey: string; // Ex: "2025-12"
  weeks: WorkoutsByWeek[];
}

interface WeeklyTimelineProps {
  groupedWorkouts: WorkoutsByMonth[] // Recebe agora o agrupamento por mês
}

const WeeklyTimeline = ({ groupedWorkouts }: WeeklyTimelineProps) => {

  // Se não houver treinos, mostra uma mensagem
  if (groupedWorkouts.length === 0) {
    return (
      <p className="text-center text-slate-500 mt-10">
        Nenhum treino registado ainda. Comece a planear!
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {groupedWorkouts.map((monthGroup) => (
        <div key={monthGroup.monthKey} className="space-y-6">

          {/* 🛑 TÍTULO DO MÊS */}
          <h2 className="text-2xl font-extrabold text-primary border-b-4 border-border pb-2 mb-6 sticky top-0  z-10">
            {monthGroup.monthName}
          </h2>

          {/* 🛑 ACCORDION PARA AGRUPAR AS SEMANAS */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {monthGroup.weeks.map((weekGroup) => (

              <AccordionItem
                key={`${monthGroup.monthKey}-${weekGroup.weekNumber}`}
                value={`${monthGroup.monthKey}-${weekGroup.weekNumber}`}
                className="border rounded-lg shadow-sm px-4 data-[state=open]:bg-blue-50/50 transition-colors"
              >

                {/* CABEÇALHO DA SEMANA (CLICKABLE) */}
                <AccordionTrigger className="text-base font-semibold hover:text-primary">
                  <span className='flex items-center gap-2'>
                    🗓️ Semana #{weekGroup.weekNumber}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (A partir de {weekGroup.weekStart})
                    </span>
                  </span>
                </AccordionTrigger>

                {/* CONTEÚDO DA SEMANA (COLAPSÁVEL) */}
                <AccordionContent className="pt-2 pb-4">

                  {/* GRID DE CARDS DESSA SEMANA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">

                    {/* Ordena os treinos dentro da semana por data */}
                    {weekGroup.workouts.sort((a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                    ).map((workout, index) => (
                      <WorkoutCard key={`${workout.id || 'temp'}-${index}`} workout={workout} />
                    ))}

                  </div>

                  {weekGroup.workouts.length === 0 && (
                    <p className="text-center text-muted-foreground mt-4">
                      Nenhum treino registado para esta semana.
                    </p>
                  )}

                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      ))}
    </div>
  )
}

export { WeeklyTimeline }