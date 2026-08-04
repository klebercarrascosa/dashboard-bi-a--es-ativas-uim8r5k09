import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SheetRow, formatCurrency } from '@/services/sheets'
import { ActiveAction, createActiveAction, updateActiveAction } from '@/services/actions'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { CheckCircle2, ShieldAlert } from 'lucide-react'

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  client: SheetRow | null
  existingAction?: ActiveAction | null
  activeTab: string
  onSaved: () => void
}

export function ActionModal({
  isOpen,
  onClose,
  client,
  existingAction,
  activeTab,
  onSaved,
}: ActionModalProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<ActiveAction['status']>('Em Negociação')
  const [priority, setPriority] = useState<ActiveAction['priority']>('Média')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (existingAction) {
      setStatus(existingAction.status)
      setPriority(existingAction.priority)
      setNote(existingAction.note || '')
    } else {
      setStatus('Em Negociação')
      setPriority('Média')
      setNote('')
    }
  }, [existingAction, client])

  if (!client) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      if (existingAction && existingAction.id) {
        await updateActiveAction(existingAction.id, {
          status,
          priority,
          note,
          tab_month: activeTab,
        })
        toast.success('Ação ativa atualizada com sucesso!')
      } else {
        await createActiveAction({
          user_id: user.id,
          client_name: client.clienteUnificado,
          cpf_cnpj: client.cpfCnpj,
          executive: client.executivo,
          regional: client.regional,
          status,
          priority,
          note,
          tab_month: activeTab,
        })
        toast.success('Nova Ação Ativa registrada!')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar ação ativa no banco de dados.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Ação Ativa do Cliente
          </DialogTitle>
          <DialogDescription className="text-xs">
            Gerencie planos de ação e acompanhamento para {client.clienteUnificado}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Executivo:</span>
              <span className="font-semibold">{client.executivo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regional:</span>
              <span className="font-semibold">{client.regional}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="text-muted-foreground">Venda Atual:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(client.venda)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status da Ação</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejada">Planejada</SelectItem>
                  <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Em Risco">Em Risco</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prioridade</Label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta 🔥</SelectItem>
                  <SelectItem value="Média">Média ⚡</SelectItem>
                  <SelectItem value="Baixa">Baixa 🍃</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observações / Próximos Passos</Label>
            <Textarea
              placeholder="Descreva a estratégia comercial, prazos de negociação ou detalhes da ação..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Ação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
