import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ActiveAction } from '@/services/actions'
import { type PlanCalculation, generateReportMessage } from '@/services/plan-calculations'
import { toast } from 'sonner'
import { Copy, Check, Send } from 'lucide-react'

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  action: ActiveAction | null
  calc: PlanCalculation | null
  onMarkAsSent: (actionId: string) => void
}

export function ReportDialog({ isOpen, onClose, action, calc, onMarkAsSent }: ReportDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!action || !calc) return null

  const reportText = generateReportMessage(action, calc)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      toast.success('Relatório copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const handleMarkAsSent = () => {
    if (action.id) {
      onMarkAsSent(action.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            Relatório de Acompanhamento
          </DialogTitle>
          <DialogDescription className="text-xs">
            Copie a mensagem abaixo e envie para o cliente via email ou WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Textarea
            value={reportText}
            readOnly
            className="text-xs min-h-[300px] font-mono resize-none"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Fechar
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleMarkAsSent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" /> Marcar como Enviado
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
