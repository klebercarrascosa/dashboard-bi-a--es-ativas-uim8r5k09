import { Card, CardContent } from '@/components/ui/card'
import { SheetRow, formatCurrency, formatPercent } from '@/services/sheets'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Target,
} from 'lucide-react'

interface KPICardsProps {
  data: SheetRow[]
  activeTab: string
}

export function KPICards({ data, activeTab }: KPICardsProps) {
  const vendaValues = data.map((r) => r.venda).filter((v): v is number => v !== null)
  const vendaLYValues = data.map((r) => r.vendaLY).filter((v): v is number => v !== null)

  const totalVenda = vendaValues.length > 0 ? vendaValues.reduce((sum, v) => sum + v, 0) : null
  const totalVendaLY =
    vendaLYValues.length > 0 ? vendaLYValues.reduce((sum, v) => sum + v, 0) : null

  let deltaTotal: number | null = null
  let pctYoYTotal: number | null = null

  if (totalVenda !== null && totalVendaLY !== null) {
    deltaTotal = totalVenda - totalVendaLY
    pctYoYTotal = totalVendaLY > 0 ? ((totalVenda - totalVendaLY) / totalVendaLY) * 100 : 0
  }

  const executivosUnicos = new Set(data.map((r) => r.executivo)).size
  const clientesUnicos = data.length
  const regionaisUnicas = new Set(data.map((r) => r.regional)).size

  const isPositive = deltaTotal !== null && deltaTotal >= 0
  const hasDelta = deltaTotal !== null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="shadow-sm border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Venda ({activeTab})
            </p>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">{formatCurrency(totalVenda)}</h3>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Base da aba selecionada
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Venda LY (Ano Anterior)
            </p>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold tracking-tight">
              {formatCurrency(totalVendaLY)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Período homólogo anterior</p>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`shadow-sm ${!hasDelta ? 'border-muted' : isPositive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Δ LY &amp; % YoY
            </p>
            <div
              className={`rounded-lg p-2 ${!hasDelta ? 'bg-muted text-muted-foreground' : isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
            >
              {!hasDelta ? (
                <Target className="h-4 w-4" />
              ) : isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <h3
                className={`text-2xl font-extrabold tracking-tight ${!hasDelta ? 'text-muted-foreground' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {formatCurrency(deltaTotal)}
              </h3>
              {hasDelta && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}
                >
                  {formatPercent(pctYoYTotal)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {!hasDelta
                ? 'Dados insuficientes para comparação'
                : isPositive
                  ? 'Crescimento acima de LY'
                  : 'Queda em relação a LY'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Abrangência Ativa
            </p>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-extrabold tracking-tight">{clientesUnicos}</h3>
              <span className="text-xs text-muted-foreground font-medium">Clientes</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-purple-500" /> {executivosUnicos} Executivos
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-purple-500" /> {regionaisUnicas} Regionais
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
