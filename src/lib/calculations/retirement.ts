/**
 * Retirement calculation functions
 * Pure functions for financial calculations with no side effects
 */

import { roundTo2Decimals, isValidPositiveNumber, isValidReturnRate } from './math'

/**
 * Calculate future value using compound growth formula: FV = PV × (1 + r)^n
 *
 * @param principal - Current savings (PV), must be non-negative
 * @param rate - Annual interest rate as decimal (e.g., 0.05 for 5%), must be non-negative
 * @param years - Number of years, must be non-negative
 * @returns Future value rounded to 2 decimal places, or 0 for invalid inputs
 */
export function calculateFutureValue(principal: number, rate: number, years: number): number {
  // Validate inputs
  if (!isValidPositiveNumber(principal)) return 0
  if (!isValidReturnRate(rate)) return 0
  if (!isValidPositiveNumber(years)) return 0

  if (principal === 0) return 0
  if (years === 0) return roundTo2Decimals(principal)
  if (rate === 0) return roundTo2Decimals(principal)

  const futureValue = principal * Math.pow(1 + rate, years)
  return roundTo2Decimals(futureValue)
}

/**
 * Calculate future value of regular monthly contributions
 * Formula: FV = PMT × [((1 + r)^n - 1) / r] where r = monthly rate
 *
 * @param monthlyContribution - Monthly contribution amount, must be non-negative
 * @param annualRate - Annual interest rate as decimal (e.g., 0.05 for 5%), must be non-negative
 * @param months - Number of months, must be non-negative
 * @returns Future value rounded to 2 decimal places, or 0 for invalid inputs
 */
export function calculateContributionGrowth(
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  // Validate inputs
  if (!isValidPositiveNumber(monthlyContribution)) return 0
  if (!isValidReturnRate(annualRate)) return 0
  if (!isValidPositiveNumber(months)) return 0

  if (monthlyContribution === 0) return 0
  if (months === 0) return 0

  // Handle zero rate case: simple sum of contributions
  if (annualRate === 0) {
    return roundTo2Decimals(monthlyContribution * months)
  }

  const monthlyRate = annualRate / 12
  const futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  return roundTo2Decimals(futureValue)
}

/**
 * Calculate how many years savings will last based on spending and returns
 * Uses present value of annuity formula solved for n: n = ln(1 - (PV × r / PMT)) / -ln(1 + r)
 *
 * @param totalSavings - Total retirement savings, must be non-negative
 * @param annualSpending - Annual spending amount, must be non-negative
 * @param returnRate - Annual return rate during retirement as decimal, must be non-negative
 * @returns Years savings will last (Infinity if sustainable indefinitely), or 0 for invalid inputs
 */
export function calculateRetirementRunway(
  totalSavings: number,
  annualSpending: number,
  returnRate: number
): number {
  // Validate inputs
  if (!isValidPositiveNumber(totalSavings)) return 0
  if (!isValidPositiveNumber(annualSpending)) return 0
  if (!isValidReturnRate(returnRate)) return 0

  // Edge case: no savings
  if (totalSavings === 0) return 0

  // Edge case: no spending - savings last forever
  if (annualSpending === 0) return Infinity

  // Edge case: zero return rate - simple division
  if (returnRate === 0) {
    return roundTo2Decimals(totalSavings / annualSpending)
  }

  // Check if savings can sustain indefinitely
  // If annual spending <= investment returns, savings never deplete
  const sustainableWithdrawal = totalSavings * returnRate
  if (annualSpending <= sustainableWithdrawal) {
    return Infinity
  }

  // Present value of annuity formula solved for n:
  // n = ln(1 - (PV × r / PMT)) / -ln(1 + r)
  // Where PV = totalSavings, r = returnRate, PMT = annualSpending
  const ratio = (totalSavings * returnRate) / annualSpending
  const years = Math.log(1 - ratio) / -Math.log(1 + returnRate)

  return roundTo2Decimals(years)
}

/**
 * Calculate sustainable monthly income from retirement savings
 * Uses annuity formula: PMT = PV × [r / (1 - (1 + r)^-n)]
 *
 * @param totalSavings - Total retirement savings, must be non-negative
 * @param returnRate - Annual return rate during retirement as decimal, must be non-negative
 * @param retirementYears - Number of years in retirement, must be non-negative
 * @returns Sustainable monthly income rounded to 2 decimal places, or 0 for invalid inputs
 */
export function calculateSustainableIncome(
  totalSavings: number,
  returnRate: number,
  retirementYears: number
): number {
  // Validate inputs
  if (!isValidPositiveNumber(totalSavings)) return 0
  if (!isValidReturnRate(returnRate)) return 0
  if (!isValidPositiveNumber(retirementYears)) return 0

  // Edge case: no savings
  if (totalSavings === 0) return 0

  // Edge case: no retirement years
  if (retirementYears === 0) return 0

  // Edge case: zero return rate - simple division
  if (returnRate === 0) {
    const annualIncome = totalSavings / retirementYears
    return roundTo2Decimals(annualIncome / 12)
  }

  // Annuity formula: PMT = PV × [r / (1 - (1 + r)^-n)]
  const annualPayment =
    totalSavings * (returnRate / (1 - Math.pow(1 + returnRate, -retirementYears)))

  return roundTo2Decimals(annualPayment / 12)
}
