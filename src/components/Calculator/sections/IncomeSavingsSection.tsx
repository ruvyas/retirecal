import { useCallback, useRef, useEffect } from 'react'
import { CurrencyInput } from '../CurrencyInput'
import { SavingsBreakdown } from '../SavingsBreakdown'
import type {
  CalculatorInputs,
  SavingsBreakdown as SavingsBreakdownType,
} from '@/lib/types/calculator'

interface IncomeSavingsSectionProps {
  values: CalculatorInputs
  onChange: (values: CalculatorInputs) => void
  disabled?: boolean
}

export function IncomeSavingsSection({
  values,
  onChange,
  disabled = false,
}: IncomeSavingsSectionProps) {
  // Use refs to avoid recreating callbacks on every values change
  const valuesRef = useRef(values)
  useEffect(() => {
    valuesRef.current = values
  }, [values])

  const handleAnnualIncomeChange = useCallback(
    (annualIncome: number) => {
      onChange({ ...valuesRef.current, annualIncome })
    },
    [onChange]
  )

  const handleSavingsChange = useCallback(
    (savings: SavingsBreakdownType) => {
      onChange({ ...valuesRef.current, savings })
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground">
        Enter your current income and how much you have saved so far.
      </p>

      <CurrencyInput
        id="annual-income"
        label="Gross Annual Income"
        value={values.annualIncome}
        onChange={handleAnnualIncomeChange}
        helpText="Before taxes and deductions"
        disabled={disabled}
      />

      <SavingsBreakdown value={values.savings} onChange={handleSavingsChange} disabled={disabled} />
    </div>
  )
}
