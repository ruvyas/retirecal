/**
 * Input validation functions for the retirement calculator
 */

import { VALIDATION_BOUNDS } from '../calculations/constants'
import { formatCurrency } from '../formatters'
import type { CalculatorInputs, SavingsBreakdown, ContributionBreakdown } from '../types/calculator'

/**
 * Validation errors structure matching CalculatorInputs shape
 */
export interface ValidationErrors {
  currentAge?: string
  retirementAge?: string
  annualIncome?: string
  savings?: {
    rrsp?: string
    tfsa?: string
    nonRegistered?: string
  }
  contributions?: {
    rrsp?: string
    tfsa?: string
    nonRegistered?: string
  }
  annualRetirementSpending?: string
}

/**
 * Validate current age
 * Must be between 18 and 99 (max - 1 to allow retirement age)
 */
export function validateCurrentAge(age: number): string | undefined {
  if (!Number.isFinite(age)) {
    return 'Please enter a valid age'
  }
  if (!Number.isInteger(age)) {
    return 'Age must be a whole number'
  }
  if (age < VALIDATION_BOUNDS.age.min) {
    return `Age must be at least ${VALIDATION_BOUNDS.age.min}`
  }
  if (age > VALIDATION_BOUNDS.age.max - 1) {
    return `Age must be less than ${VALIDATION_BOUNDS.age.max}`
  }
  return undefined
}

/**
 * Validate retirement age
 * Must be at least currentAge + 1 and at most 100
 */
export function validateRetirementAge(
  retirementAge: number,
  currentAge: number
): string | undefined {
  if (!Number.isFinite(retirementAge)) {
    return 'Please enter a valid retirement age'
  }
  if (!Number.isInteger(retirementAge)) {
    return 'Retirement age must be a whole number'
  }
  const minRetirementAge = currentAge + 1
  if (retirementAge < minRetirementAge) {
    return `Retirement age must be at least ${minRetirementAge}`
  }
  if (retirementAge > VALIDATION_BOUNDS.retirementAge.max) {
    return `Retirement age must be at most ${VALIDATION_BOUNDS.retirementAge.max}`
  }
  return undefined
}

/**
 * Validate a currency amount
 * Must be non-negative and within bounds
 */
export function validateCurrencyAmount(
  amount: number,
  fieldName: string,
  max: number = VALIDATION_BOUNDS.amounts.max
): string | undefined {
  if (!Number.isFinite(amount)) {
    return `Please enter a valid ${fieldName.toLowerCase()}`
  }
  if (amount < 0) {
    return `${fieldName} cannot be negative`
  }
  if (amount > max) {
    return `${fieldName} must be at most ${formatCurrency(max)}`
  }
  return undefined
}

/**
 * Validate all savings breakdown fields
 */
export function validateSavingsBreakdown(
  savings: SavingsBreakdown
): ValidationErrors['savings'] | undefined {
  const errors: NonNullable<ValidationErrors['savings']> = {}

  const rrspError = validateCurrencyAmount(savings.rrsp, 'RRSP')
  if (rrspError) errors.rrsp = rrspError

  const tfsaError = validateCurrencyAmount(savings.tfsa, 'TFSA')
  if (tfsaError) errors.tfsa = tfsaError

  const nonRegError = validateCurrencyAmount(savings.nonRegistered, 'Non-registered savings')
  if (nonRegError) errors.nonRegistered = nonRegError

  return Object.keys(errors).length > 0 ? errors : undefined
}

/**
 * Validate all contribution breakdown fields
 */
export function validateContributionBreakdown(
  contributions: ContributionBreakdown
): ValidationErrors['contributions'] | undefined {
  const errors: NonNullable<ValidationErrors['contributions']> = {}

  const rrspError = validateCurrencyAmount(
    contributions.rrsp,
    'RRSP contribution',
    VALIDATION_BOUNDS.monthlyContribution.max
  )
  if (rrspError) errors.rrsp = rrspError

  const tfsaError = validateCurrencyAmount(
    contributions.tfsa,
    'TFSA contribution',
    VALIDATION_BOUNDS.monthlyContribution.max
  )
  if (tfsaError) errors.tfsa = tfsaError

  const nonRegError = validateCurrencyAmount(
    contributions.nonRegistered,
    'Non-registered contribution',
    VALIDATION_BOUNDS.monthlyContribution.max
  )
  if (nonRegError) errors.nonRegistered = nonRegError

  return Object.keys(errors).length > 0 ? errors : undefined
}

/**
 * Validate all calculator inputs
 * Returns object with error messages for invalid fields
 */
export function validateInputs(inputs: CalculatorInputs): ValidationErrors {
  const errors: ValidationErrors = {}

  const currentAgeError = validateCurrentAge(inputs.currentAge)
  if (currentAgeError) errors.currentAge = currentAgeError

  const retirementAgeError = validateRetirementAge(inputs.retirementAge, inputs.currentAge)
  if (retirementAgeError) errors.retirementAge = retirementAgeError

  const incomeError = validateCurrencyAmount(inputs.annualIncome, 'Annual income')
  if (incomeError) errors.annualIncome = incomeError

  const savingsErrors = validateSavingsBreakdown(inputs.savings)
  if (savingsErrors) errors.savings = savingsErrors

  const contributionErrors = validateContributionBreakdown(inputs.contributions)
  if (contributionErrors) errors.contributions = contributionErrors

  const spendingError = validateCurrencyAmount(
    inputs.annualRetirementSpending,
    'Annual retirement spending',
    VALIDATION_BOUNDS.annualRetirementSpending.max
  )
  if (spendingError) errors.annualRetirementSpending = spendingError

  return errors
}

/**
 * Check if all inputs are valid
 */
export function areInputsValid(inputs: CalculatorInputs): boolean {
  const errors = validateInputs(inputs)
  return Object.keys(errors).length === 0
}

/**
 * Validate that a decimal value has at most the specified decimal places
 * Returns error message if invalid, undefined if valid
 */
export function validateDecimalPrecision(
  value: number,
  fieldName: string,
  maxDecimals: number = 3
): string | undefined {
  const factor = Math.pow(10, maxDecimals)
  const rounded = Math.round(value * factor) / factor
  // Use a relative tolerance that handles floating point arithmetic errors
  // 1e-10 is small enough to catch intentional precision violations while
  // accommodating typical floating point representation errors
  const tolerance = 1e-10
  if (Math.abs(value - rounded) > tolerance) {
    return `${fieldName} must have at most ${maxDecimals} decimal places`
  }
  return undefined
}

/**
 * Sanitize inputs to prevent calculation crashes
 * Returns safe values even for invalid inputs by clamping to valid ranges
 */
export function sanitizeInputs(inputs: CalculatorInputs): CalculatorInputs {
  const clamp = (value: number, min: number, max: number): number => {
    if (!Number.isFinite(value)) return min
    return Math.max(min, Math.min(max, value))
  }

  const sanitizedCurrentAge = clamp(
    inputs.currentAge,
    VALIDATION_BOUNDS.age.min,
    VALIDATION_BOUNDS.age.max - 1
  )

  return {
    currentAge: sanitizedCurrentAge,
    retirementAge: clamp(
      inputs.retirementAge,
      sanitizedCurrentAge + 1,
      VALIDATION_BOUNDS.retirementAge.max
    ),
    annualIncome: clamp(inputs.annualIncome, 0, VALIDATION_BOUNDS.amounts.max),
    savings: {
      rrsp: clamp(inputs.savings.rrsp, 0, VALIDATION_BOUNDS.amounts.max),
      tfsa: clamp(inputs.savings.tfsa, 0, VALIDATION_BOUNDS.amounts.max),
      nonRegistered: clamp(inputs.savings.nonRegistered, 0, VALIDATION_BOUNDS.amounts.max),
    },
    contributions: {
      rrsp: clamp(
        inputs.contributions.rrsp,
        VALIDATION_BOUNDS.monthlyContribution.min,
        VALIDATION_BOUNDS.monthlyContribution.max
      ),
      tfsa: clamp(
        inputs.contributions.tfsa,
        VALIDATION_BOUNDS.monthlyContribution.min,
        VALIDATION_BOUNDS.monthlyContribution.max
      ),
      nonRegistered: clamp(
        inputs.contributions.nonRegistered,
        VALIDATION_BOUNDS.monthlyContribution.min,
        VALIDATION_BOUNDS.monthlyContribution.max
      ),
    },
    annualRetirementSpending: clamp(
      inputs.annualRetirementSpending,
      VALIDATION_BOUNDS.annualRetirementSpending.min,
      VALIDATION_BOUNDS.annualRetirementSpending.max
    ),
  }
}
