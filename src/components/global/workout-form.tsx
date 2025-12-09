// components/workout-form.tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createWorkout } from '@/actions/workout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Tipos auxiliares para o formulário
type ActivityType = 'RUN' | 'WEIGHT_TRAINING' | 'REST'
type Status = 'PENDING' | 'COMPLETED'

export default function WorkoutForm() {
  // --- Estados do Formulário ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<ActivityType>('RUN')
  const [status, setStatus] = useState<Status>('PENDING')
  const [description, setDescription] = useState('')

  // Estados Específicos de Corrida
  const [runData, setRunData] = useState({
    plannedDist: '', actualDist: '',
    plannedTime: '', actualTime: '',
    plannedPace: '', actualPace: ''
  })

  // Estados Específicos de Musculação (Lista de exercícios)
  const [exercises, setExercises] = useState([{ name: '', sets: '' }])

  // --- Funções Auxiliares ---

  // Adicionar nova linha de exercício
  const addExercise = () => setExercises([...exercises, { name: '', sets: '' }])

  // Atualizar exercício específico
  const updateExercise = (index: number, field: 'name' | 'sets', value: string) => {
    const newExercises = [...exercises]
    newExercises[index][field] = value
    setExercises(newExercises)
  }

  // --- Integração com Server Action (React Query) ---
  const mutation = useMutation({
    mutationFn: async () => {
      // Prepara os dados convertendo strings para números quando necessário
      return await createWorkout({
        date: new Date(date),
        type,
        status,
        description,
        // Envia dados de corrida apenas se for corrida
        plannedDistanceKm: type === 'RUN' && runData.plannedDist ? parseFloat(runData.plannedDist) : undefined,
        actualDistanceKm: type === 'RUN' && runData.actualDist ? parseFloat(runData.actualDist) : undefined,
        plannedTimeMin: type === 'RUN' && runData.plannedTime ? parseInt(runData.plannedTime) : undefined,
        actualTimeMin: type === 'RUN' && runData.actualTime ? parseInt(runData.actualTime) : undefined,
        plannedPace: type === 'RUN' ? runData.plannedPace : undefined,
        actualPace: type === 'RUN' ? runData.actualPace : undefined,
        // Envia exercícios apenas se for musculação
        exercises: type === 'WEIGHT_TRAINING' ? exercises.filter(e => e.name) : undefined
      })
    },
    onSuccess: () => {
      alert('Treino registrado com sucesso!')
      // Resetar formulário básico (opcional)
      setDescription('')
      setExercises([{ name: '', sets: '' }])
    },
    onError: () => {
      alert('Erro ao registrar treino.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-slate-900 text-white rounded-t-lg">
        <CardTitle>Registrar Atividade</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Seção 1: Dados Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Atividade</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUN">🏃 Corrida</SelectItem>
                  <SelectItem value="WEIGHT_TRAINING">🏋️ Musculação</SelectItem>
                  <SelectItem value="REST">😴 Descanso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">📅 Planejado (Pendente)</SelectItem>
                  <SelectItem value="COMPLETED">✅ Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção 2: Campos Dinâmicos - CORRIDA */}
          {type === 'RUN' && (
            <div className="border p-4 rounded-md bg-slate-50 space-y-4">
              <h3 className="font-semibold text-slate-700">Detalhes da Corrida</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Planejado */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">Planejado</Label>
                  <Input placeholder="Distância (km)" type="number" step="0.01"
                    value={runData.plannedDist} onChange={e => setRunData({ ...runData, plannedDist: e.target.value })} />
                  <Input placeholder="Tempo (min)" type="number"
                    value={runData.plannedTime} onChange={e => setRunData({ ...runData, plannedTime: e.target.value })} />
                  <Input placeholder="Pace (ex: 5:30)"
                    value={runData.plannedPace} onChange={e => setRunData({ ...runData, plannedPace: e.target.value })} />
                </div>

                {/* Realizado */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase">Executado</Label>
                  <Input placeholder="Distância (km)" type="number" step="0.01"
                    value={runData.actualDist} onChange={e => setRunData({ ...runData, actualDist: e.target.value })} />
                  <Input placeholder="Tempo (min)" type="number"
                    value={runData.actualTime} onChange={e => setRunData({ ...runData, actualTime: e.target.value })} />
                  <Input placeholder="Pace (ex: 5:25)"
                    value={runData.actualPace} onChange={e => setRunData({ ...runData, actualPace: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Seção 3: Campos Dinâmicos - MUSCULAÇÃO */}
          {type === 'WEIGHT_TRAINING' && (
            <div className="border p-4 rounded-md bg-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Série de Exercícios</h3>
                <Button type="button" variant="outline" size="sm" onClick={addExercise}>+ Adicionar</Button>
              </div>

              {exercises.map((ex, idx) => (
                <div key={ex.name} className="flex gap-2">
                  <Input placeholder="Exercício (ex: Supino)"
                    value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)}
                    className="flex-1" />
                  <Input placeholder="Séries (ex: 3x15)"
                    value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)}
                    className="w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Observações Gerais */}
          <div className="space-y-2">
            <Label>Observações / Como me senti</Label>
            <Textarea
              placeholder="Ex: Cansaço acima do normal, ou me senti muito bem..."
              value={description} onChange={e => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Treino'}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}