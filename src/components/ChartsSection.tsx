import { useState } from 'react'
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
  LineChart,
  Line,
} from 'recharts'

interface ChartsSectionProps {
  data: SheetRow[]
}

export function ChartsSection({ data }: ChartsSectionProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null)

  // Group by Regional
  const regionalMap = data.reduce(
    (acc, row) => {
      if (!acc[row.regional]) acc[row.regional] = { regional: row.regional, venda: 0, vendaLY: 0 }
      acc[row.regional].venda += row.venda
      acc[row.regional].vendaLY += row.vendaLY
      return acc
    },
    {} as Record<string, { regional: string; venda: number; vendaLY: number }>,
  )

  const regionalData = Object.values(regionalMap).map((r) => ({
    ...r,
    delta: r.venda - r.vendaLY,
    pctYoY: r.vendaLY > 0 ? parseFloat((((r.venda - r.vendaLY) / r.vendaLY) * 100).toFixed(1)) : 0,
  }))

  // Group by Executive (Top 7)
  const executivoMap = data.reduce(
    (acc, row) => {
      if (!acc[row.executivo])
        acc[row.executivo] = { executivo: row.executivo, venda: 0, vendaLY: 0 }
      acc[row.executivo].venda += row.venda
      acc[row.executivo].vendaLY += row.vendaLY
      return acc
    },
    {} as Record<string, { executivo: string; venda: number; vendaLY: number }>,
  )

  const executivoData = Object.values(executivoMap)
    .sort((a, b) => b.venda - a.venda)
    .slice(0, 7)

  // Top 5 Clientes Venda vs LY
  const topClientesData = [...data]
    .sort((a, b) => b.venda - a.venda)
    .slice(0, 6)
    .map((c) => ({
      name:
        c.clienteUnificado.length > 15
          ? c.clienteUnificado.slice(0, 15) + '...'
          : c.clienteUnificado,
      Venda: c.venda,
      'Venda LY': c.vendaLY,
    }))

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover/95 p-3 shadow-md backdrop-blur text-xs">
          <p className="font-bold mb-1 border-b pb-1 text-popover-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="flex items-center justify-between gap-4 py-0.5"
              style={{ color: entry.color }}
            >
              <span>{entry.name}:</span>
              <span className="font-mono font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Chart 1: Venda vs Venda LY por Regional */}
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
        </CardContent>
      </Card>

      {/* Chart 2: Top Executivos em Vendas */}
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
        </CardContent>
      </Card>

      {/* Chart 3: Top Clientes Venda vs LY */}
      <Card className="shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-purple-500" />
              Top 6 Clientes Ativos
            </CardTitle>
            <CardDescription className="text-xs">
              Compara de Venda Atual vs Ano Anterior
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpandedChart('clientes')}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={topClientesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="Venda"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Venda LY"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expanded Chart Modals */}
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
        isOpen={expandedChart === 'clientes'}
        onClose={() => setExpandedChart(null)}
        title="Top Clientes Ativos (Ampliado)"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={topClientesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(val) => formatCurrency(val)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="Venda" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
            <Line
              type="monotone"
              dataKey="Venda LY"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartModal>
    </div>
  )
}
