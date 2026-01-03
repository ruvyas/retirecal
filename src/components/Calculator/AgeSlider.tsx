import { useState, useCallback, useId, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { VALIDATION_BOUNDS } from '@/lib/types/calculator'

interface AgeSliderProps {
  id?: string
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  helpText?: string
  disabled?: boolean
  className?: string
}

export function AgeSlider({
  id: providedId,
  label,
  value,
  onChange,
  min = VALIDATION_BOUNDS.age.min,
  max = VALIDATION_BOUNDS.age.max,
  step = 1,
  helpText,
  disabled = false,
  className,
}: AgeSliderProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const sliderId = `${id}-slider`
  const inputId = `${id}-input`
  const helpTextId = `${id}-help`

  // Use internal state for input to handle typing intermediate values
  const [inputValue, setInputValue] = useState(value.toString())

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const newValue = values[0]
      if (newValue !== undefined) {
        onChange(newValue)
      }
    },
    [onChange]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Update internal state to allow typing
    setInputValue(e.target.value)
  }, [])

  const handleInputBlur = useCallback(() => {
    const parsed = parseInt(inputValue, 10)

    if (isNaN(parsed) || parsed < min) {
      onChange(min)
      setInputValue(min.toString())
    } else if (parsed > max) {
      onChange(max)
      setInputValue(max.toString())
    } else {
      onChange(parsed)
    }
  }, [inputValue, min, max, onChange])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          className="w-20 text-center"
          aria-describedby={helpText ? helpTextId : undefined}
        />
      </div>
      <Slider
        id={sliderId}
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} years`}
      />
      {helpText && (
        <p id={helpTextId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}
