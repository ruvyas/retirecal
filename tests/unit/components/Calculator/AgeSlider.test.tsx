import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgeSlider } from '../../../../src/components/Calculator/AgeSlider'

describe('AgeSlider', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      // Use spinbutton role for number input
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('displays current value in input', () => {
      render(<AgeSlider label="Current Age" value={45} onChange={() => {}} />)
      expect(screen.getByDisplayValue('45')).toBeInTheDocument()
    })

    it('renders slider component', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('renders help text when provided', () => {
      render(
        <AgeSlider label="Current Age" value={30} onChange={() => {}} helpText="Your current age" />
      )
      expect(screen.getByText('Your current age')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AgeSlider label="Current Age" value={30} onChange={() => {}} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('displays label text', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      expect(screen.getByText('Current Age')).toBeInTheDocument()
    })
  })

  describe('input behavior', () => {
    it('calls onChange on blur with typed value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<AgeSlider label="Current Age" value={30} onChange={handleChange} />)

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.type(input, '45')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(45)
    })

    it('clamps input to min value on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<AgeSlider label="Current Age" value={30} onChange={handleChange} min={18} />)

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.type(input, '10')
      await user.tab()

      // Should have been called with clamped value
      expect(handleChange).toHaveBeenCalledWith(18)
    })

    it('clamps input to max value on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<AgeSlider label="Current Age" value={30} onChange={handleChange} max={100} />)

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.type(input, '120')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(100)
    })

    it('handles empty input by setting to min on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<AgeSlider label="Current Age" value={30} onChange={handleChange} min={18} />)

      const input = screen.getByRole('spinbutton')
      await user.clear(input)
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(18)
    })
  })

  describe('slider behavior', () => {
    it('slider has correct min/max attributes', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} min={18} max={100} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '18')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })

    it('slider displays current value', () => {
      render(<AgeSlider label="Current Age" value={45} onChange={() => {}} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', '45')
    })
  })

  describe('accessibility', () => {
    it('label is associated with input via htmlFor', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      const label = screen.getByText('Current Age')
      expect(label).toHaveAttribute('for')
      const input = screen.getByRole('spinbutton')
      expect(input.id).toBe(label.getAttribute('for'))
    })

    it('input type is number', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('can be disabled', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} disabled />)
      expect(screen.getByRole('spinbutton')).toBeDisabled()
    })
  })

  describe('default values', () => {
    it('uses default min of 18', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '18')
    })

    it('uses default max of 100', () => {
      render(<AgeSlider label="Current Age" value={30} onChange={() => {}} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })
  })
})
