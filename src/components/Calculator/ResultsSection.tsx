import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator, deriveStatus } from './StatusIndicator'
import { ProjectionChart, type ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import { IncomeExpensesChart } from '@/components/Charts/IncomeExpensesChart'
import { cn } from '@/lib/utils'
import { formatCurrency, formatYears } from '@/lib/formatters'
import type { CalculatorResults } from '@/lib/types/calculator'

interface ResultsSectionProps {
  results: CalculatorResults
  projectionData: ProjectionDataPoint[]
  retirementAge: number
  currentAge: number
  lifeExpectancy: number
  annualRetirementSpending: number
  inflationRate: number
  className?: string
}

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  variant?: 'default' | 'positive' | 'negative'
}

function MetricCard({ title, value, subtitle, variant = 'default' }: MetricCardProps) {
  return (
    <Card className="py-5">
      <CardContent className="pt-0">
        <div className="text-base font-medium text-muted-foreground mb-2">{title}</div>
        <div
          className={cn(
            'text-3xl font-bold tracking-tight',
            variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            variant === 'negative' && 'text-red-600 dark:text-red-400'
          )}
        >
          {value}
        </div>
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}

export function ResultsSection({
  results,
  projectionData,
  retirementAge,
  currentAge,
  lifeExpectancy,
  annualRetirementSpending,
  inflationRate,
  className,
}: ResultsSectionProps) {
  const status = deriveStatus(results.incomeGap)
  const yearsUntilRetirement = retirementAge - currentAge

  // Calculate inflation-adjusted spending at retirement for the chart
  const inflationAdjustedSpending =
    annualRetirementSpending * Math.pow(1 + inflationRate, yearsUntilRetirement)

  return (
    <div className={cn('space-y-8', className)}>
      <StatusIndicator
        status={status}
        message={
          status === 'on-track'
            ? 'Your retirement plan looks healthy!'
            : status === 'attention-needed'
              ? 'Consider increasing your savings rate.'
              : 'Significant adjustments may be needed.'
        }
        className="p-4 text-base"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Savings at Retirement"
          value={formatCurrency(results.projectedSavings)}
          subtitle={`In ${results.yearsUntilRetirement} years`}
        />

        <MetricCard
          title="Monthly Retirement Income"
          value={formatCurrency(results.monthlyIncomeToday)}
          subtitle={`${formatCurrency(results.monthlyIncome)} at retirement`}
        />

        <MetricCard
          title="Retirement Runway"
          value={formatYears(results.retirementRunway)}
          subtitle={
            results.retirementRunway === Infinity
              ? 'Your savings are sustainable'
              : 'How long your savings last'
          }
          variant={
            results.retirementRunway >= lifeExpectancy - retirementAge ? 'positive' : 'negative'
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectionChart
            data={projectionData}
            retirementAge={retirementAge}
            currentAge={currentAge}
            lifeExpectancy={lifeExpectancy}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Income Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeExpensesChart
            sustainableIncome={results.monthlyIncome}
            sustainableIncomeToday={results.monthlyIncomeToday}
            desiredSpending={inflationAdjustedSpending / 12}
            desiredSpendingToday={annualRetirementSpending / 12}
          />
        </CardContent>
      </Card>
    </div>
  )
}
