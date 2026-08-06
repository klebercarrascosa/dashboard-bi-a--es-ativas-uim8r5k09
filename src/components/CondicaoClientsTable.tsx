import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { ConditionSelector } from '@/components/ConditionSelector'
import type { ActiveAction } from '@/services/actions'
import { Plane } from 'lucide-react'

interface CondicaoClientsTableProps {
  activeActions: ActiveAction[]
  isAdmin: boolean
  onUpdate?: () => void
}

export function CondicaoClientsTable({
  activeActions,
  isAdmin,
  onUpdate,
}: CondicaoClientsTableProps) {
  const withCondicao = activeActions.filter(
    (a) => a.condicao && a.condicao.trim() !== '' && a.status !== 'Concluído',
  )

  const order: Record<string, number> = { GOL: 0, LATAM: 1, 'AZUL TOP': 2 }
  const sorted = [...withCondicao].sort((a, b) => {
    const oa = order[a.condicao as string] ?? 3
    const ob = order[b.condicao as string] ?? 3
    if (oa !== ob) return oa - ob
    return a.client_name.localeCompare(b.client_name)
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Plane className="h-4 w-4 text-sky-500" />
          Clientes GOL / LATAM / AZUL TOP
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {sorted.length === 0 ? (
          <div className="px-4 pb-4 py-8 text-center text-xs text-muted-foreground">
            Nenhum cliente com condição definida.
            {isAdmin && ' Use o detalhe do plano para definir condições.'}
          </div>
        ) : (
          <div className="overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase">Cliente</TableHead>
                  <TableHead className="text-[10px] uppercase">Exec</TableHead>
                  <TableHead className="text-[10px] uppercase">Condição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="text-xs font-medium py-2 max-w-[140px] truncate">
                      {action.client_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2 max-w-[80px] truncate">
                      {action.executive || '—'}
                    </TableCell>
                    <TableCell className="py-2">
                      <ConditionSelector
                        actionId={action.id!}
                        currentCondicao={action.condicao}
                        isAdmin={isAdmin}
                        onUpdate={onUpdate}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
