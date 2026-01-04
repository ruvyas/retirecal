/**
 * Calculator - Main container component that wires together all calculator pieces
 * Uses useCalculator hook for state management
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useCalculator } from '@/hooks/useCalculator'
import { InputPanel } from './InputPanel'
import { ResultsPanel } from './ResultsPanel'
import { AssumptionsAccordion } from './AssumptionsAccordion'
import { Hero } from './Hero'
import type { Assumptions } from '@/lib/types/calculator'

interface CalculatorProps {
  className?: string
}

export function Calculator({ className }: CalculatorProps) {
  const { inputs, assumptions, results, projectionData, setInputs, setAssumptions } =
    useCalculator()

  const handleAssumptionChange = useCallback(
    (key: keyof Assumptions, value: number) => {
      setAssumptions({ [key]: value })
    },
    [setAssumptions]
  )

  return (
    <div className={cn('space-y-8', className)}>
      <Hero />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <InputPanel values={inputs} onChange={setInputs} />
          <AssumptionsAccordion
            assumptions={assumptions}
            onAssumptionChange={handleAssumptionChange}
          />
        </div>
        <div>
          <ResultsPanel
            results={results}
            projectionData={projectionData}
            retirementAge={inputs.retirementAge}
            currentAge={inputs.currentAge}
            lifeExpectancy={assumptions.lifeExpectancy}
          />
        </div>
      </div>
    </div>
  )
}
