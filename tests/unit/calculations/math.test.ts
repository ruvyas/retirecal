import { describe, it, expect } from 'vitest'
import {
  roundTo2Decimals,
  isValidPositiveNumber,
  isValidRate,
  isValidReturnRate,
} from '@/lib/calculations/math'

describe('roundTo2Decimals', () => {
  it('rounds down when third decimal < 5', () => {
    expect(roundTo2Decimals(1.234)).toBe(1.23)
  })

  it('rounds up when third decimal >= 5', () => {
    expect(roundTo2Decimals(1.235)).toBe(1.24)
    expect(roundTo2Decimals(1.236)).toBe(1.24)
  })

  it('handles whole numbers', () => {
    expect(roundTo2Decimals(100)).toBe(100)
  })

  it('handles numbers with one decimal', () => {
    expect(roundTo2Decimals(1.5)).toBe(1.5)
  })

  it('handles negative numbers', () => {
    expect(roundTo2Decimals(-1.234)).toBe(-1.23)
  })

  it('handles zero', () => {
    expect(roundTo2Decimals(0)).toBe(0)
  })
})

describe('isValidPositiveNumber', () => {
  it('returns true for positive numbers', () => {
    expect(isValidPositiveNumber(100)).toBe(true)
    expect(isValidPositiveNumber(0.01)).toBe(true)
  })

  it('returns true for zero', () => {
    expect(isValidPositiveNumber(0)).toBe(true)
  })

  it('returns false for negative numbers', () => {
    expect(isValidPositiveNumber(-1)).toBe(false)
    expect(isValidPositiveNumber(-0.01)).toBe(false)
  })

  it('returns false for NaN', () => {
    expect(isValidPositiveNumber(NaN)).toBe(false)
  })

  it('returns false for Infinity', () => {
    expect(isValidPositiveNumber(Infinity)).toBe(false)
    expect(isValidPositiveNumber(-Infinity)).toBe(false)
  })
})

describe('isValidRate', () => {
  it('returns true for rates between 0 and 1', () => {
    expect(isValidRate(0)).toBe(true)
    expect(isValidRate(0.25)).toBe(true)
    expect(isValidRate(0.5)).toBe(true)
    expect(isValidRate(1)).toBe(true)
  })

  it('returns false for rates greater than 1', () => {
    expect(isValidRate(1.01)).toBe(false)
    expect(isValidRate(2)).toBe(false)
  })

  it('returns false for negative rates', () => {
    expect(isValidRate(-0.1)).toBe(false)
  })

  it('returns false for NaN', () => {
    expect(isValidRate(NaN)).toBe(false)
  })

  it('returns false for Infinity', () => {
    expect(isValidRate(Infinity)).toBe(false)
  })
})

describe('isValidReturnRate', () => {
  it('returns true for non-negative rates', () => {
    expect(isValidReturnRate(0)).toBe(true)
    expect(isValidReturnRate(0.05)).toBe(true)
    expect(isValidReturnRate(0.15)).toBe(true)
  })

  it('returns false for negative rates', () => {
    expect(isValidReturnRate(-0.05)).toBe(false)
  })

  it('returns false for NaN', () => {
    expect(isValidReturnRate(NaN)).toBe(false)
  })

  it('returns false for Infinity', () => {
    expect(isValidReturnRate(Infinity)).toBe(false)
  })
})
