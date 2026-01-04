import { describe, it, expect } from 'vitest'
import {
  calculateFutureValue,
  calculateContributionGrowth,
  calculateRetirementRunway,
  calculateInflationAdjustedRunway,
  calculateSustainableIncome,
} from '@/lib/calculations/retirement'

describe('calculateFutureValue', () => {
  describe('standard calculations', () => {
    it('calculates compound growth correctly: $100,000 @ 5% for 10 years = $162,889.46', () => {
      const result = calculateFutureValue(100000, 0.05, 10)
      expect(result).toBe(162889.46)
    })

    it('returns 0 for zero principal', () => {
      const result = calculateFutureValue(0, 0.05, 10)
      expect(result).toBe(0)
    })

    it('returns principal unchanged for zero rate', () => {
      const result = calculateFutureValue(100000, 0, 10)
      expect(result).toBe(100000)
    })

    it('returns principal unchanged for zero years', () => {
      const result = calculateFutureValue(100000, 0.05, 0)
      expect(result).toBe(100000)
    })

    it('rounds to 2 decimal places', () => {
      const result = calculateFutureValue(10000, 0.07, 5)
      // 10000 * (1.07)^5 = 14025.517307...
      expect(result).toBe(14025.52)
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative principal', () => {
      const result = calculateFutureValue(-100000, 0.05, 10)
      expect(result).toBe(0)
    })

    it('returns 0 for negative rate', () => {
      const result = calculateFutureValue(100000, -0.05, 10)
      expect(result).toBe(0)
    })

    it('returns 0 for negative years', () => {
      const result = calculateFutureValue(100000, 0.05, -10)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN inputs', () => {
      expect(calculateFutureValue(NaN, 0.05, 10)).toBe(0)
      expect(calculateFutureValue(100000, NaN, 10)).toBe(0)
      expect(calculateFutureValue(100000, 0.05, NaN)).toBe(0)
    })

    it('returns 0 for Infinity inputs', () => {
      expect(calculateFutureValue(Infinity, 0.05, 10)).toBe(0)
      expect(calculateFutureValue(100000, Infinity, 10)).toBe(0)
      expect(calculateFutureValue(100000, 0.05, Infinity)).toBe(0)
    })
  })
})

describe('calculateContributionGrowth', () => {
  describe('standard calculations', () => {
    it('calculates contribution growth correctly: $500/month @ 5% for 20 years = $205,516.83', () => {
      const result = calculateContributionGrowth(500, 0.05, 240)
      expect(result).toBe(205516.83)
    })

    it('returns 0 for zero contribution', () => {
      const result = calculateContributionGrowth(0, 0.05, 240)
      expect(result).toBe(0)
    })

    it('returns 0 for zero months', () => {
      const result = calculateContributionGrowth(500, 0.05, 0)
      expect(result).toBe(0)
    })

    it('returns sum of contributions for zero rate', () => {
      const result = calculateContributionGrowth(500, 0, 240)
      expect(result).toBe(120000) // 500 * 240
    })

    it('combined scenario: $50,000 initial + $300/month @ 5% for 25 years', () => {
      // Verify functions work together correctly
      const initialGrowth = calculateFutureValue(50000, 0.05, 25)
      const contributionGrowth = calculateContributionGrowth(300, 0.05, 300)
      const total = Math.round((initialGrowth + contributionGrowth) * 100) / 100

      // Initial: 50000 * (1.05)^25 = 169317.75
      expect(initialGrowth).toBe(169317.75)
      // Contributions: 300/month for 300 months at 5% = 178652.91
      expect(contributionGrowth).toBe(178652.91)
      // Total should be sum of both
      expect(total).toBe(347970.66)
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative contribution', () => {
      const result = calculateContributionGrowth(-500, 0.05, 240)
      expect(result).toBe(0)
    })

    it('returns 0 for negative rate', () => {
      const result = calculateContributionGrowth(500, -0.05, 240)
      expect(result).toBe(0)
    })

    it('returns 0 for negative months', () => {
      const result = calculateContributionGrowth(500, 0.05, -240)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN inputs', () => {
      expect(calculateContributionGrowth(NaN, 0.05, 240)).toBe(0)
      expect(calculateContributionGrowth(500, NaN, 240)).toBe(0)
      expect(calculateContributionGrowth(500, 0.05, NaN)).toBe(0)
    })
  })
})

describe('calculateRetirementRunway', () => {
  describe('standard calculations', () => {
    it('calculates runway correctly: $500,000 savings, $40,000/year, 3% return = ~15.7 years', () => {
      const result = calculateRetirementRunway(500000, 40000, 0.03)
      // Expected ~15.7 years, allowing for rounding
      expect(result).toBeGreaterThanOrEqual(15.5)
      expect(result).toBeLessThanOrEqual(15.9)
    })

    it('returns Infinity for zero spending', () => {
      const result = calculateRetirementRunway(500000, 0, 0.03)
      expect(result).toBe(Infinity)
    })

    it('returns 0 for zero savings', () => {
      const result = calculateRetirementRunway(0, 40000, 0.03)
      expect(result).toBe(0)
    })

    it('handles spending exceeding sustainable withdrawal (rapid depletion)', () => {
      // $100,000 savings, $50,000/year, 3% return
      // Sustainable withdrawal = $3,000/year, so savings will deplete
      const result = calculateRetirementRunway(100000, 50000, 0.03)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(3) // Should deplete in about 2 years
    })

    it('returns Infinity for very high savings vs low spending (sustainable)', () => {
      // $1,000,000 savings, $20,000/year, 5% return
      // Sustainable withdrawal = $50,000/year > $20,000 spending
      const result = calculateRetirementRunway(1000000, 20000, 0.05)
      expect(result).toBe(Infinity)
    })

    it('handles zero return rate as simple division', () => {
      const result = calculateRetirementRunway(100000, 25000, 0)
      expect(result).toBe(4) // 100000 / 25000
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative savings', () => {
      const result = calculateRetirementRunway(-500000, 40000, 0.03)
      expect(result).toBe(0)
    })

    it('returns 0 for negative spending', () => {
      const result = calculateRetirementRunway(500000, -40000, 0.03)
      expect(result).toBe(0)
    })

    it('returns 0 for negative return rate', () => {
      const result = calculateRetirementRunway(500000, 40000, -0.03)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN inputs', () => {
      expect(calculateRetirementRunway(NaN, 40000, 0.03)).toBe(0)
      expect(calculateRetirementRunway(500000, NaN, 0.03)).toBe(0)
      expect(calculateRetirementRunway(500000, 40000, NaN)).toBe(0)
    })
  })
})

describe('calculateInflationAdjustedRunway', () => {
  describe('standard calculations', () => {
    it('returns shorter runway than fixed-spending calculation due to inflation', () => {
      // Compare: fixed spending vs inflation-adjusted spending
      const fixedRunway = calculateRetirementRunway(500000, 40000, 0.04)
      const inflationRunway = calculateInflationAdjustedRunway(500000, 40000, 0.04, 0.02)

      // Inflation-adjusted should be shorter because withdrawals increase each year
      expect(inflationRunway).toBeLessThan(fixedRunway)
    })

    it('calculates runway with 4% return and 2% inflation (2% real return)', () => {
      // $500,000 savings, $40,000/year, 4% nominal, 2% inflation
      // Real return = (1.04/1.02) - 1 ≈ 1.96%
      const result = calculateInflationAdjustedRunway(500000, 40000, 0.04, 0.02)
      // Should be around 14-16 years with real return of ~2%
      expect(result).toBeGreaterThan(13)
      expect(result).toBeLessThan(17)
    })

    it('returns Infinity for zero spending', () => {
      const result = calculateInflationAdjustedRunway(500000, 0, 0.04, 0.02)
      expect(result).toBe(Infinity)
    })

    it('returns 0 for zero savings', () => {
      const result = calculateInflationAdjustedRunway(0, 40000, 0.04, 0.02)
      expect(result).toBe(0)
    })

    it('returns Infinity when real return sustains withdrawals indefinitely', () => {
      // $1,000,000 savings, $20,000/year, 5% nominal, 1% inflation
      // Real return = (1.05/1.01) - 1 ≈ 3.96%
      // Sustainable withdrawal = $1,000,000 * 0.0396 ≈ $39,600/year > $20,000
      const result = calculateInflationAdjustedRunway(1000000, 20000, 0.05, 0.01)
      expect(result).toBe(Infinity)
    })

    it('handles high inflation scenario (inflation > return)', () => {
      // $500,000 savings, $40,000/year, 3% return, 4% inflation
      // Real return is negative, so savings deplete faster
      const result = calculateInflationAdjustedRunway(500000, 40000, 0.03, 0.04)
      // Should deplete faster than simple division due to negative real return
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(13) // Less than 500000/40000 = 12.5 years
    })

    it('handles zero inflation as equivalent to fixed spending', () => {
      const fixedRunway = calculateRetirementRunway(500000, 40000, 0.04)
      const zeroInflationRunway = calculateInflationAdjustedRunway(500000, 40000, 0.04, 0)
      // Should be approximately equal (within rounding)
      expect(Math.abs(fixedRunway - zeroInflationRunway)).toBeLessThan(0.1)
    })

    it('handles zero return rate with inflation', () => {
      // $100,000 savings, $25,000/year, 0% return, 2% inflation
      // Real return is negative, simple division
      const result = calculateInflationAdjustedRunway(100000, 25000, 0, 0.02)
      expect(result).toBe(4) // 100000 / 25000
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative savings', () => {
      const result = calculateInflationAdjustedRunway(-500000, 40000, 0.04, 0.02)
      expect(result).toBe(0)
    })

    it('returns 0 for negative spending', () => {
      const result = calculateInflationAdjustedRunway(500000, -40000, 0.04, 0.02)
      expect(result).toBe(0)
    })

    it('returns 0 for negative return rate', () => {
      const result = calculateInflationAdjustedRunway(500000, 40000, -0.04, 0.02)
      expect(result).toBe(0)
    })

    it('returns 0 for negative inflation rate', () => {
      const result = calculateInflationAdjustedRunway(500000, 40000, 0.04, -0.02)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN inputs', () => {
      expect(calculateInflationAdjustedRunway(NaN, 40000, 0.04, 0.02)).toBe(0)
      expect(calculateInflationAdjustedRunway(500000, NaN, 0.04, 0.02)).toBe(0)
      expect(calculateInflationAdjustedRunway(500000, 40000, NaN, 0.02)).toBe(0)
      expect(calculateInflationAdjustedRunway(500000, 40000, 0.04, NaN)).toBe(0)
    })
  })
})

describe('calculateSustainableIncome', () => {
  describe('standard calculations', () => {
    it('calculates sustainable monthly income with standard values', () => {
      // $500,000 savings, 3.5% return, 30 years retirement
      const result = calculateSustainableIncome(500000, 0.035, 30)
      // Should be around $2,200/month
      expect(result).toBeGreaterThan(2000)
      expect(result).toBeLessThan(2500)
    })

    it('returns 0 for zero savings', () => {
      const result = calculateSustainableIncome(0, 0.035, 30)
      expect(result).toBe(0)
    })

    it('handles short retirement period (5 years)', () => {
      // $500,000 savings, 3.5% return, 5 years
      const result = calculateSustainableIncome(500000, 0.035, 5)
      // Should be higher monthly income due to shorter period
      expect(result).toBeGreaterThan(8000)
    })

    it('handles long retirement period (40+ years)', () => {
      // $500,000 savings, 3.5% return, 45 years
      const result = calculateSustainableIncome(500000, 0.035, 45)
      // Should be lower monthly income due to longer period
      expect(result).toBeGreaterThan(1500)
      expect(result).toBeLessThan(2000)
    })

    it('handles zero return rate as simple division', () => {
      // $120,000 savings, 0% return, 10 years = $1,000/month
      const result = calculateSustainableIncome(120000, 0, 10)
      expect(result).toBe(1000)
    })

    it('returns 0 for zero retirement years', () => {
      const result = calculateSustainableIncome(500000, 0.035, 0)
      expect(result).toBe(0)
    })
  })

  describe('edge cases - invalid inputs return 0', () => {
    it('returns 0 for negative savings', () => {
      const result = calculateSustainableIncome(-500000, 0.035, 30)
      expect(result).toBe(0)
    })

    it('returns 0 for negative return rate', () => {
      const result = calculateSustainableIncome(500000, -0.035, 30)
      expect(result).toBe(0)
    })

    it('returns 0 for negative retirement years', () => {
      const result = calculateSustainableIncome(500000, 0.035, -30)
      expect(result).toBe(0)
    })

    it('returns 0 for NaN inputs', () => {
      expect(calculateSustainableIncome(NaN, 0.035, 30)).toBe(0)
      expect(calculateSustainableIncome(500000, NaN, 30)).toBe(0)
      expect(calculateSustainableIncome(500000, 0.035, NaN)).toBe(0)
    })
  })
})
