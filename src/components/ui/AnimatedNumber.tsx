import { useAnimatedValue } from '@/hooks/useAnimatedValue'
import { formatYears } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  /** The numeric value to display */
  value: number
  /** Optional className for styling */
  className?: string
  /** Animation duration in milliseconds */
  duration?: number
  /** Whether to disable animation */
  disabled?: boolean
  /** Format type: 'years' for year formatting, 'number' for plain number */
  format?: 'years' | 'number'
  /** Number of decimal places (only for format='number') */
  decimals?: number
}

/**
 * Displays a numeric value that animates smoothly when changed.
 * Supports formatting as years or plain numbers.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 400,
  disabled = false,
  format = 'number',
  decimals = 0,
}: AnimatedNumberProps) {
  const animatedValue = useAnimatedValue(value, { duration, disabled })

  const formattedValue =
    format === 'years' ? formatYears(Math.round(animatedValue)) : animatedValue.toFixed(decimals)

  return <span className={cn('tabular-nums', className)}>{formattedValue}</span>
}
