import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateActiveAction } from '@/services/actions'
import { Plane, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ConditionSelectorProps {
  actionId: string
  currentCondicao?: string
  isAdmin: boolean
  onUpdate?: () => void
}

const CONDITIONS = [
  {
    value: 'GOL',
    label: 'GOL',
    color:
      'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20',
  },
  {
    value: 'LATAM',
    label: 'LATAM',
    color:
      'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20',
  },
  {
    value: 'AZUL TOP',
    label: 'AZUL TOP',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20',
  },
] as const

export function ConditionSelector({
  actionId,
  currentCondicao,
  isAdmin,
  onUpdate,
}: ConditionSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSet = async (value: string | '') => {
    if (!isAdmin) return
    setLoading(value || 'clear')
    try {
      await updateActiveAction(actionId, { condicao: value })
      toast.success(value ? `Condição definida: ${value}` : 'Condição removida')
      onUpdate?.()
    } catch {
      toast.error('Erro ao atualizar condição.')
    } finally {
      setLoading(null)
    }
  }

  if (!isAdmin && !currentCondicao) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!isAdmin && currentCondicao && (
        <span className="text-xs font-semibold text-muted-foreground">{currentCondicao}</span>
      )}
      {isAdmin && (
        <>
          <div className="flex items-center gap-1">
            <Plane className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Condição:
            </span>
          </div>
          {CONDITIONS.map((cond) => {
            const isActive = currentCondicao === cond.value
            const isLoading = loading === cond.value
            return (
              <Button
                key={cond.value}
                variant="outline"
                size="sm"
                disabled={loading !== null}
                onClick={() => handleSet(cond.value)}
                className={cn(
                  'h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-all duration-150',
                  cond.color,
                  isActive && 'ring-2 ring-offset-1 ring-offset-background',
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isActive ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : null}
                {cond.label}
              </Button>
            )
          })}
          {currentCondicao && (
            <Button
              variant="ghost"
              size="sm"
              disabled={loading !== null}
              onClick={() => handleSet('')}
              className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 rounded-md"
            >
              {loading === 'clear' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3 mr-0.5" />
              )}
              Limpar
            </Button>
          )}
        </>
      )}
    </div>
  )
}
