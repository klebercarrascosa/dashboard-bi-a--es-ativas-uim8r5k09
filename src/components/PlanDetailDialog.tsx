import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'

interface PlanDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  action: ActiveAction | null
  calc: PlanCalculation | null
}

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
}

function formatDateBR(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === '') return '—'
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

export function PlanDetailDialog({ isOpen, onClose, action, calc }: PlanDetailDialogProps) {
  if (!action) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{action.client_name}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[10px]">
              {action.executive || '—'}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-slate-500/5">
              {action.regional || '—'}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
            >
              {action.status}
            </Badge>
            <span className="font-mono text-muted-foreground">
              {formatDateBR(action.data_inicio)} → {formatDateBR(action.data_fim)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalhes do Plano de Meta
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Meta 1</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(action.valor_meta ?? null)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Meta 2</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(action.meta_2 ?? null)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Meta 3</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(action.meta_3 ?? null)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Soma Vendida</span>
                <span className="font-bold">{formatCurrency(calc?.somaVendida ?? 0)}</span>
              </div>
            </div>

            <div className="pt-2 border-t space-y-2">
              {calc?.quantoFalta !== null && calc?.quantoFalta !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quanto Falta (M1): </span>
                  <span
                    className={`font-bold ${calc.quantoFalta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                  >
                    {calc.quantoFalta <= 0
                      ? '✅ Meta 1 Atingida!'
                      : formatCurrency(calc.quantoFalta)}
                  </span>
                </div>
              )}
              {calc?.quantoFaltaMeta2 !== null && calc?.quantoFaltaMeta2 !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quanto Falta (M2): </span>
                  <span
                    className={`font-bold ${calc.quantoFaltaMeta2 <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}
                  >
                    {calc.quantoFaltaMeta2 <= 0
                      ? '✅ Meta 2 Atingida!'
                      : formatCurrency(calc.quantoFaltaMeta2)}
                  </span>
                </div>
              )}
              {calc?.quantoFaltaMeta3 !== null && calc?.quantoFaltaMeta3 !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quanto Falta (M3): </span>
                  <span
                    className={`font-bold ${calc.quantoFaltaMeta3 <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}
                  >
                    {calc.quantoFaltaMeta3 <= 0
                      ? '✅ Meta 3 Atingida!'
                      : formatCurrency(calc.quantoFaltaMeta3)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">% Meta 1</span>
                <span className="font-bold">
                  {calc?.pctAtingido !== null && calc?.pctAtingido !== undefined
                    ? `${calc.pctAtingido.toFixed(1)}%`
                    : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">% Meta 2</span>
                <span className="font-bold">
                  {calc?.pctAtingidoMeta2 !== null && calc?.pctAtingidoMeta2 !== undefined
                    ? `${calc.pctAtingidoMeta2.toFixed(1)}%`
                    : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">% Meta 3</span>
                <span className="font-bold">
                  {calc?.pctAtingidoMeta3 !== null && calc?.pctAtingidoMeta3 !== undefined
                    ? `${calc.pctAtingidoMeta3.toFixed(1)}%`
                    : '—'}
                </span>
              </div>
            </div>

            {action.note && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">Observação: </span>
                <span className="text-sm">{action.note}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
