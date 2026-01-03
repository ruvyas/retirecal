import { useState, useCallback, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatCurrency, parseCurrency } from '@/lib/formatters'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'

interface CurrencyInputProps {
  id?: string
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  placeholder?: string
  helpText?: string
  disabled?: boolean
  className?: string
  'aria-describedby'?: string
}

export function CurrencyInput({
  id: providedId,
  label,
  value,
  onChange,
  min = VALIDATION_BOUNDS.amounts.min,
  max = VALIDATION_BOUNDS.amounts.max,
  placeholder = '$0',
  helpText,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
}: CurrencyInputProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const helpTextId = `${id}-help`

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    // When focusing, show the raw numeric value for editing
    setInputValue(value === 0 ? '' : value.toString())
  }, [value])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Parse and clamp the value on blur
    let parsed = parseCurrency(inputValue)
    parsed = Math.max(min, Math.min(max, parsed))
    onChange(parsed)
    setInputValue('')
  }, [inputValue, min, max, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow typing any value, we'll validate on blur
    const rawValue = e.target.value
    // Remove non-numeric characters except decimal point and minus
    const cleaned = rawValue.replace(/[^0-9.-]/g, '')
    setInputValue(cleaned)
  }, [])

  const displayValue = isFocused ? inputValue : formatCurrency(value)

  const describedByIds = [helpText ? helpTextId : null, ariaDescribedBy].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={describedByIds || undefined}
        aria-invalid={value < min || value > max}
      />
      {helpText && (
        <p id={helpTextId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}
