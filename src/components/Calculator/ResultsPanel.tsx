import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectionChart, type ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import { FormulaTooltip, type FormulaStep } from './FormulaTooltip'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber, formatYears } from '@/lib/formatters'
import type { CalculatorResults, Assumptions } from '@/lib/types/calculator'

interface ResultsPanelProps {
  results: CalculatorResults | null
  assumptions?: Assumptions
  projectionData?: ProjectionDataPoint[]
  retirementAge?: number
  currentAge?: number
  lifeExpectancy?: number
  annualRetirementSpending?: number
  isLoading?: boolean
  className?: string
}

interface ResultCardProps {
  title: string
  value: string
  description?: string
  variant?: 'default' | 'positive' | 'negative'
  /** Tooltip content for showing calculation breakdown */
  tooltipTitle?: string
  tooltipSteps?: FormulaStep[]
}

function ResultCard({
  title,
  value,
  description,
  variant = 'default',
  tooltipTitle,
  tooltipSteps,
}: ResultCardProps) {
  const valueElement = (
    <div
      className={cn(
        'text-2xl font-bold',
        variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
        variant === 'negative' && 'text-red-600 dark:text-red-400'
      )}
    >
      {value}
    </div>
  )

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {tooltipTitle && tooltipSteps ? (
          <FormulaTooltip title={tooltipTitle} steps={tooltipSteps}>
            {valueElement}
          </FormulaTooltip>
        ) : (
          valueElement
        )}
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
  assumptions,
  projectionData,
  retirementAge,
  currentAge,
  lifeExpectancy,
  annualRetirementSpending = 0,
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

  const gapVariant = results.incomeGap >= 0 ? 'positive' : 'negative'
  const gapLabel = results.incomeGap >= 0 ? 'Surplus' : 'Gap'

  // Build tooltip steps for each result card
  const projectedSavingsSteps: FormulaStep[] = [
    { label: 'Growth of initial savings', value: results.savingsGrowth, format: 'currency' },
    { label: '+', value: 0, isOperator: true },
    { label: 'Growth from contributions', value: results.contributionGrowth, format: 'currency' },
    {
      label: 'Total at retirement',
      value: results.projectedSavings,
      format: 'currency',
      isResult: true,
    },
  ]

  const retirementRunwaySteps: FormulaStep[] = [
    { label: 'Savings at retirement', value: results.projectedSavings, format: 'currency' },
    {
      label: "Annual spending (today's $)",
      value: annualRetirementSpending,
      format: 'currency',
    },
    ...(assumptions
      ? [
          {
            label: 'Return rate in retirement',
            value: assumptions.retirementReturn,
            format: 'percent' as const,
          },
        ]
      : []),
    {
      label: 'Years savings will last',
      value: results.retirementRunway,
      format: 'years',
      isResult: true,
    },
  ]

  // Calculate effective tax rate from gross vs net income
  const effectiveTaxRate =
    results.grossMonthlyIncome > 0 ? 1 - results.monthlyIncome / results.grossMonthlyIncome : 0

  const monthlyIncomeSteps: FormulaStep[] = [
    { label: 'Pre-tax monthly income', value: results.grossMonthlyIncome, format: 'currency' },
    { label: 'Effective tax rate', value: effectiveTaxRate, format: 'percent' },
    { label: 'After-tax income', value: results.monthlyIncome, format: 'currency', isResult: true },
  ]

  const monthlySpendingNeeded = annualRetirementSpending / 12
  const incomeGapSteps: FormulaStep[] = [
    { label: 'Sustainable income', value: results.monthlyIncome, format: 'currency' },
    { label: '-', value: 0, isOperator: true },
    { label: 'Monthly spending needed', value: monthlySpendingNeeded, format: 'currency' },
    {
      label: results.incomeGap >= 0 ? 'Monthly surplus' : 'Monthly shortfall',
      value: Math.abs(results.incomeGap),
      format: 'currency',
      isResult: true,
    },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          title="Projected Savings at Retirement"
          value={formatCurrency(results.projectedSavings)}
          description="Total savings when you retire"
          tooltipTitle="How this is calculated"
          tooltipSteps={projectedSavingsSteps}
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
          tooltipTitle="Retirement runway breakdown"
          tooltipSteps={retirementRunwaySteps}
        />

        <ResultCard
          title="Sustainable Monthly Income"
          value={formatCurrency(results.monthlyIncome)}
          description="Monthly withdrawal in retirement"
          tooltipTitle="Income calculation"
          tooltipSteps={monthlyIncomeSteps}
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
          tooltipTitle="Income gap breakdown"
          tooltipSteps={incomeGapSteps}
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
