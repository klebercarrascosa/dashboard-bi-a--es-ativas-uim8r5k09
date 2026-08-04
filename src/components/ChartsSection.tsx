import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SheetRow } from '@/services/sheets'
import { ActiveAction } from '@/services/actions'
import { PlanCalculation } from '@/services/plan-calculations'
import { PieChart, Flag } from 'lucide-react'

interface ChartsSectionProps {
  data: SheetRow[]
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
}

export function ChartsSection({ data, activeActions, planCalculations }: ChartsSectionProps) {
  const activePlanList = useMemo(() => {
    return activeActions
      .filter((a) => a.status !== 'Concluído')
      .map((a) => ({
        name: a.client_name,
        pctAtingido: planCalculations.get(a.client_name)?.pctAtingido ?? null,
      }))
      .sort((a, b) => (b.pctAtingido ?? 0) - (a.pctAtingido ?? 0))
  }, [activeActions, planCalculations])

  const { agencyRepData, paretoSummary } = useMemo(() => {
    const clients = data
      .filter((c) => c.venda !== null && c.venda > 0)
      .map((c) => ({ name: c.clienteUnificado, venda: c.venda as number }))
      .sort((a, b) => b.venda - a.venda)
    const total = clients.reduce((sum, c) => sum + c.venda, 0)
    const repData = clients.map((c) => ({
      name: c.name,
      pct: total > 0 ? parseFloat(((c.venda / total) * 100).toFixed(1)) : 0,
    }))
    let cumul = 0
    const cutoffIdx = repData.findIndex((r) => {
      cumul += r.pct
      return cumul >= 80
    })
    const clientsFor80 = cutoffIdx >= 0 ? cutoffIdx + 1 : repData.length
    const pctClients = repData.length > 0 ? Math.round((clientsFor80 / repData.length) * 100) : 0
    return {
      agencyRepData: repData,
      paretoSummary:
        repData.length > 0
          ? `${pctClients}% dos clientes (${clientsFor80} de ${repData.length}) = 80% da receita`
          : 'Concentração de receita por cliente',
    }
  }, [data])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm flex flex-col">
        <CardHeader className="pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-amber-500" />
              Planos de Meta Ativos
            </CardTitle>
            <CardDescription className="text-xs">
              {activePlanList.length > 0
                ? `${activePlanList.length} agências com meta vigente`
                : 'Nenhum plano ativo'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {activePlanList.length > 0 ? (
            <div className="max-h-[260px] overflow-y-auto space-y-0.5 pr-1">
              {activePlanList.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-xs"
                >
                  <span className="font-medium truncate flex-1" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    {item.pctAtingido !== null ? `${item.pctAtingido.toFixed(1)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Nenhum plano de meta ativo.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col">
        <CardHeader className="pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-amber-500" />
              Análise 80/20 da Carteira
            </CardTitle>
            <CardDescription className="text-xs">{paretoSummary}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {agencyRepData.length > 0 ? (
            <div className="max-h-[260px] overflow-y-auto space-y-0.5 pr-1">
              {agencyRepData.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-xs"
                >
                  <span className="font-medium truncate flex-1" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Sem dados de venda disponíveis nesta aba.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
