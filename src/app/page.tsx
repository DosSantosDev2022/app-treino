import {
  Activity,
  Calendar,
  Clock,
  Footprints,
  TrendingUp,
} from 'lucide-react'
import { db } from '@/lib/prisma'
import { Workout as WorkoutType } from '@/utils/workout-utils'
import { RegisterWorkoutModal } from '@/components/global/workouts'
import { ResumCards } from '@/components/global/dashboard/resumCards'
import { ResumCardsGridSkeleton, WorkoutTimelineSection } from '@/components/global/dashboard'
import { Suspense } from 'react'

// Função para buscar dados (roda no servidor) - Mantida
async function getWorkouts(): Promise<WorkoutType[]> {
  // Ajuste a busca para garantir que as datas sejam trazidas
  const workouts = await db.workout.findMany({
    orderBy: { date: 'desc' },
    include: { exercises: true },
    // Buscar todos os treinos para o agrupamento semanal funcionar corretamente
  }) as WorkoutType[] // Assume que a tipagem é compatível
  return workouts
}

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const allWorkouts = await getWorkouts()

  /* console.log('Workouts buscados para o Dashboard:', allWorkouts) */

  return (
    <div className="container mx-auto p-4 space-y-8">

      {/* --- CABEÇALHO E AÇÕES --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Meu Treino Diário</h1>
          <p className="text-muted-foreground">Acompanhe sua evolução e consistência.</p>
        </div>
        <RegisterWorkoutModal />
      </div>

      {/* --- CARDS DE RESUMO (KPIs) --- */}
      <div className="space-y-6">

        <Suspense fallback={<ResumCardsGridSkeleton count={4} />}>

          <div className="flex flex-wrap gap-4">
            {/* COLUNA 1: TOTAL */}
            <div className='flex-1 min-w-[45%] md:min-w-0 md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] space-y-1.5'>
              <h2 className='font-semibold text-xl flex items-center gap-2 text-primary'>
                <TrendingUp className='w-5 h-5' />
                Total Geral
              </h2>
              {/* TOTAL - Treinos Concluídos */}
              <ResumCards
                title="Total de Treinos"
                unit="treinos"
                icon={Activity}
                timeframe="total"
                metric="workouts"
              />

              {/* TOTAL - Km Percorridos */}
              <ResumCards
                title="Total de Km"
                unit="km"
                icon={Footprints}
                timeframe="total"
                metric="distance"
              />
            </div>

            {/* COLUNA 2: ANUAL */}
            <div className='flex-1 min-w-[45%] md:min-w-0 md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] space-y-1.5'>
              <h2 className='font-semibold text-xl flex items-center gap-2 text-primary'>
                <Calendar className='w-5 h-5' />
                Resumo Anual
              </h2>
              {/* ANUAL - Treinos Concluídos (Ano Atual) */}
              <ResumCards
                title="Treinos do Ano"
                unit="treinos"
                icon={Activity}
                timeframe="year"
                metric="workouts"
              />

              {/* ANUAL - Km Percorridos (Ano Atual) */}
              <ResumCards
                title="Km do Ano"
                unit="km"
                icon={Footprints}
                timeframe="year"
                metric="distance"
              />
            </div>

            {/* COLUNA 3: MENSAL */}
            <div className='flex-1 min-w-[45%] md:min-w-0 md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] space-y-1.5'>
              <h2 className='font-semibold text-xl flex items-center gap-2 text-primary'>
                <Calendar className='w-5 h-5' />
                Resumo Mensal
              </h2>
              {/* MENSAL - Treinos Concluídos (Mês Atual) */}
              <ResumCards
                title="Treinos do Mês"
                unit="treinos"
                icon={Activity}
                timeframe="month"
                metric="workouts"
              />

              {/* MENSAL - Km Percorridos (Mês Atual) */}
              <ResumCards
                title="Km do Mês"
                unit="km"
                icon={Footprints}
                timeframe="month"
                metric="distance"
              />
            </div>

            {/* COLUNA 4: SEMANAL */}
            <div className='flex-1 min-w-[45%] md:min-w-0 md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] space-y-1.5'>
              <h2 className='font-semibold text-xl flex items-center gap-2 text-primary'>
                <Clock className='w-5 h-5' />
                Resumo Semanal
              </h2>
              {/* SEMANAL - Treinos Concluídos (Semana Atual) */}
              <ResumCards
                title="Treinos da Semana"
                unit="treinos"
                icon={Activity}
                timeframe="week"
                metric="workouts"
              />

              {/* SEMANAL - Km Percorridos (Semana Atual) */}
              <ResumCards
                title="Km da Semana"
                unit="km"
                icon={Footprints}
                timeframe="week"
                metric="distance"
              />
            </div>
          </div>

        </Suspense>

        {/* --- LISTA DE TREINOS POR SEMANA --- */}
        <WorkoutTimelineSection allWorkouts={allWorkouts} />
      </div>
    </div>
  )
}