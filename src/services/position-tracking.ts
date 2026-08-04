import { SheetRow, SHEET_MONTHS, normalizeClientName, normalizeCpfCnpj } from '@/services/sheets'

export interface PositionChange {
  currentPosition: number | null
  previousPosition: number | null
  direction: 'up' | 'down' | 'same' | 'unknown'
  currentVenda: number | null
  previousVenda: number | null
  totalClientsCurrent: number
  totalClientsPrevious: number
}

export function getPreviousMonthName(currentMonth: string): string | null {
  if (currentMonth === 'Visão Geral') return null
  const idx = SHEET_MONTHS.indexOf(currentMonth)
  if (idx <= 1) return null
  return SHEET_MONTHS[idx - 1]
}

function rankClientsByVenda(rows: SheetRow[]): SheetRow[] {
  return [...rows]
    .filter((r) => r.venda !== null && r.venda > 0)
    .sort((a, b) => (b.venda ?? 0) - (a.venda ?? 0))
}

export function getClientPositionChange(
  monthDataMap: Map<string, SheetRow[]>,
  currentMonth: string,
  clientName: string,
  cpfCnpj: string,
): PositionChange {
  const prevMonth = getPreviousMonthName(currentMonth)
  const currentRows = monthDataMap.get(currentMonth) || []
  const prevRows = prevMonth ? monthDataMap.get(prevMonth) || [] : []

  const currentRanked = rankClientsByVenda(currentRows)
  const prevRanked = rankClientsByVenda(prevRows)

  const normName = normalizeClientName(clientName)
  const normDoc = normalizeCpfCnpj(cpfCnpj)

  const currentIdx = currentRanked.findIndex(
    (r) =>
      normalizeClientName(r.clienteUnificado) === normName &&
      normalizeCpfCnpj(r.cpfCnpj) === normDoc,
  )
  const prevIdx = prevRanked.findIndex(
    (r) =>
      normalizeClientName(r.clienteUnificado) === normName &&
      normalizeCpfCnpj(r.cpfCnpj) === normDoc,
  )

  const currentPosition = currentIdx >= 0 ? currentIdx + 1 : null
  const previousPosition = prevIdx >= 0 ? prevIdx + 1 : null
  const currentVenda = currentIdx >= 0 ? currentRanked[currentIdx].venda : null
  const previousVenda = prevIdx >= 0 ? prevRanked[prevIdx].venda : null

  let direction: 'up' | 'down' | 'same' | 'unknown' = 'unknown'
  if (currentPosition !== null && previousPosition !== null) {
    if (currentPosition < previousPosition) direction = 'up'
    else if (currentPosition > previousPosition) direction = 'down'
    else direction = 'same'
  }

  return {
    currentPosition,
    previousPosition,
    direction,
    currentVenda,
    previousVenda,
    totalClientsCurrent: currentRanked.length,
    totalClientsPrevious: prevRanked.length,
  }
}
