/**
 * Retirement calculation functions
 * Pure functions for financial calculations with no side effects
 */

/**
 * Round a number to 2 decimal places
 */
function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calculate future value using compound growth formula: FV = PV × (1 + r)^n
 *
 * @param principal - Current savings (PV)
 * @param rate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param years - Number of years
 * @returns Future value rounded to 2 decimal places
 */
export function calculateFutureValue(principal: number, rate: number, years: number): number {
  if (principal === 0) return 0
  if (years === 0) return roundTo2Decimals(principal)
  if (rate === 0) return roundTo2Decimals(principal)

  const futureValue = principal * Math.pow(1 + rate, years)
  return roundTo2Decimals(futureValue)
}

/**
 * Calculate future value of regular monthly contributions
 * Formula: FV = PMT × [((1 + r)^n - 1) / r] where r = monthly rate
 *
 * @param monthlyContribution - Monthly contribution amount
 * @param annualRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param months - Number of months
 * @returns Future value rounded to 2 decimal places
 */
export function calculateContributionGrowth(
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  if (monthlyContribution === 0) return 0
  if (months === 0) return 0

  // Handle zero rate case: simple sum of contributions
  if (annualRate === 0) {
    return roundTo2Decimals(monthlyContribution * months)
  }

  const monthlyRate = annualRate / 12
  const futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  return roundTo2Decimals(futureValue)
}

/**
 * Calculate how many years savings will last based on spending and returns
 * Uses present value of annuity formula solved for n: n = ln(1 - (PV × r / PMT)) / -ln(1 + r)
 *
 * @param totalSavings - Total retirement savings
 * @param annualSpending - Annual spending amount
 * @param returnRate - Annual return rate during retirement as decimal
 * @returns Years savings will last (Infinity if sustainable indefinitely)
 */
export function calculateRetirementRunway(
  totalSavings: number,
  annualSpending: number,
  returnRate: number
): number {
  // Edge case: no savings
  if (totalSavings === 0) return 0

  // Edge case: no spending - savings last forever
  if (annualSpending === 0) return Infinity

  // Edge case: zero return rate - simple division
  if (returnRate === 0) {
    return roundTo2Decimals(totalSavings / annualSpending)
  }

  // Check if savings can sustain indefinitely
  // If annual spending <= investment returns, savings never deplete
  const sustainableWithdrawal = totalSavings * returnRate
  if (annualSpending <= sustainableWithdrawal) {
    return Infinity
  }

  // Present value of annuity formula solved for n:
  // n = ln(1 - (PV × r / PMT)) / -ln(1 + r)
  // Where PV = totalSavings, r = returnRate, PMT = annualSpending
  const ratio = (totalSavings * returnRate) / annualSpending
  const years = Math.log(1 - ratio) / -Math.log(1 + returnRate)

  return roundTo2Decimals(years)
}
