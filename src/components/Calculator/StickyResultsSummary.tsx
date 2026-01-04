import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import type { CalculatorResults } from '@/lib/types/calculator'
import { deriveStatus, type StatusType } from './StatusIndicator'

interface StickyResultsSummaryProps {
  results: CalculatorResults
  className?: string
}

const statusConfig: Record<
  StatusType,
  {
    icon: typeof CheckCircle2
    label: string
    bgClass: string
    textClass: string
  }
> = {
  'on-track': {
    icon: CheckCircle2,
    label: 'On Track',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  'attention-needed': {
    icon: AlertTriangle,
    label: 'Needs Attention',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  'significant-gap': {
    icon: XCircle,
    label: 'Gap Detected',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
  },
}

export function StickyResultsSummary({ results, className }: StickyResultsSummaryProps) {
  const status = deriveStatus(results.incomeGap)
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'sticky top-16 z-40 -mx-4 bg-background/95 backdrop-blur-sm border-b px-4 py-3',
        'md:-mx-8 md:px-8',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Retirement status summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className={cn('flex items-center gap-3 rounded-full px-4 py-2', config.bgClass)}
          aria-label={`Retirement status: ${config.label}`}
        >
          <Icon className={cn('h-5 w-5', config.textClass)} aria-hidden="true" />
          <span className={cn('text-base font-semibold', config.textClass)}>{config.label}</span>
        </div>

        <div className="flex items-center gap-6 text-base">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-muted-foreground">Monthly Income:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold tabular-nums">
                {formatCurrency(results.monthlyIncome)}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                ({formatCurrency(results.monthlyIncomeToday)} today)
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-muted-foreground">At Retirement:</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(results.projectedSavings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
