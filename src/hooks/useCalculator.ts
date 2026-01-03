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

  // Calculate sustainable income and runway
  const monthlyIncome = calculateSustainableIncome(
    projectedSavings,
    assumptions.retirementReturn,
    retirementYears
  )

  const retirementRunway = calculateRetirementRunway(
    projectedSavings,
    safeInputs.annualRetirementSpending,
    assumptions.retirementReturn
  )

  // Calculate income gap (monthly): positive = surplus, negative = gap
  const desiredMonthlySpending = safeInputs.annualRetirementSpending / 12
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
  }
}

// Export defaults for testing
export { DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS, computeResults }
