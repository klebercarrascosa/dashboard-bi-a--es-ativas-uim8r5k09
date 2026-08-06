import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import { updateActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import type { SheetRow } from '@/services/sheets'
import { PlanDetailReport } from '@/components/PlanDetailReport'
import { ReportDialog } from '@/components/ReportDialog'
import { Flag, Target, TrendingUp, Trophy, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface ClientPlansDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  clientName: string | null
  allActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  monthDataMap: Map<string, SheetRow[]>
  isAdmin?: boolean
  onUpdate?: () => void
}

export function ClientPlansDetailDialog({
  isOpen,
  onClose,
  clientName,
  allActions,
  planCalculations,
  monthDataMap,
  isAdmin = false,
  onUpdate,
}: ClientPlansDetailDialogProps) {
  const [reportAction, setReportAction] = useState<ActiveAction | null>(null)

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
  const reportCalc = reportAction ? (planCalculations.get(reportAction.id ?? '') ?? null) : null

  const handleMarkReportAsSent = async (actionId: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      await updateActiveAction(actionId, { ultimo_relatorio: today })
      onUpdate?.()
      toast.success('Relatório marcado como enviado!')
    } catch {
      toast.error('Erro ao atualizar relatório.')
    }
  }

  return (
    <>
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
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Planos
                  </p>
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
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    % Geral
                  </p>
                </div>
                <p className="text-xl font-bold">
                  {totalMeta > 0 ? `${((totalSoma / totalMeta) * 100).toFixed(1)}%` : '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {clientActions.map((action, idx) => (
              <Card key={action.id ?? idx} className="border-l-4 border-l-amber-500/40">
                <CardContent className="p-4">
                  <PlanDetailReport
                    action={action}
                    calc={planCalculations.get(action.id ?? '') ?? null}
                    monthDataMap={monthDataMap}
                    planIndex={idx}
                    isAdmin={isAdmin}
                  />
                  {action.id && (
                    <div className="flex justify-end pt-2 border-t mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReportAction(action)}
                        className="h-7 text-[11px] gap-1.5 text-blue-600 hover:bg-blue-500/10"
                      >
                        <FileText className="h-3 w-3" />
                        Gerar Relatório
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ReportDialog
        isOpen={!!reportAction}
        onClose={() => setReportAction(null)}
        action={reportAction}
        calc={reportCalc}
        onMarkAsSent={handleMarkReportAsSent}
      />
    </>
  )
}
