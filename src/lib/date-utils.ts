export const CURRENT_YEAR = new Date().getFullYear()

export function formatMonthYear(monthName: string, year: number = CURRENT_YEAR): string {
  return `${monthName}/${year}`
}

export function formatLastUpdated(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
