/**
 * Formatting utilities for the retirement calculator
 */

/**
 * Format a number as Canadian currency without cents ($1,234)
 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '$0'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format currency with cents for precise display ($1,234.56)
 */
export function formatCurrencyPrecise(value: number): string {
  if (!Number.isFinite(value)) return '$0.00'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Parse a currency string back to a number
 * Strips $, commas, and non-numeric characters except decimal point and minus
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a decimal as percentage (0.05 -> "5%")
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0%'
  return new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format years with appropriate singular/plural
 */
export function formatYears(years: number): string {
  if (years === Infinity) return 'Indefinitely'
  if (!Number.isFinite(years) || years < 0) return '0 years'
  const rounded = Math.round(years * 10) / 10
  return `${rounded} ${rounded === 1 ? 'year' : 'years'}`
}
