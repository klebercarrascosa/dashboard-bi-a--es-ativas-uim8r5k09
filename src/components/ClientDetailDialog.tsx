import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SheetRow, formatCurrency } from '@/services/sheets'
import { ActiveAction, findActivePlanForClient } from '@/services/actions'
import { PlanCalculation, getMonthlyBreakdown } from '@/services/plan-calculations'
import { getClientPositionChange } from '@/services/position-tracking'
import { GoalProgressBars } from '@/components/GoalProgressBars'
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react'

interface ClientDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  client: SheetRow | null
  activeTab: string
  monthDataMap: Map<string, SheetRow[]>
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
  isAdmin?: boolean
}

export function ClientDetailDialog({
  isOpen,
  onClose,
  client,
  activeTab,
  monthDataMap,
  activeActions,
  planCalculations,
  isAdmin = false,
}: ClientDetailDialogProps) {
  if (!client) return null

  const action = findActivePlanForClient(activeActions, client.clienteUnificado)
  const calc = action ? (planCalculations.get(action.id ?? '') ?? null) : null
  const posChange = getClientPositionChange(
    monthDataMap,
    activeTab,
    client.clienteUnificado,
    client.cpfCnpj,
  )
  const breakdown = action
    ? getMonthlyBreakdown(
        monthDataMap,
        action.client_name,
        action.cpf_cnpj,
        action.data_inicio,
        action.data_fim,
      )
    : []

  const isOverview = activeTab === 'Visão Geral'
  const salesDiff =
    posChange.currentVenda !== null && posChange.previousVenda !== null
      ? posChange.currentVenda - posChange.previousVenda
      : null
  const salesPctChange =
    salesDiff !== null && posChange.previousVenda !== null && posChange.previousVenda > 0
      ? (salesDiff / posChange.previousVenda) * 100
      : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{client.clienteUnificado}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[10px]">
              {client.executivo}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-slate-500/5">
              {client.regional}
            </Badge>
            <span className="font-mono text-muted-foreground">{client.cpfCnpj}</span>
          </DialogDescription>
        </DialogHeader>

        <Card
          className={
            !isOverview && posChange.direction === 'up'
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : !isOverview && posChange.direction === 'down'
                ? 'border-rose-500/30 bg-rose-500/5'
                : ''
          }
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Posição no Ranking {isOverview ? '(Visão Geral)' : `- ${activeTab}`}
            </p>
            {isOverview || posChange.currentPosition === null ? (
              <p className="text-sm text-muted-foreground">
                {isOverview
                  ? 'Posição não disponível na Visão Geral. Selecione um mês específico.'
                  : 'Cliente sem venda no mês atual.'}
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {posChange.direction === 'up' && <ArrowUp className="h-8 w-8 text-emerald-500" />}
                  {posChange.direction === 'down' && (
                    <ArrowDown className="h-8 w-8 text-rose-500" />
                  )}
                  {posChange.direction === 'same' && (
                    <Minus className="h-8 w-8 text-muted-foreground" />
                  )}
                  {posChange.direction === 'unknown' && (
                    <ArrowUp className="h-8 w-8 text-emerald-500" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">
                      #{posChange.currentPosition}
                      <span className="text-sm text-muted-foreground font-normal">
                        {' '}
                        / {posChange.totalClientsCurrent}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {posChange.direction === 'up' &&
                        `Subiu ${posChange.previousPosition! - posChange.currentPosition!} posições`}
                      {posChange.direction === 'down' &&
                        `Caiu ${posChange.currentPosition! - posChange.previousPosition!} posições`}
                      {posChange.direction === 'same' && 'Manteve a posição'}
                      {posChange.direction === 'unknown' && 'Novo no ranking'}
                    </p>
                  </div>
                </div>
                {posChange.previousPosition !== null && (
                  <div className="ml-auto text-right text-xs text-muted-foreground">
                    <p>
                      Mês anterior:{' '}
                      <span className="font-semibold">
                        #{posChange.previousPosition} / {posChange.totalClientsPrevious}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{activeTab}</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(posChange.currentVenda ?? client.venda)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Mês Anterior</p>
              <p className="text-lg font-bold text-muted-foreground">
                {formatCurrency(posChange.previousVenda)}
              </p>
            </CardContent>
          </Card>
        </div>

        {salesDiff !== null && (
          <div className="flex items-center gap-2 text-sm">
            {salesDiff >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span
              className={
                salesDiff >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }
            >
              {salesDiff >= 0 ? '+' : ''}
              {formatCurrency(salesDiff)}
              {salesPctChange !== null &&
                ` (${salesPctChange >= 0 ? '+' : ''}${salesPctChange.toFixed(1)}%)`}
            </span>
          </div>
        )}

        {action && calc && (
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Plano de Meta
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Pagamento: </span>
                  <span className="font-semibold text-xs">
                    {action.pagamento_mensal
                      ? 'Mensal'
                      : action.pagamento_trimestral
                        ? 'Trimestral'
                        : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bônus Anual: </span>
                  <span className="font-semibold text-xs">
                    {action.bonus_anual ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Meta 1: </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(action.valor_meta ?? null)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Meta 2: </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(action.meta_2 ?? null)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Meta 3: </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(action.meta_3 ?? null)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Soma Vendida: </span>
                  <span className="font-bold">{formatCurrency(calc.somaVendida)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prêmio Projetado: </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {calc.premioProjetado > 0 ? formatCurrency(calc.premioProjetado) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">% Atingido: </span>
                  <span className="font-bold">
                    {calc.pctAtingido !== null ? `${calc.pctAtingido.toFixed(1)}%` : '—'}
                  </span>
                </div>
                {calc.quantoFalta !== null && (
                  <div className="col-span-2">
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
                {calc.quantoFaltaMeta2 !== null && (
                  <div className="col-span-2">
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
                {calc.quantoFaltaMeta3 !== null && (
                  <div className="col-span-2">
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

              {calc && (action.valor_vendido ?? 0) > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Progresso das Metas &amp; Prêmio Provisório
                  </p>
                  <GoalProgressBars action={action} calc={calc} />
                </div>
              )}

              {breakdown.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Detalhamento Mensal (Período do Plano)
                  </p>
                  <div className="space-y-1">
                    {breakdown.map((entry) => (
                      <div key={entry.month} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{entry.month}</span>
                        <span
                          className={`font-mono font-semibold ${entry.venda !== null ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {formatCurrency(entry.venda)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold pt-1 border-t">
                      <span>Total</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(calc.somaVendida)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
