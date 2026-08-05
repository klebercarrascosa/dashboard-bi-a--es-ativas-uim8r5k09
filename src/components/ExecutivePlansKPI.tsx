import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Flag, Building2, CalendarDays } from 'lucide-react'
import type { ActiveAction } from '@/services/actions'

interface ExecutivePlansKPIProps {
  activeActions: ActiveAction[]
  today?: string
}

export function ExecutivePlansKPI({ activeActions, today }: ExecutivePlansKPIProps) {
  const [selectedExec, setSelectedExec] = useState<string | null>(null)
  const todayStr = today || new Date().toISOString().slice(0, 10)

  const executiveStats = useMemo(() => {
    const map = new Map<string, { clients: Set<string>; plans: ActiveAction[] }>()
    for (const action of activeActions) {
      if (action.status === 'Concluído') continue
      if (!action.data_inicio || !action.data_fim) continue
      if (todayStr < action.data_inicio || todayStr > action.data_fim) continue
      const exec = action.executive || 'Sem Executivo'
      if (!map.has(exec)) map.set(exec, { clients: new Set(), plans: [] })
      map.get(exec)!.clients.add(action.client_name)
      map.get(exec)!.plans.push(action)
    }
    return Array.from(map.entries())
      .map(([exec, { clients, plans }]) => ({
        exec,
        clientCount: clients.size,
        uniqueClients: Array.from(clients).sort(),
        plans,
      }))
      .sort((a, b) => b.clientCount - a.clientCount)
  }, [activeActions, todayStr])

  const formattedToday = useMemo(() => {
    try {
      return new Date(todayStr + 'T00:00:00').toLocaleDateString('pt-BR')
    } catch {
      return todayStr
    }
  }, [todayStr])

  if (executiveStats.length === 0) return null

  const selectedData = selectedExec
    ? (executiveStats.find((s) => s.exec === selectedExec) ?? null)
    : null

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium text-muted-foreground">
          Data de referência: <span className="font-bold text-foreground">{formattedToday}</span>
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {executiveStats.map(({ exec, clientCount }) => (
          <Card
            key={exec}
            className="cursor-pointer hover:shadow-md hover:border-amber-500/40 transition-all border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent"
            onClick={() => setSelectedExec(exec)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate">
                  {exec}
                </p>
                <Flag className="h-3 w-3 text-amber-500 shrink-0" />
              </div>
              <p className="text-2xl font-extrabold">{clientCount}</p>
              <p className="text-[10px] text-muted-foreground">
                {clientCount === 1 ? 'cliente ativo' : 'clientes ativos'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedExec} onOpenChange={(open) => !open && setSelectedExec(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              {selectedExec}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              {selectedData?.clientCount ?? 0}{' '}
              {selectedData?.clientCount === 1 ? 'agência ativa' : 'agências ativas'}
            </Badge>
            {selectedData?.uniqueClients.map((clientName) => {
              const plan = selectedData.plans.find((p) => p.client_name === clientName)
              return (
                <div
                  key={clientName}
                  className="flex items-center justify-between rounded-lg border p-2.5 text-xs"
                >
                  <span className="font-semibold">{clientName}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {plan?.regional || '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
