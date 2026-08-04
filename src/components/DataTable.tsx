import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SheetRow, formatCurrency, formatPercent } from '@/services/sheets'
import { ActiveAction } from '@/services/actions'
import { PlanCalculation } from '@/services/plan-calculations'
import {
  Search,
  ArrowUpDown,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  FilterX,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
} from 'lucide-react'

function formatDateBR(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === '') return '—'
  try {
    const datePart = dateStr.trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return '—'
    const d = new Date(datePart + 'T00:00:00')
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch {
    return '—'
  }
}

function getBadgeStatusColor(status?: string) {
  switch (status) {
    case 'Concluído':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
    case 'Em Negociação':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/30'
    case 'Em Risco':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/30'
    case 'Planejada':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/30'
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/30'
  }
}

interface DataTableProps {
  data: SheetRow[]
  activeActions: ActiveAction[]
  planCalculations?: Map<string, PlanCalculation>
  onOpenActionModal: (client: SheetRow) => void
  onGenerateReport?: (action: ActiveAction) => void
}

export function DataTable({
  data,
  activeActions,
  planCalculations = new Map<string, PlanCalculation>(),
  onOpenActionModal,
  onGenerateReport,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof SheetRow>('venda')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return data.filter(
      (row) =>
        row.clienteUnificado.toLowerCase().includes(term) ||
        row.executivo.toLowerCase().includes(term) ||
        row.regional.toLowerCase().includes(term) ||
        row.cpfCnpj.includes(term),
    )
  }, [data, searchTerm])

  const sortedData = useMemo(
    () =>
      [...filteredData].sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (typeof valA === 'number' && typeof valB === 'number')
          return sortDirection === 'asc' ? valA - valB : valB - valA
        if (valA === null && valB !== null) return 1
        if (valA !== null && valB === null) return -1
        if (valA === null && valB === null) return 0
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      }),
    [filteredData, sortField, sortDirection],
  )

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage])

  const handleSort = (field: keyof SheetRow) => {
    if (sortField === field) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Cliente Unificado',
      'Executivo',
      'CPFCNPJ',
      'Regional',
      'Venda',
      'Venda LY',
      'Δ LY',
      '% YoY',
      'Data Inicio',
      'Data Fim',
      'Valor Meta',
      'Meta 2',
      'Soma Vendida',
      'Quanto Falta',
      'Quanto Falta M2',
      'Status Plano',
    ]
    const rows = sortedData.map((r) => {
      if (!r) return []
      const action = activeActions.find((a) => a.client_name === r.clienteUnificado)
      const calc = planCalculations?.get(r.clienteUnificado)
      return [
        `"${r.clienteUnificado}"`,
        `"${r.executivo}"`,
        `"${r.cpfCnpj}"`,
        `"${r.regional}"`,
        r.venda ?? '',
        r.vendaLY ?? '',
        r.deltaLY ?? '',
        r.pctYoY !== null ? `${r.pctYoY}%` : '',
        action?.data_inicio ?? '',
        action?.data_fim ?? '',
        action?.valor_meta ?? '',
        action?.meta_2 ?? '',
        calc?.somaVendida ?? '',
        calc?.quantoFalta ?? '',
        calc?.quantoFaltaMeta2 ?? '',
        action?.status ?? '',
      ]
    })
    const csv =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', 'Plano_Meta_BI_Export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getActionForClient = (clientName: string) =>
    activeActions.find((a) => a.client_name === clientName)

  const renderQuantoFalta = (val: number | null) => {
    if (val === null) return <span className="text-muted-foreground">—</span>
    if (val <= 0)
      return (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          ✅ Meta Atingida
        </span>
      )
    return (
      <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
        {formatCurrency(val)}
      </span>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            Detalhamento de Carteira de Clientes
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Exibindo {filteredData.length} registros da planilha ativa
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, executivo, CPF..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 text-xs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
              >
                <FilterX className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="h-9 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1700px]">
            <thead className="bg-muted/50 text-muted-foreground border-y font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente Unificado</th>
                <th className="py-3 px-4">Executivo</th>
                <th className="py-3 px-4">CPF / CNPJ</th>
                <th className="py-3 px-4">Regional</th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('venda')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Venda <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('vendaLY')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Venda LY <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('deltaLY')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Δ LY <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('pctYoY')}
                >
                  <div className="flex items-center justify-end gap-1">
                    % YoY <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Início</th>
                <th className="py-3 px-4 text-center">Fim</th>
                <th className="py-3 px-4 text-right">Meta (R$)</th>
                <th className="py-3 px-4 text-right">Meta 2 (R$)</th>
                <th className="py-3 px-4 text-right">Soma Vendida</th>
                <th className="py-3 px-4 text-right">Quanto Falta</th>
                <th className="py-3 px-4 text-right">Quanto Falta (M2)</th>
                <th className="py-3 px-4 text-center">Plano / Relatório</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-muted-foreground">
                    Nenhum registro encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  if (!row) return null
                  const action = getActionForClient(row.clienteUnificado)
                  const calc = action ? planCalculations?.get(action.client_name) : null
                  const isPositive = row.deltaLY !== null && row.deltaLY >= 0
                  const hasDelta = row.deltaLY !== null
                  const hasDates = !!(action?.data_inicio && action?.data_fim)
                  return (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td
                        className="py-3 px-4 font-semibold text-foreground max-w-[200px] truncate"
                        title={row.clienteUnificado}
                      >
                        {row.clienteUnificado}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{row.executivo}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {row.cpfCnpj}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-normal text-[10px] bg-slate-500/5">
                          {row.regional}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(row.venda)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {formatCurrency(row.vendaLY)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold ${!hasDelta ? 'text-muted-foreground' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                      >
                        {formatCurrency(row.deltaLY)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {hasDelta ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatPercent(row.pctYoY)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-muted-foreground">
                        {action ? formatDateBR(action.data_inicio) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-muted-foreground">
                        {action ? formatDateBR(action.data_fim) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {action?.valor_meta ? formatCurrency(action.valor_meta) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {action?.meta_2 ? formatCurrency(action.meta_2) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        {calc && hasDates ? (
                          formatCurrency(calc.somaVendida)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {calc && hasDates ? (
                          renderQuantoFalta(calc.quantoFalta)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {calc && hasDates ? (
                          renderQuantoFalta(calc.quantoFaltaMeta2)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {action ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenActionModal(row)}
                                className={`h-7 text-[11px] gap-1 px-2.5 ${getBadgeStatusColor(action.status)}`}
                              >
                                <Eye className="h-3 w-3" />
                                {action.status}
                              </Button>
                              {onGenerateReport && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onGenerateReport(action)}
                                  className="h-7 text-[11px] px-2 text-blue-600 hover:bg-blue-500/10"
                                  title="Gerar Relatório"
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                              )}
                              {calc?.isDue && (
                                <CheckCircle2
                                  className="h-3 w-3 text-amber-500"
                                  title="Relatório pendente"
                                />
                              )}
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenActionModal(row)}
                              className="h-7 text-[11px] text-muted-foreground hover:text-primary gap-1 px-2"
                            >
                              <Plus className="h-3 w-3" /> Criar Plano
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
          <p>
            Página {currentPage} de {totalPages} ({sortedData.length} itens)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-7 text-xs px-2"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-7 text-xs px-2"
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
