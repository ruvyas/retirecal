import { describe, it, expect } from 'vitest'
import { estimateAfterTaxAmount } from '@/lib/calculations/tax'

describe('estimateAfterTaxAmount', () => {
  describe('standard calculations', () => {
    it('applies default 25% tax rate', () => {
      // $1000 gross - 25% tax = $750 after tax
      const result = estimateAfterTaxAmount(1000)
      expect(result).toBe(750)
    })

    it('applies custom tax rate', () => {
      // $1000 gross - 30% tax = $700 after tax
      const result = estimateAfterTaxAmount(1000, 0.3)
      expect(result).toBe(700)
    })

    it('returns full amount for 0% tax rate', () => {
      const result = estimateAfterTaxAmount(1000, 0)
      expect(result).toBe(1000)
    })

    it('returns 0 for 0 gross amount', () => {
      const result = estimateAfterTaxAmount(0)
      expect(result).toBe(0)
    })

    it('rounds to 2 decimal places', () => {
      // $333.33 * 0.75 = 249.9975 -> 250.00
      const result = estimateAfterTaxAmount(333.33)
      expect(result).toBe(250)
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative gross amount', () => {
      const result = estimateAfterTaxAmount(-1000)
      expect(result).toBe(0)
    })

    it('returns 0 for negative tax rate', () => {
      const result = estimateAfterTaxAmount(1000, -0.25)
      expect(result).toBe(0)
    })

    it('returns 0 for tax rate greater than 1 (100%)', () => {
      const result = estimateAfterTaxAmount(1000, 1.5)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN gross amount', () => {
      const result = estimateAfterTaxAmount(NaN)
      expect(result).toBe(0)
    })

    it('returns 0 for Infinity gross amount', () => {
      const result = estimateAfterTaxAmount(Infinity)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN tax rate', () => {
      const result = estimateAfterTaxAmount(1000, NaN)
      expect(result).toBe(0)
    })
  })

  describe('boundary cases', () => {
    it('handles 100% tax rate (returns 0)', () => {
      const result = estimateAfterTaxAmount(1000, 1)
      expect(result).toBe(0)
    })

    it('handles very small amounts', () => {
      const result = estimateAfterTaxAmount(0.01, 0.25)
      expect(result).toBe(0.01) // rounds to 0.01
    })

    it('handles very large amounts', () => {
      const result = estimateAfterTaxAmount(1000000000, 0.25)
      expect(result).toBe(750000000)
    })
  })
})
