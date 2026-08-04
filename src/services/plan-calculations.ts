import {
  type SheetRow,
  SHEET_MONTHS,
  normalizeClientName,
  normalizeCpfCnpj,
  fetchGoogleSheetData,
} from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function getMonthsInRange(startDate?: string, endDate?: string): string[] {
  if (!startDate || !endDate) return []
  const start = new Date(startDate.slice(0, 10) + 'T00:00:00')
  const end = new Date(endDate.slice(0, 10) + 'T00:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return []
  const months: string[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
  while (cur <= endMonth) {
    months.push(MONTH_NAMES_PT[cur.getMonth()])
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

export function calculateSomaVendida(
  monthDataMap: Map<string, SheetRow[]>,
  clientName: string,
  cpfCnpj: string,
  startDate?: string,
  endDate?: string,
): number {
  const months = getMonthsInRange(startDate, endDate)
  if (months.length === 0) return 0
  const normName = normalizeClientName(clientName)
  const normDoc = normalizeCpfCnpj(cpfCnpj)
  let total = 0
  for (const month of months) {
    const rows = monthDataMap.get(month)
    if (!rows) continue
    for (const row of rows) {
      if (
        normalizeClientName(row.clienteUnificado) === normName &&
        normalizeCpfCnpj(row.cpfCnpj) === normDoc
      ) {
        if (row.venda !== null) total += row.venda
      }
    }
  }
  return total
}

export interface PlanCalculation {
  somaVendida: number
  quantoFalta: number | null
  quantoFaltaMeta2: number | null
  pctAtingido: number | null
  pctAtingidoMeta2: number | null
  isDue: boolean
  nextDueDate: Date | null
}

export function calculatePlanMetrics(action: ActiveAction, somaVendida: number): PlanCalculation {
  const quantoFalta =
    action.valor_meta && action.valor_meta > 0 ? action.valor_meta - somaVendida : null
  const quantoFaltaMeta2 = action.meta_2 && action.meta_2 > 0 ? action.meta_2 - somaVendida : null
  const pctAtingido =
    action.valor_meta && action.valor_meta > 0 ? (somaVendida / action.valor_meta) * 100 : null
  const pctAtingidoMeta2 =
    action.meta_2 && action.meta_2 > 0 ? (somaVendida / action.meta_2) * 100 : null
  const intervalDays = action.intervalo_relatorio === '15 dias' ? 15 : 30
  let nextDueDate: Date | null = null
  let isDue = false
  if (action.ultimo_relatorio) {
    const lastReport = new Date(action.ultimo_relatorio.slice(0, 10) + 'T00:00:00')
    if (!isNaN(lastReport.getTime())) {
      nextDueDate = new Date(lastReport)
      nextDueDate.setDate(nextDueDate.getDate() + intervalDays)
      isDue = nextDueDate <= new Date()
    } else {
      isDue = true
    }
  } else {
    isDue = true
  }
  return {
    somaVendida,
    quantoFalta,
    quantoFaltaMeta2,
    pctAtingido,
    pctAtingidoMeta2,
    isDue,
    nextDueDate,
  }
}

function formatCurrencyBR(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
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

export function generateReportMessage(action: ActiveAction, calc: PlanCalculation): string {
  const lines: string[] = [
    '📋 RELATÓRIO DE ACOMPANHAMENTO — PLANO DE META',
    '',
    `🏢 Cliente/Agência: ${action.client_name}`,
    `👤 Executivo: ${action.executive}`,
    `📍 Regional: ${action.regional}`,
    `📅 Período: ${formatDateBR(action.data_inicio)} a ${formatDateBR(action.data_fim)}`,
    '',
    `💰 Valor da Meta: ${formatCurrencyBR(action.valor_meta && action.valor_meta > 0 ? action.valor_meta : null)}`,
    `💰 Meta 2: ${formatCurrencyBR(action.meta_2 && action.meta_2 > 0 ? action.meta_2 : null)}`,
    `📊 Soma Vendida (no período): ${formatCurrencyBR(calc.somaVendida)}`,
    '',
  ]

  if (calc.quantoFalta !== null) {
    if (calc.quantoFalta <= 0) lines.push('✅ Meta Atingida!')
    else lines.push(`🎯 Quanto Falta: ${formatCurrencyBR(calc.quantoFalta)}`)
  }
  if (calc.quantoFaltaMeta2 !== null) {
    if (calc.quantoFaltaMeta2 <= 0) lines.push('✅ Meta 2 Atingida!')
    else lines.push(`🎯 Quanto Falta (Meta 2): ${formatCurrencyBR(calc.quantoFaltaMeta2)}`)
  }
  if (calc.pctAtingido !== null)
    lines.push(`📈 % da Meta Atingida: ${calc.pctAtingido.toFixed(1)}%`)
  if (calc.pctAtingidoMeta2 !== null)
    lines.push(`📈 % da Meta 2 Atingida: ${calc.pctAtingidoMeta2.toFixed(1)}%`)

  return lines.join('\n')
}

export async function fetchAllMonthData(spreadsheetId: string): Promise<Map<string, SheetRow[]>> {
  const months = SHEET_MONTHS.filter((m) => m !== 'Visão Geral')
  const results = await Promise.allSettled(
    months.map((m) => fetchGoogleSheetData(spreadsheetId, m)),
  )
  const map = new Map<string, SheetRow[]>()
  months.forEach((month, i) => {
    const result = results[i]
    if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
      map.set(month, result.value)
    }
  })
  return map
}
