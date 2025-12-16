import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

// O componente de um único card placeholder
export function ResumCardSkeleton() {
  return (
    <Card className="min-h-35"> {/* Altura mínima para evitar layout shift */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Título do Card */}
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-30" />
        </CardTitle>
        {/* Ícone */}
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        {/* Valor Principal */}
        <div className="text-2xl font-bold">
          <Skeleton className="h-8 w-22.5" />
        </div>
        {/* Subtítulo */}
        <p className="text-xs text-muted-foreground mt-1">
          <Skeleton className="h-3 w-37.5" />
        </p>
      </CardContent>
    </Card>
  );
}

// Ele usa a mesma lógica responsiva do seu Dashboard para manter o layout estável.
export const ResumCardsGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <React.Fragment>
    {[...Array(count)].map((_, index) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        key={index}
        className='flex-1 min-w-[45%] md:min-w-0 md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] space-y-1.5'
      >
        <ResumCardSkeleton />
        <ResumCardSkeleton />
      </div>
    ))}
  </React.Fragment>
);