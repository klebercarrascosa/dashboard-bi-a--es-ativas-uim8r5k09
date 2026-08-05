import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ActiveAction } from '@/services/actions'
import { Plane } from 'lucide-react'

interface CondicaoKpiProps {
  activeActions: ActiveAction[]
}

const CONDICOES = ['GOL', 'LATAM', 'AZUL TOP'] as const

const CONDICAO_STYLES: Record<string, string> = {
  GOL: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  LATAM: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  'AZUL TOP': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
}

export function CondicaoKpi({ activeActions }: CondicaoKpiProps) {
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const action of activeActions) {
      if (!action.condicao) continue
      map.set(action.condicao, (map.get(action.condicao) ?? 0) + 1)
    }
    return map
  }, [activeActions])

  const total = Array.from(counts.values()).reduce((sum, v) => sum + v, 0)

  return (
    <Card className="shadow-sm flex flex-col border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
      <CardHeader className="pb-2 space-y-0">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <Plane className="h-4 w-4 text-amber-500" />
          Clientes GOL / LATAM / AZUL TOP
        </CardTitle>
        <CardDescription className="text-xs">
          {total} cliente(s) com condição de companhia aérea
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-1">
        <div className="grid grid-cols-3 gap-2">
          {CONDICOES.map((cond) => {
            const count = counts.get(cond) ?? 0
            return (
              <div
                key={cond}
                className="flex flex-col items-center justify-center rounded-lg border p-3 transition-colors hover:bg-muted/30"
              >
                <Badge variant="outline" className={`text-[10px] mb-1.5 ${CONDICAO_STYLES[cond]}`}>
                  {cond}
                </Badge>
                <span className="text-2xl font-extrabold tracking-tight">{count}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">cliente(s)</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
