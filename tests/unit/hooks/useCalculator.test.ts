import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useCalculator,
  DEFAULT_INPUTS,
  DEFAULT_ASSUMPTIONS,
  computeResults,
} from '@/hooks/useCalculator'
import type { CalculatorInputs, Assumptions } from '@/lib/types/calculator'

describe('useCalculator', () => {
  describe('initial state', () => {
    it('returns default inputs on first render', () => {
      const { result } = renderHook(() => useCalculator())
      expect(result.current.inputs).toEqual(DEFAULT_INPUTS)
    })

    it('returns default assumptions on first render', () => {
      const { result } = renderHook(() => useCalculator())
      expect(result.current.assumptions).toEqual(DEFAULT_ASSUMPTIONS)
    })

    it('computes initial results from defaults', () => {
      const { result } = renderHook(() => useCalculator())
      expect(result.current.results).toBeDefined()
      expect(result.current.results.projectedSavings).toBeGreaterThan(0)
      expect(result.current.results.yearsUntilRetirement).toBe(35) // 65 - 30
    })

    it('has no errors for valid default inputs', () => {
      const { result } = renderHook(() => useCalculator())
      expect(result.current.errors).toEqual({})
      expect(result.current.hasErrors).toBe(false)
    })

    it('calculates correct totalSavings from defaults', () => {
      const { result } = renderHook(() => useCalculator())
      const expectedTotal =
        DEFAULT_INPUTS.savings.rrsp +
        DEFAULT_INPUTS.savings.tfsa +
        DEFAULT_INPUTS.savings.nonRegistered
      expect(result.current.totalSavings).toBe(expectedTotal)
    })
  })

  describe('setInputs', () => {
    it('updates inputs when setInputs is called', () => {
      const { result } = renderHook(() => useCalculator())

      const newInputs: CalculatorInputs = {
        ...DEFAULT_INPUTS,
        currentAge: 40,
        retirementAge: 60,
      }

      act(() => {
        result.current.setInputs(newInputs)
      })

      expect(result.current.inputs.currentAge).toBe(40)
      expect(result.current.inputs.retirementAge).toBe(60)
    })

    it('triggers recalculation when inputs change', () => {
      const { result } = renderHook(() => useCalculator())
      const initialProjectedSavings = result.current.results.projectedSavings

      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          monthlyContribution: 2000, // Increase from 500
        })
      })

      expect(result.current.results.projectedSavings).toBeGreaterThan(initialProjectedSavings)
    })

    it('updates yearsUntilRetirement when ages change', () => {
      const { result } = renderHook(() => useCalculator())

      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          currentAge: 50,
          retirementAge: 60,
        })
      })

      expect(result.current.results.yearsUntilRetirement).toBe(10)
    })

    it('updates totalSavings when savings change', () => {
      const { result } = renderHook(() => useCalculator())

      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          savings: { rrsp: 100000, tfsa: 50000, nonRegistered: 50000 },
        })
      })

      expect(result.current.totalSavings).toBe(200000)
    })

    it('validates inputs and sets errors for invalid values', () => {
      const { result } = renderHook(() => useCalculator())

      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          currentAge: 10, // Invalid: below 18
        })
      })

      expect(result.current.errors.currentAge).toBeDefined()
      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('setAssumptions', () => {
    it('updates individual assumption values', () => {
      const { result } = renderHook(() => useCalculator())

      act(() => {
        result.current.setAssumptions({ preRetirementReturn: 0.08 })
      })

      expect(result.current.assumptions.preRetirementReturn).toBe(0.08)
      // Other assumptions should remain unchanged
      expect(result.current.assumptions.inflationRate).toBe(DEFAULT_ASSUMPTIONS.inflationRate)
    })

    it('triggers recalculation when assumptions change', () => {
      const { result } = renderHook(() => useCalculator())
      const initialProjectedSavings = result.current.results.projectedSavings

      act(() => {
        result.current.setAssumptions({ preRetirementReturn: 0.1 }) // Higher return
      })

      expect(result.current.results.projectedSavings).toBeGreaterThan(initialProjectedSavings)
    })

    it('updates multiple assumptions at once', () => {
      const { result } = renderHook(() => useCalculator())

      act(() => {
        result.current.setAssumptions({
          preRetirementReturn: 0.08,
          retirementReturn: 0.04,
          lifeExpectancy: 90,
        })
      })

      expect(result.current.assumptions.preRetirementReturn).toBe(0.08)
      expect(result.current.assumptions.retirementReturn).toBe(0.04)
      expect(result.current.assumptions.lifeExpectancy).toBe(90)
    })
  })

  describe('reset', () => {
    it('restores default inputs', () => {
      const { result } = renderHook(() => useCalculator())

      // Change inputs first
      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          currentAge: 45,
          monthlyContribution: 2000,
        })
      })

      // Then reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.inputs).toEqual(DEFAULT_INPUTS)
    })

    it('restores default assumptions', () => {
      const { result } = renderHook(() => useCalculator())

      // Change assumptions first
      act(() => {
        result.current.setAssumptions({ preRetirementReturn: 0.1 })
      })

      // Then reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.assumptions).toEqual(DEFAULT_ASSUMPTIONS)
    })

    it('clears any validation errors', () => {
      const { result } = renderHook(() => useCalculator())

      // Set invalid inputs
      act(() => {
        result.current.setInputs({
          ...DEFAULT_INPUTS,
          currentAge: 10, // Invalid
        })
      })

      expect(result.current.hasErrors).toBe(true)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.hasErrors).toBe(false)
    })
  })

  describe('memoization', () => {
    it('returns same results reference when inputs unchanged', () => {
      const { result, rerender } = renderHook(() => useCalculator())
      const firstResults = result.current.results

      // Rerender without changing inputs
      rerender()

      expect(result.current.results).toBe(firstResults)
    })

    it('returns same errors reference when inputs unchanged', () => {
      const { result, rerender } = renderHook(() => useCalculator())
      const firstErrors = result.current.errors

      // Rerender without changing inputs
      rerender()

      expect(result.current.errors).toBe(firstErrors)
    })
  })
})

describe('computeResults', () => {
  const testInputs: CalculatorInputs = {
    currentAge: 30,
    retirementAge: 65,
    annualIncome: 75000,
    savings: { rrsp: 50000, tfsa: 30000, nonRegistered: 20000 },
    monthlyContribution: 500,
    annualRetirementSpending: 50000,
  }

  const testAssumptions: Assumptions = {
    inflationRate: 0.02,
    preRetirementReturn: 0.055,
    retirementReturn: 0.035,
    taxRate: 0.25,
    lifeExpectancy: 95,
  }

  it('calculates projectedSavings correctly', () => {
    const results = computeResults(testInputs, testAssumptions)
    // With 100k savings growing at 5.5% for 35 years + $500/mo contributions
    expect(results.projectedSavings).toBeGreaterThan(500000)
  })

  it('calculates yearsUntilRetirement correctly', () => {
    const results = computeResults(testInputs, testAssumptions)
    expect(results.yearsUntilRetirement).toBe(35) // 65 - 30
  })

  it('calculates retirementRunway', () => {
    const results = computeResults(testInputs, testAssumptions)
    // Should be able to sustain spending for some years
    expect(results.retirementRunway).toBeGreaterThan(0)
  })

  it('calculates monthlyIncome', () => {
    const results = computeResults(testInputs, testAssumptions)
    expect(results.monthlyIncome).toBeGreaterThan(0)
  })

  it('calculates incomeGap (surplus when income > spending)', () => {
    const results = computeResults(testInputs, testAssumptions)
    const desiredMonthly = testInputs.annualRetirementSpending / 12
    const expectedGap = results.monthlyIncome - desiredMonthly
    expect(results.incomeGap).toBeCloseTo(expectedGap, 2)
  })

  it('handles zero savings', () => {
    const zeroSavingsInputs = {
      ...testInputs,
      savings: { rrsp: 0, tfsa: 0, nonRegistered: 0 },
      monthlyContribution: 0,
    }
    const results = computeResults(zeroSavingsInputs, testAssumptions)
    expect(results.projectedSavings).toBe(0)
    expect(results.monthlyIncome).toBe(0)
  })

  it('handles higher contribution rate', () => {
    const highContributionInputs = {
      ...testInputs,
      monthlyContribution: 2000,
    }
    const normalResults = computeResults(testInputs, testAssumptions)
    const highContribResults = computeResults(highContributionInputs, testAssumptions)

    expect(highContribResults.projectedSavings).toBeGreaterThan(normalResults.projectedSavings)
  })

  it('handles shorter time to retirement', () => {
    const shortTimeInputs = {
      ...testInputs,
      currentAge: 55,
      retirementAge: 60,
    }
    const results = computeResults(shortTimeInputs, testAssumptions)
    expect(results.yearsUntilRetirement).toBe(5)
    // Less time means less projected savings
    expect(results.projectedSavings).toBeLessThan(
      computeResults(testInputs, testAssumptions).projectedSavings
    )
  })

  it('sanitizes invalid inputs before calculation', () => {
    const invalidInputs = {
      ...testInputs,
      currentAge: -10, // Invalid
      savings: { rrsp: -100, tfsa: -200, nonRegistered: -300 }, // Invalid
    }
    // Should not throw, should sanitize and calculate
    const results = computeResults(invalidInputs, testAssumptions)
    expect(Number.isFinite(results.projectedSavings)).toBe(true)
    expect(results.projectedSavings).toBeGreaterThanOrEqual(0)
  })
})

describe('DEFAULT_INPUTS', () => {
  it('has all required fields', () => {
    expect(DEFAULT_INPUTS).toHaveProperty('currentAge')
    expect(DEFAULT_INPUTS).toHaveProperty('retirementAge')
    expect(DEFAULT_INPUTS).toHaveProperty('annualIncome')
    expect(DEFAULT_INPUTS).toHaveProperty('savings')
    expect(DEFAULT_INPUTS).toHaveProperty('monthlyContribution')
    expect(DEFAULT_INPUTS).toHaveProperty('annualRetirementSpending')
  })

  it('has valid default values', () => {
    expect(DEFAULT_INPUTS.currentAge).toBeGreaterThanOrEqual(18)
    expect(DEFAULT_INPUTS.retirementAge).toBeGreaterThan(DEFAULT_INPUTS.currentAge)
    expect(DEFAULT_INPUTS.annualIncome).toBeGreaterThan(0)
    expect(DEFAULT_INPUTS.monthlyContribution).toBeGreaterThanOrEqual(0)
  })

  it('has valid savings breakdown', () => {
    expect(DEFAULT_INPUTS.savings.rrsp).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_INPUTS.savings.tfsa).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_INPUTS.savings.nonRegistered).toBeGreaterThanOrEqual(0)
  })
})

describe('DEFAULT_ASSUMPTIONS', () => {
  it('has all required fields', () => {
    expect(DEFAULT_ASSUMPTIONS).toHaveProperty('inflationRate')
    expect(DEFAULT_ASSUMPTIONS).toHaveProperty('preRetirementReturn')
    expect(DEFAULT_ASSUMPTIONS).toHaveProperty('retirementReturn')
    expect(DEFAULT_ASSUMPTIONS).toHaveProperty('taxRate')
    expect(DEFAULT_ASSUMPTIONS).toHaveProperty('lifeExpectancy')
  })

  it('has reasonable assumption values', () => {
    expect(DEFAULT_ASSUMPTIONS.inflationRate).toBeGreaterThan(0)
    expect(DEFAULT_ASSUMPTIONS.inflationRate).toBeLessThan(0.1)
    expect(DEFAULT_ASSUMPTIONS.preRetirementReturn).toBeGreaterThan(
      DEFAULT_ASSUMPTIONS.inflationRate
    )
    expect(DEFAULT_ASSUMPTIONS.retirementReturn).toBeGreaterThan(0)
    expect(DEFAULT_ASSUMPTIONS.taxRate).toBeGreaterThan(0)
    expect(DEFAULT_ASSUMPTIONS.taxRate).toBeLessThan(1)
    expect(DEFAULT_ASSUMPTIONS.lifeExpectancy).toBeGreaterThan(60)
  })
})
