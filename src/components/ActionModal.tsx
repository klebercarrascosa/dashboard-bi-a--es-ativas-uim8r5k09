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
import { Input } from '@/components/ui/input'
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
import { CheckCircle2, Clock } from 'lucide-react'

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
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [valorMeta, setValorMeta] = useState('')
  const [meta2, setMeta2] = useState('')
  const [intervaloRelatorio, setIntervaloRelatorio] = useState<'15 dias' | '30 dias'>('30 dias')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toDateInputValue = (val?: string): string => {
    if (!val || val.trim() === '') return ''
    const datePart = val.trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return ''
    return datePart
  }

  useEffect(() => {
    if (existingAction) {
      setStatus(existingAction.status)
      setPriority(existingAction.priority)
      setNote(existingAction.note || '')
      setDataInicio(toDateInputValue(existingAction.data_inicio))
      setDataFim(toDateInputValue(existingAction.data_fim))
      setValorMeta(existingAction.valor_meta ? String(existingAction.valor_meta) : '')
      setMeta2(existingAction.meta_2 ? String(existingAction.meta_2) : '')
      setIntervaloRelatorio(existingAction.intervalo_relatorio || '30 dias')
    } else {
      setStatus('Em Negociação')
      setPriority('Média')
      setNote('')
      setDataInicio('')
      setDataFim('')
      setValorMeta('')
      setMeta2('')
      setIntervaloRelatorio('30 dias')
    }
  }, [existingAction, client])

  if (!client) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    try {
      const commonData = {
        status,
        priority,
        note,
        tab_month: activeTab,
        data_inicio: dataInicio,
        data_fim: dataFim,
        valor_meta: valorMeta ? parseFloat(valorMeta) : 0,
        meta_2: meta2 ? parseFloat(meta2) : 0,
        intervalo_relatorio: intervaloRelatorio,
      }
      if (existingAction && existingAction.id) {
        await updateActiveAction(existingAction.id, commonData)
        toast.success('Plano de Meta atualizado com sucesso!')
      } else {
        await createActiveAction({
          user_id: user.id,
          client_name: client.clienteUnificado,
          cpf_cnpj: client.cpfCnpj,
          executive: client.executivo,
          regional: client.regional,
          ...commonData,
        })
        toast.success('Novo Plano de Meta registrado!')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar Plano de Meta no banco de dados.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateDisplay = (val?: string) => {
    if (!val || val.trim() === '') return null
    try {
      const d = new Date(val.slice(0, 10) + 'T00:00:00')
      if (isNaN(d.getTime())) return null
      return d.toLocaleDateString('pt-BR')
    } catch {
      return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Plano de Meta do Cliente
          </DialogTitle>
          <DialogDescription className="text-xs">
            Defina metas e prazos para acompanhamento comercial de {client.clienteUnificado}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
              <Label className="text-xs font-semibold">Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Valor da Meta (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 50000.00"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meta 2 (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 75000.00"
                value={meta2}
                onChange={(e) => setMeta2(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status do Plano</Label>
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
            <Label className="text-xs font-semibold">Intervalo de Relatório</Label>
            <Select
              value={intervaloRelatorio}
              onValueChange={(val: any) => setIntervaloRelatorio(val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 dias">A cada 15 dias</SelectItem>
                <SelectItem value="30 dias">A cada 30 dias</SelectItem>
              </SelectContent>
            </Select>
            {existingAction?.ultimo_relatorio &&
              formatDateDisplay(existingAction.ultimo_relatorio) && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Último relatório enviado: {formatDateDisplay(existingAction.ultimo_relatorio)}
                </p>
              )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observações / Estratégia</Label>
            <Textarea
              placeholder="Descreva a estratégia comercial, prazos de negociação ou detalhes do plano de meta..."
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
              {isSubmitting ? 'Salvando...' : 'Salvar Plano'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
