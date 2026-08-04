import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SheetRow, formatCurrency } from '@/services/sheets'
import { ChartModal } from '@/components/ChartModal'
import { Maximize2, BarChart2, PieChart, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts'

interface ChartsSectionProps {
  data: SheetRow[]
}

interface RegionalAgg {
  regional: string
  venda: number | null
  vendaLY: number | null
  delta: number | null
  pctYoY: number | null
}

interface ExecutivoAgg {
  executivo: string
  venda: number | null
}

export function ChartsSection({ data }: ChartsSectionProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null)

  const regionalData: RegionalAgg[] = useMemo(() => {
    const map = data.reduce(
      (acc, row) => {
        if (!acc[row.regional]) {
          acc[row.regional] = {
            regional: row.regional,
            vendaSum: 0,
            vendaLYSum: 0,
            hasVenda: false,
            hasVendaLY: false,
          }
        }
        if (row.venda !== null) {
          acc[row.regional].vendaSum += row.venda
          acc[row.regional].hasVenda = true
        }
        if (row.vendaLY !== null) {
          acc[row.regional].vendaLYSum += row.vendaLY
          acc[row.regional].hasVendaLY = true
        }
        return acc
      },
      {} as Record<
        string,
        {
          regional: string
          vendaSum: number
          vendaLYSum: number
          hasVenda: boolean
          hasVendaLY: boolean
        }
      >,
    )
    return Object.values(map).map((r) => {
      const venda = r.hasVenda ? r.vendaSum : null
      const vendaLY = r.hasVendaLY ? r.vendaLYSum : null
      return {
        regional: r.regional,
        venda,
        vendaLY,
        delta: venda !== null && vendaLY !== null ? venda - vendaLY : null,
        pctYoY:
          venda !== null && vendaLY !== null && vendaLY > 0
            ? parseFloat((((venda - vendaLY) / vendaLY) * 100).toFixed(1))
            : null,
      }
    })
  }, [data])

  const executivoData: ExecutivoAgg[] = useMemo(() => {
    const map = data.reduce(
      (acc, row) => {
        if (!acc[row.executivo])
          acc[row.executivo] = { executivo: row.executivo, vendaSum: 0, hasVenda: false }
        if (row.venda !== null) {
          acc[row.executivo].vendaSum += row.venda
          acc[row.executivo].hasVenda = true
        }
        return acc
      },
      {} as Record<string, { executivo: string; vendaSum: number; hasVenda: boolean }>,
    )
    return Object.values(map)
      .filter((e) => e.hasVenda)
      .map((e) => ({ executivo: e.executivo, venda: e.vendaSum }))
      .sort((a, b) => (b.venda ?? 0) - (a.venda ?? 0))
      .slice(0, 7)
  }, [data])

  const paretoAll = useMemo(() => {
    const sorted = [...data]
      .filter((c) => c.venda !== null && c.venda > 0)
      .sort((a, b) => (b.venda ?? 0) - (a.venda ?? 0))
    const total = sorted.reduce((sum, r) => sum + (r.venda ?? 0), 0)
    let cumul = 0
    return sorted.map((c) => {
      cumul += c.venda ?? 0
      return {
        name:
          c.clienteUnificado.length > 12
            ? c.clienteUnificado.slice(0, 12) + '…'
            : c.clienteUnificado,
        venda: c.venda,
        pct: total > 0 ? parseFloat(((cumul / total) * 100).toFixed(1)) : 0,
      }
    })
  }, [data])

  const paretoCardData = paretoAll.slice(0, 8)
  const cutoffIdx = paretoAll.findIndex((r) => r.pct >= 80)
  const clientsFor80 = cutoffIdx >= 0 ? cutoffIdx + 1 : paretoAll.length
  const pctClients = paretoAll.length > 0 ? Math.round((clientsFor80 / paretoAll.length) * 100) : 0

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const validEntries = payload.filter(
        (entry: any) => entry.value !== null && entry.value !== undefined,
      )
      if (validEntries.length === 0) return null
      return (
        <div className="rounded-lg border bg-popover/95 p-3 shadow-md backdrop-blur text-xs">
          <p className="font-bold mb-1 border-b pb-1 text-popover-foreground">{label}</p>
          {validEntries.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="flex items-center justify-between gap-4 py-0.5"
              style={{ color: entry.color }}
            >
              <span>{entry.name}:</span>
              <span className="font-mono font-semibold">
                {entry.name === '% Acumulado' ? `${entry.value}%` : formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const hasData = data.length > 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-emerald-500" />
              Desempenho por Regional
            </CardTitle>
            <CardDescription className="text-xs">Comparativo Venda vs Venda LY</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpandedChart('regional')}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="regional" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="venda" name="Venda Atual" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="vendaLY"
                  name="Venda LY"
                  fill="#3b82f6"
                  opacity={0.6}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Sem dados disponíveis nesta aba.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Top Executivos
            </CardTitle>
            <CardDescription className="text-xs">Ranking comercial por faturamento</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpandedChart('executivos')}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {executivoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={executivoData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                />
                <YAxis dataKey="executivo" type="category" tick={{ fontSize: 10 }} width={85} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="venda" name="Venda (R$)" radius={[0, 4, 4, 0]}>
                  {executivoData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Sem dados de venda disponíveis nesta aba.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-amber-500" />
              Análise 80/20 da Carteira
            </CardTitle>
            <CardDescription className="text-xs">
              {paretoAll.length > 0
                ? `${pctClients}% dos clientes (${clientsFor80} de ${paretoAll.length}) = 80% da receita`
                : 'Concentração de receita por cliente'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpandedChart('pareto')}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {paretoAll.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={paretoCardData}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="venda"
                  name="Venda"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pct"
                  name="% Acumulado"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Sem dados de venda disponíveis nesta aba.
            </div>
          )}
        </CardContent>
      </Card>

      <ChartModal
        isOpen={expandedChart === 'regional'}
        onClose={() => setExpandedChart(null)}
        title="Venda por Regional (Ampliado)"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="regional" />
            <YAxis tickFormatter={(val) => formatCurrency(val)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="venda" name="Venda Atual" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="vendaLY" name="Venda LY" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartModal>

      <ChartModal
        isOpen={expandedChart === 'executivos'}
        onClose={() => setExpandedChart(null)}
        title="Top Executivos (Ampliado)"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={executivoData}
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(val) => formatCurrency(val)} />
            <YAxis dataKey="executivo" type="category" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="venda" name="Venda (R$)" radius={[0, 6, 6, 0]}>
              {executivoData.map((_, index) => (
                <Cell key={`modal-cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartModal>

      <ChartModal
        isOpen={expandedChart === 'pareto'}
        onClose={() => setExpandedChart(null)}
        title="Análise 80/20 da Carteira (Ampliado)"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={paretoAll} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} interval={0} />
            <YAxis yAxisId="left" tickFormatter={(v) => formatCurrency(v)} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="venda" name="Venda" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pct"
              name="% Acumulado"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartModal>
    </div>
  )
}
