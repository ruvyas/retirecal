import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'
import type { Assumptions, Province } from '@/lib/types/calculator'
import { calculateCanadianTax } from '@/lib/calculations/tax'
import { DEFAULT_WITHDRAWAL_TAX_RATE } from '@/lib/calculations/constants'

interface AssumptionsInputsProps {
  assumptions: Assumptions
  onAssumptionChange: (key: keyof Assumptions, value: number | null) => void
  province: Province
  estimatedAnnualIncome?: number
  className?: string
}

interface AssumptionInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  description: string
  isPercent?: boolean
  step?: number
  min: number
  max: number
}

function AssumptionInput({
  id,
  label,
  value,
  onChange,
  description,
  isPercent = false,
  step = 0.1,
  min,
  max,
}: AssumptionInputProps) {
  // Round display value to 3 decimals to prevent floating point artifacts like 7.000000000000001
  const displayValue = isPercent ? Math.round(value * 100 * 1000) / 1000 : value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFloat(e.target.value)
    if (isNaN(rawValue)) return

    // Silently block percent inputs with more than 3 decimal places
    if (isPercent) {
      const decimalPart = e.target.value.split('.')[1]
      if (decimalPart && decimalPart.length > 3) {
        return
      }
    }

    const newValue = isPercent ? rawValue / 100 : rawValue
    onChange(newValue)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 space-y-1">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-1">
        <Input
          id={id}
          type="number"
          value={displayValue}
          onChange={handleChange}
          step={step}
          min={isPercent ? min * 100 : min}
          max={isPercent ? max * 100 : max}
          className="w-20 text-right"
        />
        <span className="w-6 text-sm text-muted-foreground">{isPercent ? '%' : 'yrs'}</span>
      </div>
    </div>
  )
}

export function AssumptionsInputs({
  assumptions,
  onAssumptionChange,
  province,
  estimatedAnnualIncome,
  className,
}: AssumptionsInputsProps) {
  // Calculate tax breakdown for display
  const taxResult =
    estimatedAnnualIncome && estimatedAnnualIncome > 0
      ? calculateCanadianTax(estimatedAnnualIncome, province)
      : null

  const federalRate = taxResult ? taxResult.federal / estimatedAnnualIncome! : 0
  const provincialRate = taxResult ? taxResult.provincial / estimatedAnnualIncome! : 0
  const effectiveTaxRate = taxResult?.effectiveRate ?? 0

  const isUsingBrackets = assumptions.taxRate === null

  const handleTaxToggle = (useBrackets: boolean) => {
    if (useBrackets) {
      onAssumptionChange('taxRate', null)
    } else {
      // When switching to manual, start with the current effective rate or default
      onAssumptionChange('taxRate', effectiveTaxRate || DEFAULT_WITHDRAWAL_TAX_RATE)
    }
  }

  return (
    <div className={cn('space-y-1 divide-y', className)}>
      <AssumptionInput
        id="inflationRate"
        label="Inflation Rate"
        value={assumptions.inflationRate}
        onChange={(v) => onAssumptionChange('inflationRate', v)}
        description="Annual rate at which prices increase over time"
        isPercent
        step={0.1}
        min={VALIDATION_BOUNDS.rates.min}
        max={VALIDATION_BOUNDS.rates.max}
      />
      <AssumptionInput
        id="preRetirementReturn"
        label="Pre-Retirement Return"
        value={assumptions.preRetirementReturn}
        onChange={(v) => onAssumptionChange('preRetirementReturn', v)}
        description="Expected annual investment return before retirement"
        isPercent
        step={0.1}
        min={VALIDATION_BOUNDS.rates.min}
        max={VALIDATION_BOUNDS.rates.max}
      />
      <AssumptionInput
        id="retirementReturn"
        label="Retirement Return"
        value={assumptions.retirementReturn}
        onChange={(v) => onAssumptionChange('retirementReturn', v)}
        description="Conservative return rate during retirement"
        isPercent
        step={0.1}
        min={VALIDATION_BOUNDS.rates.min}
        max={VALIDATION_BOUNDS.rates.max}
      />

      {/* Tax Rate with toggle */}
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="taxRate" className="font-medium">
            Tax Rate
          </Label>
          <p className="text-xs text-muted-foreground">
            {isUsingBrackets
              ? 'Using federal + provincial tax brackets'
              : 'Manual override rate on withdrawals'}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Switch id="tax-toggle" checked={isUsingBrackets} onCheckedChange={handleTaxToggle} />
            <Label htmlFor="tax-toggle" className="text-xs text-muted-foreground cursor-pointer">
              Use tax brackets
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isUsingBrackets ? (
            <div className="text-right text-xs text-muted-foreground tabular-nums space-y-0.5">
              <div className="flex justify-between gap-2">
                <span>Federal:</span>
                <span>{(federalRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Provincial:</span>
                <span>{(provincialRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-2 font-medium text-foreground">
                <span>Effective:</span>
                <span>{(effectiveTaxRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-2 pt-1 border-t border-border/50">
                <span>Marginal:</span>
                <span>{((taxResult?.marginalRate ?? 0) * 100).toFixed(2)}%</span>
              </div>
            </div>
          ) : (
            <Input
              id="taxRate"
              type="number"
              value={Math.round((assumptions.taxRate ?? 0) * 100 * 1000) / 1000}
              onChange={(e) => {
                const rawValue = parseFloat(e.target.value)
                if (!isNaN(rawValue)) {
                  onAssumptionChange('taxRate', rawValue / 100)
                }
              }}
              step={1}
              min={VALIDATION_BOUNDS.taxRate.min * 100}
              max={VALIDATION_BOUNDS.taxRate.max * 100}
              className="w-20 text-right"
            />
          )}
          {!isUsingBrackets && <span className="w-6 text-sm text-muted-foreground">%</span>}
        </div>
      </div>

      <AssumptionInput
        id="lifeExpectancy"
        label="Life Expectancy"
        value={assumptions.lifeExpectancy}
        onChange={(v) => onAssumptionChange('lifeExpectancy', v)}
        description="Planning horizon for retirement savings"
        isPercent={false}
        step={1}
        min={VALIDATION_BOUNDS.lifeExpectancy.min}
        max={VALIDATION_BOUNDS.lifeExpectancy.max}
      />
    </div>
  )
}

// Keep old export name for backwards compatibility during transition
export { AssumptionsInputs as AssumptionsAccordion }
