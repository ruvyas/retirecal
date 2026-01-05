import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusIndicator, deriveStatus } from './StatusIndicator'
import { ProjectionChart, type ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import { IncomeExpensesChart } from '@/components/Charts/IncomeExpensesChart'
import { FormulasTab } from './FormulasTab'
import { FormulaTooltip, type FormulaStep } from './FormulaTooltip'
import { AnimatedCurrency } from '@/components/ui/AnimatedCurrency'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/utils'
import type { CalculatorResults, Assumptions } from '@/lib/types/calculator'

interface ResultsSectionProps {
  results: CalculatorResults
  assumptions?: Assumptions
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
  value: ReactNode
  subtitle?: ReactNode
  variant?: 'default' | 'positive' | 'negative'
  tooltipTitle?: string
  tooltipSteps?: FormulaStep[]
}

function MetricCard({
  title,
  value,
  subtitle,
  variant = 'default',
  tooltipTitle,
  tooltipSteps,
}: MetricCardProps) {
  const valueElement = (
    <div
      className={cn(
        'text-3xl font-bold tracking-tight',
        variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
        variant === 'negative' && 'text-red-600 dark:text-red-400'
      )}
    >
      {value}
    </div>
  )

  return (
    <Card className="py-5">
      <CardContent className="pt-0">
        <div className="text-base font-medium text-muted-foreground mb-2">{title}</div>
        {tooltipTitle && tooltipSteps ? (
          <FormulaTooltip title={tooltipTitle} steps={tooltipSteps}>
            {valueElement}
          </FormulaTooltip>
        ) : (
          valueElement
        )}
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}

export function ResultsSection({
  results,
  assumptions,
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

  // Build tooltip steps for each metric card
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

  // Calculate effective tax rate from gross vs net income
  const effectiveTaxRate =
    results.grossMonthlyIncome > 0 ? 1 - results.monthlyIncome / results.grossMonthlyIncome : 0

  const monthlyIncomeSteps: FormulaStep[] = [
    { label: 'Pre-tax monthly income', value: results.grossMonthlyIncome, format: 'currency' },
    { label: 'Effective tax rate', value: effectiveTaxRate, format: 'percent' },
    { label: 'After-tax income', value: results.monthlyIncome, format: 'currency', isResult: true },
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

  return (
    <div className={cn('space-y-6', className)}>
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

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6 space-y-8">
          <div className="grid gap-4 sm:grid-cols-3" aria-live="polite" aria-atomic="false">
            <MetricCard
              title="Savings at Retirement"
              value={<AnimatedCurrency value={results.projectedSavings} />}
              subtitle={`In ${results.yearsUntilRetirement} years`}
              tooltipTitle="How this is calculated"
              tooltipSteps={projectedSavingsSteps}
            />

            <MetricCard
              title="Monthly Retirement Income"
              value={<AnimatedCurrency value={results.monthlyIncomeToday} />}
              subtitle="In today's dollars"
              tooltipTitle="Income calculation"
              tooltipSteps={monthlyIncomeSteps}
            />

            <MetricCard
              title="Retirement Runway"
              value={<AnimatedNumber value={results.retirementRunway} format="years" />}
              subtitle={
                results.retirementRunway === Infinity
                  ? 'Your savings are sustainable'
                  : 'How long your savings last'
              }
              variant={
                results.retirementRunway >= lifeExpectancy - retirementAge ? 'positive' : 'negative'
              }
              tooltipTitle="Retirement runway breakdown"
              tooltipSteps={retirementRunwaySteps}
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
        </TabsContent>

        <TabsContent value="formulas" className="mt-6">
          <FormulasTab
            results={results}
            assumptions={assumptions}
            yearsUntilRetirement={yearsUntilRetirement}
            annualRetirementSpending={annualRetirementSpending}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
