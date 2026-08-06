import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ConditionSelector } from '@/components/ConditionSelector'
import { normalizeCondicao, type ActiveAction } from '@/services/actions'
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
  AZUL: {
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  RC: {
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
}

const ALL_CONDITIONS = ['GOL', 'LATAM', 'AZUL', 'RC'] as const

export function CondicaoPanel({ activeActions, isAdmin, onUpdate }: CondicaoPanelProps) {
  const withCondicao = activeActions.filter(
    (a) => normalizeCondicao(a.condicao).length > 0 && a.status !== 'Concluído',
  )

  const counts = ALL_CONDITIONS.map((cond) => ({
    label: cond,
    count: withCondicao.filter((a) => normalizeCondicao(a.condicao).includes(cond)).length,
    key: cond,
  }))

  const total = withCondicao.length

  const order: Record<string, number> = { GOL: 0, LATAM: 1, AZUL: 2, RC: 3 }
  const sorted = [...withCondicao].sort((a, b) => {
    const aCond = normalizeCondicao(a.condicao)[0] || ''
    const bCond = normalizeCondicao(b.condicao)[0] || ''
    const oa = order[aCond] ?? 4
    const ob = order[bCond] ?? 4
    if (oa !== ob) return oa - ob
    return a.client_name.localeCompare(b.client_name)
  })

  const allClients = sorted

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plane className="h-4 w-4 text-sky-500" />
            Clientes GOL / LATAM / AZUL / RC
          </CardTitle>
          <span className="text-[11px] font-medium text-muted-foreground">
            {total} cliente{total !== 1 ? 's' : ''} marcado{total !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {counts.map((item) => {
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
                Marque uma condição (GOL, LATAM, AZUL ou RC) para um cliente na tabela de
                Detalhamento para vê-lo aqui.
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
                    Condições
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allClients.map((action) => {
                  const conditions = normalizeCondicao(action.condicao)
                  const hasCondicao = conditions.length > 0
                  const firstCond = conditions[0]
                  return (
                    <TableRow
                      key={action.id}
                      className={cn(
                        'transition-colors',
                        hasCondicao && firstCond && CONDICAO_STYLES[firstCond]?.bg,
                      )}
                    >
                      <TableCell className="text-xs font-medium py-2.5 max-w-[140px] truncate">
                        {action.client_name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 max-w-[80px] truncate">
                        {action.executive || '—'}
                      </TableCell>
                      <TableCell className="py-2.5">
                        {isAdmin && action.id ? (
                          <ConditionSelector
                            actionId={action.id}
                            currentCondicao={action.condicao}
                            isAdmin={isAdmin}
                            onUpdate={onUpdate}
                          />
                        ) : hasCondicao ? (
                          <div className="flex flex-wrap gap-1">
                            {conditions.map((c) => (
                              <Badge
                                key={c}
                                variant="outline"
                                className={cn(
                                  'text-[10px] font-semibold',
                                  CONDICAO_STYLES[c]?.border,
                                  CONDICAO_STYLES[c]?.bg,
                                  CONDICAO_STYLES[c]?.color,
                                )}
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
