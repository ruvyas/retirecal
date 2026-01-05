import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import type { CalculatorResults } from '@/lib/types/calculator'

interface StickyResultsSummaryProps {
  results: CalculatorResults
  className?: string
}

export function StickyResultsSummary({ results, className }: StickyResultsSummaryProps) {
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
        <div className="flex items-center gap-6 text-base">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-muted-foreground">Safe Withdrawal:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold tabular-nums">
                {formatCurrency(results.monthlyIncomeToday)}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                ({formatCurrency(results.monthlyIncome)} at retirement)
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
