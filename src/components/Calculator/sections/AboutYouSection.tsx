import { useCallback, useRef, useEffect } from 'react'
import { AgeSlider } from '../AgeSlider'
import { ProvinceSelector } from '../ProvinceSelector'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'
import type { CalculatorInputs, Province } from '@/lib/types/calculator'

interface AboutYouSectionProps {
  values: CalculatorInputs
  onChange: (values: CalculatorInputs) => void
  disabled?: boolean
}

export function AboutYouSection({ values, onChange, disabled = false }: AboutYouSectionProps) {
  // Use refs to avoid recreating callbacks on every values change
  const valuesRef = useRef(values)
  useEffect(() => {
    valuesRef.current = values
  }, [values])

  const handleCurrentAgeChange = useCallback(
    (currentAge: number) => {
      const current = valuesRef.current
      onChange({
        ...current,
        currentAge,
        retirementAge: Math.max(current.retirementAge, currentAge + 1),
      })
    },
    [onChange]
  )

  const handleRetirementAgeChange = useCallback(
    (retirementAge: number) => {
      onChange({ ...valuesRef.current, retirementAge })
    },
    [onChange]
  )

  const handleProvinceChange = useCallback(
    (province: Province) => {
      onChange({ ...valuesRef.current, province })
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground">
        Tell us about yourself and when you plan to retire.
      </p>
      <div className="grid gap-8 sm:grid-cols-2">
        <AgeSlider
          id="current-age"
          label="Current Age"
          value={values.currentAge}
          onChange={handleCurrentAgeChange}
          min={VALIDATION_BOUNDS.age.min}
          max={VALIDATION_BOUNDS.age.max - 1}
          disabled={disabled}
        />

        <AgeSlider
          id="retirement-age"
          label="Retirement Age"
          value={values.retirementAge}
          onChange={handleRetirementAgeChange}
          min={values.currentAge + 1}
          max={VALIDATION_BOUNDS.retirementAge.max}
          disabled={disabled}
        />
      </div>
      <ProvinceSelector
        value={values.province}
        onChange={handleProvinceChange}
        disabled={disabled}
      />
    </div>
  )
}
