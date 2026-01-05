/**
 * TypeScript types for the retirement calculator
 */

// Re-export validation bounds from constants for convenience
export { VALIDATION_BOUNDS, type ValidationBounds } from '../calculations/constants'

// Import and re-export tax types for convenience
import type { Province, TaxBracket, ProvinceInfo, TaxCalculationResult } from './tax'
export type { Province, TaxBracket, ProvinceInfo, TaxCalculationResult }

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
  /** Cash savings (0% growth) */
  cash: number
}

/**
 * Breakdown of monthly contributions by account type
 */
export interface ContributionBreakdown {
  /** Monthly RRSP contribution */
  rrsp: number
  /** Monthly TFSA contribution */
  tfsa: number
  /** Monthly non-registered investment contribution */
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
  /** Monthly contributions by account type */
  contributions: ContributionBreakdown
  /** Expected annual spending in retirement */
  annualRetirementSpending: number
  /** Province/territory for tax calculation */
  province: Province
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
  /** Sustainable monthly income in retirement (nominal, at retirement date) */
  monthlyIncome: number
  /** Monthly income expressed in today's dollars (inflation-adjusted back) */
  monthlyIncomeToday: number
  /** Gap (negative) or surplus (positive) vs desired spending */
  incomeGap: number

  // Breakdown values for formula explanations
  /** Growth of initial savings until retirement */
  savingsGrowth: number
  /** Growth from monthly contributions until retirement */
  contributionGrowth: number
  /** Pre-tax sustainable monthly income */
  grossMonthlyIncome: number
  /** Spending adjusted for inflation at retirement */
  inflationAdjustedSpending: number
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
  /** Override tax rate for withdrawals as decimal, or null to use bracket calculation */
  taxRate: number | null
  /** Expected age at end of life for planning purposes */
  lifeExpectancy: number
}
