import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateActiveAction, normalizeCondicao } from '@/services/actions'
import { Plane, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ConditionSelectorProps {
  actionId: string
  currentCondicao?: string[]
  isAdmin: boolean
  onUpdate?: () => void
}

const CONDITIONS = [
  {
    value: 'GOL',
    label: 'GOL',
    color:
      'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20',
    badge: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  },
  {
    value: 'LATAM',
    label: 'LATAM',
    color:
      'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
  },
  {
    value: 'AZUL',
    label: 'AZUL',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
  {
    value: 'RC',
    label: 'RC',
    color:
      'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  },
] as const

export function ConditionSelector({
  actionId,
  currentCondicao,
  isAdmin,
  onUpdate,
}: ConditionSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const conditions = normalizeCondicao(currentCondicao)

  const handleToggle = async (value: string) => {
    if (!isAdmin) return
    const newValue = conditions.includes(value)
      ? conditions.filter((v) => v !== value)
      : [...conditions, value]
    setLoading(value)
    try {
      await updateActiveAction(actionId, { condicao: newValue })
      toast.success(
        newValue.length > 0 ? `Condições: ${newValue.join(', ')}` : 'Condições removidas',
      )
      onUpdate?.()
    } catch {
      toast.error('Erro ao atualizar condição.')
    } finally {
      setLoading(null)
    }
  }

  if (!isAdmin && conditions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!isAdmin && conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <Plane className="h-3 w-3 text-muted-foreground" />
          {conditions.map((c) => {
            const cond = CONDITIONS.find((cd) => cd.value === c)
            return (
              <Badge
                key={c}
                variant="outline"
                className={cn('text-[10px] font-semibold', cond?.badge ?? '')}
              >
                {c}
              </Badge>
            )
          })}
        </div>
      )}
      {isAdmin && (
        <>
          <div className="flex items-center gap-1">
            <Plane className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Condições:
            </span>
          </div>
          {CONDITIONS.map((cond) => {
            const isActive = conditions.includes(cond.value)
            const isLoading = loading === cond.value
            return (
              <Button
                key={cond.value}
                variant="outline"
                size="sm"
                disabled={loading !== null}
                onClick={() => handleToggle(cond.value)}
                className={cn(
                  'h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-all duration-150',
                  cond.color,
                  isActive && 'ring-2 ring-offset-1 ring-offset-background',
                )}
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {cond.label}
              </Button>
            )
          })}
        </>
      )}
    </div>
  )
}
