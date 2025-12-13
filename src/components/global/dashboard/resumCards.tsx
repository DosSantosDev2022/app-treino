import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/prisma';
import * as Prisma from '@prisma/client';

// --- TIPAGEM ---
interface DashboardCardProps {
  title: string;
  unit: string;
  icon: React.ElementType;
  timeframe: 'total' | 'year' | 'month' | 'week';
  metric: 'workouts' | 'distance';
}

// --- FUNÇÕES AUXILIARES DE DATA ---
function getCurrentWeekDateRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
}

// --- FUNÇÃO DE BUSCA DE DADOS (CORE DO SERVER COMPONENT) ---
async function fetchMetricData(timeframe: DashboardCardProps['timeframe'], metric: DashboardCardProps['metric']): Promise<number> {
  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;
  const now = new Date();

  // 1. Definição do Período de Tempo
  switch (timeframe) {
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'week': {
      const weekRange = getCurrentWeekDateRange();
      startDate = weekRange.start;
      endDate = weekRange.end;
      break;
    }
    case 'total':
    default:
      break;
  }

  // O filtro de data e status
  const baseWhere = {
    status: Prisma.Status.COMPLETED, // Usando o Enum do Prisma para tipagem correta
    date: (startDate && endDate) ? {
      gte: startDate,
      lte: endDate,
    } : undefined,
  };

  let value: number = 0; // Variável para armazenar o resultado

  // 2. Busca Otimizada no Banco de Dados (✅ SOLUÇÃO DEFINITIVA)
  if (metric === 'workouts') {
    const aggregation = await db.workout.aggregate({
      _count: { id: true }, // Passa o objeto de contagem exato
      where: baseWhere,
    });
    value = aggregation._count?.id || 0;

  } else if (metric === 'distance') {
    const aggregation = await db.workout.aggregate({
      _sum: { actualDistanceKm: true }, // Passa o objeto de soma exato
      where: baseWhere,
    });
    value = aggregation._sum?.actualDistanceKm || 0;
  }

  // 3. Retorna o Resultado
  return value;
}


// --- COMPONENTE DE SERVIDOR ---
const ResumCards = async ({
  title,
  unit,
  icon: Icon,
  timeframe,
  metric,
}: DashboardCardProps) => {

  const value = await fetchMetricData(timeframe, metric);

  const displayValue = metric === 'distance' ? value.toFixed(1) : value.toString();

  const subtitleMap = {
    'total': 'Total acumulado',
    'year': `Acumulado em ${new Date().getFullYear()}`,
    'month': 'No mês atual',
    'week': 'Na semana atual'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayValue} {unit}
        </div>
        <p className="text-xs text-muted-foreground">
          {subtitleMap[timeframe]}
        </p>
      </CardContent>
    </Card>
  );
}

export { ResumCards }