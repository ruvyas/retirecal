import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssumptionsInputs } from '../../../../src/components/Calculator/AssumptionsAccordion'
import type { Assumptions, Province } from '../../../../src/lib/types/calculator'

const mockAssumptions: Assumptions = {
  inflationRate: 0.02,
  preRetirementReturn: 0.055,
  retirementReturn: 0.035,
  taxRate: 0.25,
  lifeExpectancy: 95,
}

const mockProvince: Province = 'ON'
const mockEstimatedAnnualIncome = 50000

const mockOnChange = vi.fn()

describe('AssumptionsInputs', () => {
  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('rendering', () => {
    it('renders all assumption inputs', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      expect(screen.getByLabelText('Inflation Rate')).toBeInTheDocument()
      expect(screen.getByLabelText('Pre-Retirement Return')).toBeInTheDocument()
      expect(screen.getByLabelText('Retirement Return')).toBeInTheDocument()
      expect(screen.getByLabelText('Life Expectancy')).toBeInTheDocument()
      // Tax rate section should show the label
      expect(screen.getByText('Tax Rate')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
          className="custom-class"
        />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('assumption input values', () => {
    it('displays inflation rate as percentage value', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement
      expect(input.value).toBe('2')
    })

    it('displays pre-retirement return as percentage value', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Pre-Retirement Return') as HTMLInputElement
      expect(input.value).toBe('5.5')
    })

    it('displays life expectancy in years', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Life Expectancy') as HTMLInputElement
      expect(input.value).toBe('95')
    })

    it('rounds floating point artifacts to clean display values', () => {
      const assumptionsWithArtifact: Assumptions = {
        ...mockAssumptions,
        preRetirementReturn: 0.07000000000000001, // floating point artifact (7%)
      }
      render(
        <AssumptionsInputs
          assumptions={assumptionsWithArtifact}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Pre-Retirement Return') as HTMLInputElement
      // Should display "7" not "7.000000000000001"
      expect(input.value).toBe('7')
    })
  })

  describe('input interactions', () => {
    it('calls onAssumptionChange when inflation rate is changed', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Inflation Rate') as HTMLInputElement
      await user.type(input, '5')

      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange.mock.calls[0][0]).toBe('inflationRate')
      expect(typeof mockOnChange.mock.calls[0][1]).toBe('number')
    })

    it('calls onAssumptionChange when life expectancy is changed', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const input = screen.getByLabelText('Life Expectancy') as HTMLInputElement
      await user.type(input, '0')

      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange.mock.calls[0][0]).toBe('lifeExpectancy')
      expect(typeof mockOnChange.mock.calls[0][1]).toBe('number')
    })
  })

  describe('descriptions', () => {
    it('displays description for each assumption', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      expect(screen.getByText(/prices increase over time/i)).toBeInTheDocument()
      expect(screen.getByText(/investment return before retirement/i)).toBeInTheDocument()
      expect(screen.getByText(/conservative return rate/i)).toBeInTheDocument()
      expect(screen.getByText(/planning horizon/i)).toBeInTheDocument()
    })
  })

  describe('tax rate toggle', () => {
    it('shows tax bracket toggle when taxRate is null', () => {
      const assumptionsWithNullTax: Assumptions = {
        ...mockAssumptions,
        taxRate: null,
      }
      render(
        <AssumptionsInputs
          assumptions={assumptionsWithNullTax}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      expect(screen.getByText('Use tax brackets')).toBeInTheDocument()
      expect(screen.getByText(/federal \+ provincial tax brackets/i)).toBeInTheDocument()
    })

    it('shows federal, provincial, and combined breakdown when using brackets', () => {
      const assumptionsWithNullTax: Assumptions = {
        ...mockAssumptions,
        taxRate: null,
      }
      render(
        <AssumptionsInputs
          assumptions={assumptionsWithNullTax}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      // Should show Federal, Provincial, Effective, and Marginal labels
      expect(screen.getByText('Federal:')).toBeInTheDocument()
      expect(screen.getByText('Provincial:')).toBeInTheDocument()
      expect(screen.getByText('Effective:')).toBeInTheDocument()
      expect(screen.getByText('Marginal:')).toBeInTheDocument()
    })

    it('shows manual input when taxRate is set', () => {
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      expect(screen.getByText('Use tax brackets')).toBeInTheDocument()
      expect(screen.getByText(/manual override/i)).toBeInTheDocument()
    })

    it('toggles from manual to brackets', async () => {
      const user = userEvent.setup()
      render(
        <AssumptionsInputs
          assumptions={mockAssumptions}
          onAssumptionChange={mockOnChange}
          province={mockProvince}
          estimatedAnnualIncome={mockEstimatedAnnualIncome}
        />
      )

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      // Should call onChange with null for taxRate
      expect(mockOnChange).toHaveBeenCalledWith('taxRate', null)
    })
  })
})
