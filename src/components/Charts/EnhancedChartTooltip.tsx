import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { ProjectionDataPoint } from './ProjectionChart'

interface EnhancedChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ProjectionDataPoint }>
}

export function EnhancedChartTooltip({ active, payload }: EnhancedChartTooltipProps) {
  if (!active || !payload || !payload[0]) {
    return null
  }

  const data = payload[0]?.payload

  // Defensive check for malformed data
  if (!data || typeof data.age !== 'number' || typeof data.savings !== 'number') {
    return null
  }

  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-4 shadow-lg min-w-[240px]">
      <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b">
        <span className="text-base font-semibold">Age {data.age}</span>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            data.phase === 'accumulation'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}
        >
          {data.phase === 'accumulation' ? 'Saving' : 'Retired'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Savings</span>
          <span className="font-semibold tabular-nums text-base">
            {formatCurrency(data.savings)}
          </span>
        </div>

        <div className="border-t pt-2 mt-2">
          <span className="text-sm font-medium text-muted-foreground">This Year</span>
        </div>

        {data.phase === 'accumulation' ? (
          <>
            {data.annualContribution > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                  +{formatCurrency(data.annualContribution)}
                </span>
              </div>
            )}
            {data.growthAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Growth ({formatPercent(data.returnRate)})
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(data.growthAmount)}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            {data.growthAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Growth ({formatPercent(data.returnRate)})
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(data.growthAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Withdrawal</span>
              <div className="text-right">
                <span className="font-medium text-orange-600 dark:text-orange-400 tabular-nums">
                  -{formatCurrency(data.annualWithdrawal)}
                </span>
                {data.originalWithdrawal > 0 && (
                  <div className="text-xs text-muted-foreground">
                    ({formatCurrency(data.originalWithdrawal)} in today's $)
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {data.phase === 'retirement' && data.postTaxIncome > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Post-Tax Income</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(data.postTaxIncome)}/yr
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Monthly</span>
              <span className="tabular-nums">{formatCurrency(data.postTaxIncome / 12)}/mo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
