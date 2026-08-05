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
import { Trophy, Flag, Eye, FileText, Users, TrendingUp, ArrowLeft } from 'lucide-react'

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

interface MyTeamDashboardProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  today: string
  onClientClick: (clientName: string) => void
  onEditAction: (action: ActiveAction) => void
  onGenerateReport: (action: ActiveAction) => void
}

export function MyTeamDashboard({
  activeActions,
  planCalculations,
  today,
  onClientClick,
  onEditAction,
  onGenerateReport,
}: MyTeamDashboardProps) {
  const [selectedExec, setSelectedExec] = useState<string | null>(null)

  const executiveRanking = useMemo(() => {
    const map = new Map<string, { count: number; totalMeta: number; totalSoma: number }>()
    for (const action of activeActions) {
      if (!isActivePlan(action, today)) continue
      const exec = action.executive || 'Sem Executivo'
      if (!map.has(exec)) map.set(exec, { count: 0, totalMeta: 0, totalSoma: 0 })
      const s = map.get(exec)!
      s.count++
      s.totalMeta += action.valor_meta && action.valor_meta > 0 ? action.valor_meta : 0
      s.totalSoma += planCalculations.get(action.id ?? '')?.somaVendida ?? 0
    }
    return Array.from(map.entries())
      .map(([exec, s]) => ({
        exec,
        count: s.count,
        growthPct: s.totalMeta > 0 ? (s.totalSoma / s.totalMeta) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [activeActions, planCalculations, today])

  const selectedPlans = useMemo(() => {
    if (!selectedExec) return []
    return activeActions
      .filter((a) => (a.executive || 'Sem Executivo') === selectedExec && isActivePlan(a, today))
      .sort((a, b) => a.client_name.localeCompare(b.client_name))
  }, [activeActions, selectedExec, today])

  if (selectedExec) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setSelectedExec(null)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar ao ranking
          </Button>
          <h2 className="text-lg font-bold">Planos ativos — {selectedExec}</h2>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            {selectedPlans.length}
          </Badge>
        </div>
        <Card className="shadow-sm">
          <CardContent className="pt-0">
            {selectedPlans.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum plano ativo encontrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs whitespace-nowrap">Cliente</TableHead>
                      <TableHead className="text-xs whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-xs whitespace-nowrap">Prioridade</TableHead>
                      <TableHead className="text-xs whitespace-nowrap">Período</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">Meta 1</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">Meta 2</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">Meta 3</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">
                        Vendido
                      </TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">Falta</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">%</TableHead>
                      <TableHead className="text-xs text-right whitespace-nowrap">Ganho</TableHead>
                      <TableHead className="text-xs text-center whitespace-nowrap">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlans.map((action) => {
                      const calc = planCalculations.get(action.id ?? '')
                      return (
                        <TableRow key={action.id}>
                          <TableCell className="text-xs font-semibold">
                            <button
                              onClick={() => onClientClick(action.client_name)}
                              className="text-left hover:text-primary hover:underline cursor-pointer"
                            >
                              {action.client_name}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
                            >
                              {action.status}
                            </Badge>
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
                                ? '✅'
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

  const totalPlans = executiveRanking.reduce((s, e) => s + e.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Meu Time
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranking de executivos por planos de meta ativos
          </p>
        </div>
        {executiveRanking.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold flex items-center gap-1">
              <Flag className="h-3 w-3 text-amber-500" />
              {totalPlans} {totalPlans === 1 ? 'plano ativo' : 'planos ativos'}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-500" />
              {executiveRanking.length} {executiveRanking.length === 1 ? 'executivo' : 'executivos'}
            </span>
          </div>
        )}
      </div>

      {executiveRanking.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum plano de meta ativo encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {executiveRanking.map(({ exec, count, growthPct }, idx) => (
            <Card
              key={exec}
              className="cursor-pointer hover:shadow-md hover:border-amber-500/40 transition-all border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent"
              onClick={() => setSelectedExec(exec)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                            ? 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200'
                            : idx === 2
                              ? 'bg-orange-400 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold truncate" title={exec}>
                      {exec}
                    </p>
                  </div>
                  {idx === 0 && count > 0 && <Trophy className="h-4 w-4 text-amber-500 shrink-0" />}
                </div>
                <p className="text-3xl font-extrabold">{count}</p>
                <p className="text-[10px] text-muted-foreground">
                  {count === 1 ? 'plano ativo' : 'planos ativos'}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {growthPct.toFixed(1)}% cresc.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
