import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { Flag, Users, TrendingUp } from 'lucide-react'

interface ActivePlansViewProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
}

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
}

export function ActivePlansView({ activeActions, planCalculations }: ActivePlansViewProps) {
  const plansWithData = activeActions
    .map((action) => ({
      action,
      calc: planCalculations.get(action.client_name) ?? null,
    }))
    .sort((a, b) => {
      const aCompleted = a.action.status === 'Concluído' ? 1 : 0
      const bCompleted = b.action.status === 'Concluído' ? 1 : 0
      if (aCompleted !== bCompleted) return aCompleted - bCompleted
      return a.action.client_name.localeCompare(b.action.client_name)
    })

  const totalMeta = activeActions.reduce(
    (sum, a) => sum + (a.valor_meta && a.valor_meta > 0 ? a.valor_meta : 0),
    0,
  )
  const totalSoma = plansWithData.reduce((sum, { calc }) => sum + (calc?.somaVendida ?? 0), 0)
  const activeCount = activeActions.filter((a) => a.status !== 'Concluído').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total de Planos
              </p>
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Flag className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{activeActions.length}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{activeCount} ativos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Meta
              </p>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
              {formatCurrency(totalMeta)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Soma de todas as metas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Soma Vendida
              </p>
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
              {formatCurrency(totalSoma)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalMeta > 0 ? `${((totalSoma / totalMeta) * 100).toFixed(1)}% do total` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Flag className="h-5 w-5 text-amber-500" />
            Todas as Agências com Plano de Meta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {plansWithData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Nenhum plano de meta cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Cliente / Agência</TableHead>
                    <TableHead className="text-xs">Executivo</TableHead>
                    <TableHead className="text-xs">Regional</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Meta</TableHead>
                    <TableHead className="text-xs text-right">Meta 2</TableHead>
                    <TableHead className="text-xs text-right">Soma Vendida</TableHead>
                    <TableHead className="text-xs text-right">Quanto Falta</TableHead>
                    <TableHead className="text-xs text-right">Quanto Falta (M2)</TableHead>
                    <TableHead className="text-xs text-right">% Atingido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansWithData.map(({ action, calc }) => (
                    <TableRow key={action.id}>
                      <TableCell className="text-xs font-semibold">{action.client_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {action.executive || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {action.regional || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
                        >
                          {action.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {formatCurrency(action.valor_meta ?? null)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {formatCurrency(action.meta_2 ?? null)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {formatCurrency(calc?.somaVendida ?? 0)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {calc?.quantoFalta !== null && calc?.quantoFalta !== undefined ? (
                          <span
                            className={
                              calc.quantoFalta <= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }
                          >
                            {calc.quantoFalta <= 0 ? '✅' : formatCurrency(calc.quantoFalta)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {calc?.quantoFaltaMeta2 !== null && calc?.quantoFaltaMeta2 !== undefined ? (
                          <span
                            className={
                              calc.quantoFaltaMeta2 <= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }
                          >
                            {calc.quantoFaltaMeta2 <= 0
                              ? '✅'
                              : formatCurrency(calc.quantoFaltaMeta2)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">
                        {calc?.pctAtingido !== null && calc?.pctAtingido !== undefined
                          ? `${calc.pctAtingido.toFixed(1)}%`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
