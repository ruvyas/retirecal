import { useCallback, useEffect, useState } from 'react'
import { AgeSlider } from './AgeSlider'
import { CurrencyInput } from './CurrencyInput'
import { SavingsBreakdown } from './SavingsBreakdown'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import type {
  CalculatorInputs,
  SavingsBreakdown as SavingsBreakdownType,
} from '@/lib/types/calculator'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'

interface InputPanelProps {
  values: CalculatorInputs
  onChange: (values: CalculatorInputs) => void
  disabled?: boolean
  className?: string
}

const DEBOUNCE_DELAY = 150

export function InputPanel({ values, onChange, disabled = false, className }: InputPanelProps) {
  // Use internal state for immediate UI updates
  const [internalValues, setInternalValues] = useState(values)

  // Sync with external values when they change
  useEffect(() => {
    setInternalValues(values)
  }, [values])

  // Debounce the internal values before calling onChange
  const debouncedValues = useDebounce(internalValues, DEBOUNCE_DELAY)

  // Notify parent when debounced values change
  useEffect(() => {
    // Only notify if values have actually changed
    if (JSON.stringify(debouncedValues) !== JSON.stringify(values)) {
      onChange(debouncedValues)
    }
  }, [debouncedValues, onChange, values])

  const handleCurrentAgeChange = useCallback((currentAge: number) => {
    setInternalValues((prev) => ({
      ...prev,
      currentAge,
      // Ensure retirement age is always greater than current age
      retirementAge: Math.max(prev.retirementAge, currentAge + 1),
    }))
  }, [])

  const handleRetirementAgeChange = useCallback((retirementAge: number) => {
    setInternalValues((prev) => ({ ...prev, retirementAge }))
  }, [])

  const handleAnnualIncomeChange = useCallback((annualIncome: number) => {
    setInternalValues((prev) => ({ ...prev, annualIncome }))
  }, [])

  const handleSavingsChange = useCallback((savings: SavingsBreakdownType) => {
    setInternalValues((prev) => ({ ...prev, savings }))
  }, [])

  const handleMonthlyContributionChange = useCallback((monthlyContribution: number) => {
    setInternalValues((prev) => ({ ...prev, monthlyContribution }))
  }, [])

  const handleAnnualRetirementSpendingChange = useCallback((annualRetirementSpending: number) => {
    setInternalValues((prev) => ({ ...prev, annualRetirementSpending }))
  }, [])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 md:grid-cols-2">
        <AgeSlider
          id="current-age"
          label="Current Age"
          value={internalValues.currentAge}
          onChange={handleCurrentAgeChange}
          min={VALIDATION_BOUNDS.age.min}
          max={VALIDATION_BOUNDS.age.max - 1}
          disabled={disabled}
        />

        <AgeSlider
          id="retirement-age"
          label="Retirement Age"
          value={internalValues.retirementAge}
          onChange={handleRetirementAgeChange}
          min={internalValues.currentAge + 1}
          max={VALIDATION_BOUNDS.retirementAge.max}
          disabled={disabled}
        />
      </div>

      <CurrencyInput
        id="annual-income"
        label="Annual Income"
        value={internalValues.annualIncome}
        onChange={handleAnnualIncomeChange}
        helpText="Your current annual gross income"
        disabled={disabled}
      />

      <SavingsBreakdown
        value={internalValues.savings}
        onChange={handleSavingsChange}
        disabled={disabled}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CurrencyInput
          id="monthly-contribution"
          label="Monthly Contribution"
          value={internalValues.monthlyContribution}
          onChange={handleMonthlyContributionChange}
          helpText="Amount you save each month"
          disabled={disabled}
        />

        <CurrencyInput
          id="annual-retirement-spending"
          label="Annual Retirement Spending"
          value={internalValues.annualRetirementSpending}
          onChange={handleAnnualRetirementSpendingChange}
          helpText="Expected yearly spending in retirement"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
