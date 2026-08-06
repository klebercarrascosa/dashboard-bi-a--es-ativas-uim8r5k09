import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Flag, Eye, FileText, Users, Trophy, Download, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

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

interface ActivePlansDashboardProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  onEditAction: (action: ActiveAction) => void
  onGenerateReport: (action: ActiveAction) => void
  onClientClick: (clientName: string) => void
  onRefresh?: () => void
}

export function ActivePlansDashboard({
  activeActions,
  planCalculations,
  onEditAction,
  onGenerateReport,
  onClientClick,
  onRefresh,
}: ActivePlansDashboardProps) {
  const [selectedExec, setSelectedExec] = useState<string>('all')
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [showSelectHint, setShowSelectHint] = useState(false)

  const executives = useMemo(
    () => Array.from(new Set(activeActions.map((a) => a.executive).filter(Boolean))).sort(),
    [activeActions],
  )

  const filteredActions = useMemo(() => {
    if (selectedExec === 'all') return activeActions
    return activeActions.filter((a) => a.executive === selectedExec)
  }, [activeActions, selectedExec])

  const totals = useMemo(() => {
    let totalMeta = 0
    let totalPremium = 0
    for (const a of filteredActions) {
      if (a.valor_meta && a.valor_meta > 0) totalMeta += a.valor_meta
      totalPremium += planCalculations.get(a.id ?? '')?.totalGanhoPremio ?? 0
    }
    return { totalMeta, totalPremium, count: filteredActions.length }
  }, [filteredActions, planCalculations])

  const selectedAction = useMemo(
    () => filteredActions.find((a) => a.id === selectedActionId) ?? null,
    [filteredActions, selectedActionId],
  )

  const handleGerarRelatorio = () => {
    if (!selectedAction) {
      setShowSelectHint(true)
      toast.info('Selecione um plano na tabela para gerar o relatório.')
      setTimeout(() => setShowSelectHint(false), 4000)
      return
    }
    onGenerateReport(selectedAction)
  }

  const exportToCSV = () => {
    const headers = [
      'Cliente',
      'Executivo',
      'Status',
      'Prioridade',
      'Início',
      'Fim',
      'Meta 1',
      'Meta 2',
      'Meta 3',
      'Vendido',
      'Prêmio Projetado',
      'Prêmio Ganho',
    ]
    const rows = filteredActions.map((a) => {
      const calc = planCalculations.get(a.id ?? '')
      return [
        `"${a.client_name}"`,
        `"${a.executive || ''}"`,
        `"${a.status}"`,
        `"${a.priority || ''}"`,
        a.data_inicio || '',
        a.data_fim || '',
        a.valor_meta ?? '',
        a.meta_2 ?? '',
        a.meta_3 ?? '',
        a.valor_vendido ?? '',
        calc?.premioProjetado ?? '',
        calc?.totalGanhoPremio ?? '',
      ].join(',')
    })
    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', 'Planos_Ativos_Export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exportação concluída!')
  }

  const kpiCards = [
    {
      label: 'Planos Ativos',
      value: totals.count,
      sub: selectedExec === 'all' ? 'Todos os executivos' : selectedExec,
      icon: Flag,
      color: 'amber',
      meta: totals.totalMeta,
    },
    {
      label: 'Total Meta 1',
      value: formatCurrency(totals.totalMeta),
      sub: 'Soma de todas as metas',
      icon: Users,
      color: 'emerald',
    },
    {
      label: 'Prêmio Ganho',
      value: formatCurrency(totals.totalPremium),
      sub: 'Total de prêmios já conquistados',
      icon: Trophy,
      color: 'blue',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.label}
            className={`shadow-sm border-${kpi.color}-500/20 bg-gradient-to-br from-${kpi.color}-500/5 via-transparent to-transparent`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div
                  className={`rounded-lg bg-${kpi.color}-500/10 p-2 text-${kpi.color}-600 dark:text-${kpi.color}-400`}
                >
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{kpi.value}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedExec} onValueChange={setSelectedExec}>
            <SelectTrigger className="h-8 text-xs w-[200px]">
              <SelectValue placeholder="Filtrar por executivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Executivos</SelectItem>
              {executives.map((exec) => (
                <SelectItem key={exec} value={exec}>
                  {exec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedExec !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExec('all')}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
            >
              Limpar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSelectHint && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="h-3.5 w-3.5" /> Selecione um plano primeiro
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGerarRelatorio}
            className="h-8 text-xs gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" /> Gerar Relatório
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh?.()}
            className="h-8 text-xs gap-1.5"
            disabled={!onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Recarregar
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="pt-0">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Flag className="h-8 w-8 text-muted-foreground/50" />
              <p>Nenhum plano ativo encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="text-xs whitespace-nowrap">Cliente / Agência</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Executivo</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Prioridade</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Período</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 1</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 2</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Meta 3</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Vendido</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Proj.</TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">Prêmio</TableHead>
                    <TableHead className="text-xs text-center whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => {
                    const calc = planCalculations.get(action.id ?? '')
                    const isSelected = action.id === selectedActionId
                    return (
                      <TableRow
                        key={action.id}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/30'}`}
                        onClick={() => setSelectedActionId(action.id ?? null)}
                      >
                        <TableCell className="w-10">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedActionId(action.id ?? null)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5 cursor-pointer accent-primary"
                          />
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onClientClick(action.client_name)
                            }}
                            className="text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                          >
                            {action.client_name}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {action.executive || '—'}
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
                          {formatCurrency(action.valor_vendido ?? null)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {calc?.premioProjetado != null && calc.premioProjetado > 0
                            ? formatCurrency(calc.premioProjetado)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {calc?.totalGanhoPremio != null && calc.totalGanhoPremio > 0
                            ? formatCurrency(calc.totalGanhoPremio)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditAction(action)
                              }}
                              className="h-7 text-[11px] gap-1 px-2"
                            >
                              <Eye className="h-3 w-3" /> Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onGenerateReport(action)
                              }}
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
