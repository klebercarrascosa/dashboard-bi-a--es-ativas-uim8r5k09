export interface SheetRow {
  id: string
  clienteUnificado: string
  executivo: string
  cpfCnpj: string
  regional: string
  venda: number
  vendaLY: number
  deltaLY: number
  pctYoY: number
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

const REGIONAIS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
const EXECUTIVOS = [
  'Carlos Silva',
  'Mariana Santos',
  'Roberto Oliveira',
  'Fernanda Lima',
  'Lucas Almeida',
  'Juliana Rocha',
  'Gabriel Costa',
]
const CLIENTES = [
  'Atacadão Global S/A',
  'Varejo Express Ltda',
  'Distribuidora do Sul',
  'Mega Mercado Brasil',
  'Comércio Horizonte',
  'Rede Integração',
  'Logística & Cia',
  'Supermercados Primus',
  'Empreendimentos Alfa',
  'Grupo Delta Comercial',
  'Nacional Suprimentos',
  'Soluções Corporativas',
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

function parseFormattedNumber(val: string): number {
  if (!val) return 0
  const clean = val
    .replace(/R\$\s?/, '')
    .replace(/\s/g, '')
    .replace(/%/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

export function generateMockSheetData(sheetName: string): SheetRow[] {
  const seed =
    sheetName.length +
    (SHEET_MONTHS.indexOf(sheetName) >= 0 ? SHEET_MONTHS.indexOf(sheetName) * 7 : 42)
  const rows: SheetRow[] = []

  CLIENTES.forEach((client, idx) => {
    const regional = REGIONAIS[(idx + seed) % REGIONAIS.length]
    const executivo = EXECUTIVOS[(idx * 3 + seed) % EXECUTIVOS.length]
    const baseVenda = 45000 + ((idx * 13700 + seed * 9973) % 280000)
    const growthFactor = 0.82 + ((idx * 19 + seed * 3) % 45) / 100
    const vendaLY = Math.round(baseVenda * growthFactor)
    const venda = Math.round(baseVenda)
    const deltaLY = venda - vendaLY
    const pctYoY = vendaLY > 0 ? ((venda - vendaLY) / vendaLY) * 100 : 0

    const formattedCpfCnpj = `${((idx + 1) * 11111111).toString().slice(0, 8)}0001${((idx + 1) * 9).toString().padStart(2, '0')}`

    rows.push({
      id: `${sheetName}-${idx}`,
      clienteUnificado: client,
      executivo,
      cpfCnpj: formattedCpfCnpj,
      regional,
      venda,
      vendaLY,
      deltaLY,
      pctYoY: parseFloat(pctYoY.toFixed(2)),
    })
  })

  return rows
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
      return generateMockSheetData(sheetName)
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

      const cliente = idxCliente >= 0 ? cols[idxCliente] : `Cliente ${i}`
      const executivo = idxExecutivo >= 0 ? cols[idxExecutivo] : 'Executivo Geral'
      const cpfCnpj = idxCpfCnpj >= 0 ? cols[idxCpfCnpj] : '00.000.000/0001-00'
      const regional = idxRegional >= 0 ? cols[idxRegional] : 'Sudeste'
      const venda = idxVenda >= 0 ? parseFormattedNumber(cols[idxVenda]) : 100000
      const vendaLY = idxVendaLY >= 0 ? parseFormattedNumber(cols[idxVendaLY]) : 90000

      let deltaLY = idxDeltaLY >= 0 ? parseFormattedNumber(cols[idxDeltaLY]) : venda - vendaLY
      if (isNaN(deltaLY)) deltaLY = venda - vendaLY

      let pctYoY =
        idxPctYoY >= 0
          ? parseFormattedNumber(cols[idxPctYoY])
          : vendaLY > 0
            ? ((venda - vendaLY) / vendaLY) * 100
            : 0
      if (isNaN(pctYoY)) pctYoY = vendaLY > 0 ? ((venda - vendaLY) / vendaLY) * 100 : 0

      parsedRows.push({
        id: `row-${i}`,
        clienteUnificado: cliente || `Cliente ${i}`,
        executivo: executivo || 'Geral',
        cpfCnpj: cpfCnpj || 'N/A',
        regional: regional || 'N/A',
        venda,
        vendaLY,
        deltaLY,
        pctYoY: parseFloat(pctYoY.toFixed(2)),
      })
    }

    return parsedRows.length > 0 ? parsedRows : generateMockSheetData(sheetName)
  } catch (err) {
    console.warn('Fallback to mock sheet data due to fetch error:', err)
    return generateMockSheetData(sheetName)
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
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
    const totalVenda = groupRows.reduce((sum, r) => sum + r.venda, 0)
    const totalVendaLY = groupRows.reduce((sum, r) => sum + r.vendaLY, 0)
    const deltaLY = totalVenda - totalVendaLY
    const pctYoY = totalVendaLY > 0 ? ((totalVenda - totalVendaLY) / totalVendaLY) * 100 : 0

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
      pctYoY: parseFloat(pctYoY.toFixed(2)),
    })
  }

  return result
}
