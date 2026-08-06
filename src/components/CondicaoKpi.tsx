import { Card, CardContent } from '@/components/ui/card'
import type { ActiveAction } from '@/services/actions'
import { Plane } from 'lucide-react'

interface CondicaoKpiProps {
  activeActions: ActiveAction[]
}

export function CondicaoKpi({ activeActions }: CondicaoKpiProps) {
  const gol = activeActions.filter((a) => a.condicao === 'GOL').length
  const latam = activeActions.filter((a) => a.condicao === 'LATAM').length
  const azul = activeActions.filter((a) => a.condicao === 'AZUL TOP').length
  const total = gol + latam + azul

  const items = [
    {
      label: 'GOL',
      count: gol,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      label: 'LATAM',
      count: latam,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'AZUL TOP',
      count: azul,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="h-4 w-4 text-sky-500" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Clientes por Condição
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border ${item.border} ${item.bg} p-2 text-center`}
            >
              <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Total: {total} cliente{total !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}
