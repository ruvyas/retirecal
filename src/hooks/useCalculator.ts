/**
 * useCalculator hook - Main state management for the retirement calculator
 * Uses useReducer for complex state management with memoized calculations
 */

import { useReducer, useMemo, useCallback } from 'react'
import {
  calculateFutureValue,
  calculateContributionGrowth,
  calculateInflationAdjustedRunway,
  calculateSustainableIncome,
} from '@/lib/calculations/retirement'
import { calculateCanadianTax } from '@/lib/calculations/tax'
import { DEFAULT_PROVINCE } from '@/lib/calculations/tax-brackets'
import type { ProjectionDataPoint } from '@/components/Charts/ProjectionChart'
import {
  DEFAULT_INFLATION_RATE,
  DEFAULT_PRE_RETIREMENT_RETURN_MODERATE,
  DEFAULT_RETIREMENT_RETURN,
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
    cash: 0,
  },
  contributions: {
    rrsp: 200,
    tfsa: 200,
    nonRegistered: 100,
  },
  annualRetirementSpending: 50000,
  province: DEFAULT_PROVINCE,
}

// Default assumptions based on constants
const DEFAULT_ASSUMPTIONS: Assumptions = {
  inflationRate: DEFAULT_INFLATION_RATE,
  preRetirementReturn: DEFAULT_PRE_RETIREMENT_RETURN_MODERATE,
  retirementReturn: DEFAULT_RETIREMENT_RETURN,
  taxRate: null, // Use bracket calculation by default
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
 * Includes detailed data for enhanced tooltips
 */
function generateProjectionData(
  inputs: CalculatorInputs,
  assumptions: Assumptions
): ProjectionDataPoint[] {
  const safeInputs = sanitizeInputs(inputs)
  // Invested savings (grow with returns)
  const investedSavings =
    safeInputs.savings.rrsp + safeInputs.savings.tfsa + safeInputs.savings.nonRegistered
  // Cash savings (0% growth)
  const cashSavings = safeInputs.savings.cash
  const totalSavings = investedSavings + cashSavings

  const monthlyContribution =
    safeInputs.contributions.rrsp +
    safeInputs.contributions.tfsa +
    safeInputs.contributions.nonRegistered
  const annualContribution = monthlyContribution * 12

  const data: ProjectionDataPoint[] = []
  let cumulativeContributions = 0
  let previousSavings = totalSavings

  // Accumulation phase: current age to retirement
  for (let age = safeInputs.currentAge; age <= safeInputs.retirementAge; age++) {
    const yearsFromNow = age - safeInputs.currentAge
    const monthsFromNow = yearsFromNow * 12

    // Only invested savings grow with returns
    const investedGrowth = calculateFutureValue(
      investedSavings,
      assumptions.preRetirementReturn,
      yearsFromNow
    )
    const contributionGrowth = calculateContributionGrowth(
      monthlyContribution,
      assumptions.preRetirementReturn,
      monthsFromNow
    )

    // Cash stays flat (0% growth)
    const currentTotalSavings = investedGrowth + contributionGrowth + cashSavings
    cumulativeContributions = annualContribution * yearsFromNow

    // Calculate growth for this year
    const growthAmount =
      age === safeInputs.currentAge ? 0 : currentTotalSavings - previousSavings - annualContribution

    data.push({
      age,
      savings: currentTotalSavings,
      isRetirement: false,
      phase: 'accumulation',
      annualContribution: age === safeInputs.currentAge ? 0 : annualContribution,
      annualWithdrawal: 0,
      originalWithdrawal: 0,
      growthAmount: Math.max(0, growthAmount),
      returnRate: assumptions.preRetirementReturn,
      postTaxIncome: 0,
      postTaxIncomeToday: 0,
      cumulativeContributions,
      previousSavings,
    })

    previousSavings = currentTotalSavings
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
  previousSavings = savingsAtRetirement

  for (let age = safeInputs.retirementAge + 1; age <= assumptions.lifeExpectancy; age++) {
    const savingsBeforeWithdrawal = currentSavings * (1 + assumptions.retirementReturn)
    const growthAmount = savingsBeforeWithdrawal - previousSavings

    // Apply return and subtract inflation-adjusted withdrawal
    currentSavings = savingsBeforeWithdrawal - currentWithdrawal
    currentSavings = Math.max(0, currentSavings) // Don't go negative

    // Calculate post-tax income (withdrawal after tax)
    // Use bracket calculation if taxRate is null, otherwise use override
    const effectiveTaxRate =
      assumptions.taxRate !== null
        ? assumptions.taxRate
        : calculateCanadianTax(currentWithdrawal, safeInputs.province).effectiveRate
    const postTaxIncome = currentWithdrawal * (1 - effectiveTaxRate)

    // Calculate post-tax income in today's dollars (using today's spending for tax rate)
    const effectiveTaxRateToday =
      assumptions.taxRate !== null
        ? assumptions.taxRate
        : calculateCanadianTax(safeInputs.annualRetirementSpending, safeInputs.province)
            .effectiveRate
    const postTaxIncomeToday = safeInputs.annualRetirementSpending * (1 - effectiveTaxRateToday)

    data.push({
      age,
      savings: currentSavings,
      isRetirement: true,
      phase: 'retirement',
      annualContribution: 0,
      annualWithdrawal: currentWithdrawal,
      originalWithdrawal: safeInputs.annualRetirementSpending,
      growthAmount: Math.max(0, growthAmount),
      returnRate: assumptions.retirementReturn,
      postTaxIncome,
      postTaxIncomeToday,
      cumulativeContributions,
      previousSavings,
    })

    previousSavings = currentSavings

    // Increase withdrawal by inflation each year
    currentWithdrawal = currentWithdrawal * (1 + assumptions.inflationRate)

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

  // Invested savings (grow with returns)
  const investedSavings =
    safeInputs.savings.rrsp + safeInputs.savings.tfsa + safeInputs.savings.nonRegistered
  // Cash savings (0% growth)
  const cashSavings = safeInputs.savings.cash

  const monthlyContribution =
    safeInputs.contributions.rrsp +
    safeInputs.contributions.tfsa +
    safeInputs.contributions.nonRegistered
  const yearsUntilRetirement = safeInputs.retirementAge - safeInputs.currentAge
  const monthsUntilRetirement = yearsUntilRetirement * 12

  // Growth of existing invested savings until retirement (cash stays flat)
  const savingsGrowth = calculateFutureValue(
    investedSavings,
    assumptions.preRetirementReturn,
    yearsUntilRetirement
  )

  // Growth of future contributions until retirement
  const contributionGrowth = calculateContributionGrowth(
    monthlyContribution,
    assumptions.preRetirementReturn,
    monthsUntilRetirement
  )

  // Total at retirement: invested growth + contribution growth + cash (unchanged)
  const projectedSavings = savingsGrowth + contributionGrowth + cashSavings

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

  // Calculate effective tax rate
  // Use bracket calculation based on annual income if taxRate is null
  const grossAnnualIncome = grossMonthlyIncome * 12
  const effectiveTaxRate =
    assumptions.taxRate !== null
      ? assumptions.taxRate
      : calculateCanadianTax(grossAnnualIncome, safeInputs.province).effectiveRate

  // Apply tax rate to get after-tax income
  const monthlyIncome = grossMonthlyIncome * (1 - effectiveTaxRate)

  // Calculate runway using inflation-adjusted spending with proper inflation accounting
  const retirementRunway = calculateInflationAdjustedRunway(
    projectedSavings,
    inflationAdjustedSpending,
    assumptions.retirementReturn,
    assumptions.inflationRate
  )

  // Calculate income gap using inflation-adjusted spending (monthly)
  const desiredMonthlySpending = inflationAdjustedSpending / 12
  const incomeGap = monthlyIncome - desiredMonthlySpending

  // Calculate monthly income in today's dollars (discount back from retirement)
  const monthlyIncomeToday =
    monthlyIncome / Math.pow(1 + assumptions.inflationRate, yearsUntilRetirement)

  return {
    projectedSavings,
    yearsUntilRetirement,
    retirementRunway,
    monthlyIncome,
    monthlyIncomeToday,
    incomeGap,
    // Breakdown values for formula explanations
    savingsGrowth,
    contributionGrowth,
    grossMonthlyIncome,
    inflationAdjustedSpending,
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

  // Calculate total savings (memoized) - includes cash
  const totalSavings = useMemo(
    () =>
      state.inputs.savings.rrsp +
      state.inputs.savings.tfsa +
      state.inputs.savings.nonRegistered +
      state.inputs.savings.cash,
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
