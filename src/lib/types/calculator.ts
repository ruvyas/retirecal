/**
 * TypeScript types for the retirement calculator
 */

// Re-export validation bounds from constants for convenience
export { VALIDATION_BOUNDS, type ValidationBounds } from '../calculations/constants'

/**
 * Breakdown of savings by account type
 */
export interface SavingsBreakdown {
  /** Registered Retirement Savings Plan balance */
  rrsp: number
  /** Tax-Free Savings Account balance */
  tfsa: number
  /** Non-registered investment account balance */
  nonRegistered: number
}

/**
 * All user input fields for the calculator
 */
export interface CalculatorInputs {
  /** Current age in years */
  currentAge: number
  /** Target retirement age */
  retirementAge: number
  /** Current annual gross income */
  annualIncome: number
  /** Current savings breakdown by account type */
  savings: SavingsBreakdown
  /** Monthly contribution to savings */
  monthlyContribution: number
  /** Expected annual spending in retirement */
  annualRetirementSpending: number
}

/**
 * Calculated output values from the calculator
 */
export interface CalculatorResults {
  /** Projected total savings at retirement */
  projectedSavings: number
  /** Years remaining until retirement */
  yearsUntilRetirement: number
  /** How many years savings will last in retirement */
  retirementRunway: number
  /** Sustainable monthly income in retirement */
  monthlyIncome: number
  /** Gap (negative) or surplus (positive) vs desired spending */
  incomeGap: number
}

/**
 * Configurable calculation assumptions
 */
export interface Assumptions {
  /** Annual inflation rate as decimal */
  inflationRate: number
  /** Expected return rate before retirement as decimal */
  preRetirementReturn: number
  /** Expected return rate during retirement as decimal */
  retirementReturn: number
  /** Blended tax rate for withdrawals as decimal */
  taxRate: number
  /** Expected age at end of life for planning purposes */
  lifeExpectancy: number
}
