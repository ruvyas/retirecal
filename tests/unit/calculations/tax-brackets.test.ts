/**
 * Unit tests for Canadian federal and provincial tax bracket calculations
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBracketTax,
  calculateCanadianTax,
  calculateAfterTaxWithBrackets,
  getMarginalRate,
} from '@/lib/calculations/tax'
import { FEDERAL_BRACKETS, PROVINCIAL_BRACKETS } from '@/lib/calculations/tax-brackets'

describe('calculateBracketTax', () => {
  describe('federal brackets', () => {
    it('calculates tax for income in first bracket only ($50,000)', () => {
      // $50,000 at 14% = $7,000
      const result = calculateBracketTax(50000, FEDERAL_BRACKETS)
      expect(result).toBeCloseTo(7000, 0)
    })

    it('calculates tax spanning two brackets ($80,000)', () => {
      // First bracket: $58,523 × 14% = $8,193.22
      // Second bracket: ($80,000 - $58,523) × 20.5% = $4,402.79
      // Total: ~$12,596
      const result = calculateBracketTax(80000, FEDERAL_BRACKETS)
      expect(result).toBeCloseTo(12596, 0)
    })

    it('calculates tax spanning multiple brackets ($150,000)', () => {
      // First: $58,523 × 14% = $8,193.22
      // Second: $58,522 × 20.5% = $11,997.01
      // Third: ($150,000 - $117,045) × 26% = $8,568.30
      // Total: ~$28,758.53
      const result = calculateBracketTax(150000, FEDERAL_BRACKETS)
      expect(result).toBeCloseTo(28759, 0)
    })

    it('calculates tax for top bracket income ($300,000)', () => {
      // All brackets apply up to $253,414, then 33% on remainder
      const result = calculateBracketTax(300000, FEDERAL_BRACKETS)
      expect(result).toBeGreaterThan(70000)
      expect(result).toBeLessThan(100000)
    })

    it('returns 0 for zero income', () => {
      expect(calculateBracketTax(0, FEDERAL_BRACKETS)).toBe(0)
    })

    it('returns 0 for negative income', () => {
      expect(calculateBracketTax(-50000, FEDERAL_BRACKETS)).toBe(0)
    })

    it('returns 0 for empty brackets array', () => {
      expect(calculateBracketTax(50000, [])).toBe(0)
    })

    it('handles very small income amounts', () => {
      const result = calculateBracketTax(100, FEDERAL_BRACKETS)
      expect(result).toBeCloseTo(14, 0) // 100 × 14%
    })
  })

  describe('provincial brackets (Ontario)', () => {
    it('calculates Ontario tax for income in first bracket ($40,000)', () => {
      // $40,000 × 5.05% = $2,020
      const result = calculateBracketTax(40000, PROVINCIAL_BRACKETS.ON)
      expect(result).toBeCloseTo(2020, 0)
    })

    it('calculates Ontario tax for middle income ($100,000)', () => {
      // First: $52,886 × 5.05% = $2,670.74
      // Second: ($100,000 - $52,886) × 9.15% = $4,310.93
      // Total: ~$6,981.67
      const result = calculateBracketTax(100000, PROVINCIAL_BRACKETS.ON)
      expect(result).toBeCloseTo(6982, 0)
    })

    it('calculates Ontario tax for high income ($250,000)', () => {
      const result = calculateBracketTax(250000, PROVINCIAL_BRACKETS.ON)
      // Ontario rates max out at 13.16%, so tax should be reasonable
      expect(result).toBeGreaterThan(20000)
      expect(result).toBeLessThan(35000)
    })
  })

  describe('provincial brackets (Alberta - simplified)', () => {
    it('calculates Alberta tax with different bracket structure', () => {
      // Alberta has 8% for first $60,000
      const result = calculateBracketTax(50000, PROVINCIAL_BRACKETS.AB)
      expect(result).toBeCloseTo(4000, 0) // 50,000 × 8%
    })
  })

  describe('provincial brackets (Quebec - highest rates)', () => {
    it('calculates Quebec tax for middle income', () => {
      // Quebec has 14% for first bracket
      const result = calculateBracketTax(50000, PROVINCIAL_BRACKETS.QC)
      expect(result).toBeCloseTo(7000, 0) // 50,000 × 14%
    })
  })
})

describe('getMarginalRate', () => {
  describe('federal brackets', () => {
    it('returns first bracket rate for low income ($50,000)', () => {
      // $50,000 is in first bracket (0 - $58,523) at 14%
      expect(getMarginalRate(50000, FEDERAL_BRACKETS)).toBe(0.14)
    })

    it('returns second bracket rate for middle income ($80,000)', () => {
      // $80,000 is in second bracket ($58,523 - $117,045) at 20.5%
      expect(getMarginalRate(80000, FEDERAL_BRACKETS)).toBe(0.205)
    })

    it('returns third bracket rate ($150,000)', () => {
      // $150,000 is in third bracket ($117,045 - $181,440) at 26%
      expect(getMarginalRate(150000, FEDERAL_BRACKETS)).toBe(0.26)
    })

    it('returns top bracket rate for high income ($300,000)', () => {
      // $300,000 is in top bracket ($258,482+) at 33%
      expect(getMarginalRate(300000, FEDERAL_BRACKETS)).toBe(0.33)
    })

    it('returns 0 for zero income', () => {
      expect(getMarginalRate(0, FEDERAL_BRACKETS)).toBe(0)
    })

    it('returns 0 for negative income', () => {
      expect(getMarginalRate(-50000, FEDERAL_BRACKETS)).toBe(0)
    })

    it('returns 0 for empty brackets array', () => {
      expect(getMarginalRate(50000, [])).toBe(0)
    })

    it('handles income at exact bracket boundary', () => {
      // At exactly $58,523 should be in second bracket
      expect(getMarginalRate(58523, FEDERAL_BRACKETS)).toBe(0.205)
    })
  })

  describe('provincial brackets', () => {
    it('returns correct Ontario marginal rate', () => {
      // $100,000 is in second Ontario bracket ($52,886 - $105,775) at 9.15%
      expect(getMarginalRate(100000, PROVINCIAL_BRACKETS.ON)).toBe(0.0915)
    })

    it('returns correct Quebec marginal rate (highest first bracket)', () => {
      // $50,000 is in first Quebec bracket at 14%
      expect(getMarginalRate(50000, PROVINCIAL_BRACKETS.QC)).toBe(0.14)
    })

    it('returns correct Alberta marginal rate (lowest rates)', () => {
      // $50,000 is in first Alberta bracket at 8%
      expect(getMarginalRate(50000, PROVINCIAL_BRACKETS.AB)).toBe(0.08)
    })
  })
})

describe('calculateCanadianTax', () => {
  it('combines federal and Ontario provincial tax correctly', () => {
    const result = calculateCanadianTax(100000, 'ON')

    expect(result.federal).toBeGreaterThan(0)
    expect(result.provincial).toBeGreaterThan(0)
    expect(result.total).toBe(result.federal + result.provincial)
    expect(result.effectiveRate).toBeCloseTo(result.total / 100000, 2)
  })

  it('returns correct marginal rates for $100k Ontario income', () => {
    const result = calculateCanadianTax(100000, 'ON')

    // $100k falls in federal second bracket (20.5%) and Ontario second bracket (9.15%)
    expect(result.federalMarginalRate).toBe(0.205)
    expect(result.provincialMarginalRate).toBe(0.0915)
    expect(result.marginalRate).toBe(0.205 + 0.0915)
  })

  it('returns correct marginal rates for high income', () => {
    const result = calculateCanadianTax(300000, 'ON')

    // $300k in federal top bracket (33%) and Ontario top bracket (13.16%)
    expect(result.federalMarginalRate).toBe(0.33)
    expect(result.provincialMarginalRate).toBe(0.1316)
    expect(result.marginalRate).toBeCloseTo(0.33 + 0.1316, 4)
  })

  it('calculates correct effective rate for different provinces', () => {
    const ontarioResult = calculateCanadianTax(75000, 'ON')
    const quebecResult = calculateCanadianTax(75000, 'QC')
    const nunavutResult = calculateCanadianTax(75000, 'NU')

    // Quebec should have higher effective rate (higher provincial rates)
    expect(quebecResult.effectiveRate).toBeGreaterThan(ontarioResult.effectiveRate)
    // Nunavut should have lower effective rate (lowest provincial rates in Canada)
    expect(nunavutResult.effectiveRate).toBeLessThan(ontarioResult.effectiveRate)
  })

  it('returns zero for zero income', () => {
    const result = calculateCanadianTax(0, 'ON')
    expect(result.federal).toBe(0)
    expect(result.provincial).toBe(0)
    expect(result.total).toBe(0)
    expect(result.effectiveRate).toBe(0)
    expect(result.federalMarginalRate).toBe(0)
    expect(result.provincialMarginalRate).toBe(0)
    expect(result.marginalRate).toBe(0)
  })

  it('returns zero for negative income', () => {
    const result = calculateCanadianTax(-50000, 'ON')
    expect(result.total).toBe(0)
    expect(result.marginalRate).toBe(0)
  })

  it('calculates tax for all provinces', () => {
    const provinces = [
      'AB',
      'BC',
      'MB',
      'NB',
      'NL',
      'NS',
      'NT',
      'NU',
      'ON',
      'PE',
      'QC',
      'SK',
      'YT',
    ] as const

    for (const province of provinces) {
      const result = calculateCanadianTax(100000, province)
      expect(result.federal).toBeGreaterThan(0)
      expect(result.provincial).toBeGreaterThan(0)
      expect(result.effectiveRate).toBeGreaterThan(0.15) // At least 15%
      expect(result.effectiveRate).toBeLessThan(0.5) // Less than 50%
    }
  })

  it('effective rate increases with income', () => {
    const lowIncomeResult = calculateCanadianTax(40000, 'ON')
    const midIncomeResult = calculateCanadianTax(100000, 'ON')
    const highIncomeResult = calculateCanadianTax(300000, 'ON')

    expect(midIncomeResult.effectiveRate).toBeGreaterThan(lowIncomeResult.effectiveRate)
    expect(highIncomeResult.effectiveRate).toBeGreaterThan(midIncomeResult.effectiveRate)
  })
})

describe('calculateAfterTaxWithBrackets', () => {
  it('returns correct after-tax amount', () => {
    const grossAmount = 100000
    const result = calculateAfterTaxWithBrackets(grossAmount, 'ON')
    const { total } = calculateCanadianTax(grossAmount, 'ON')

    expect(result).toBeCloseTo(grossAmount - total, 2)
  })

  it('returns 0 for zero gross amount', () => {
    expect(calculateAfterTaxWithBrackets(0, 'ON')).toBe(0)
  })

  it('returns 0 for negative gross amount', () => {
    expect(calculateAfterTaxWithBrackets(-50000, 'ON')).toBe(0)
  })

  it('after-tax amount is always less than gross amount', () => {
    const testAmounts = [25000, 50000, 100000, 200000, 500000]

    for (const amount of testAmounts) {
      const afterTax = calculateAfterTaxWithBrackets(amount, 'ON')
      expect(afterTax).toBeLessThan(amount)
      expect(afterTax).toBeGreaterThan(0)
    }
  })
})

describe('tax bracket data integrity', () => {
  it('federal brackets are in ascending order', () => {
    for (let i = 1; i < FEDERAL_BRACKETS.length; i++) {
      expect(FEDERAL_BRACKETS[i].min).toBe(FEDERAL_BRACKETS[i - 1].max)
    }
  })

  it('all provincial brackets are in ascending order', () => {
    const provinces = Object.keys(PROVINCIAL_BRACKETS) as (keyof typeof PROVINCIAL_BRACKETS)[]

    for (const province of provinces) {
      const brackets = PROVINCIAL_BRACKETS[province]
      for (let i = 1; i < brackets.length; i++) {
        expect(brackets[i].min).toBe(brackets[i - 1].max)
      }
    }
  })

  it('federal brackets have highest bracket with null max', () => {
    const lastBracket = FEDERAL_BRACKETS[FEDERAL_BRACKETS.length - 1]
    expect(lastBracket.max).toBeNull()
  })

  it('all provincial brackets have highest bracket with null max', () => {
    const provinces = Object.keys(PROVINCIAL_BRACKETS) as (keyof typeof PROVINCIAL_BRACKETS)[]

    for (const province of provinces) {
      const brackets = PROVINCIAL_BRACKETS[province]
      const lastBracket = brackets[brackets.length - 1]
      expect(lastBracket.max).toBeNull()
    }
  })

  it('all rates are valid percentages (0 < rate < 1)', () => {
    for (const bracket of FEDERAL_BRACKETS) {
      expect(bracket.rate).toBeGreaterThan(0)
      expect(bracket.rate).toBeLessThan(1)
    }

    const provinces = Object.keys(PROVINCIAL_BRACKETS) as (keyof typeof PROVINCIAL_BRACKETS)[]
    for (const province of provinces) {
      for (const bracket of PROVINCIAL_BRACKETS[province]) {
        expect(bracket.rate).toBeGreaterThan(0)
        expect(bracket.rate).toBeLessThan(1)
      }
    }
  })
})
