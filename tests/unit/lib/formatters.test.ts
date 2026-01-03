import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencyPrecise,
  parseCurrency,
  formatNumber,
  formatPercent,
  formatYears,
} from '../../../src/lib/formatters'

describe('formatCurrency', () => {
  it('formats positive numbers with $ and commas', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567')
  })

  it('formats small numbers without commas', () => {
    expect(formatCurrency(999)).toBe('$999')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-1234)).toBe('-$1,234')
  })

  it('rounds to whole dollars', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
    expect(formatCurrency(1234.44)).toBe('$1,234')
  })

  it('handles NaN', () => {
    expect(formatCurrency(NaN)).toBe('$0')
  })

  it('handles Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('$0')
  })
})

describe('formatCurrencyPrecise', () => {
  it('formats with two decimal places', () => {
    expect(formatCurrencyPrecise(1234.56)).toBe('$1,234.56')
  })

  it('pads with zeros when needed', () => {
    expect(formatCurrencyPrecise(1234)).toBe('$1,234.00')
    expect(formatCurrencyPrecise(1234.5)).toBe('$1,234.50')
  })

  it('handles zero', () => {
    expect(formatCurrencyPrecise(0)).toBe('$0.00')
  })

  it('handles NaN', () => {
    expect(formatCurrencyPrecise(NaN)).toBe('$0.00')
  })
})

describe('parseCurrency', () => {
  it('parses formatted currency strings', () => {
    expect(parseCurrency('$1,234.56')).toBe(1234.56)
  })

  it('parses plain numbers', () => {
    expect(parseCurrency('1234')).toBe(1234)
  })

  it('handles strings with only non-numeric characters', () => {
    expect(parseCurrency('$')).toBe(0)
    expect(parseCurrency('abc')).toBe(0)
  })

  it('handles empty string', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(parseCurrency('-$1,234')).toBe(-1234)
  })

  it('parses decimal values', () => {
    expect(parseCurrency('1234.99')).toBe(1234.99)
  })
})

describe('formatNumber', () => {
  it('formats with thousand separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('supports decimal places', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    expect(formatNumber(1234, 2)).toBe('1,234.00')
  })

  it('handles NaN', () => {
    expect(formatNumber(NaN)).toBe('0')
  })

  it('handles Infinity', () => {
    expect(formatNumber(Infinity)).toBe('0')
  })
})

describe('formatPercent', () => {
  it('converts decimal to percentage', () => {
    expect(formatPercent(0.05)).toBe('5.0%')
    expect(formatPercent(0.25)).toBe('25.0%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('handles 100%', () => {
    expect(formatPercent(1)).toBe('100.0%')
  })

  it('supports custom decimal places', () => {
    expect(formatPercent(0.0555, 2)).toBe('5.55%')
    expect(formatPercent(0.05, 0)).toBe('5%')
  })

  it('handles NaN', () => {
    expect(formatPercent(NaN)).toBe('0%')
  })
})

describe('formatYears', () => {
  it('formats years with plural', () => {
    expect(formatYears(25)).toBe('25 years')
  })

  it('formats single year with singular', () => {
    expect(formatYears(1)).toBe('1 year')
  })

  it('handles zero', () => {
    expect(formatYears(0)).toBe('0 years')
  })

  it('handles decimal years', () => {
    expect(formatYears(15.7)).toBe('15.7 years')
    expect(formatYears(15.75)).toBe('15.8 years')
  })

  it('handles Infinity', () => {
    expect(formatYears(Infinity)).toBe('Indefinitely')
  })

  it('handles negative numbers', () => {
    expect(formatYears(-5)).toBe('0 years')
  })

  it('handles NaN', () => {
    expect(formatYears(NaN)).toBe('0 years')
  })
})
