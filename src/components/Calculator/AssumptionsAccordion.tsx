import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'
import type { Assumptions } from '@/lib/types/calculator'

interface AssumptionsInputsProps {
  assumptions: Assumptions
  onAssumptionChange: (key: keyof Assumptions, value: number) => void
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
  className,
}: AssumptionsInputsProps) {
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
      <AssumptionInput
        id="taxRate"
        label="Tax Rate"
        value={assumptions.taxRate}
        onChange={(v) => onAssumptionChange('taxRate', v)}
        description="Blended tax rate on retirement withdrawals"
        isPercent
        step={1}
        min={VALIDATION_BOUNDS.taxRate.min}
        max={VALIDATION_BOUNDS.taxRate.max}
      />
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
