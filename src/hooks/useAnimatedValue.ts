import { useEffect, useRef, useState } from 'react'

interface UseAnimatedValueOptions {
  /** Animation duration in milliseconds */
  duration?: number
  /** Custom easing function */
  easing?: (t: number) => number
  /** Whether to disable animation */
  disabled?: boolean
}

/** Ease-out cubic for smooth deceleration */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

/**
 * Hook that animates a numeric value smoothly from its previous value to a new target.
 * Respects the user's prefers-reduced-motion setting.
 *
 * @param targetValue - The value to animate towards
 * @param options - Animation options
 * @returns The current animated value
 */
export function useAnimatedValue(
  targetValue: number,
  options: UseAnimatedValueOptions = {}
): number {
  const { duration = 400, easing = easeOutCubic, disabled = false } = options
  const [displayValue, setDisplayValue] = useState(targetValue)
  const animationRef = useRef<number | null>(null)
  const previousTargetRef = useRef(targetValue)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Skip if value hasn't changed (includes first render)
    if (previousTargetRef.current === targetValue) {
      return
    }

    // Store the current display value as the animation start point
    const startValue = displayValue
    startValueRef.current = startValue
    previousTargetRef.current = targetValue

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (disabled || prefersReducedMotion) {
      setDisplayValue(targetValue)
      return
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress

      setDisplayValue(newValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    // Note: displayValue is intentionally excluded to prevent re-triggering animation mid-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration, easing, disabled])

  return displayValue
}
