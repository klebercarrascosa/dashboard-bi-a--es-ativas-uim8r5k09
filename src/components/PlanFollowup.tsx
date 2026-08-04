import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { AlertCircle, FileText } from 'lucide-react'

interface PlanFollowupProps {
  duePlans: Array<{ action: ActiveAction; calc: PlanCalculation }>
  onGenerateReport: (action: ActiveAction) => void
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

export function PlanFollowup({ duePlans, onGenerateReport }: PlanFollowupProps) {
  if (duePlans.length === 0) return null

  return (
    <Card className="shadow-sm border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Relatórios Pendentes
          <Badge
            variant="outline"
            className="ml-1 bg-amber-500/10 text-amber-600 border-amber-500/30"
          >
            {duePlans.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {duePlans.map(({ action }) => (
            <div
              key={action.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card p-2.5 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{action.client_name}</p>
                <p className="text-muted-foreground text-[11px]">
                  {action.executive} · {action.regional}
                  {action.ultimo_relatorio
                    ? ` · Último: ${formatDateBR(action.ultimo_relatorio)}`
                    : ' · Nunca enviado'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateReport(action)}
                className="h-7 text-[11px] gap-1 shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              >
                <FileText className="h-3 w-3" />
                Gerar Relatório
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
