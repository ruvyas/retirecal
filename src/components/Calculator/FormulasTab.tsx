import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { CalculatorResults, Assumptions } from '@/lib/types/calculator'

interface FormulasTabProps {
  results: CalculatorResults
  assumptions?: Assumptions
  yearsUntilRetirement: number
  annualRetirementSpending: number
  className?: string
}

interface FormulaCollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FormulaCollapsible({ title, children, defaultOpen = false }: FormulaCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className="rounded-b-lg border border-t-0 bg-muted/30 p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FormulasTab({
  results,
  assumptions,
  yearsUntilRetirement,
  annualRetirementSpending,
  className,
}: FormulasTabProps) {
  const inflationRate = assumptions?.inflationRate ?? 0.025
  const preRetirementReturn = assumptions?.preRetirementReturn ?? 0.06
  const retirementReturn = assumptions?.retirementReturn ?? 0.04
  const lifeExpectancy = assumptions?.lifeExpectancy ?? 90

  // Calculate inflation multiplier
  const inflationMultiplier = Math.pow(1 + inflationRate, yearsUntilRetirement)

  // Calculate income gap in both representations
  const monthlySpendingToday = annualRetirementSpending / 12
  const monthlySpendingAtRetirement = results.inflationAdjustedSpending / 12
  const gapToday = results.monthlyIncomeToday - monthlySpendingToday
  const gapAtRetirement = results.monthlyIncome - monthlySpendingAtRetirement

  return (
    <div className={cn('space-y-6', className)}>
      {/* Inflation Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Inflation-Adjusted Values</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare what your money means today vs. at retirement in {yearsUntilRetirement} years
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground">Metric</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">
                    Today&apos;s $
                  </th>
                  <th className="py-3 text-right font-medium text-muted-foreground">
                    At Retirement
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3">Safe Withdrawal</td>
                  <td className="py-3 text-right tabular-nums font-medium">
                    {formatCurrency(results.monthlyIncomeToday)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(results.monthlyIncome)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Monthly Spending</td>
                  <td className="py-3 text-right tabular-nums font-medium">
                    {formatCurrency(monthlySpendingToday)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(monthlySpendingAtRetirement)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Monthly {gapToday >= 0 ? 'Surplus' : 'Gap'}</td>
                  <td
                    className={cn(
                      'py-3 text-right tabular-nums font-medium',
                      gapToday >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {gapToday >= 0 ? '+' : ''}
                    {formatCurrency(gapToday)}
                  </td>
                  <td
                    className={cn(
                      'py-3 text-right tabular-nums',
                      gapAtRetirement >= 0
                        ? 'text-emerald-600/70 dark:text-emerald-400/70'
                        : 'text-red-600/70 dark:text-red-400/70'
                    )}
                  >
                    {gapAtRetirement >= 0 ? '+' : ''}
                    {formatCurrency(gapAtRetirement)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            Inflation multiplier: {inflationMultiplier.toFixed(2)}x over {yearsUntilRetirement}{' '}
            years at {formatPercent(inflationRate)}/year
          </div>
        </CardContent>
      </Card>

      {/* Formula Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">How We Calculate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click each section to see the formula and your actual values
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Savings Growth */}
          <FormulaCollapsible title="Savings Growth">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Future Value of Current Savings
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  FV = PV × (1 + r)<sup>n</sup>
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PV (Current Savings)</span>
                  <span className="tabular-nums">
                    {formatCurrency(
                      results.projectedSavings - results.savingsGrowth - results.contributionGrowth
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">r (Annual Return)</span>
                  <span className="tabular-nums">{formatPercent(preRetirementReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">n (Years)</span>
                  <span className="tabular-nums">{yearsUntilRetirement}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Growth from Savings</span>
                  <span className="tabular-nums">{formatCurrency(results.savingsGrowth)}</span>
                </div>
              </div>
            </div>
          </FormulaCollapsible>

          {/* Contribution Growth */}
          <FormulaCollapsible title="Contribution Growth">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Future Value of Monthly Contributions
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  FV = PMT × [((1 + r/12)<sup>n</sup> - 1) / (r/12)]
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">r (Annual Return)</span>
                  <span className="tabular-nums">{formatPercent(preRetirementReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">n (Months)</span>
                  <span className="tabular-nums">{yearsUntilRetirement * 12}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Growth from Contributions</span>
                  <span className="tabular-nums">{formatCurrency(results.contributionGrowth)}</span>
                </div>
              </div>
            </div>
          </FormulaCollapsible>

          {/* Inflation Adjustment */}
          <FormulaCollapsible title="Inflation Adjustment">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  How inflation affects your spending power
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  Future Value = Today&apos;s Value × (1 + i)<sup>n</sup>
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today&apos;s Spending</span>
                  <span className="tabular-nums">
                    {formatCurrency(annualRetirementSpending)}/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">i (Inflation Rate)</span>
                  <span className="tabular-nums">{formatPercent(inflationRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">n (Years)</span>
                  <span className="tabular-nums">{yearsUntilRetirement}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Spending at Retirement</span>
                  <span className="tabular-nums">
                    {formatCurrency(results.inflationAdjustedSpending)}/year
                  </span>
                </div>
              </div>
            </div>
          </FormulaCollapsible>

          {/* Safe Withdrawal */}
          <FormulaCollapsible title="Safe Withdrawal">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  How much you can withdraw monthly (annuity formula)
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  PMT = PV × [r / (1 - (1 + r)<sup>-n</sup>)]
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PV (Savings at Retirement)</span>
                  <span className="tabular-nums">{formatCurrency(results.projectedSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">r (Return in Retirement)</span>
                  <span className="tabular-nums">{formatPercent(retirementReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">n (Retirement Years)</span>
                  <span className="tabular-nums">
                    {lifeExpectancy -
                      (assumptions?.lifeExpectancy ?? 90) +
                      results.yearsUntilRetirement >
                    0
                      ? lifeExpectancy - results.yearsUntilRetirement
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Gross Monthly Income (future $)</span>
                  <span className="tabular-nums">{formatCurrency(results.grossMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">After-Tax Income (future $)</span>
                  <span className="tabular-nums">{formatCurrency(results.monthlyIncome)}</span>
                </div>
              </div>

              {/* Inflation adjustment to today's dollars */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Converting to today&apos;s purchasing power
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  Today&apos;s $ = Future $ / (1 + i)<sup>n</sup>
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">After-Tax Income (future $)</span>
                  <span className="tabular-nums">{formatCurrency(results.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">i (Inflation Rate)</span>
                  <span className="tabular-nums">{formatPercent(inflationRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">n (Years Until Retirement)</span>
                  <span className="tabular-nums">{yearsUntilRetirement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inflation Divisor</span>
                  <span className="tabular-nums">{inflationMultiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>After-Tax Income (today&apos;s $)</span>
                  <span className="tabular-nums">{formatCurrency(results.monthlyIncomeToday)}</span>
                </div>
              </div>
            </div>
          </FormulaCollapsible>

          {/* Retirement Runway */}
          <FormulaCollapsible title="Retirement Runway">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  How long your savings will last
                </p>
                <code className="block rounded bg-muted p-3 text-sm">
                  n = ln(1 - (PV × r / PMT)) / -ln(1 + r)
                </code>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PV (Savings at Retirement)</span>
                  <span className="tabular-nums">{formatCurrency(results.projectedSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">r (Real Return Rate)</span>
                  <span className="tabular-nums">
                    {formatPercent(retirementReturn - inflationRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PMT (Annual Spending)</span>
                  <span className="tabular-nums">
                    {formatCurrency(results.inflationAdjustedSpending)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Years Savings Will Last</span>
                  <span className="tabular-nums">
                    {results.retirementRunway === Infinity
                      ? 'Forever'
                      : `${results.retirementRunway.toFixed(1)} years`}
                  </span>
                </div>
              </div>
            </div>
          </FormulaCollapsible>
        </CardContent>
      </Card>
    </div>
  )
}
