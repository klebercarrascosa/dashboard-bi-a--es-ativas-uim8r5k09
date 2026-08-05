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
import { Flag, Users, Trophy, BarChart3, Filter } from 'lucide-react'

interface ActivePlansRankingProps {
  activeActions: ActiveAction[]
  today: string
}

export function ActivePlansRanking({ activeActions, today }: ActivePlansRankingProps) {
  const [selectedExec, setSelectedExec] = useState<string>('all')

  const executives = useMemo(
    () => Array.from(new Set(activeActions.map((a) => a.executive).filter(Boolean))).sort(),
    [activeActions],
  )

  const executiveCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const action of activeActions) {
      if (action.status === 'Concluído') continue
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Planos Ativos
              </p>
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Flag className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">{filteredTotal}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedExec === 'all' ? 'Todos os executivos' : selectedExec}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Executivos Ativos
              </p>
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
              {selectedExec === 'all' ? executiveCounts.length : filteredCounts.length}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Com planos vigentes hoje</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Maior Concentração
              </p>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
              {executiveCounts.length > 0 ? executiveCounts[0].count : 0}
            </h3>
            <p
              className="mt-1 text-xs text-muted-foreground truncate"
              title={executiveCounts[0]?.name}
            >
              {executiveCounts.length > 0 ? executiveCounts[0].name : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedExec} onValueChange={setSelectedExec}>
          <SelectTrigger className="h-8 text-xs w-[220px]">
            <SelectValue placeholder="Filtrar por executivo" />
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
            Limpar filtro
          </Button>
        )}
      </div>

      <Card className="shadow-sm flex flex-col">
        <CardHeader className="pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Ranking de Planos Ativos por Executivo
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedExec === 'all'
                ? `${filteredTotal} planos ativos distribuídos entre ${executiveCounts.length} executivos`
                : filteredCounts.length > 0
                  ? `${filteredCounts[0].count} plano(s) ativo(s) para ${selectedExec}`
                  : `Nenhum plano ativo para ${selectedExec}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2 flex-1 min-h-[260px]">
          {filteredCounts.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
              {filteredCounts.map((item, idx) => {
                const barPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                const sharePct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0'
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors text-xs"
                  >
                    <span className="font-mono font-bold text-muted-foreground w-6 shrink-0">
                      {idx + 1}º
                    </span>
                    <span className="font-medium truncate flex-1" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex-1 max-w-[200px]">
                      <div className="h-5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500/60 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0 w-8 text-right">
                      {item.count}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0"
                    >
                      {sharePct}%
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              Nenhum plano ativo encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
