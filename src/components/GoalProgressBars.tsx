import { formatCurrency } from '@/services/sheets'
import type { PlanCalculation } from '@/services/plan-calculations'
import type { ActiveAction } from '@/services/actions'
import { cn } from '@/lib/utils'

interface GoalBarProps {
  label: string
  sold: number
  goal: number | null | undefined
  prizePercent: number | null | undefined
  provisionalPrize: number
  color: string
}

function GoalBar({ label, sold, goal, prizePercent, provisionalPrize, color }: GoalBarProps) {
  const hasGoal = goal != null && goal > 0
  const pct = hasGoal ? Math.min((sold / goal!) * 100, 100) : 0
  const isAchieved = hasGoal && sold >= goal!
  const barColor = isAchieved ? 'bg-emerald-500' : 'bg-amber-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-bold',
            isAchieved
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400',
          )}
        >
          {hasGoal ? `${pct.toFixed(1)}%` : '—'}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {formatCurrency(sold)} / {hasGoal ? formatCurrency(goal) : '—'}
        </span>
        <span className="font-semibold" style={{ color }}>
          Prêmio prov.: {formatCurrency(provisionalPrize)}
          {prizePercent != null && prizePercent > 0 && ` (${prizePercent}%)`}
        </span>
      </div>
    </div>
  )
}

interface GoalProgressBarsProps {
  action: ActiveAction
  calc: PlanCalculation | null
  compact?: boolean
}

export function GoalProgressBars({ action, calc, compact = false }: GoalProgressBarsProps) {
  const sold = action.valor_vendido ?? 0

  return (
    <div className={cn('space-y-2', compact ? 'gap-1.5' : 'gap-2.5')}>
      <GoalBar
        label="Meta 1"
        sold={sold}
        goal={action.valor_meta}
        prizePercent={action.premio_meta_1}
        provisionalPrize={calc?.provisionalPrizeMeta1 ?? 0}
        color="hsl(var(--chart-1))"
      />
      <GoalBar
        label="Meta 2"
        sold={sold}
        goal={action.meta_2}
        prizePercent={action.premio_meta_2}
        provisionalPrize={calc?.provisionalPrizeMeta2 ?? 0}
        color="hsl(var(--chart-2))"
      />
      <GoalBar
        label="Meta 3"
        sold={sold}
        goal={action.meta_3}
        prizePercent={action.premio_meta_3}
        provisionalPrize={calc?.provisionalPrizeMeta3 ?? 0}
        color="hsl(var(--chart-3))"
      />
    </div>
  )
}
