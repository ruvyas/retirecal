import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  StatusIndicator,
  deriveStatus,
  type StatusType,
} from '../../../../src/components/Calculator/StatusIndicator'

describe('StatusIndicator', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<StatusIndicator status="on-track" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it.each<[StatusType, string]>([
      ['on-track', 'On Track'],
      ['attention-needed', 'Attention Needed'],
      ['significant-gap', 'Significant Gap'],
    ])('renders %s status with correct label', (status, expectedLabel) => {
      render(<StatusIndicator status={status} />)
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })

    it('displays optional message', () => {
      render(<StatusIndicator status="on-track" message="Great job!" />)
      expect(screen.getByText('Great job!')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<StatusIndicator status="on-track" className="custom-class" />)
      expect(screen.getByRole('status')).toHaveClass('custom-class')
    })
  })

  describe('styling', () => {
    it('applies green styling for on-track', () => {
      render(<StatusIndicator status="on-track" />)
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-emerald-100')
    })

    it('applies amber styling for attention-needed', () => {
      render(<StatusIndicator status="attention-needed" />)
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-amber-100')
    })

    it('applies red styling for significant-gap', () => {
      render(<StatusIndicator status="significant-gap" />)
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-red-100')
    })
  })

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<StatusIndicator status="on-track" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has aria-live="polite"', () => {
      render(<StatusIndicator status="on-track" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })

    it('includes screen reader description', () => {
      render(<StatusIndicator status="on-track" />)
      expect(screen.getByText(/on track/i, { selector: '.sr-only' })).toBeInTheDocument()
    })

    it('hides decorative icon from screen readers', () => {
      const { container } = render(<StatusIndicator status="on-track" />)
      const icon = container.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

describe('deriveStatus', () => {
  it('returns on-track for positive income gap', () => {
    expect(deriveStatus(1000)).toBe('on-track')
    expect(deriveStatus(100)).toBe('on-track')
  })

  it('returns on-track for zero income gap', () => {
    expect(deriveStatus(0)).toBe('on-track')
  })

  it('returns attention-needed for small negative gap', () => {
    expect(deriveStatus(-1)).toBe('attention-needed')
    expect(deriveStatus(-250)).toBe('attention-needed')
    expect(deriveStatus(-500)).toBe('attention-needed')
  })

  it('returns significant-gap for large negative gap', () => {
    expect(deriveStatus(-501)).toBe('significant-gap')
    expect(deriveStatus(-1000)).toBe('significant-gap')
    expect(deriveStatus(-5000)).toBe('significant-gap')
  })
})
