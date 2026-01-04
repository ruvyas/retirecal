/**
 * useCalculator hook - Main state management for the retirement calculator
 * Uses useReducer for complex state management with memoized calculations
 */

import { useReducer, useMemo, useCallback } from 'react'
import {
  calculateFutureValue,
  calculateContributionGrowth,
  calculateRetirementRunway,
  calculateSustainableIncome,
} from '@/lib/calculations/retirement'
import type { ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import {
  DEFAULT_INFLATION_RATE,
  DEFAULT_PRE_RETIREMENT_RETURN_MODERATE,
  DEFAULT_RETIREMENT_RETURN,
  DEFAULT_WITHDRAWAL_TAX_RATE,
  DEFAULT_LIFE_EXPECTANCY,
} from '@/lib/calculations/constants'
import { validateInputs, sanitizeInputs, type ValidationErrors } from '@/lib/utils/validators'
import type { CalculatorInputs, CalculatorResults, Assumptions } from '@/lib/types/calculator'

// Default input values for initial state
const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 30,
  retirementAge: 65,
  annualIncome: 75000,
  savings: {
    rrsp: 50000,
    tfsa: 30000,
    nonRegistered: 20000,
  },
  monthlyContribution: 500,
  annualRetirementSpending: 50000,
}

// Default assumptions based on constants
const DEFAULT_ASSUMPTIONS: Assumptions = {
  inflationRate: DEFAULT_INFLATION_RATE,
  preRetirementReturn: DEFAULT_PRE_RETIREMENT_RETURN_MODERATE,
  retirementReturn: DEFAULT_RETIREMENT_RETURN,
  taxRate: DEFAULT_WITHDRAWAL_TAX_RATE,
  lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
}

// State shape
interface CalculatorState {
  inputs: CalculatorInputs
  assumptions: Assumptions
}

// Action types
type CalculatorAction =
  | { type: 'SET_INPUTS'; inputs: CalculatorInputs }
  | { type: 'SET_ASSUMPTIONS'; assumptions: Partial<Assumptions> }
  | { type: 'RESET' }

// Reducer
function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_INPUTS':
      return {
        ...state,
        inputs: action.inputs,
      }
    case 'SET_ASSUMPTIONS':
      return {
        ...state,
        assumptions: {
          ...state.assumptions,
          ...action.assumptions,
        },
      }
    case 'RESET':
      return {
        inputs: DEFAULT_INPUTS,
        assumptions: DEFAULT_ASSUMPTIONS,
      }
    default:
      return state
  }
}

/**
 * Generate year-by-year projection data for the chart
 * Shows savings growth through accumulation and drawdown phases
 */
function generateProjectionData(
  inputs: CalculatorInputs,
  assumptions: Assumptions
): ProjectionDataPoint[] {
  const safeInputs = sanitizeInputs(inputs)
  const totalSavings =
    safeInputs.savings.rrsp + safeInputs.savings.tfsa + safeInputs.savings.nonRegistered

  const data: ProjectionDataPoint[] = []

  // Accumulation phase: current age to retirement
  for (let age = safeInputs.currentAge; age <= safeInputs.retirementAge; age++) {
    const yearsFromNow = age - safeInputs.currentAge
    const monthsFromNow = yearsFromNow * 12

    const savingsGrowth = calculateFutureValue(
      totalSavings,
      assumptions.preRetirementReturn,
      yearsFromNow
    )
    const contributionGrowth = calculateContributionGrowth(
      safeInputs.monthlyContribution,
      assumptions.preRetirementReturn,
      monthsFromNow
    )

    data.push({
      age,
      savings: savingsGrowth + contributionGrowth,
      isRetirement: false,
    })
  }

  // Retirement phase: retirement to life expectancy
  const savingsAtRetirement = data[data.length - 1]?.savings ?? 0
  const yearsUntilRetirement = safeInputs.retirementAge - safeInputs.currentAge

  // Adjust annual spending for inflation at retirement
  const inflationAdjustedSpending =
    safeInputs.annualRetirementSpending *
    Math.pow(1 + assumptions.inflationRate, yearsUntilRetirement)

  let currentSavings = savingsAtRetirement
  let currentWithdrawal = inflationAdjustedSpending

  for (let age = safeInputs.retirementAge + 1; age <= assumptions.lifeExpectancy; age++) {
    // Apply return and subtract inflation-adjusted withdrawal
    currentSavings = currentSavings * (1 + assumptions.retirementReturn) - currentWithdrawal
    currentSavings = Math.max(0, currentSavings) // Don't go negative

    // Increase withdrawal by inflation each year
    currentWithdrawal = currentWithdrawal * (1 + assumptions.inflationRate)

    data.push({
      age,
      savings: currentSavings,
      isRetirement: true,
    })

    // Stop if savings depleted
    if (currentSavings === 0) break
  }

  return data
}

/**
 * Compute calculator results from inputs and assumptions
 * Pure function for easy testing and memoization
 */
function computeResults(inputs: CalculatorInputs, assumptions: Assumptions): CalculatorResults {
  // Sanitize inputs to prevent calculation errors
  const safeInputs = sanitizeInputs(inputs)

  const totalSavings =
    safeInputs.savings.rrsp + safeInputs.savings.tfsa + safeInputs.savings.nonRegistered
  const yearsUntilRetirement = safeInputs.retirementAge - safeInputs.currentAge
  const monthsUntilRetirement = yearsUntilRetirement * 12

  // Growth of existing savings until retirement
  const savingsGrowth = calculateFutureValue(
    totalSavings,
    assumptions.preRetirementReturn,
    yearsUntilRetirement
  )

  // Growth of future contributions until retirement
  const contributionGrowth = calculateContributionGrowth(
    safeInputs.monthlyContribution,
    assumptions.preRetirementReturn,
    monthsUntilRetirement
  )

  const projectedSavings = savingsGrowth + contributionGrowth

  // Retirement duration based on life expectancy
  const retirementYears = assumptions.lifeExpectancy - safeInputs.retirementAge

  // Adjust annual spending for inflation at retirement
  const inflationAdjustedSpending =
    safeInputs.annualRetirementSpending *
    Math.pow(1 + assumptions.inflationRate, yearsUntilRetirement)

  // Calculate sustainable income (gross, before tax)
  const grossMonthlyIncome = calculateSustainableIncome(
    projectedSavings,
    assumptions.retirementReturn,
    retirementYears
  )

  // Apply tax rate to get after-tax income
  const monthlyIncome = grossMonthlyIncome * (1 - assumptions.taxRate)

  // Calculate runway using inflation-adjusted spending
  const retirementRunway = calculateRetirementRunway(
    projectedSavings,
    inflationAdjustedSpending,
    assumptions.retirementReturn
  )

  // Calculate income gap using inflation-adjusted spending (monthly)
  const desiredMonthlySpending = inflationAdjustedSpending / 12
  const incomeGap = monthlyIncome - desiredMonthlySpending

  return {
    projectedSavings,
    yearsUntilRetirement,
    retirementRunway,
    monthlyIncome,
    incomeGap,
  }
}

// Hook return type
export interface UseCalculatorReturn {
  // State
  inputs: CalculatorInputs
  assumptions: Assumptions
  results: CalculatorResults
  errors: ValidationErrors

  // Actions
  setInputs: (inputs: CalculatorInputs) => void
  setAssumptions: (assumptions: Partial<Assumptions>) => void
  reset: () => void

  // Derived values
  totalSavings: number
  hasErrors: boolean
  projectionData: ProjectionDataPoint[]
}

/**
 * Main hook for managing calculator state and calculations
 */
export function useCalculator(): UseCalculatorReturn {
  const [state, dispatch] = useReducer(calculatorReducer, {
    inputs: DEFAULT_INPUTS,
    assumptions: DEFAULT_ASSUMPTIONS,
  })

  // Validate inputs and get errors
  const errors = useMemo(() => validateInputs(state.inputs), [state.inputs])

  // Check if there are any errors
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  // Compute results (memoized based on inputs and assumptions)
  const results = useMemo(
    () => computeResults(state.inputs, state.assumptions),
    [state.inputs, state.assumptions]
  )

  // Generate projection data for chart (memoized)
  const projectionData = useMemo(
    () => generateProjectionData(state.inputs, state.assumptions),
    [state.inputs, state.assumptions]
  )

  // Calculate total savings (memoized)
  const totalSavings = useMemo(
    () =>
      state.inputs.savings.rrsp + state.inputs.savings.tfsa + state.inputs.savings.nonRegistered,
    [state.inputs.savings]
  )

  // Action creators
  const setInputs = useCallback((inputs: CalculatorInputs) => {
    dispatch({ type: 'SET_INPUTS', inputs })
  }, [])

  const setAssumptions = useCallback((assumptions: Partial<Assumptions>) => {
    dispatch({ type: 'SET_ASSUMPTIONS', assumptions })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    inputs: state.inputs,
    assumptions: state.assumptions,
    results,
    errors,
    setInputs,
    setAssumptions,
    reset,
    totalSavings,
    hasErrors,
    projectionData,
  }
}

// Export defaults for testing
export { DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS, computeResults, generateProjectionData }
