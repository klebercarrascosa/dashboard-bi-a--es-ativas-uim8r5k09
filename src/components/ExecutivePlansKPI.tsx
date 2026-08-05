import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Flag, Users, CalendarDays, Trophy } from 'lucide-react'
import type { ActiveAction } from '@/services/actions'

interface ExecutivePlansKPIProps {
  activeActions: ActiveAction[]
  today?: string
  onExecutiveClick?: (executive: string) => void
}

export function ExecutivePlansKPI({
  activeActions,
  today,
  onExecutiveClick,
}: ExecutivePlansKPIProps) {
  const todayStr = today || new Date().toISOString().slice(0, 10)

  const executiveStats = useMemo(() => {
    const map = new Map<string, ActiveAction[]>()
    for (const action of activeActions) {
      if (action.status === 'Concluído') continue
      if (!action.data_inicio || !action.data_fim) continue
      if (todayStr < action.data_inicio || todayStr > action.data_fim) continue
      const exec = action.executive || 'Sem Executivo'
      if (!map.has(exec)) map.set(exec, [])
      map.get(exec)!.push(action)
    }
    return Array.from(map.entries())
      .map(([exec, plans]) => ({ exec, planCount: plans.length }))
      .sort((a, b) => b.planCount - a.planCount)
  }, [activeActions, todayStr])

  const formattedToday = useMemo(() => {
    try {
      return new Date(todayStr + 'T00:00:00').toLocaleDateString('pt-BR')
    } catch {
      return todayStr
    }
  }, [todayStr])

  const totalActivePlans = executiveStats.reduce((s, e) => s + e.planCount, 0)

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Data de referência: <span className="font-bold text-foreground">{formattedToday}</span>
          </span>
        </div>
        {executiveStats.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold flex items-center gap-1">
              <Flag className="h-3 w-3 text-amber-500" />
              {totalActivePlans} {totalActivePlans === 1 ? 'plano ativo' : 'planos ativos'}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-500" />
              {executiveStats.length} {executiveStats.length === 1 ? 'executivo' : 'executivos'}
            </span>
          </div>
        )}
      </div>

      {executiveStats.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum plano de meta ativo encontrado para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {executiveStats.map(({ exec, planCount }, idx) => (
            <Card
              key={exec}
              className="cursor-pointer hover:shadow-md hover:border-amber-500/40 transition-all border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent"
              onClick={() => onExecutiveClick?.(exec)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate">
                    {exec}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {idx === 0 && planCount > 0 && <Trophy className="h-3 w-3 text-amber-500" />}
                    <Flag className="h-3 w-3 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold">{planCount}</p>
                <p className="text-[10px] text-muted-foreground">
                  {planCount === 1 ? 'plano ativo' : 'planos ativos'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
