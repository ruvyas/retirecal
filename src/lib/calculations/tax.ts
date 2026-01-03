/**
 * Tax calculation functions
 * Simplified tax estimation for retirement planning
 */

import { roundTo2Decimals, isValidPositiveNumber, isValidRate } from './math'
import { DEFAULT_WITHDRAWAL_TAX_RATE } from './constants'

/**
 * Estimate after-tax amount using a simplified blended tax rate
 *
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
