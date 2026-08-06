import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateActiveAction } from '@/services/actions'
import { toast } from 'sonner'
import { Plane, Check, X, ChevronDown, Loader2 } from 'lucide-react'

const CONDICOES = ['GOL', 'LATAM', 'AZUL TOP'] as const
type CondicaoValue = (typeof CONDICOES)[number]

const CONDICAO_STYLES: Record<string, string> = {
  GOL: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400',
  LATAM: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400',
  'AZUL TOP': 'bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-400',
}

interface ConditionSelectorProps {
  actionId: string
  currentCondicao?: string
  isAdmin: boolean
  onUpdate?: () => void
}

export function ConditionSelector({
  actionId,
  currentCondicao,
  isAdmin,
  onUpdate,
}: ConditionSelectorProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const condicao = currentCondicao && currentCondicao.trim() !== '' ? currentCondicao : undefined

  const handleSelect = async (value: CondicaoValue | null) => {
    setSaving(true)
    try {
      await updateActiveAction(actionId, { condicao: value || '' })
      toast.success(value ? `Condição definida: ${value}` : 'Condição removida')
      onUpdate?.()
    } catch {
      toast.error('Erro ao atualizar condição')
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  if (!isAdmin) {
    if (!condicao) return null
    return (
      <Badge variant="outline" className={`text-[10px] ${CONDICAO_STYLES[condicao] ?? ''}`}>
        <Plane className="h-2.5 w-2.5 mr-1" />
        {condicao}
      </Badge>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={saving}
          className="h-7 text-[11px] gap-1 px-2"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : condicao ? (
            <>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${CONDICAO_STYLES[condicao] ?? ''}`}
              >
                {condicao}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          ) : (
            <>
              <Plane className="h-3 w-3" />
              Definir Condição
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        <div className="space-y-0.5">
          {CONDICOES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className="flex items-center justify-between w-full rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold border ${CONDICAO_STYLES[c] ?? ''}`}
                >
                  {c === 'GOL' ? 'G' : c === 'LATAM' ? 'L' : 'A'}
                </span>
                {c}
              </span>
              {condicao === c && <Check className="h-3 w-3 text-emerald-500" />}
            </button>
          ))}
          {condicao && (
            <>
              <div className="h-px bg-border my-0.5" />
              <button
                onClick={() => handleSelect(null)}
                className="flex items-center gap-1.5 w-full rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-3 w-3" />
                Limpar Condição
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
