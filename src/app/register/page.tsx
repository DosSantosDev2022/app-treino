// app/registrar/page.tsx
import WorkoutForm from '@/components/global/workout-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegistrarPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Novo Treino</h1>
        <Link href="/">
          <Button variant="ghost">Voltar ao Dashboard</Button>
        </Link>
      </div>

      <WorkoutForm />
    </div>
  )
}