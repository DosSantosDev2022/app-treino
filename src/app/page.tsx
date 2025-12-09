// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Footprints,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

// Função para buscar dados (roda no servidor)
async function getWorkouts() {
  const workouts = await prisma.workout.findMany({
    orderBy: { date: 'desc' }, // Mais recentes primeiro
    include: { exercises: true }, // Traz os exercícios juntos
    take: 20 // Limita aos últimos 20 para começar
  })
  return workouts
}

export const dynamic = 'force-dynamic' // Garante que a página não faça cache estático eterno

export default async function Dashboard() {
  const workouts = await getWorkouts()

  // Cálculos Simples para o Resumo
  const totalWorkouts = workouts.filter(w => w.status === 'COMPLETED').length
  const totalKmRun = workouts.reduce((acc, curr) => acc + (curr.actualDistanceKm || 0), 0)

  return (
    <div className="container mx-auto p-4 space-y-8">

      {/* --- CABEÇALHO E AÇÕES --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meu Treino Diário</h1>
          <p className="text-slate-500">Acompanhe sua evolução e consistência.</p>
        </div>
        <Link href="/registrar">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
            + Registrar Novo Treino
          </Button>
        </Link>
      </div>

      {/* --- CARDS DE RESUMO (KPIs) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinos Feitos</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-slate-500">Nos últimos registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Km Percorridos</CardTitle>
            <Footprints className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKmRun.toFixed(1)} km</div>
            <p className="text-xs text-slate-500">Total acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* --- LISTA DE TREINOS (TIMELINE) --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Histórico Recente</h2>

        {workouts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border rounded-lg bg-slate-50">
            Nenhum treino registrado ainda. Comece agora!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTE: CARD DO TREINO ---
// Como é apenas visualização, podemos deixar no mesmo arquivo para facilitar
function WorkoutCard({ workout }: { workout: any }) {
  const isRun = workout.type === 'RUN'
  const isWeight = workout.type === 'WEIGHT_TRAINING'
  const isRest = workout.type === 'REST'
  const isCompleted = workout.status === 'COMPLETED'

  // Formatação de data
  const dateFormatted = new Date(workout.date).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'long'
  })

  return (
    <Card className={`border-l-4 shadow-sm ${isRun ? 'border-l-blue-500' :
      isWeight ? 'border-l-orange-500' :
        'border-l-green-500'
      }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="capitalize">{dateFormatted}</span>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isRun && <span>🏃 Corrida</span>}
              {isWeight && <span>🏋️ Musculação</span>}
              {isRest && <span>😴 Descanso</span>}
            </CardTitle>
          </div>
          <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-green-600" : ""}>
            {isCompleted ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Circle className="w-3 h-3 mr-1" />}
            {isCompleted ? "Feito" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* CONTEÚDO DE CORRIDA */}
        {isRun && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-slate-500 text-xs">Distância</p>
              <p className="font-semibold">
                {workout.actualDistanceKm ? `${workout.actualDistanceKm} km` : '-'}
                {workout.plannedDistanceKm && <span className="text-slate-400 text-xs ml-1">/ {workout.plannedDistanceKm} km</span>}
              </p>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-slate-500 text-xs">Tempo</p>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-semibold">
                  {workout.actualTimeMin ? `${workout.actualTimeMin} min` : '-'}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded col-span-2">
              <p className="text-slate-500 text-xs">Pace (Min/Km)</p>
              <p className="font-semibold">
                {workout.actualPace || '-'}
                {workout.plannedPace && <span className="text-slate-400 text-xs ml-1">(Meta: {workout.plannedPace})</span>}
              </p>
            </div>
          </div>
        )}

        {/* CONTEÚDO DE MUSCULAÇÃO */}
        {isWeight && workout.exercises.length > 0 && (
          <div className="bg-slate-50 p-3 rounded text-sm space-y-2">
            <p className="font-semibold text-slate-700 mb-2 border-b pb-1">Série do Dia</p>
            <ul className="space-y-1">
              {workout.exercises.map((ex: any) => (
                <li key={ex.id} className="flex justify-between">
                  <span>{ex.name}</span>
                  <span className="font-mono text-slate-500">{ex.sets}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DESCRIÇÃO / OBSERVAÇÕES */}
        {workout.description && (
          <div className="text-sm text-slate-600 italic bg-yellow-50/50 p-2 rounded border border-yellow-100">
            "{workout.description}"
          </div>
        )}
      </CardContent>
    </Card>
  )
}