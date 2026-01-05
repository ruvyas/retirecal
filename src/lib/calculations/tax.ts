/**
 * Tax calculation functions
 * Canadian federal and provincial marginal tax bracket calculations
 */

import { roundTo2Decimals, isValidPositiveNumber, isValidRate } from './math'
import { DEFAULT_WITHDRAWAL_TAX_RATE } from './constants'
import { FEDERAL_BRACKETS, PROVINCIAL_BRACKETS } from './tax-brackets'
import type { Province, TaxBracket, TaxCalculationResult } from '../types/tax'

/**
 * Get the marginal tax rate for a given income level
 *
 * @param income - Annual gross income, must be non-negative
 * @param brackets - Array of tax brackets
 * @returns Marginal rate as a decimal (rate on the next dollar earned)
 */
export function getMarginalRate(income: number, brackets: TaxBracket[]): number {
  if (!isValidPositiveNumber(income) || income === 0 || !brackets || brackets.length === 0) return 0

  // Find the bracket that contains this income level
  for (const bracket of brackets) {
    const upperLimit = bracket.max === null ? Infinity : bracket.max
    if (income >= bracket.min && income < upperLimit) {
      return bracket.rate
    }
  }

  // If income exceeds all brackets, return the highest bracket's rate
  const lastBracket = brackets[brackets.length - 1]
  return lastBracket?.rate ?? 0
}

/**
 * Calculate tax using marginal brackets
 *
 * @param income - Annual gross income, must be non-negative
 * @param brackets - Array of tax brackets to apply
 * @returns Total tax amount rounded to 2 decimal places, or 0 for invalid inputs
 */
export function calculateBracketTax(income: number, brackets: TaxBracket[]): number {
  if (!isValidPositiveNumber(income) || income === 0) return 0
  if (!brackets || brackets.length === 0) return 0

  let totalTax = 0

  for (const bracket of brackets) {
    // Skip if income doesn't reach this bracket
    if (income <= bracket.min) break

    // Calculate taxable amount in this bracket
    const upperLimit = bracket.max === null ? income : Math.min(income, bracket.max)
    const taxableInBracket = upperLimit - bracket.min

    totalTax += taxableInBracket * bracket.rate
  }

  return roundTo2Decimals(totalTax)
}

/**
 * Calculate combined federal and provincial tax for a given income
 *
 * @param income - Annual gross income, must be non-negative
 * @param province - Province/territory code
 * @returns Object with federal, provincial, total tax, effective rate, and marginal rates
 */
export function calculateCanadianTax(income: number, province: Province): TaxCalculationResult {
  if (!isValidPositiveNumber(income) || income === 0) {
    return {
      federal: 0,
      provincial: 0,
      total: 0,
      effectiveRate: 0,
      federalMarginalRate: 0,
      provincialMarginalRate: 0,
      marginalRate: 0,
    }
  }

  const provincialBrackets = PROVINCIAL_BRACKETS[province]
  if (!provincialBrackets) {
    return {
      federal: 0,
      provincial: 0,
      total: 0,
      effectiveRate: 0,
      federalMarginalRate: 0,
      provincialMarginalRate: 0,
      marginalRate: 0,
    }
  }

  const federal = calculateBracketTax(income, FEDERAL_BRACKETS)
  const provincial = calculateBracketTax(income, provincialBrackets)
  const total = roundTo2Decimals(federal + provincial)
  const effectiveRate = income > 0 ? roundTo2Decimals(total / income) : 0

  const federalMarginalRate = getMarginalRate(income, FEDERAL_BRACKETS)
  const provincialMarginalRate = getMarginalRate(income, provincialBrackets)
  const marginalRate = federalMarginalRate + provincialMarginalRate

  return {
    federal,
    provincial,
    total,
    effectiveRate,
    federalMarginalRate,
    provincialMarginalRate,
    marginalRate,
  }
}

/**
 * Calculate after-tax amount using Canadian tax brackets
 *
 * @param grossAmount - Pre-tax amount, must be non-negative
 * @param province - Province/territory code
 * @returns After-tax amount rounded to 2 decimal places
 */
export function calculateAfterTaxWithBrackets(grossAmount: number, province: Province): number {
  if (!isValidPositiveNumber(grossAmount) || grossAmount === 0) return 0

  const { total } = calculateCanadianTax(grossAmount, province)
  return roundTo2Decimals(grossAmount - total)
}

/**
 * Estimate after-tax amount using a simplified blended tax rate
 *
 * @deprecated Use calculateAfterTaxWithBrackets for accurate calculations
 * @param grossAmount - The pre-tax amount, must be non-negative
 * @param taxRate - The blended tax rate as decimal (default: 25%), must be between 0 and 1
 * @returns The after-tax amount rounded to 2 decimal places, or 0 for invalid inputs
 */
export function estimateAfterTaxAmount(
  grossAmount: number,
  taxRate: number = DEFAULT_WITHDRAWAL_TAX_RATE
): number {
  // Validate inputs
  if (!isValidPositiveNumber(grossAmount)) return 0
  if (!isValidRate(taxRate)) return 0

  if (grossAmount === 0) return 0
  if (taxRate === 0) return roundTo2Decimals(grossAmount)

  const afterTax = grossAmount * (1 - taxRate)
  return roundTo2Decimals(afterTax)
}
