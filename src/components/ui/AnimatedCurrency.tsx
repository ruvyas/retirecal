import { useAnimatedValue } from '@/hooks/useAnimatedValue'
import { formatCurrency } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface AnimatedCurrencyProps {
  /** The currency value to display */
  value: number
  /** Optional className for styling */
  className?: string
  /** Animation duration in milliseconds */
  duration?: number
  /** Whether to disable animation */
  disabled?: boolean
}

/**
 * Displays a currency value that animates smoothly when changed.
 * Uses tabular-nums for stable layout during animation.
 */
export function AnimatedCurrency({
  value,
  className,
  duration = 400,
  disabled = false,
}: AnimatedCurrencyProps) {
  const animatedValue = useAnimatedValue(value, { duration, disabled })

  return (
    <span className={cn('tabular-nums', className)}>
      {formatCurrency(Math.round(animatedValue))}
    </span>
  )
}
