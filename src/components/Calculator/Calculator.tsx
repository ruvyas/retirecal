/**
 * Calculator - Main container component with wizard-style layout
 * Optimized for users in their 50s with larger text and reduced cognitive load
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCalculator } from '@/hooks/useCalculator'
import { useDebounce } from '@/hooks/useDebounce'
import { WizardSection } from './WizardSection'
import { StickyResultsSummary } from './StickyResultsSummary'
import { ResultsSection } from './ResultsSection'
import { AboutYouSection } from './sections/AboutYouSection'
import { IncomeSavingsSection } from './sections/IncomeSavingsSection'
import { SavingsPlanSection } from './sections/SavingsPlanSection'
import { AssumptionsAccordion } from './AssumptionsAccordion'
import { Hero } from './Hero'
import type { Assumptions, CalculatorInputs } from '@/lib/types/calculator'

interface CalculatorProps {
  className?: string
}

const DEBOUNCE_DELAY = 150

/**
 * Compare two CalculatorInputs objects for equality
 * More efficient than JSON.stringify and handles the known structure
 */
function areInputsEqual(a: CalculatorInputs, b: CalculatorInputs): boolean {
  return (
    a.currentAge === b.currentAge &&
    a.retirementAge === b.retirementAge &&
    a.annualIncome === b.annualIncome &&
    a.annualRetirementSpending === b.annualRetirementSpending &&
    a.province === b.province &&
    a.savings.rrsp === b.savings.rrsp &&
    a.savings.tfsa === b.savings.tfsa &&
    a.savings.nonRegistered === b.savings.nonRegistered &&
    a.contributions.rrsp === b.contributions.rrsp &&
    a.contributions.tfsa === b.contributions.tfsa &&
    a.contributions.nonRegistered === b.contributions.nonRegistered
  )
}

export function Calculator({ className }: CalculatorProps) {
  const { inputs, assumptions, results, projectionData, setInputs, setAssumptions } =
    useCalculator()

  // Track which section is currently active
  const [activeSection, setActiveSection] = useState(1)

  // Internal state for immediate UI updates
  const [internalInputs, setInternalInputs] = useState(inputs)

  // Sync with external values when they change
  useEffect(() => {
    setInternalInputs(inputs)
  }, [inputs])

  // Debounce the internal values before calling setInputs
  const debouncedInputs = useDebounce(internalInputs, DEBOUNCE_DELAY)

  // Notify hook when debounced values change
  useEffect(() => {
    if (!areInputsEqual(debouncedInputs, inputs)) {
      setInputs(debouncedInputs)
    }
  }, [debouncedInputs, setInputs, inputs])

  const handleInputChange = useCallback((newInputs: CalculatorInputs) => {
    setInternalInputs(newInputs)
  }, [])

  const handleAssumptionChange = useCallback(
    (key: keyof Assumptions, value: number | null) => {
      setAssumptions({ [key]: value })
    },
    [setAssumptions]
  )

  // Memoized section completion status
  const totalMonthlyContribution =
    internalInputs.contributions.rrsp +
    internalInputs.contributions.tfsa +
    internalInputs.contributions.nonRegistered

  const sectionCompleteness = useMemo(
    () => ({
      1: internalInputs.currentAge > 0 && internalInputs.retirementAge > internalInputs.currentAge,
      2: internalInputs.annualIncome > 0,
      3: totalMonthlyContribution >= 0 && internalInputs.annualRetirementSpending > 0,
    }),
    [
      internalInputs.currentAge,
      internalInputs.retirementAge,
      internalInputs.annualIncome,
      totalMonthlyContribution,
      internalInputs.annualRetirementSpending,
    ]
  )

  return (
    <div className={cn('space-y-6', className)}>
      <Hero />

      <StickyResultsSummary results={results} />

      <div className="space-y-4">
        <WizardSection
          title="About You"
          stepNumber={1}
          isActive={activeSection === 1}
          isComplete={activeSection > 1 && sectionCompleteness[1]}
          onActivate={() => setActiveSection(1)}
        >
          <AboutYouSection values={internalInputs} onChange={handleInputChange} />
        </WizardSection>

        <WizardSection
          title="Income & Savings"
          stepNumber={2}
          isActive={activeSection === 2}
          isComplete={activeSection > 2 && sectionCompleteness[2]}
          onActivate={() => setActiveSection(2)}
        >
          <IncomeSavingsSection values={internalInputs} onChange={handleInputChange} />
        </WizardSection>

        <WizardSection
          title="Savings Plan"
          stepNumber={3}
          isActive={activeSection === 3}
          isComplete={activeSection > 3 && sectionCompleteness[3]}
          onActivate={() => setActiveSection(3)}
        >
          <SavingsPlanSection values={internalInputs} onChange={handleInputChange} />
        </WizardSection>

        <WizardSection
          title="Advanced Assumptions"
          stepNumber={4}
          isActive={activeSection === 4}
          isComplete={false}
          onActivate={() => setActiveSection(4)}
        >
          <AssumptionsAccordion
            assumptions={assumptions}
            onAssumptionChange={handleAssumptionChange}
            province={inputs.province}
            estimatedAnnualIncome={results.monthlyIncome * 12}
          />
        </WizardSection>
      </div>

      <ResultsSection
        results={results}
        assumptions={assumptions}
        projectionData={projectionData}
        retirementAge={internalInputs.retirementAge}
        currentAge={internalInputs.currentAge}
        lifeExpectancy={assumptions.lifeExpectancy}
        annualRetirementSpending={internalInputs.annualRetirementSpending}
        inflationRate={assumptions.inflationRate}
      />
    </div>
  )
}
