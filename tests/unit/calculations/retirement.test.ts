import { describe, it, expect } from 'vitest'
import {
  calculateFutureValue,
  calculateContributionGrowth,
  calculateRetirementRunway,
} from '@/lib/calculations/retirement'

describe('calculateFutureValue', () => {
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

describe('calculateContributionGrowth', () => {
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

describe('calculateRetirementRunway', () => {
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
