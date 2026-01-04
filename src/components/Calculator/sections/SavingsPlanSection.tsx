import { useCallback, useRef, useEffect } from 'react'
import { CurrencyInput } from '../CurrencyInput'
import { ContributionBreakdown } from '../ContributionBreakdown'
import type {
  CalculatorInputs,
  ContributionBreakdown as ContributionBreakdownType,
} from '@/lib/types/calculator'

interface SavingsPlanSectionProps {
  values: CalculatorInputs
  onChange: (values: CalculatorInputs) => void
  disabled?: boolean
}

export function SavingsPlanSection({
  values,
  onChange,
  disabled = false,
}: SavingsPlanSectionProps) {
  // Use refs to avoid recreating callbacks on every values change
  const valuesRef = useRef(values)
  useEffect(() => {
    valuesRef.current = values
  }, [values])

  const handleContributionsChange = useCallback(
    (contributions: ContributionBreakdownType) => {
      onChange({ ...valuesRef.current, contributions })
    },
    [onChange]
  )

  const handleAnnualRetirementSpendingChange = useCallback(
    (annualRetirementSpending: number) => {
      onChange({ ...valuesRef.current, annualRetirementSpending })
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground">
        How much do you plan to save each month, and how much will you need in retirement?
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        <ContributionBreakdown
          value={values.contributions}
          onChange={handleContributionsChange}
          disabled={disabled}
        />

        <CurrencyInput
          id="annual-retirement-spending"
          label="Annual Retirement Spending"
          value={values.annualRetirementSpending}
          onChange={handleAnnualRetirementSpendingChange}
          helpText="Expected yearly spending in retirement"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
