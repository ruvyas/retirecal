import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssumptionsAccordion } from '../../../../src/components/Calculator/AssumptionsAccordion'
import type { Assumptions } from '../../../../src/lib/types/calculator'

const mockAssumptions: Assumptions = {
  inflationRate: 0.02,
  preRetirementReturn: 0.055,
  retirementReturn: 0.035,
  taxRate: 0.25,
  lifeExpectancy: 95,
}

const mockOnChange = vi.fn()

describe('AssumptionsAccordion', () => {
  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )
      expect(screen.getByText('Calculation Assumptions')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AssumptionsAccordion
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          className="custom-class"
        />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('expand/collapse behavior', () => {
    it('is collapsed by default', () => {
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )
      expect(screen.queryByLabelText('Inflation Rate')).not.toBeInTheDocument()
    })

    it('expands when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))

      expect(screen.getByLabelText('Inflation Rate')).toBeInTheDocument()
      expect(screen.getByLabelText('Pre-Retirement Return')).toBeInTheDocument()
      expect(screen.getByLabelText('Retirement Return')).toBeInTheDocument()
      expect(screen.getByLabelText('Tax Rate')).toBeInTheDocument()
      expect(screen.getByLabelText('Life Expectancy')).toBeInTheDocument()
    })

    it('collapses when trigger is clicked again', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByLabelText('Inflation Rate')).toBeInTheDocument()

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.queryByLabelText('Inflation Rate')).not.toBeInTheDocument()
    })
  })

  describe('assumption input values', () => {
    it('displays inflation rate as percentage value', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement
      expect(input.value).toBe('2')
    })

    it('displays pre-retirement return as percentage value', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Pre-Retirement Return') as HTMLInputElement
      expect(input.value).toBe('5.5')
    })

    it('displays life expectancy in years', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Life Expectancy') as HTMLInputElement
      expect(input.value).toBe('95')
    })

    it('rounds floating point artifacts to clean display values', async () => {
      const user = userEvent.setup()
      // Simulate a value with floating point artifact
      const assumptionsWithArtifact: Assumptions = {
        ...mockAssumptions,
        preRetirementReturn: 0.07000000000000001, // floating point artifact (7%)
      }
      render(
        <AssumptionsAccordion
          assumptions={assumptionsWithArtifact}
          onAssumptionChange={mockOnChange}
        />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Pre-Retirement Return') as HTMLInputElement
      // Should display "7" not "7.000000000000001"
      expect(input.value).toBe('7')
    })
  })

  describe('input interactions', () => {
    it('calls onAssumptionChange when inflation rate is changed', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement

      // Type a character to trigger change
      await user.type(input, '5')

      // Verify the handler was called with the correct key
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange.mock.calls[0][0]).toBe('inflationRate')
      expect(typeof mockOnChange.mock.calls[0][1]).toBe('number')
    })

    it('calls onAssumptionChange when life expectancy is changed', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Life Expectancy') as HTMLInputElement

      // Type a character to trigger change
      await user.type(input, '0')

      // Verify the handler was called with the correct key
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange.mock.calls[0][0]).toBe('lifeExpectancy')
      expect(typeof mockOnChange.mock.calls[0][1]).toBe('number')
    })
  })

  describe('descriptions', () => {
    it('displays description for each assumption', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))

      expect(screen.getByText(/prices increase over time/i)).toBeInTheDocument()
      expect(screen.getByText(/investment return before retirement/i)).toBeInTheDocument()
      expect(screen.getByText(/conservative return rate/i)).toBeInTheDocument()
      expect(screen.getByText(/blended tax rate/i)).toBeInTheDocument()
      expect(screen.getByText(/planning horizon/i)).toBeInTheDocument()
    })
  })

  describe('decimal precision limit (3 decimals in display value)', () => {
    it('allows values with up to 3 decimals and calls onAssumptionChange', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement

      mockOnChange.mockClear()

      // Enter a value with 3 decimals in display (5.555%)
      fireEvent.change(input, { target: { value: '5.555' } })

      // Should call onChange (3 decimals is valid)
      expect(mockOnChange).toHaveBeenCalledWith('inflationRate', expect.closeTo(0.05555, 10))
    })

    it('silently blocks values with 4+ decimals', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement

      mockOnChange.mockClear()

      // Enter a value with 4 decimals in display (5.5555%)
      fireEvent.change(input, { target: { value: '5.5555' } })

      // Should NOT call onChange (4 decimals is blocked)
      expect(mockOnChange).not.toHaveBeenCalled()

      // No error message should be displayed (silent blocking)
      expect(screen.queryByText(/decimal/i)).not.toBeInTheDocument()
    })

    it('allows 2-decimal values', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement

      mockOnChange.mockClear()

      // Enter a value with 2 decimals (5.55%)
      fireEvent.change(input, { target: { value: '5.55' } })

      // Should call onChange
      expect(mockOnChange).toHaveBeenCalledWith('inflationRate', 0.0555)
    })

    it('does not limit decimals for life expectancy (non-percent field)', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsAccordion assumptions={mockAssumptions} onAssumptionChange={mockOnChange} />
      )

      await user.click(screen.getByText('Calculation Assumptions'))
      const input = screen.getByLabelText('Life Expectancy') as HTMLInputElement

      mockOnChange.mockClear()

      // Enter a value - should work without decimal validation
      fireEvent.change(input, { target: { value: '90' } })

      expect(mockOnChange).toHaveBeenCalledWith('lifeExpectancy', 90)
    })
  })
})
