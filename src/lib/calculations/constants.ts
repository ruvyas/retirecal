/**
 * Default calculation assumptions for the retirement calculator
 * All rates are expressed as decimals (e.g., 0.02 = 2%)
 */

/** Default inflation rate: 2.0% */
export const DEFAULT_INFLATION_RATE = 0.02 as const

/** Conservative pre-retirement return: 4.0% */
export const DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE = 0.04 as const

/** Moderate pre-retirement return: 5.5% */
export const DEFAULT_PRE_RETIREMENT_RETURN_MODERATE = 0.055 as const

/** Aggressive pre-retirement return: 7.0% */
export const DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE = 0.07 as const

/** Default retirement return rate: 3.5% */
export const DEFAULT_RETIREMENT_RETURN = 0.035 as const

/** Default life expectancy: 95 years */
export const DEFAULT_LIFE_EXPECTANCY = 95 as const

/** Default blended withdrawal tax rate: 25% */
export const DEFAULT_WITHDRAWAL_TAX_RATE = 0.25 as const

/**
 * Validation bounds for input fields
 */
export const VALIDATION_BOUNDS = {
  age: { min: 18, max: 100 },
  retirementAge: { min: 19, max: 100 },
  amounts: { min: 0, max: 100_000_000 },
  monthlyContribution: { min: 0, max: 100_000 },
  annualRetirementSpending: { min: 0, max: 10_000_000 },
  rates: { min: 0, max: 0.25 },
  lifeExpectancy: { min: 50, max: 120 },
} as const

/**
 * Type for validation bounds structure
 */
export type ValidationBounds = typeof VALIDATION_BOUNDS
