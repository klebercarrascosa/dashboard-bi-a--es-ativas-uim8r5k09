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
import { Checkbox } from '@/components/ui/checkbox'
import { z } from 'zod'

const planSchema = z
  .object({
    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
    valorMeta: z.string().optional(),
    meta2: z.string().optional(),
    meta3: z.string().optional(),
    premioMeta1: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || v.trim() === '') return true
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0 && n <= 100
      }, 'Percentual deve estar entre 0 e 100'),
    premioMeta2: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || v.trim() === '') return true
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0 && n <= 100
      }, 'Percentual deve estar entre 0 e 100'),
    premioMeta3: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || v.trim() === '') return true
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0 && n <= 100
      }, 'Percentual deve estar entre 0 e 100'),
    valorVendido: z
      .string()
      .optional()
      .refine((v) => {
        if (!v || v.trim() === '') return true
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0
      }, 'Valor vendido não pode ser negativo'),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.dataFim) {
        return new Date(data.dataInicio) <= new Date(data.dataFim)
      }
      return true
    },
    { message: 'Data Fim não pode ser anterior à Data Início', path: ['dataFim'] },
  )

type FieldErrors = Record<string, string>

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
  const [meta3, setMeta3] = useState('')
  const [intervaloRelatorio, setIntervaloRelatorio] = useState<'15 dias' | '30 dias'>('30 dias')
  const [premioMeta1, setPremioMeta1] = useState('')
  const [premioMeta2, setPremioMeta2] = useState('')
  const [premioMeta3, setPremioMeta3] = useState('')
  const [valorVendido, setValorVendido] = useState('')
  const [pagamentoMensal, setPagamentoMensal] = useState(false)
  const [pagamentoTrimestral, setPagamentoTrimestral] = useState(false)
  const [bonusAnual, setBonusAnual] = useState(false)
  const [tipoMeta, setTipoMeta] = useState<string[]>(['Geral'])
  const [condicao, setCondicao] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const toDateInputValue = (val?: string): string => {
    if (!val || val.trim() === '') return ''
    const datePart = val.trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return ''
    return datePart
  }

  useEffect(() => {
    setFieldErrors({})
    if (existingAction) {
      setStatus(existingAction.status)
      setPriority(existingAction.priority)
      setNote(existingAction.note || '')
      setDataInicio(toDateInputValue(existingAction.data_inicio))
      setDataFim(toDateInputValue(existingAction.data_fim))
      setValorMeta(existingAction.valor_meta ? String(existingAction.valor_meta) : '')
      setMeta2(existingAction.meta_2 ? String(existingAction.meta_2) : '')
      setMeta3(existingAction.meta_3 ? String(existingAction.meta_3) : '')
      setPremioMeta1(
        existingAction.premio_meta_1 != null ? String(existingAction.premio_meta_1) : '',
      )
      setPremioMeta2(
        existingAction.premio_meta_2 != null ? String(existingAction.premio_meta_2) : '',
      )
      setPremioMeta3(
        existingAction.premio_meta_3 != null ? String(existingAction.premio_meta_3) : '',
      )
      setValorVendido(
        existingAction.valor_vendido != null ? String(existingAction.valor_vendido) : '',
      )
      setPagamentoMensal(existingAction.pagamento_mensal ?? false)
      setPagamentoTrimestral(existingAction.pagamento_trimestral ?? false)
      setBonusAnual(existingAction.bonus_anual ?? false)
      const tm = existingAction.tipo_meta
      setTipoMeta(Array.isArray(tm) ? tm : tm ? [tm] : ['Geral'])
      setCondicao(
        Array.isArray(existingAction.condicao)
          ? existingAction.condicao
          : existingAction.condicao
            ? [existingAction.condicao]
            : [],
      )
      setIntervaloRelatorio(existingAction.intervalo_relatorio || '30 dias')
    } else {
      setStatus('Em Negociação')
      setPriority('Média')
      setNote('')
      setDataInicio('')
      setDataFim('')
      setValorMeta('')
      setMeta2('')
      setMeta3('')
      setPremioMeta1('')
      setPremioMeta2('')
      setPremioMeta3('')
      setValorVendido('')
      setPagamentoMensal(false)
      setPagamentoTrimestral(false)
      setBonusAnual(false)
      setTipoMeta(['Geral'])
      setCondicao([])
      setIntervaloRelatorio('30 dias')
    }
  }, [existingAction?.id, client])

  if (!client) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const result = planSchema.safeParse({
      dataInicio,
      dataFim,
      valorMeta,
      meta2,
      meta3,
      premioMeta1,
      premioMeta2,
      premioMeta3,
      valorVendido,
    })
    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
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
        meta_3: meta3 ? parseFloat(meta3) : 0,
        premio_meta_1: premioMeta1 ? parseFloat(premioMeta1) : 0,
        premio_meta_2: premioMeta2 ? parseFloat(premioMeta2) : 0,
        premio_meta_3: premioMeta3 ? parseFloat(premioMeta3) : 0,
        valor_vendido: valorVendido ? parseFloat(valorVendido) : 0,
        intervalo_relatorio: intervaloRelatorio,
        pagamento_mensal: pagamentoMensal,
        pagamento_trimestral: pagamentoTrimestral,
        bonus_anual: bonusAnual,
        tipo_meta: tipoMeta,
        condicao: condicao,
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Meta</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={tipoMeta.includes('Geral')}
                  onCheckedChange={(checked) => {
                    setTipoMeta((prev) =>
                      checked ? [...prev, 'Geral'] : prev.filter((v) => v !== 'Geral'),
                    )
                  }}
                />
                <span>Meta Geral</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={tipoMeta.includes('Por Cia')}
                  onCheckedChange={(checked) => {
                    setTipoMeta((prev) =>
                      checked ? [...prev, 'Por Cia'] : prev.filter((v) => v !== 'Por Cia'),
                    )
                  }}
                />
                <span>Meta por Cia</span>
              </label>
            </div>
            {tipoMeta.includes('Por Cia') && (
              <p className="text-[11px] text-muted-foreground">
                Insira os percentuais de prêmio manualmente para meta por companhia
              </p>
            )}
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
              {fieldErrors.dataFim && (
                <p className="text-[11px] text-red-500">{fieldErrors.dataFim}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meta 1 (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 50000.00"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.valorMeta && (
                <p className="text-[11px] text-red-500">{fieldErrors.valorMeta}</p>
              )}
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
              {fieldErrors.meta2 && <p className="text-[11px] text-red-500">{fieldErrors.meta2}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meta 3 (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 100000.00"
                value={meta3}
                onChange={(e) => setMeta3(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.meta3 && <p className="text-[11px] text-red-500">{fieldErrors.meta3}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prêmio Meta 1 (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ex: 2.50"
                value={premioMeta1}
                onChange={(e) => setPremioMeta1(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.premioMeta1 && (
                <p className="text-[11px] text-red-500">{fieldErrors.premioMeta1}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prêmio Meta 2 (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ex: 5.00"
                value={premioMeta2}
                onChange={(e) => setPremioMeta2(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.premioMeta2 && (
                <p className="text-[11px] text-red-500">{fieldErrors.premioMeta2}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prêmio Meta 3 (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ex: 10.00"
                value={premioMeta3}
                onChange={(e) => setPremioMeta3(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.premioMeta3 && (
                <p className="text-[11px] text-red-500">{fieldErrors.premioMeta3}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Valor Vendido (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 60000.00"
                value={valorVendido}
                onChange={(e) => setValorVendido(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.valorVendido && (
                <p className="text-[11px] text-red-500">{fieldErrors.valorVendido}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prêmio Projetado</Label>
              <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-500/5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {(() => {
                  const vv = parseFloat(valorVendido) || 0
                  const m1 = parseFloat(valorMeta) || 0
                  const m2 = parseFloat(meta2) || 0
                  const m3 = parseFloat(meta3) || 0
                  const p1 = parseFloat(premioMeta1) || 0
                  const p2 = parseFloat(premioMeta2) || 0
                  const p3 = parseFloat(premioMeta3) || 0
                  let ganho = 0
                  if (m3 > 0 && vv >= m3) ganho = vv * (p3 / 100)
                  else if (m2 > 0 && vv >= m2) ganho = vv * (p2 / 100)
                  else if (m1 > 0 && vv >= m1) ganho = vv * (p1 / 100)
                  return formatCurrency(ganho)
                })()}
              </div>
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
            <Label className="text-xs font-semibold">Condição (Companhia Aérea) — Múltipla</Label>
            <div className="flex items-center gap-4 flex-wrap">
              {['GOL', 'LATAM', 'AZUL', 'RC'].map((cond) => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer text-xs">
                  <Checkbox
                    checked={condicao.includes(cond)}
                    onCheckedChange={(checked) => {
                      setCondicao((prev) =>
                        checked ? [...prev, cond] : prev.filter((v) => v !== cond),
                      )
                    }}
                  />
                  <span>{cond}</span>
                </label>
              ))}
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
            <Label className="text-xs font-semibold">Frequência de Pagamento</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={pagamentoMensal}
                  onCheckedChange={(checked) => {
                    setPagamentoMensal(checked === true)
                    if (checked === true) setPagamentoTrimestral(false)
                  }}
                />
                <span>Mensal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={pagamentoTrimestral}
                  onCheckedChange={(checked) => {
                    setPagamentoTrimestral(checked === true)
                    if (checked === true) setPagamentoMensal(false)
                  }}
                />
                <span>Trimestral</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Checkbox
                  checked={bonusAnual}
                  onCheckedChange={(checked) => setBonusAnual(checked === true)}
                />
                <span className="font-semibold">Bônus Anual</span>
              </label>
            </div>
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
