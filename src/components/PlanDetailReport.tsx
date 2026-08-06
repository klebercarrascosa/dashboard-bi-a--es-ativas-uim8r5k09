import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/services/sheets'
import type { ActiveAction } from '@/services/actions'
import type { PlanCalculation } from '@/services/plan-calculations'
import { getMonthlyBreakdown } from '@/services/plan-calculations'
import type { SheetRow } from '@/services/sheets'
import type { ComponentType } from 'react'
import {
  Calendar,
  DollarSign,
  Trophy,
  Bell,
  Tag,
  Clock,
  FileText,
  CalendarDays,
  Gift,
} from 'lucide-react'
import { GoalProgressBars } from '@/components/GoalProgressBars'

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Em Negociação': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Concluído: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'Em Risco': 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Pendente: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  Média: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Baixa: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
}

function formatDateBR(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return '—'
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

function formatDateTimeBR(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return '—'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? formatDateBR(dateStr) : d.toLocaleString('pt-BR')
  } catch {
    return '—'
  }
}

function MetaCard({
  label,
  val,
  color,
  pct,
  falta,
}: {
  label: string
  val: number | null | undefined
  color: string
  pct: number | null | undefined
  falta: number | null | undefined
}) {
  return (
    <div className="rounded-lg border p-2.5 bg-card">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{formatCurrency(val ?? null)}</p>
      {pct != null && (
        <div className="mt-1">
          <Progress value={Math.min(pct, 100)} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-0.5">{pct.toFixed(1)}%</p>
        </div>
      )}
      {falta != null && (
        <p
          className={`text-[10px] mt-0.5 font-semibold ${falta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
        >
          {falta <= 0 ? '✅ Atingida' : `Falta: ${formatCurrency(falta)}`}
        </p>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

interface PlanDetailReportProps {
  action: ActiveAction
  calc: PlanCalculation | null
  monthDataMap: Map<string, SheetRow[]>
  planIndex?: number
  isAdmin?: boolean
}

export function PlanDetailReport({
  action,
  calc,
  monthDataMap,
  planIndex,
  isAdmin = false,
}: PlanDetailReportProps) {
  const breakdown = getMonthlyBreakdown(
    monthDataMap,
    action.client_name,
    action.cpf_cnpj,
    action.data_inicio,
    action.data_fim,
  )
  const pagamentos =
    [
      action.pagamento_mensal && 'Mensal',
      action.pagamento_trimestral && 'Trimestral',
      action.bonus_anual && 'Bônus Anual',
    ]
      .filter(Boolean)
      .join(', ') || '—'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {planIndex !== undefined ? `Plano ${planIndex + 1}: ` : ''}
          {formatDateBR(action.data_inicio)} → {formatDateBR(action.data_fim)}
        </span>
        <div className="flex gap-1.5">
          <Badge
            variant="outline"
            className={`text-[10px] ${STATUS_COLORS[action.status] ?? STATUS_COLORS.Pendente}`}
          >
            {action.status}
          </Badge>
          {action.priority && (
            <Badge
              variant="outline"
              className={`text-[10px] ${PRIORITY_COLORS[action.priority] ?? ''}`}
            >
              {action.priority}
            </Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetaCard
          label="Meta 1"
          val={action.valor_meta}
          color="text-amber-600 dark:text-amber-400"
          pct={calc?.pctAtingido}
          falta={calc?.quantoFalta}
        />
        <MetaCard
          label="Meta 2"
          val={action.meta_2}
          color="text-blue-600 dark:text-blue-400"
          pct={calc?.pctAtingidoMeta2}
          falta={calc?.quantoFaltaMeta2}
        />
        <MetaCard
          label="Meta 3"
          val={action.meta_3}
          color="text-purple-600 dark:text-purple-400"
          pct={calc?.pctAtingidoMeta3}
          falta={calc?.quantoFaltaMeta3}
        />
      </div>
      {calc && (action.valor_vendido ?? 0) > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Progresso das Metas &amp; Prêmio Provisório
          </p>
          <GoalProgressBars action={action} calc={calc} />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <InfoRow
          icon={Trophy}
          label="Prêmio M1"
          value={action.premio_meta_1 != null ? `${action.premio_meta_1}%` : '—'}
        />
        <InfoRow
          icon={Trophy}
          label="Prêmio M2"
          value={action.premio_meta_2 != null ? `${action.premio_meta_2}%` : '—'}
        />
        <InfoRow
          icon={Trophy}
          label="Prêmio M3"
          value={action.premio_meta_3 != null ? `${action.premio_meta_3}%` : '—'}
        />
        <InfoRow
          icon={DollarSign}
          label="Soma Vendida"
          value={formatCurrency(calc?.somaVendida ?? 0)}
        />
      </div>
      {calc?.perMetaGains != null && calc.perMetaGains.some((m) => m.isAchieved) && (
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Prêmio Já Ganho
            </span>
          </div>
          {(action.pagamento_mensal || action.pagamento_trimestral || action.bonus_anual) && (
            <div className="flex flex-wrap gap-1.5">
              {action.pagamento_mensal && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30"
                >
                  <CalendarDays className="h-2.5 w-2.5 mr-1" />
                  Mensal
                </Badge>
              )}
              {action.pagamento_trimestral && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/30"
                >
                  <CalendarDays className="h-2.5 w-2.5 mr-1" />
                  Trimestral
                </Badge>
              )}
              {action.bonus_anual && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30"
                >
                  <Gift className="h-2.5 w-2.5 mr-1" />
                  Bônus Anual
                </Badge>
              )}
            </div>
          )}
          <div className="space-y-1">
            {calc.perMetaGains.map((mg) => (
              <div key={mg.metaNumber} className="text-xs">
                {mg.isAchieved ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✅ Meta {mg.metaNumber} atingida — Prêmio: {formatCurrency(mg.ganho)}
                  </span>
                ) : (
                  <span className="text-muted-foreground opacity-50">
                    ⬜ Meta {mg.metaNumber} ({mg.premioPercent}%) — Não atingida
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-emerald-500/20">
            <span className="text-xs font-bold text-muted-foreground">Total Já Ganho</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(calc.totalGanhoPremio)}
            </span>
          </div>
        </div>
      )}
      <Separator />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <InfoRow icon={Tag} label="Tipo" value="Geral" />
        <InfoRow icon={Bell} label="Intervalo Rel." value={action.intervalo_relatorio || '—'} />
        <InfoRow
          icon={Calendar}
          label="Últ. Relatório"
          value={formatDateBR(action.ultimo_relatorio)}
        />
        <InfoRow
          icon={DollarSign}
          label="Valor Vendido"
          value={formatCurrency(action.valor_vendido ?? null)}
        />
        <InfoRow icon={FileText} label="Aba/Mês" value={action.tab_month || '—'} />
        <InfoRow icon={CalendarDays} label="Pagamento" value={pagamentos} />
        <InfoRow icon={Clock} label="Criado" value={formatDateTimeBR(action.created)} />
        <InfoRow icon={Clock} label="Atualizado" value={formatDateTimeBR(action.updated)} />
      </div>
      {breakdown.length > 0 && (
        <div className="pt-1 border-t">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">
            Detalhamento Mensal
          </p>
          <div className="flex flex-wrap gap-2">
            {breakdown.map((e) => (
              <div key={e.month} className="rounded-md bg-muted/40 px-2 py-1 text-[10px]">
                <span className="text-muted-foreground">{e.month}: </span>
                <span
                  className={`font-mono font-semibold ${e.venda !== null ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {formatCurrency(e.venda)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {action.note && (
        <div className="pt-1 border-t">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Observação
          </span>
          <p className="text-xs mt-0.5">{action.note}</p>
        </div>
      )}
    </div>
  )
}
