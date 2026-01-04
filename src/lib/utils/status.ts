/**
 * Status derivation utility for retirement calculator
 * Moved from StatusIndicator to allow Fast Refresh to work properly
 */

export type StatusType = 'on-track' | 'attention-needed' | 'significant-gap'

/**
 * Monthly income gap threshold below which status becomes "significant-gap"
 * A gap smaller than this (more negative) indicates serious retirement planning issues
 */
const SIGNIFICANT_GAP_THRESHOLD = -500

/**
 * Derive status from income gap value
 * @param incomeGap - The monthly income gap (positive = surplus, negative = shortfall)
 * @returns The appropriate status type
 */
export function deriveStatus(incomeGap: number): StatusType {
  if (incomeGap >= 0) return 'on-track'
  if (incomeGap >= SIGNIFICANT_GAP_THRESHOLD) return 'attention-needed'
  return 'significant-gap'
}
