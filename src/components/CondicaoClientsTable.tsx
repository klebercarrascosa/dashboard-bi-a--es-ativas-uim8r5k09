import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ActiveAction } from '@/services/actions'
import { Search, Plane, FilterX } from 'lucide-react'

interface CondicaoClientsTableProps {
  activeActions: ActiveAction[]
}

const CONDICOES = ['GOL', 'LATAM', 'AZUL TOP'] as const

const CONDICAO_STYLES: Record<string, string> = {
  GOL: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  LATAM: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  'AZUL TOP': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
}

export function CondicaoClientsTable({ activeActions }: CondicaoClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const condicaoClients = useMemo(() => {
    return activeActions
      .filter((a) => a.condicao && CONDICOES.includes(a.condicao as (typeof CONDICOES)[number]))
      .sort((a, b) => {
        const condOrder =
          CONDICOES.indexOf(a.condicao as (typeof CONDICOES)[number]) -
          CONDICOES.indexOf(b.condicao as (typeof CONDICOES)[number])
        if (condOrder !== 0) return condOrder
        return (a.client_name || '').localeCompare(b.client_name || '')
      })
  }, [activeActions])

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return condicaoClients
    return condicaoClients.filter(
      (a) =>
        (a.client_name || '').toLowerCase().includes(term) ||
        (a.executive || '').toLowerCase().includes(term) ||
        (a.regional || '').toLowerCase().includes(term) ||
        (a.cpf_cnpj || '').toLowerCase().includes(term) ||
        (a.condicao || '').toLowerCase().includes(term),
    )
  }, [condicaoClients, searchTerm])

  const thBase = 'py-2 px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap'

  return (
    <Card className="shadow-sm flex flex-col border-amber-500/20">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Plane className="h-4 w-4 text-amber-500" />
              Clientes por Condição (GOL / LATAM / AZUL TOP)
            </CardTitle>
            <CardDescription className="text-xs">
              {filteredClients.length} cliente(s) listado(s)
            </CardDescription>
          </div>
          <div className="relative w-40">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1 h-6 w-6 text-muted-foreground"
              >
                <FilterX className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 min-h-[260px]">
        {filteredClients.length > 0 ? (
          <div className="max-h-[260px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 text-muted-foreground border-y sticky top-0">
                <tr>
                  <th className={thBase}>Cliente</th>
                  <th className={thBase}>CPF / CNPJ</th>
                  <th className={thBase}>Executivo</th>
                  <th className={thBase}>Regional</th>
                  <th className={thBase}>Condição</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClients.map((action, idx) => (
                  <tr key={`${action.id ?? idx}`} className="hover:bg-muted/30 transition-colors">
                    <td
                      className="py-2 px-3 font-semibold text-foreground max-w-[180px] truncate"
                      title={action.client_name}
                    >
                      {action.client_name}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                      {action.cpf_cnpj || '—'}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{action.executive || '—'}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="font-normal text-[10px] bg-slate-500/5">
                        {action.regional || '—'}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${CONDICAO_STYLES[action.condicao!]}`}
                      >
                        {action.condicao}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
            Nenhum cliente com condição GOL, LATAM ou AZUL TOP encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
