export interface SheetRow {
  id: string
  clienteUnificado: string
  executivo: string
  cpfCnpj: string
  regional: string
  venda: number | null
  vendaLY: number | null
  deltaLY: number | null
  pctYoY: number | null
}

export const DEFAULT_SPREADSHEET_ID = '1Tl8GvNv9wemusqhNSLGr689EdYu1_u1WToLnPoEqTO0'

export const SHEET_MONTHS = [
  'Visão Geral',
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

function parseCSVLine(text: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ''))
      cur = ''
    } else {
      cur += c
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ''))
  return result
}

function parseFormattedNumber(val: string): number | null {
  if (!val || val.trim() === '') return null
  const clean = val
    .replace(/R\$\s?/, '')
    .replace(/\s/g, '')
    .replace(/%/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? null : num
}

export async function fetchGoogleSheetData(
  sheetId: string,
  sheetName: string,
): Promise<SheetRow[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0)

    if (lines.length < 2) {
      return []
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())

    const findIndex = (keywords: string[]) =>
      headers.findIndex((h) => keywords.some((k) => h.includes(k)))

    const idxCliente = findIndex(['cliente', 'cliente unificado', 'nome'])
    const idxExecutivo = findIndex(['executivo', 'vendedor', 'rep'])
    const idxCpfCnpj = findIndex(['cpf', 'cnpj', 'cpfcnpj', 'documento'])
    const idxRegional = findIndex(['regional', 'regiao', 'uf'])
    const idxVenda = findIndex(['venda', 'faturamento', 'receita'])
    const idxVendaLY = findIndex(['venda ly', 'ly', 'ano anterior'])
    const idxDeltaLY = findIndex(['delta', 'Δ', 'diferença'])
    const idxPctYoY = findIndex(['yoy', '% yoy', 'crescimento'])

    const parsedRows: SheetRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      if (cols.length === 0 || !cols.some((c) => c.trim().length > 0)) continue

      const cliente = idxCliente >= 0 ? cols[idxCliente]?.trim() || '' : ''
      if (!cliente) continue

      const executivo = idxExecutivo >= 0 ? cols[idxExecutivo]?.trim() || '' : ''
      const cpfCnpj = idxCpfCnpj >= 0 ? cols[idxCpfCnpj]?.trim() || '' : ''
      const regional = idxRegional >= 0 ? cols[idxRegional]?.trim() || '' : ''

      const venda = idxVenda >= 0 ? parseFormattedNumber(cols[idxVenda] || '') : null
      const vendaLY = idxVendaLY >= 0 ? parseFormattedNumber(cols[idxVendaLY] || '') : null

      let deltaLY: number | null = null
      let pctYoY: number | null = null

      if (venda !== null && vendaLY !== null) {
        if (idxDeltaLY >= 0) {
          const parsedDelta = parseFormattedNumber(cols[idxDeltaLY] || '')
          deltaLY = parsedDelta !== null ? parsedDelta : venda - vendaLY
        } else {
          deltaLY = venda - vendaLY
        }

        if (idxPctYoY >= 0) {
          const parsedPct = parseFormattedNumber(cols[idxPctYoY] || '')
          pctYoY =
            parsedPct !== null ? parsedPct : vendaLY > 0 ? ((venda - vendaLY) / vendaLY) * 100 : 0
        } else {
          pctYoY = vendaLY > 0 ? ((venda - vendaLY) / vendaLY) * 100 : 0
        }
        pctYoY = parseFloat(pctYoY.toFixed(2))
      }

      parsedRows.push({
        id: `row-${i}`,
        clienteUnificado: cliente,
        executivo: executivo || 'N/A',
        cpfCnpj: cpfCnpj || 'N/A',
        regional: regional || 'N/A',
        venda,
        vendaLY,
        deltaLY,
        pctYoY,
      })
    }

    return parsedRows
  } catch (err) {
    console.warn('Failed to fetch Google Sheet data:', err)
    return []
  }
}

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

export function normalizeCpfCnpj(val: string): string {
  return (val || '').replace(/\D/g, '')
}

export function normalizeClientName(val: string): string {
  return (val || '').trim().toLowerCase()
}

export function aggregateSheetRowsByClient(rows: SheetRow[]): SheetRow[] {
  const groups = new Map<string, SheetRow[]>()

  for (const row of rows) {
    const key = `${normalizeClientName(row.clienteUnificado)}|${normalizeCpfCnpj(row.cpfCnpj)}`
    const existing = groups.get(key)
    if (existing) {
      existing.push(row)
    } else {
      groups.set(key, [row])
    }
  }

  const result: SheetRow[] = []

  for (const [key, groupRows] of groups) {
    const vendaValues = groupRows.map((r) => r.venda).filter((v): v is number => v !== null)
    const vendaLYValues = groupRows.map((r) => r.vendaLY).filter((v): v is number => v !== null)

    const totalVenda = vendaValues.length > 0 ? vendaValues.reduce((sum, v) => sum + v, 0) : null
    const totalVendaLY =
      vendaLYValues.length > 0 ? vendaLYValues.reduce((sum, v) => sum + v, 0) : null

    let deltaLY: number | null = null
    let pctYoY: number | null = null

    if (totalVenda !== null && totalVendaLY !== null) {
      deltaLY = totalVenda - totalVendaLY
      pctYoY =
        totalVendaLY > 0
          ? parseFloat((((totalVenda - totalVendaLY) / totalVendaLY) * 100).toFixed(2))
          : 0
    }

    const execCounts = new Map<string, number>()
    const regCounts = new Map<string, number>()
    for (const r of groupRows) {
      execCounts.set(r.executivo, (execCounts.get(r.executivo) || 0) + 1)
      regCounts.set(r.regional, (regCounts.get(r.regional) || 0) + 1)
    }
    const executive =
      Array.from(execCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || groupRows[0].executivo
    const regional =
      Array.from(regCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || groupRows[0].regional

    result.push({
      id: key,
      clienteUnificado: groupRows[0].clienteUnificado.trim(),
      executivo: executive,
      cpfCnpj: groupRows[0].cpfCnpj,
      regional,
      venda: totalVenda,
      vendaLY: totalVendaLY,
      deltaLY,
      pctYoY,
    })
  }

  return result
}
