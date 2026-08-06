import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { ConditionSelector } from '@/components/ConditionSelector'
import type { ActiveAction } from '@/services/actions'
import { Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CondicaoPanelProps {
  activeActions: ActiveAction[]
  isAdmin: boolean
  onUpdate?: () => void
}

const CONDICAO_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  GOL: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  LATAM: {
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  'AZUL TOP': {
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
}

export function CondicaoPanel({ activeActions, isAdmin, onUpdate }: CondicaoPanelProps) {
  const withCondicao = activeActions.filter(
    (a) => a.condicao && a.condicao.trim() !== '' && a.status !== 'Concluído',
  )
  const withoutCondicao = activeActions.filter(
    (a) => (!a.condicao || a.condicao.trim() === '') && a.status !== 'Concluído',
  )

  const gol = withCondicao.filter((a) => a.condicao === 'GOL').length
  const latam = withCondicao.filter((a) => a.condicao === 'LATAM').length
  const azul = withCondicao.filter((a) => a.condicao === 'AZUL TOP').length
  const total = gol + latam + azul

  const order: Record<string, number> = { GOL: 0, LATAM: 1, 'AZUL TOP': 2 }
  const sorted = [...withCondicao].sort((a, b) => {
    const oa = order[a.condicao as string] ?? 3
    const ob = order[b.condicao as string] ?? 3
    if (oa !== ob) return oa - ob
    return a.client_name.localeCompare(b.client_name)
  })

  const allClients = isAdmin
    ? [...sorted, ...withoutCondicao.sort((a, b) => a.client_name.localeCompare(b.client_name))]
    : sorted

  const kpiItems = [
    { label: 'GOL', count: gol, key: 'GOL' },
    { label: 'LATAM', count: latam, key: 'LATAM' },
    { label: 'AZUL TOP', count: azul, key: 'AZUL TOP' },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plane className="h-4 w-4 text-sky-500" />
            Clientes GOL / LATAM / AZUL TOP
          </CardTitle>
          <span className="text-[11px] font-medium text-muted-foreground">
            {total} cliente{total !== 1 ? 's' : ''} marcado{total !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {kpiItems.map((item) => {
            const style = CONDICAO_STYLES[item.key]
            return (
              <div
                key={item.label}
                className={cn(
                  'rounded-lg border p-2.5 text-center transition-all duration-200',
                  style.border,
                  style.bg,
                )}
              >
                <p className={cn('text-2xl font-extrabold tabular-nums', style.color)}>
                  {item.count}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">
                  {item.label}
                </p>
              </div>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {allClients.length === 0 ? (
          <div className="px-4 pb-4 py-10 text-center">
            <Plane className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum cliente marcado ainda.</p>
            {isAdmin && (
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Use os botões abaixo de cada cliente para definir a condição.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-auto max-h-[340px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                    Exec
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                    Condição
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allClients.map((action) => {
                  const hasCondicao = action.condicao && action.condicao.trim() !== ''
                  return (
                    <TableRow
                      key={action.id}
                      className={cn(
                        'transition-colors',
                        hasCondicao && CONDICAO_STYLES[action.condicao as string]?.bg,
                      )}
                    >
                      <TableCell className="text-xs font-medium py-2.5 max-w-[140px] truncate">
                        {action.client_name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 max-w-[80px] truncate">
                        {action.executive || '—'}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <ConditionSelector
                          actionId={action.id!}
                          currentCondicao={action.condicao}
                          isAdmin={isAdmin}
                          onUpdate={onUpdate}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
