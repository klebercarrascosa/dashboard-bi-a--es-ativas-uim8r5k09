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
import { Flag, Filter, Trophy, ChevronDown, ChevronRight, Building2 } from 'lucide-react'

interface ActivePlansKpiProps {
  activeActions: ActiveAction[]
  today: string
  isAdmin: boolean
}

export function ActivePlansKpi({ activeActions, today, isAdmin }: ActivePlansKpiProps) {
  const [selectedExec, setSelectedExec] = useState<string>('all')
  const [expandedExec, setExpandedExec] = useState<string | null>(null)

  const executives = useMemo(
    () => Array.from(new Set(activeActions.map((a) => a.executive).filter(Boolean))).sort(),
    [activeActions],
  )

  const agenciesByExec = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const action of activeActions) {
      if (!action.data_inicio || !action.data_fim) continue
      if (today < action.data_inicio || today > action.data_fim) continue
      const exec = action.executive || 'Sem Executivo'
      if (!map.has(exec)) map.set(exec, [])
      map.get(exec)!.push(action.client_name)
    }
    return map
  }, [activeActions, today])

  const executiveCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const action of activeActions) {
      if (!action.data_inicio || !action.data_fim) continue
      if (today < action.data_inicio || today > action.data_fim) continue
      const exec = action.executive || 'Sem Executivo'
      map.set(exec, (map.get(exec) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [activeActions, today])

  const totalCount = executiveCounts.reduce((sum, e) => sum + e.count, 0)

  const filteredCounts = useMemo(() => {
    if (selectedExec === 'all') return executiveCounts
    return executiveCounts.filter((e) => e.name === selectedExec)
  }, [executiveCounts, selectedExec])

  const filteredTotal = filteredCounts.reduce((sum, e) => sum + e.count, 0)
  const maxCount = filteredCounts.length > 0 ? Math.max(...filteredCounts.map((e) => e.count)) : 0

  return (
    <Card className="shadow-sm flex flex-col">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Flag className="h-4 w-4 text-emerald-500" />
              Planos de Meta Ativos por executivo
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedExec === 'all'
                ? `${totalCount} plano(s) ativo(s) • ${executiveCounts.length} executivo(s)`
                : `${filteredTotal} plano(s) ativo(s) para ${selectedExec}`}
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
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Planos Ativos
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {filteredTotal}
            </p>
          </div>
        </div>

        {filteredCounts.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1">
            {filteredCounts.map((item, idx) => {
              const barPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              const sharePct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0'
              const isExpanded = expandedExec === item.name
              const agencies = agenciesByExec.get(item.name) ?? []
              return (
                <div key={`${item.name}-${idx}`}>
                  <div
                    className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors text-xs cursor-pointer"
                    onClick={() => setExpandedExec(isExpanded ? null : item.name)}
                  >
                    <span className="font-mono font-bold text-muted-foreground w-6 shrink-0">
                      {idx + 1}º
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium truncate flex-1" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex-1 max-w-[180px]">
                      <div className="h-5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 w-6 text-right">
                      {item.count}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0"
                    >
                      {sharePct}%
                    </Badge>
                  </div>
                  {isExpanded && (
                    <div className="ml-10 mb-2 space-y-1 animate-fade-in">
                      {agencies.length > 0 ? (
                        agencies.map((agency, i) => (
                          <div
                            key={`${agency}-${i}`}
                            className="flex items-center gap-2 py-1 px-2 rounded text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                          >
                            <Building2 className="h-3 w-3 text-emerald-500/60 shrink-0" />
                            <span className="truncate">{agency}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic px-2 py-1">
                          Nenhuma agência ativa.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
            Nenhum plano ativo encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
