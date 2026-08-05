import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { Flag } from 'lucide-react'

interface PlanosMetaAtivosProps {
  activeActions: ActiveAction[]
  planCalculations: Map<string, PlanCalculation>
}

const STATUS_STYLES: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
}

export function PlanosMetaAtivos({ activeActions, planCalculations }: PlanosMetaAtivosProps) {
  if (activeActions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Flag className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          Nenhum plano de meta ativo encontrado.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Flag className="h-5 w-5 text-amber-500" />
          Planos de Meta Ativos
          <Badge
            variant="outline"
            className="ml-1 bg-amber-500/10 text-amber-600 border-amber-500/30"
          >
            {activeActions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs whitespace-nowrap">Cliente/Agência</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Executivo</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Regional</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Status</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Meta</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Meta 2</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Soma Vendida</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Quanto Falta</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">
                  Quanto Falta (M2)
                </TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">% Atingido</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Ganho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeActions.map((action) => {
                const calc = planCalculations.get(action.client_name)
                return (
                  <TableRow key={action.id}>
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {action.client_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {action.executive || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {action.regional || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_STYLES[action.status] || ''}`}
                      >
                        {action.status || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatCurrency(action.valor_meta ?? null)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatCurrency(action.meta_2 ?? null)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatCurrency(calc?.somaVendida ?? null)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {calc?.quantoFalta !== null && calc?.quantoFalta !== undefined
                        ? calc.quantoFalta <= 0
                          ? '✅ Meta Atingida'
                          : formatCurrency(calc.quantoFalta)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {calc?.quantoFaltaMeta2 !== null && calc?.quantoFaltaMeta2 !== undefined
                        ? calc.quantoFaltaMeta2 <= 0
                          ? '✅ Meta 2 Atingida'
                          : formatCurrency(calc.quantoFaltaMeta2)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {calc?.pctAtingido !== null && calc?.pctAtingido !== undefined
                        ? `${calc.pctAtingido.toFixed(1)}%`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                      {calc?.ganhoPremio != null ? formatCurrency(calc.ganhoPremio) : '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
