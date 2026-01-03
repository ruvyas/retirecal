/**
 * Calculator - Main container component that wires together all calculator pieces
 * Uses useCalculator hook for state management
 */

import { cn } from '@/lib/utils'
import { useCalculator } from '@/hooks/useCalculator'
import { InputPanel } from './InputPanel'
import { ResultsPanel } from './ResultsPanel'
import { AssumptionsAccordion } from './AssumptionsAccordion'

interface CalculatorProps {
  className?: string
}

export function Calculator({ className }: CalculatorProps) {
  const { inputs, assumptions, results, setInputs } = useCalculator()

  return (
    <div className={cn('grid gap-8 lg:grid-cols-2', className)}>
      <div className="space-y-6">
        <InputPanel values={inputs} onChange={setInputs} />
        <AssumptionsAccordion assumptions={assumptions} />
      </div>
      <div>
        <ResultsPanel results={results} />
      </div>
    </div>
  )
}
