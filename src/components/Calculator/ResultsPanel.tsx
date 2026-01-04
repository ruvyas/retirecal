import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator, deriveStatus } from './StatusIndicator'
import { ProjectionChart, type ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber, formatYears } from '@/lib/formatters'
import type { CalculatorResults } from '@/lib/types/calculator'

interface ResultsPanelProps {
  results: CalculatorResults | null
  projectionData?: ProjectionDataPoint[]
  retirementAge?: number
  currentAge?: number
  lifeExpectancy?: number
  isLoading?: boolean
  className?: string
}

interface ResultCardProps {
  title: string
  value: string
  description?: string
  variant?: 'default' | 'positive' | 'negative'
}

function ResultCard({ title, value, description, variant = 'default' }: ResultCardProps) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold',
            variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            variant === 'negative' && 'text-red-600 dark:text-red-400'
          )}
        >
          {value}
        </div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

export function ResultsPanel({
  results,
  projectionData,
  retirementAge,
  currentAge,
  lifeExpectancy,
  isLoading = false,
  className,
}: ResultsPanelProps) {
  if (isLoading || !results) {
    return (
      <div className={cn('space-y-4', className)}>
        <LoadingSkeleton />
      </div>
    )
  }

  const status = deriveStatus(results.incomeGap)
  const gapVariant = results.incomeGap >= 0 ? 'positive' : 'negative'
  const gapLabel = results.incomeGap >= 0 ? 'Surplus' : 'Gap'

  return (
    <div className={cn('space-y-4', className)}>
      <StatusIndicator
        status={status}
        message={
          status === 'on-track'
            ? 'Your retirement plan looks healthy!'
            : status === 'attention-needed'
              ? 'Consider increasing your savings rate.'
              : 'Significant adjustments may be needed.'
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          title="Projected Savings at Retirement"
          value={formatCurrency(results.projectedSavings)}
          description="Total savings when you retire"
        />

        <ResultCard
          title="Years Until Retirement"
          value={formatNumber(results.yearsUntilRetirement)}
          description="Time to save and invest"
        />

        <ResultCard
          title="Retirement Runway"
          value={formatYears(results.retirementRunway)}
          description="How long your savings will last"
        />

        <ResultCard
          title="Sustainable Monthly Income"
          value={formatCurrency(results.monthlyIncome)}
          description="Monthly withdrawal in retirement"
        />

        <ResultCard
          title={`Monthly ${gapLabel}`}
          value={formatCurrency(Math.abs(results.incomeGap))}
          description={
            results.incomeGap >= 0
              ? 'Extra income beyond your needs'
              : 'Shortfall vs. desired spending'
          }
          variant={gapVariant}
        />
      </div>

      {projectionData &&
        retirementAge !== undefined &&
        currentAge !== undefined &&
        lifeExpectancy !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Savings Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionChart
                data={projectionData}
                retirementAge={retirementAge}
                currentAge={currentAge}
                lifeExpectancy={lifeExpectancy}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}
    </div>
  )
}
