import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { Flag, Users, TrendingUp, Eye, FileText, Trash2 } from 'lucide-react'

interface ActivePlansViewProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  onEditAction: (action: ActiveAction) => void
  onGenerateReport: (action: ActiveAction) => void
  onDeleteAction: (action: ActiveAction) => void
  onClientClick: (clientName: string) => void
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

function renderFalta(val: number | null | undefined) {
  if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>
  if (val <= 0)
    return (
      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
        ✅ Atingida
      </span>
    )
  return (
    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
      {formatCurrency(val)}
    </span>
  )
}

export function ActivePlansView({
  activeActions,
  planCalculations,
  onEditAction,
  onGenerateReport,
  onDeleteAction,
  onClientClick,
}: ActivePlansViewProps) {
  const [deleteTarget, setDeleteTarget] = useState<ActiveAction | null>(null)

  const plansWithData = activeActions
    .map((action) => ({
      action,
      calc: planCalculations.get(action.id ?? '') ?? null,
    }))
    .sort((a, b) => {
      const aDone = a.action.status === 'Concluído' ? 1 : 0
      const bDone = b.action.status === 'Concluído' ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      return a.action.client_name.localeCompare(b.action.client_name)
    })

  const totalMeta = activeActions.reduce(
    (s, a) => s + (a.valor_meta && a.valor_meta > 0 ? a.valor_meta : 0),
    0,
  )
  const totalSoma = plansWithData.reduce((s, { calc }) => s + (calc?.somaVendida ?? 0), 0)
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
                    <TableHead className="text-xs whitespace-nowrap">Cliente / Agência</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Período</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
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
                      Falta (M2)
                    </TableHead>
                    <TableHead className="text-xs text-right whitespace-nowrap">
                      Falta (M3)
                    </TableHead>
                    <TableHead className="text-xs text-center whitespace-nowrap">
                      Plano / Relatório
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansWithData.map(({ action, calc }) => (
                    <TableRow key={action.id}>
                      <TableCell className="text-xs font-semibold">
                        <button
                          onClick={() => onClientClick(action.client_name)}
                          className="text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                        >
                          {action.client_name}
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateBR(action.data_inicio)} → {formatDateBR(action.data_fim)}
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
                        {formatCurrency(action.meta_3 ?? null)}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {formatCurrency(calc?.somaVendida ?? 0)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {renderFalta(calc?.quantoFalta)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {renderFalta(calc?.quantoFaltaMeta2)}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {renderFalta(calc?.quantoFaltaMeta3)}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <div className="flex items-center justify-center gap-1">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(action)}
                            className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10"
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano de Meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano de meta de{' '}
              <strong>{deleteTarget?.client_name}</strong> (
              {formatDateBR(deleteTarget?.data_inicio)} → {formatDateBR(deleteTarget?.data_fim)})?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  onDeleteAction(deleteTarget)
                  setDeleteTarget(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
