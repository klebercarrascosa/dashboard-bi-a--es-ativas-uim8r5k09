import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { getMonthlyBreakdown } from '@/services/plan-calculations'
import type { SheetRow } from '@/services/sheets'
import { Flag, Target, TrendingUp, Calendar, DollarSign, Trophy } from 'lucide-react'

interface ClientPlansDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  clientName: string | null
  allActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  monthDataMap: Map<string, SheetRow[]>
}

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
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

function MetaCard({
  label,
  val,
  color,
  pct,
  falta,
}: {
  label: string
  val: number | null | undefined
  color: string
  pct: number | null | undefined
  falta: number | null | undefined
}) {
  return (
    <div className="rounded-lg border p-2.5 bg-card">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{formatCurrency(val ?? null)}</p>
      {pct !== null && pct !== undefined && (
        <div className="mt-1">
          <Progress value={Math.min(pct, 100)} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-0.5">{pct.toFixed(1)}%</p>
        </div>
      )}
      {falta !== null && falta !== undefined && (
        <p
          className={`text-[10px] mt-0.5 font-semibold ${falta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
        >
          {falta <= 0 ? '✅ Atingida' : `Falta: ${formatCurrency(falta)}`}
        </p>
      )}
    </div>
  )
}

export function ClientPlansDetailDialog({
  isOpen,
  onClose,
  clientName,
  allActions,
  planCalculations,
  monthDataMap,
}: ClientPlansDetailDialogProps) {
  if (!clientName) return null
  const norm = clientName.trim().toLowerCase()
  const clientActions = allActions
    .filter((a) => a.client_name.trim().toLowerCase() === norm)
    .sort((a, b) => (a.data_inicio || '').localeCompare(b.data_inicio || ''))

  if (clientActions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{clientName}</DialogTitle>
            <DialogDescription>
              Nenhum plano de meta encontrado para este cliente.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const totalMeta = clientActions.reduce((s, a) => s + (a.valor_meta ?? 0), 0)
  const totalSoma = clientActions.reduce(
    (s, a) => s + (planCalculations.get(a.id ?? '')?.somaVendida ?? 0),
    0,
  )
  const activeCount = clientActions.filter((a) => a.status !== 'Concluído').length
  const first = clientActions[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            {clientName}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[10px]">
              {first.executive || '—'}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-slate-500/5">
              {first.regional || '—'}
            </Badge>
            <span className="font-mono text-muted-foreground">{first.cpf_cnpj || '—'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Flag className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Planos</p>
              </div>
              <p className="text-xl font-bold">{clientActions.length}</p>
              <p className="text-[10px] text-muted-foreground">{activeCount} ativos</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Total Meta 1
                </p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalMeta)}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Soma Vendida
                </p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalSoma)}</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="h-3.5 w-3.5 text-purple-500" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">% Geral</p>
              </div>
              <p className="text-xl font-bold">
                {totalMeta > 0 ? `${((totalSoma / totalMeta) * 100).toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {clientActions.map((action, idx) => {
            const calc = planCalculations.get(action.id ?? '') ?? null
            const breakdown = getMonthlyBreakdown(
              monthDataMap,
              action.client_name,
              action.cpf_cnpj,
              action.data_inicio,
              action.data_fim,
            )
            return (
              <Card key={action.id ?? idx} className="border-l-4 border-l-amber-500/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Plano {idx + 1}: {formatDateBR(action.data_inicio)} →{' '}
                      {formatDateBR(action.data_fim)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
                    >
                      {action.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MetaCard
                      label="Meta 1"
                      val={action.valor_meta}
                      color="text-amber-600 dark:text-amber-400"
                      pct={calc?.pctAtingido}
                      falta={calc?.quantoFalta}
                    />
                    <MetaCard
                      label="Meta 2"
                      val={action.meta_2}
                      color="text-blue-600 dark:text-blue-400"
                      pct={calc?.pctAtingidoMeta2}
                      falta={calc?.quantoFaltaMeta2}
                    />
                    <MetaCard
                      label="Meta 3"
                      val={action.meta_3}
                      color="text-purple-600 dark:text-purple-400"
                      pct={calc?.pctAtingidoMeta3}
                      falta={calc?.quantoFaltaMeta3}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" /> Soma Vendida (no período)
                    </span>
                    <span className="text-sm font-bold">
                      {formatCurrency(calc?.somaVendida ?? 0)}
                    </span>
                  </div>
                  {breakdown.length > 0 && (
                    <div className="pt-1 border-t">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">
                        Detalhamento Mensal
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {breakdown.map((e) => (
                          <div
                            key={e.month}
                            className="rounded-md bg-muted/40 px-2 py-1 text-[10px]"
                          >
                            <span className="text-muted-foreground">{e.month}: </span>
                            <span
                              className={`font-mono font-semibold ${e.venda !== null ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {formatCurrency(e.venda)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {action.note && (
                    <div className="pt-1 border-t">
                      <span className="text-[10px] text-muted-foreground">Obs: </span>
                      <span className="text-xs">{action.note}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
