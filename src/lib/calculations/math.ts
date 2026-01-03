/**
 * Shared math utilities for financial calculations
 */

/**
 * Round a number to 2 decimal places
 * Uses standard rounding (0.5 rounds up)
 *
 * @param value - The number to round
 * @returns The value rounded to 2 decimal places
 */
export function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Check if a value is a valid non-negative number
 *
 * @param value - The value to validate
 * @returns true if the value is a finite non-negative number
 */
export function isValidPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

/**
 * Check if a rate is valid (between 0 and 1 inclusive)
 *
 * @param rate - The rate to validate (as decimal, e.g., 0.05 for 5%)
 * @returns true if the rate is between 0 and 1
 */
export function isValidRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0 && rate <= 1
}

/**
 * Check if a return rate is valid (can be higher than 1 for aggressive returns)
 *
 * @param rate - The rate to validate (as decimal, e.g., 0.07 for 7%)
 * @returns true if the rate is a finite non-negative number
 */
export function isValidReturnRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0
}
