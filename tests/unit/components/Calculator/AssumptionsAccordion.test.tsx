import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('AssumptionsAccordion', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)
      expect(screen.getByText('Calculation Assumptions')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AssumptionsAccordion assumptions={mockAssumptions} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('expand/collapse behavior', () => {
    it('is collapsed by default', () => {
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)
      // Content should not be present initially (accordion removes content from DOM when collapsed)
      expect(screen.queryByText('Inflation Rate')).not.toBeInTheDocument()
    })

    it('expands when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))

      expect(screen.getByText('Inflation Rate')).toBeInTheDocument()
      expect(screen.getByText('Pre-Retirement Return')).toBeInTheDocument()
      expect(screen.getByText('Retirement Return')).toBeInTheDocument()
      expect(screen.getByText('Tax Rate')).toBeInTheDocument()
      expect(screen.getByText('Life Expectancy')).toBeInTheDocument()
    })

    it('collapses when trigger is clicked again', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      // Expand
      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('Inflation Rate')).toBeInTheDocument()

      // Collapse
      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.queryByText('Inflation Rate')).not.toBeInTheDocument()
    })
  })

  describe('assumption values display', () => {
    it('displays inflation rate as percentage', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('2.0%')).toBeInTheDocument()
    })

    it('displays pre-retirement return as percentage', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('5.5%')).toBeInTheDocument()
    })

    it('displays retirement return as percentage', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('3.5%')).toBeInTheDocument()
    })

    it('displays tax rate as percentage', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('25.0%')).toBeInTheDocument()
    })

    it('displays life expectancy in years', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))
      expect(screen.getByText('95 years')).toBeInTheDocument()
    })
  })

  describe('descriptions', () => {
    it('displays description for each assumption', async () => {
      const user = userEvent.setup()
      render(<AssumptionsAccordion assumptions={mockAssumptions} />)

      await user.click(screen.getByText('Calculation Assumptions'))

      expect(screen.getByText(/prices increase over time/i)).toBeInTheDocument()
      expect(screen.getByText(/investment return before retirement/i)).toBeInTheDocument()
      expect(screen.getByText(/conservative return rate/i)).toBeInTheDocument()
      expect(screen.getByText(/blended tax rate/i)).toBeInTheDocument()
      expect(screen.getByText(/planning horizon/i)).toBeInTheDocument()
    })
  })
})
