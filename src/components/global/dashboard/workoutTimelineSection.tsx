'use client'; // 💡 Torna este um Cliente Componente

import React, { useState, useMemo } from 'react';
import { WeeklyTimeline } from '@/components/global/workouts';
import { Workout as WorkoutType, groupWorkoutsByMonthAndWeek } from '@/utils/workout-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assumindo que você usa um Select/Dropdown

// --- TIPAGEM ---
interface WorkoutTimelineSectionProps {
  // Agora recebemos a lista completa de treinos
  allWorkouts: WorkoutType[];
}

// --- FUNÇÕES AUXILIARES DE FILTRO ---
// Função para extrair Anos Únicos
const getUniqueYears = (workouts: WorkoutType[]) => {
  const years = new Set<string>();
  workouts.forEach(workout => {
    // Garantir que a data seja tratada como Date (se não for já)
    const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
    years.add(date.getFullYear().toString());
  });
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Ordena do mais recente para o mais antigo
};

// Mapeamento de Mês
const MONTH_MAP: { [key: string]: string } = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

// --- COMPONENTE CLIENTE ---
export function WorkoutTimelineSection({ allWorkouts }: WorkoutTimelineSectionProps) {
  // 1. Estados dos Filtros
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // 2. Extração de Opções Únicas
  const uniqueYears = useMemo(() => getUniqueYears(allWorkouts), [allWorkouts]);
  const availableMonths = useMemo(() => {
    // Retorna todos os meses se o ano for 'all' ou o ano selecionado não tiver sido definido ainda.
    return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  }, []);

  // 3. Aplicação dos Filtros e Agrupamento (Memoization para performance)
  const filteredWorkouts = useMemo(() => {
    let filtered = allWorkouts;

    // Filtro por Ano
    if (selectedYear !== 'all') {
      filtered = filtered.filter(workout => {
        const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
        return date.getFullYear().toString() === selectedYear;
      });
    }

    // Filtro por Mês (só se um ano específico estiver selecionado ou se o ano for 'all' - embora não faça muito sentido filtrar o mês sem o ano)
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(workout => {
        const date = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
        // O getMonth() é 0-based, mas a conversão para string e comparação com '01' a '12' é mais fácil
        const monthString = (date.getMonth() + 1).toString().padStart(2, '0');
        return monthString === selectedMonth;
      });
    }

    // Filtro de Semana seria implementado aqui, mas é complexo pois a WeeklyTimeline já agrupa.
    // Vamos focar em Ano e Mês por enquanto, para simplificar.

    // Agrupa os treinos filtrados para a Timeline
    return groupWorkoutsByMonthAndWeek(filtered);

  }, [allWorkouts, selectedYear, selectedMonth]);

  const totalFilteredWorkouts = Object.values(filteredWorkouts).flat().length;

  return (
    <div className="space-y-4 border p-4 rounded-2xl shadow">

      {/* Título e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">📅 Meus Treinos Recentes</h2>

        {/* FILTROS */}
        <div className="flex gap-4">

          {/* Filtro de Ano */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Anos</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Mês */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={selectedYear === 'all'}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Meses</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {MONTH_MAP[month]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Semana não implementado para simplificação inicial */}

        </div>
      </div>

      {/* Timeline */}
      <div className="max-h-[600px] overflow-y-auto pr-2">
        {totalFilteredWorkouts === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-lg bg-secondary">
            {selectedYear !== 'all' || selectedMonth !== 'all'
              ? `Nenhum treino encontrado para o período selecionado.`
              : `Nenhum treino registrado ainda. Comece agora!`}
          </div>
        ) : (
          <WeeklyTimeline groupedWorkouts={filteredWorkouts} />
        )}
      </div>
    </div>
  );
}