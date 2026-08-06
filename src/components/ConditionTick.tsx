import { useState } from 'react'
import { updateActiveAction, normalizeCondicao } from '@/services/actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ConditionTickProps {
  actionId: string
  currentCondicao?: string[]
  onUpdate?: () => void
}

const CONDITIONS = [
  {
    value: 'GOL',
    label: 'GOL',
    activeClass: 'border-orange-500 bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    value: 'LATAM',
    label: 'LATAM',
    activeClass: 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
  {
    value: 'AZUL TOP',
    label: 'AZUL',
    activeClass: 'border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    value: 'RC',
    label: 'RC',
    activeClass: 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
] as const

export function ConditionTick({ actionId, currentCondicao, onUpdate }: ConditionTickProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const conditions = normalizeCondicao(currentCondicao)

  const handleToggle = async (value: string) => {
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

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {CONDITIONS.map((cond) => {
        const isActive = conditions.includes(cond.value)
        const isLoading = loading === cond.value
        return (
          <button
            key={cond.value}
            type="button"
            disabled={loading !== null}
            onClick={() => handleToggle(cond.value)}
            className={cn(
              'h-6 px-1.5 text-[10px] font-semibold rounded border transition-all duration-150',
              isActive ? cond.activeClass : 'border-muted text-muted-foreground hover:bg-muted/50',
            )}
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : cond.label}
          </button>
        )
      })}
    </div>
  )
}
