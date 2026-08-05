import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { Flag, TrendingUp, Eye, FileText, Trophy } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Média: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Baixa: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
}

function formatDateBR(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return '—'
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

function isActivePlan(action: ActiveAction, today: string): boolean {
  if (action.status === 'Concluído') return false
  if (!action.data_inicio || !action.data_fim) return false
  return today >= action.data_inicio && today <= action.data_fim
}

interface ExecutivePlansViewProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  today: string
  onClientClick: (clientName: string) => void
  onEditAction: (action: ActiveAction) => void
  onGenerateReport: (action: ActiveAction) => void
  initialExec?: string | null
}

export function ExecutivePlansView({
  activeActions,
  planCalculations,
  today,
  onClientClick,
  onEditAction,
  onGenerateReport,
  initialExec,
}: ExecutivePlansViewProps) {
  const [selectedExec, setSelectedExec] = useState<string | null>(initialExec ?? null)

  const executiveStats = useMemo(() => {
    const map = new Map<string, { count: number; totalMeta: number; totalSoma: number }>()
    for (const action of activeActions) {
      const exec = action.executive || 'Sem Executivo'
      if (!map.has(exec)) map.set(exec, { count: 0, totalMeta: 0, totalSoma: 0 })
      const s = map.get(exec)!
      s.totalMeta += action.valor_meta && action.valor_meta > 0 ? action.valor_meta : 0
      s.totalSoma += planCalculations.get(action.id ?? '')?.somaVendida ?? 0
      if (isActivePlan(action, today)) s.count++
    }
    return Array.from(map.entries())
      .map(([exec, s]) => ({
        exec,
        activePlanCount: s.count,
        growthPct: s.totalMeta > 0 ? (s.totalSoma / s.totalMeta) * 100 : 0,
      }))
      .sort((a, b) => b.activePlanCount - a.activePlanCount)
  }, [activeActions, planCalculations, today])

  const visibleActivePlans = useMemo(() => {
    if (!selectedExec) return []
    return activeActions
      .filter((a) => (a.executive || 'Sem Executivo') === selectedExec && isActivePlan(a, today))
      .sort((a, b) => a.client_name.localeCompare(b.client_name))
  }, [activeActions, selectedExec, today])

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {executiveStats.map(({ exec, activePlanCount, growthPct }, idx) => (
          <Card
            key={exec}
            className={`cursor-pointer hover:shadow-md hover:border-amber-500/40 transition-all border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent ${selectedExec === exec ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => setSelectedExec(exec === selectedExec ? null : exec)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate">
                  {exec}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {idx === 0 && activePlanCount > 0 && (
                    <Trophy className="h-3 w-3 text-amber-500" />
                  )}
                  <Flag className="h-3 w-3 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold">{activePlanCount}</p>
              <p className="text-[10px] text-muted-foreground">
                {activePlanCount === 1 ? 'plano ativo' : 'planos ativos'}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {growthPct.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedExec && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            Planos ativos de <span className="text-foreground">{selectedExec}</span>{' '}
            <Badge
              variant="outline"
              className="ml-1 bg-amber-500/10 text-amber-600 border-amber-500/30"
            >
              {visibleActivePlans.length}
            </Badge>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedExec(null)}
            className="h-7 text-xs"
          >
            Ver todos
          </Button>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="pt-0">
          {!selectedExec ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Flag className="h-8 w-8 text-muted-foreground/50" />
              <p>Selecione um executivo acima para ver seus planos ativos.</p>
            </div>
          ) : visibleActivePlans.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Nenhum plano ativo encontrado para {selectedExec}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap">Cliente / Agência</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Prioridade</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Período</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 1</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 2</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 3</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">
                      Soma Vendida
                    </TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">
                      Quanto Falta
                    </TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">
                      % Atingido
                    </TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Ganho</TableHead>
                    <TableHead className="text-xs text-center whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleActivePlans.map((action) => {
                    const calc = planCalculations.get(action.id ?? '')
                    return (
                      <TableRow key={action.id}>
                        <TableCell className="text-xs font-semibold">
                          <button
                            onClick={() => onClientClick(action.client_name)}
                            className="text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                          >
                            {action.client_name}
                          </button>
                        </TableCell>
                        <TableCell>
                          {action.priority && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${PRIORITY_COLORS[action.priority] ?? ''}`}
                            >
                              {action.priority}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
                          >
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateBR(action.data_inicio)} → {formatDateBR(action.data_fim)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {formatCurrency(action.valor_meta ?? null)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {formatCurrency(action.meta_2 ?? null)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {formatCurrency(action.meta_3 ?? null)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {formatCurrency(calc?.somaVendida ?? 0)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {calc?.quantoFalta != null
                            ? calc.quantoFalta <= 0
                              ? '✅ Atingida'
                              : formatCurrency(calc.quantoFalta)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {calc?.pctAtingido != null ? `${calc.pctAtingido.toFixed(1)}%` : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {calc?.ganhoPremio != null && calc.ganhoPremio > 0
                            ? formatCurrency(calc.ganhoPremio)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditAction(action)}
                              className="h-7 text-[11px] gap-1 px-2"
                            >
                              <Eye className="h-3 w-3" /> Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onGenerateReport(action)}
                              className="h-7 text-[11px] px-2 text-blue-600 hover:bg-blue-500/10"
                              title="Gerar Relatório"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
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
    </div>
  )
}
