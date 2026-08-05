import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ActiveAction } from '@/services/actions'
import { Flag, Filter, Building2 } from 'lucide-react'

interface ActiveAgenciesKpiProps {
  activeActions: ActiveAction[]
  today: string
  isAdmin: boolean
}

export function ActiveAgenciesKpi({ activeActions, today, isAdmin }: ActiveAgenciesKpiProps) {
  const [selectedExec, setSelectedExec] = useState<string>('all')

  const executives = useMemo(
    () => Array.from(new Set(activeActions.map((a) => a.executive).filter(Boolean))).sort(),
    [activeActions],
  )

  const activeAgencies = useMemo(() => {
    const seen = new Set<string>()
    const list: { client_name: string; executive: string }[] = []
    for (const action of activeActions) {
      if (!action.data_inicio || !action.data_fim) continue
      if (today < action.data_inicio || today > action.data_fim) continue
      const exec = action.executive || 'Sem Executivo'
      if (selectedExec !== 'all' && exec !== selectedExec) continue
      const key = `${action.client_name}-${exec}`
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ client_name: action.client_name, executive: exec })
    }
    return list.sort((a, b) => a.client_name.localeCompare(b.client_name))
  }, [activeActions, today, selectedExec])

  const totalAgencies = activeAgencies.length

  return (
    <Card className="shadow-sm flex flex-col">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-blue-500" />
              Planos de Meta Ativos
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedExec === 'all'
                ? `${totalAgencies} agência(s) com plano ativo`
                : `${totalAgencies} agência(s) ativa(s) para ${selectedExec}`}
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              <Select value={selectedExec} onValueChange={setSelectedExec}>
                <SelectTrigger className="h-8 text-xs w-[180px]">
                  <SelectValue placeholder="Executivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Executivos</SelectItem>
                  {executives.map((exec) => (
                    <SelectItem key={exec} value={exec}>
                      {exec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedExec !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExec('all')}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  Limpar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 min-h-[200px]">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-blue-500/5 border border-blue-500/20 px-4 py-2.5">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Agências com Plano Ativo
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              {totalAgencies}
            </p>
          </div>
        </div>

        {activeAgencies.length > 0 ? (
          <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1">
            {activeAgencies.map((agency, idx) => (
              <div
                key={`${agency.client_name}-${idx}`}
                className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-xs"
              >
                <span className="font-mono font-bold text-muted-foreground w-6 shrink-0">
                  {idx + 1}
                </span>
                <Building2 className="h-3.5 w-3.5 text-blue-500/60 shrink-0" />
                <span className="font-medium truncate flex-1" title={agency.client_name}>
                  {agency.client_name}
                </span>
                {selectedExec === 'all' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30 shrink-0"
                  >
                    {agency.executive}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
            Nenhuma agência com plano ativo encontrada.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
