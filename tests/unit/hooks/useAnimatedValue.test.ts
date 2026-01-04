import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimatedValue } from '@/hooks/useAnimatedValue'

describe('useAnimatedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id)
    })
    // Mock matchMedia for reduced motion check
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns the initial value on first render', () => {
    const { result } = renderHook(() => useAnimatedValue(100))
    // Initial value is the target value - no animation on first render
    expect(result.current).toBe(100)
  })

  it('returns target value immediately when disabled', () => {
    const { result, rerender } = renderHook(
      ({ value, disabled }) => useAnimatedValue(value, { disabled }),
      { initialProps: { value: 100, disabled: true } }
    )

    expect(result.current).toBe(100)

    rerender({ value: 200, disabled: true })
    expect(result.current).toBe(200) // Immediate update, no animation
  })

  it('returns target value immediately when reduced motion is preferred', () => {
    // Mock matchMedia to return true for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result, rerender } = renderHook(({ value }) => useAnimatedValue(value), {
      initialProps: { value: 100 },
    })

    rerender({ value: 200 })
    expect(result.current).toBe(200) // Immediate update due to reduced motion
  })

  it('animates from previous value to new target value', async () => {
    const { result, rerender } = renderHook(({ value }) => useAnimatedValue(value), {
      initialProps: { value: 100 },
    })

    expect(result.current).toBe(100)

    rerender({ value: 200 })

    // Initially should still be close to 100
    expect(result.current).toBe(100)

    // Advance timers to trigger animation frames
    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    // Should be somewhere between 100 and 200
    expect(result.current).toBeGreaterThan(100)
    expect(result.current).toBeLessThanOrEqual(200)

    // Complete animation
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // Should reach target
    expect(result.current).toBe(200)
  })

  it('handles rapid value changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useAnimatedValue(value), {
      initialProps: { value: 100 },
    })

    // Change value multiple times rapidly
    rerender({ value: 200 })
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 300 })
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 400 })

    // Complete all animations
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // Should reach final target
    expect(result.current).toBe(400)
  })

  it('respects custom duration', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedValue(value, { duration: 1000 }),
      { initialProps: { value: 100 } }
    )

    rerender({ value: 200 })

    // At 500ms (halfway), should be approximately halfway
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // Value should be between 100 and 200, progressing
    expect(result.current).toBeGreaterThan(100)
    expect(result.current).toBeLessThan(200)

    // Complete animation
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current).toBe(200)
  })

  it('cleans up animation on unmount', () => {
    const { rerender, unmount } = renderHook(({ value }) => useAnimatedValue(value), {
      initialProps: { value: 100 },
    })

    rerender({ value: 200 })

    // Unmount before animation completes
    unmount()

    // Should not throw or cause issues
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })

  it('handles zero and negative values', async () => {
    const { result, rerender } = renderHook(({ value }) => useAnimatedValue(value), {
      initialProps: { value: 100 },
    })

    // Animate to zero
    rerender({ value: 0 })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe(0)

    // Animate to negative
    rerender({ value: -50 })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe(-50)
  })
})
