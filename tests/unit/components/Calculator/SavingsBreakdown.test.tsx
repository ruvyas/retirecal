import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SavingsBreakdown } from '../../../../src/components/Calculator/SavingsBreakdown'
import type { SavingsBreakdown as SavingsBreakdownType } from '../../../../src/lib/types/calculator'

const defaultValue: SavingsBreakdownType = {
  rrsp: 50000,
  tfsa: 30000,
  nonRegistered: 20000,
  cash: 0,
}

describe('SavingsBreakdown', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText('Current Savings')).toBeInTheDocument()
    })

    it('displays total savings when collapsed', () => {
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)
      // Total should be $100,000
      expect(screen.getByText('$100,000')).toBeInTheDocument()
    })

    it('shows chevron icon', () => {
      const { container } = render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <SavingsBreakdown value={defaultValue} onChange={() => {}} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('collapse/expand behavior', () => {
    it('starts collapsed', () => {
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)
      // Individual inputs should not be visible initially
      expect(screen.queryByLabelText('RRSP')).not.toBeInTheDocument()
    })

    it('expands when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)

      await user.click(screen.getByText('Current Savings'))

      expect(screen.getByLabelText('RRSP')).toBeInTheDocument()
      expect(screen.getByLabelText('TFSA')).toBeInTheDocument()
      expect(screen.getByLabelText('Non-Registered')).toBeInTheDocument()
    })

    it('collapses when trigger is clicked again', async () => {
      const user = userEvent.setup()
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)

      // Expand
      await user.click(screen.getByText('Current Savings'))
      expect(screen.getByLabelText('RRSP')).toBeInTheDocument()

      // Collapse
      await user.click(screen.getByText('Current Savings'))
      expect(screen.queryByLabelText('RRSP')).not.toBeInTheDocument()
    })

    it('has correct aria-expanded attribute', async () => {
      const user = userEvent.setup()
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('sum calculation', () => {
    it('shows correct total for different values', () => {
      const value = { rrsp: 10000, tfsa: 5000, nonRegistered: 2500, cash: 0 }
      render(<SavingsBreakdown value={value} onChange={() => {}} />)
      expect(screen.getByText('$17,500')).toBeInTheDocument()
    })

    it('shows $0 when all values are zero', () => {
      const value = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0 }
      render(<SavingsBreakdown value={value} onChange={() => {}} />)
      expect(screen.getByText('$0')).toBeInTheDocument()
    })
  })

  describe('individual field updates', () => {
    it('calls onChange when RRSP is updated', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<SavingsBreakdown value={defaultValue} onChange={handleChange} />)

      // Expand
      await user.click(screen.getByText('Current Savings'))

      // Update RRSP
      const rrspInput = screen.getByLabelText('RRSP')
      await user.clear(rrspInput)
      await user.type(rrspInput, '75000')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith({
        ...defaultValue,
        rrsp: 75000,
      })
    })

    it('calls onChange when TFSA is updated', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<SavingsBreakdown value={defaultValue} onChange={handleChange} />)

      // Expand
      await user.click(screen.getByText('Current Savings'))

      // Update TFSA
      const tfsaInput = screen.getByLabelText('TFSA')
      await user.clear(tfsaInput)
      await user.type(tfsaInput, '45000')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith({
        ...defaultValue,
        tfsa: 45000,
      })
    })

    it('calls onChange when Non-Registered is updated', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<SavingsBreakdown value={defaultValue} onChange={handleChange} />)

      // Expand
      await user.click(screen.getByText('Current Savings'))

      // Update Non-Registered
      const nonRegInput = screen.getByLabelText('Non-Registered')
      await user.clear(nonRegInput)
      await user.type(nonRegInput, '35000')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith({
        ...defaultValue,
        nonRegistered: 35000,
      })
    })
  })

  describe('disabled state', () => {
    it('disables the trigger when disabled', () => {
      render(<SavingsBreakdown value={defaultValue} onChange={() => {}} disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
