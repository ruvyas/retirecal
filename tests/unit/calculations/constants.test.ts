import { describe, it, expect } from 'vitest'
import {
  DEFAULT_INFLATION_RATE,
  DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE,
  DEFAULT_PRE_RETIREMENT_RETURN_MODERATE,
  DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE,
  DEFAULT_RETIREMENT_RETURN,
  DEFAULT_LIFE_EXPECTANCY,
  DEFAULT_WITHDRAWAL_TAX_RATE,
  VALIDATION_BOUNDS,
} from '@/lib/calculations/constants'

describe('Constants', () => {
  it('DEFAULT_INFLATION_RATE is 2.0%', () => {
    expect(DEFAULT_INFLATION_RATE).toBe(0.02)
  })

  it('DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE is 4.0%', () => {
    expect(DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE).toBe(0.04)
  })

  it('DEFAULT_PRE_RETIREMENT_RETURN_MODERATE is 5.5%', () => {
    expect(DEFAULT_PRE_RETIREMENT_RETURN_MODERATE).toBe(0.055)
  })

  it('DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE is 7.0%', () => {
    expect(DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE).toBe(0.07)
  })

  it('DEFAULT_RETIREMENT_RETURN is 3.5%', () => {
    expect(DEFAULT_RETIREMENT_RETURN).toBe(0.035)
  })

  it('DEFAULT_LIFE_EXPECTANCY is 95 years', () => {
    expect(DEFAULT_LIFE_EXPECTANCY).toBe(95)
  })

  it('DEFAULT_WITHDRAWAL_TAX_RATE is 25%', () => {
    expect(DEFAULT_WITHDRAWAL_TAX_RATE).toBe(0.25)
  })
})

describe('Constants relationships', () => {
  it('conservative return is less than moderate return', () => {
    expect(DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE).toBeLessThan(
      DEFAULT_PRE_RETIREMENT_RETURN_MODERATE
    )
  })

  it('moderate return is less than aggressive return', () => {
    expect(DEFAULT_PRE_RETIREMENT_RETURN_MODERATE).toBeLessThan(
      DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE
    )
  })

  it('retirement return is less than conservative pre-retirement return', () => {
    expect(DEFAULT_RETIREMENT_RETURN).toBeLessThan(DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE)
  })
})

describe('VALIDATION_BOUNDS', () => {
  it('has age bounds defined', () => {
    expect(VALIDATION_BOUNDS.age.min).toBe(18)
    expect(VALIDATION_BOUNDS.age.max).toBe(100)
  })

  it('has retirement age bounds defined', () => {
    expect(VALIDATION_BOUNDS.retirementAge.min).toBe(19)
    expect(VALIDATION_BOUNDS.retirementAge.max).toBe(100)
  })

  it('has amounts bounds defined', () => {
    expect(VALIDATION_BOUNDS.amounts.min).toBe(0)
    expect(VALIDATION_BOUNDS.amounts.max).toBe(100_000_000)
  })

  it('has rates bounds defined', () => {
    expect(VALIDATION_BOUNDS.rates.min).toBe(0)
    expect(VALIDATION_BOUNDS.rates.max).toBe(0.25)
  })

  it('has life expectancy bounds defined', () => {
    expect(VALIDATION_BOUNDS.lifeExpectancy.min).toBe(50)
    expect(VALIDATION_BOUNDS.lifeExpectancy.max).toBe(120)
  })
})
