import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Footprints,
} from 'lucide-react'
import { db } from '@/lib/prisma'
import { groupWorkoutsByMonthAndWeek, Workout as WorkoutType } from '@/utils/workout-utils'
import { WeeklyTimeline, RegisterWorkoutModal } from '@/components/global/workouts'

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
  const workouts = await getWorkouts()

  // 4. Aplica o agrupamento por semana
  const groupedWorkouts = groupWorkoutsByMonthAndWeek(workouts);

  // Cálculos Simples para o Resumo
  // *MELHORIA: Use os treinos COM status COMPLETED para KPIs mais precisos*
  const completedWorkouts = workouts.filter(w => w.status === 'COMPLETED')
  const totalWorkoutsCount = completedWorkouts.length
  const totalKmRun = completedWorkouts.reduce((acc, curr) => acc + (curr.actualDistanceKm || 0), 0)

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinos Feitos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkoutsCount}</div>
            <p className="text-xs text-muted-foreground">Total concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Km Percorridos</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKmRun.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
        {/* Adicione mais cards de KPI (por exemplo, Média Semanal) aqui */}
      </div>

      {/* --- LISTA DE TREINOS POR SEMANA --- */}
      <div className="space-y-4 border p-2 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Meus Treinos</h2>

        <div className="max-h-[600px] overflow-y-auto pr-2">
          {workouts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-secondary">
              Nenhum treino registrado ainda. Comece agora!
            </div>
          ) : (
            // 5. Utiliza o novo componente para a timeline
            <WeeklyTimeline groupedWorkouts={groupedWorkouts} />
          )}
        </div>
      </div>
    </div>
  )
}