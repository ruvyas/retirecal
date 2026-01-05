/**
 * Tax-related types for Canadian federal and provincial tax calculations
 */

/**
 * Province/territory codes for all 13 Canadian jurisdictions
 */
export type Province =
  | 'AB' // Alberta
  | 'BC' // British Columbia
  | 'MB' // Manitoba
  | 'NB' // New Brunswick
  | 'NL' // Newfoundland and Labrador
  | 'NS' // Nova Scotia
  | 'NT' // Northwest Territories
  | 'NU' // Nunavut
  | 'ON' // Ontario
  | 'PE' // Prince Edward Island
  | 'QC' // Quebec
  | 'SK' // Saskatchewan
  | 'YT' // Yukon

/**
 * Tax bracket definition for marginal tax calculations
 */
export interface TaxBracket {
  /** Lower bound of the bracket (0 for the first bracket) */
  min: number
  /** Upper bound of the bracket (null for the highest bracket) */
  max: number | null
  /** Marginal tax rate as a decimal (e.g., 0.15 for 15%) */
  rate: number
}

/**
 * Province/territory metadata for display purposes
 */
export interface ProvinceInfo {
  /** Province/territory code */
  code: Province
  /** Full display name */
  name: string
}

/**
 * Result of a Canadian tax calculation
 */
export interface TaxCalculationResult {
  /** Federal tax amount */
  federal: number
  /** Provincial/territorial tax amount */
  provincial: number
  /** Total tax (federal + provincial) */
  total: number
  /** Effective tax rate as a decimal */
  effectiveRate: number
  /** Federal marginal rate (rate on next dollar) as a decimal */
  federalMarginalRate: number
  /** Provincial marginal rate (rate on next dollar) as a decimal */
  provincialMarginalRate: number
  /** Combined marginal rate (federal + provincial) as a decimal */
  marginalRate: number
}
