import { describe, it, expect } from 'vitest'
import {
  validateCurrentAge,
  validateRetirementAge,
  validateCurrencyAmount,
  validateSavingsBreakdown,
  validateInputs,
  areInputsValid,
  sanitizeInputs,
  validateDecimalPrecision,
} from '@/lib/utils/validators'
import type { CalculatorInputs } from '@/lib/types/calculator'

const validInputs: CalculatorInputs = {
  currentAge: 30,
  retirementAge: 65,
  annualIncome: 75000,
  savings: { rrsp: 50000, tfsa: 30000, nonRegistered: 20000 },
  monthlyContribution: 500,
  annualRetirementSpending: 50000,
}

describe('validateCurrentAge', () => {
  describe('valid ages', () => {
    it('returns undefined for minimum valid age (18)', () => {
      expect(validateCurrentAge(18)).toBeUndefined()
    })

    it('returns undefined for typical age (30)', () => {
      expect(validateCurrentAge(30)).toBeUndefined()
    })

    it('returns undefined for maximum valid age (99)', () => {
      expect(validateCurrentAge(99)).toBeUndefined()
    })
  })

  describe('invalid ages', () => {
    it('returns error for age below 18', () => {
      expect(validateCurrentAge(17)).toContain('at least 18')
    })

    it('returns error for age at 100', () => {
      expect(validateCurrentAge(100)).toContain('less than 100')
    })

    it('returns error for negative age', () => {
      expect(validateCurrentAge(-5)).toContain('at least 18')
    })

    it('returns error for non-integer values', () => {
      expect(validateCurrentAge(30.5)).toContain('whole number')
    })

    it('returns error for NaN', () => {
      expect(validateCurrentAge(NaN)).toContain('valid')
    })

    it('returns error for Infinity', () => {
      expect(validateCurrentAge(Infinity)).toContain('valid')
    })

    it('returns error for negative Infinity', () => {
      expect(validateCurrentAge(-Infinity)).toContain('valid')
    })
  })
})

describe('validateRetirementAge', () => {
  describe('valid retirement ages', () => {
    it('returns undefined when retirement age > current age', () => {
      expect(validateRetirementAge(65, 30)).toBeUndefined()
    })

    it('returns undefined for minimum valid (currentAge + 1)', () => {
      expect(validateRetirementAge(31, 30)).toBeUndefined()
    })

    it('returns undefined for maximum valid (100)', () => {
      expect(validateRetirementAge(100, 30)).toBeUndefined()
    })

    it('handles edge case: current age 99, retirement 100', () => {
      expect(validateRetirementAge(100, 99)).toBeUndefined()
    })
  })

  describe('invalid retirement ages', () => {
    it('returns error when retirement age equals current age', () => {
      expect(validateRetirementAge(30, 30)).toContain('at least 31')
    })

    it('returns error when retirement age < current age', () => {
      expect(validateRetirementAge(29, 30)).toContain('at least 31')
    })

    it('returns error when retirement age > 100', () => {
      expect(validateRetirementAge(101, 30)).toContain('at most 100')
    })

    it('returns error for non-integer values', () => {
      expect(validateRetirementAge(65.5, 30)).toContain('whole number')
    })

    it('returns error for NaN', () => {
      expect(validateRetirementAge(NaN, 30)).toContain('valid')
    })

    it('returns error for Infinity', () => {
      expect(validateRetirementAge(Infinity, 30)).toContain('valid')
    })
  })
})

describe('validateCurrencyAmount', () => {
  describe('valid amounts', () => {
    it('returns undefined for zero', () => {
      expect(validateCurrencyAmount(0, 'Test')).toBeUndefined()
    })

    it('returns undefined for typical amount', () => {
      expect(validateCurrencyAmount(50000, 'Test')).toBeUndefined()
    })

    it('returns undefined for maximum amount (100M)', () => {
      expect(validateCurrencyAmount(100_000_000, 'Test')).toBeUndefined()
    })
  })

  describe('invalid amounts', () => {
    it('returns error for negative amounts', () => {
      expect(validateCurrencyAmount(-1, 'Income')).toContain('cannot be negative')
    })

    it('returns error for amounts exceeding default max', () => {
      expect(validateCurrencyAmount(100_000_001, 'Income')).toContain('at most')
    })

    it('respects custom max parameter', () => {
      expect(validateCurrencyAmount(101_000, 'Contribution', 100_000)).toContain('at most')
    })

    it('allows amounts within custom max', () => {
      expect(validateCurrencyAmount(100_000, 'Contribution', 100_000)).toBeUndefined()
    })

    it('returns error for NaN', () => {
      expect(validateCurrencyAmount(NaN, 'Test')).toContain('valid')
    })

    it('returns error for Infinity', () => {
      expect(validateCurrencyAmount(Infinity, 'Test')).toContain('valid')
    })

    it('includes field name in error message (lowercase)', () => {
      expect(validateCurrencyAmount(NaN, 'Annual Income')).toContain('annual income')
    })
  })
})

describe('validateSavingsBreakdown', () => {
  it('returns undefined for valid savings', () => {
    const savings = { rrsp: 50000, tfsa: 30000, nonRegistered: 20000 }
    expect(validateSavingsBreakdown(savings)).toBeUndefined()
  })

  it('returns undefined for all zero savings', () => {
    const savings = { rrsp: 0, tfsa: 0, nonRegistered: 0 }
    expect(validateSavingsBreakdown(savings)).toBeUndefined()
  })

  it('returns error for negative RRSP', () => {
    const savings = { rrsp: -100, tfsa: 30000, nonRegistered: 20000 }
    const errors = validateSavingsBreakdown(savings)
    expect(errors?.rrsp).toContain('negative')
    expect(errors?.tfsa).toBeUndefined()
    expect(errors?.nonRegistered).toBeUndefined()
  })

  it('returns error for negative TFSA', () => {
    const savings = { rrsp: 50000, tfsa: -100, nonRegistered: 20000 }
    const errors = validateSavingsBreakdown(savings)
    expect(errors?.tfsa).toContain('negative')
  })

  it('returns error for negative non-registered', () => {
    const savings = { rrsp: 50000, tfsa: 30000, nonRegistered: -100 }
    const errors = validateSavingsBreakdown(savings)
    expect(errors?.nonRegistered).toContain('negative')
  })

  it('returns multiple errors when multiple fields invalid', () => {
    const savings = { rrsp: -100, tfsa: -200, nonRegistered: -300 }
    const errors = validateSavingsBreakdown(savings)
    expect(errors?.rrsp).toBeDefined()
    expect(errors?.tfsa).toBeDefined()
    expect(errors?.nonRegistered).toBeDefined()
  })
})

describe('validateInputs', () => {
  it('returns empty object for valid inputs', () => {
    const errors = validateInputs(validInputs)
    expect(errors).toEqual({})
  })

  it('validates currentAge', () => {
    const inputs = { ...validInputs, currentAge: 10 }
    const errors = validateInputs(inputs)
    expect(errors.currentAge).toBeDefined()
  })

  it('validates retirementAge', () => {
    const inputs = { ...validInputs, retirementAge: 25 } // Less than currentAge
    const errors = validateInputs(inputs)
    expect(errors.retirementAge).toBeDefined()
  })

  it('validates annualIncome', () => {
    const inputs = { ...validInputs, annualIncome: -1000 }
    const errors = validateInputs(inputs)
    expect(errors.annualIncome).toBeDefined()
  })

  it('validates savings breakdown', () => {
    const inputs = {
      ...validInputs,
      savings: { rrsp: -100, tfsa: 30000, nonRegistered: 20000 },
    }
    const errors = validateInputs(inputs)
    expect(errors.savings?.rrsp).toBeDefined()
  })

  it('validates monthlyContribution with 100K max', () => {
    const inputs = { ...validInputs, monthlyContribution: 101_000 }
    const errors = validateInputs(inputs)
    expect(errors.monthlyContribution).toBeDefined()
  })

  it('validates annualRetirementSpending with 10M max', () => {
    const inputs = { ...validInputs, annualRetirementSpending: 10_000_001 }
    const errors = validateInputs(inputs)
    expect(errors.annualRetirementSpending).toBeDefined()
  })

  it('returns all validation errors at once', () => {
    const invalidInputs: CalculatorInputs = {
      currentAge: 10,
      retirementAge: 5,
      annualIncome: -1000,
      savings: { rrsp: -100, tfsa: -100, nonRegistered: -100 },
      monthlyContribution: -500,
      annualRetirementSpending: -1000,
    }
    const errors = validateInputs(invalidInputs)
    expect(errors.currentAge).toBeDefined()
    expect(errors.retirementAge).toBeDefined()
    expect(errors.annualIncome).toBeDefined()
    expect(errors.savings).toBeDefined()
    expect(errors.monthlyContribution).toBeDefined()
    expect(errors.annualRetirementSpending).toBeDefined()
  })
})

describe('areInputsValid', () => {
  it('returns true for valid inputs', () => {
    expect(areInputsValid(validInputs)).toBe(true)
  })

  it('returns false when currentAge is invalid', () => {
    const inputs = { ...validInputs, currentAge: 10 }
    expect(areInputsValid(inputs)).toBe(false)
  })

  it('returns false when retirementAge is invalid', () => {
    const inputs = { ...validInputs, retirementAge: 25 }
    expect(areInputsValid(inputs)).toBe(false)
  })

  it('returns false when any amount is negative', () => {
    const inputs = { ...validInputs, annualIncome: -1 }
    expect(areInputsValid(inputs)).toBe(false)
  })

  it('returns false when savings has invalid values', () => {
    const inputs = {
      ...validInputs,
      savings: { rrsp: -1, tfsa: 0, nonRegistered: 0 },
    }
    expect(areInputsValid(inputs)).toBe(false)
  })
})

describe('sanitizeInputs', () => {
  it('returns valid inputs unchanged', () => {
    const result = sanitizeInputs(validInputs)
    expect(result).toEqual(validInputs)
  })

  it('clamps currentAge below minimum to 18', () => {
    const inputs = { ...validInputs, currentAge: 10 }
    const result = sanitizeInputs(inputs)
    expect(result.currentAge).toBe(18)
  })

  it('clamps currentAge above maximum to 99', () => {
    const inputs = { ...validInputs, currentAge: 150 }
    const result = sanitizeInputs(inputs)
    expect(result.currentAge).toBe(99)
  })

  it('ensures retirementAge is at least currentAge + 1', () => {
    const inputs = { ...validInputs, currentAge: 30, retirementAge: 25 }
    const result = sanitizeInputs(inputs)
    expect(result.retirementAge).toBe(31)
  })

  it('clamps retirementAge above maximum to 100', () => {
    const inputs = { ...validInputs, retirementAge: 150 }
    const result = sanitizeInputs(inputs)
    expect(result.retirementAge).toBe(100)
  })

  it('clamps negative amounts to 0', () => {
    const inputs = {
      ...validInputs,
      annualIncome: -1000,
      monthlyContribution: -500,
      annualRetirementSpending: -2000,
    }
    const result = sanitizeInputs(inputs)
    expect(result.annualIncome).toBe(0)
    expect(result.monthlyContribution).toBe(0)
    expect(result.annualRetirementSpending).toBe(0)
  })

  it('clamps negative savings to 0', () => {
    const inputs = {
      ...validInputs,
      savings: { rrsp: -100, tfsa: -200, nonRegistered: -300 },
    }
    const result = sanitizeInputs(inputs)
    expect(result.savings.rrsp).toBe(0)
    expect(result.savings.tfsa).toBe(0)
    expect(result.savings.nonRegistered).toBe(0)
  })

  it('clamps monthlyContribution above 100K to 100K', () => {
    const inputs = { ...validInputs, monthlyContribution: 200_000 }
    const result = sanitizeInputs(inputs)
    expect(result.monthlyContribution).toBe(100_000)
  })

  it('clamps annualRetirementSpending above 10M to 10M', () => {
    const inputs = { ...validInputs, annualRetirementSpending: 20_000_000 }
    const result = sanitizeInputs(inputs)
    expect(result.annualRetirementSpending).toBe(10_000_000)
  })

  it('handles NaN values by returning minimum', () => {
    const inputs = {
      ...validInputs,
      currentAge: NaN,
      retirementAge: NaN,
      annualIncome: NaN,
    }
    const result = sanitizeInputs(inputs)
    expect(Number.isFinite(result.currentAge)).toBe(true)
    expect(result.currentAge).toBe(18)
    expect(Number.isFinite(result.retirementAge)).toBe(true)
    expect(result.retirementAge).toBe(19) // currentAge + 1
    expect(Number.isFinite(result.annualIncome)).toBe(true)
    expect(result.annualIncome).toBe(0)
  })

  it('handles Infinity values by clamping', () => {
    const inputs = { ...validInputs, annualIncome: Infinity }
    const result = sanitizeInputs(inputs)
    expect(Number.isFinite(result.annualIncome)).toBe(true)
  })

  it('maintains relationship: retirementAge > currentAge after sanitization', () => {
    const inputs = { ...validInputs, currentAge: 50, retirementAge: 40 }
    const result = sanitizeInputs(inputs)
    expect(result.retirementAge).toBeGreaterThan(result.currentAge)
  })
})

describe('validateDecimalPrecision', () => {
  describe('valid values (at most 3 decimal places)', () => {
    it('returns undefined for whole number', () => {
      expect(validateDecimalPrecision(1, 'Rate')).toBeUndefined()
    })

    it('returns undefined for 1 decimal place', () => {
      expect(validateDecimalPrecision(0.5, 'Rate')).toBeUndefined()
    })

    it('returns undefined for 2 decimal places', () => {
      expect(validateDecimalPrecision(0.25, 'Rate')).toBeUndefined()
    })

    it('returns undefined for 3 decimal places', () => {
      expect(validateDecimalPrecision(0.055, 'Rate')).toBeUndefined()
    })

    it('returns undefined for 0', () => {
      expect(validateDecimalPrecision(0, 'Rate')).toBeUndefined()
    })

    it('returns undefined for 0.035 (3 decimals)', () => {
      expect(validateDecimalPrecision(0.035, 'Rate')).toBeUndefined()
    })
  })

  describe('invalid values (more than 3 decimal places)', () => {
    it('returns error for 4 decimal places', () => {
      expect(validateDecimalPrecision(0.0555, 'Rate')).toContain('at most 3 decimal places')
    })

    it('returns error for 5 decimal places', () => {
      expect(validateDecimalPrecision(0.05555, 'Rate')).toContain('at most 3 decimal places')
    })

    it('includes field name in error message', () => {
      expect(validateDecimalPrecision(0.0555, 'Inflation Rate')).toContain('Inflation Rate')
    })
  })

  describe('custom maxDecimals parameter', () => {
    it('allows 2 decimals when maxDecimals=2', () => {
      expect(validateDecimalPrecision(0.05, 'Rate', 2)).toBeUndefined()
    })

    it('rejects 3 decimals when maxDecimals=2', () => {
      expect(validateDecimalPrecision(0.055, 'Rate', 2)).toContain('at most 2 decimal places')
    })

    it('allows 4 decimals when maxDecimals=4', () => {
      expect(validateDecimalPrecision(0.0555, 'Rate', 4)).toBeUndefined()
    })
  })

  describe('floating point edge cases', () => {
    it('handles values from floating point arithmetic', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const result = 0.1 + 0.2
      expect(validateDecimalPrecision(result, 'Rate')).toBeUndefined()
    })

    it('handles very small valid values', () => {
      expect(validateDecimalPrecision(0.001, 'Rate')).toBeUndefined()
    })

    it('handles negative values with valid precision', () => {
      expect(validateDecimalPrecision(-0.055, 'Rate')).toBeUndefined()
    })

    it('rejects negative values with invalid precision', () => {
      expect(validateDecimalPrecision(-0.0555, 'Rate')).toContain('at most 3 decimal places')
    })

    it('handles division results', () => {
      // 5.5 / 100 = 0.055 (typical percentage conversion)
      const result = 5.5 / 100
      expect(validateDecimalPrecision(result, 'Rate')).toBeUndefined()
    })
  })
})
