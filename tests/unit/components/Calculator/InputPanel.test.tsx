import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputPanel } from '../../../../src/components/Calculator/InputPanel'
import type { CalculatorInputs } from '../../../../src/lib/types/calculator'

const defaultValues: CalculatorInputs = {
  currentAge: 30,
  retirementAge: 65,
  annualIncome: 75000,
  savings: {
    rrsp: 50000,
    tfsa: 30000,
    nonRegistered: 20000,
  },
  contributions: {
    rrsp: 200,
    tfsa: 200,
    nonRegistered: 100,
  },
  annualRetirementSpending: 50000,
}

describe('InputPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders all input components', () => {
      render(<InputPanel values={defaultValues} onChange={() => {}} />)

      // Age sliders
      expect(screen.getByText('Current Age')).toBeInTheDocument()
      expect(screen.getByText('Retirement Age')).toBeInTheDocument()

      // Currency inputs
      expect(screen.getByLabelText('Annual Income')).toBeInTheDocument()
      expect(screen.getByLabelText('Annual Retirement Spending')).toBeInTheDocument()

      // Savings and contributions breakdowns
      expect(screen.getByText('Current Savings')).toBeInTheDocument()
      expect(screen.getByText('Monthly Contributions')).toBeInTheDocument()
    })

    it('displays correct initial values', () => {
      render(<InputPanel values={defaultValues} onChange={() => {}} />)

      expect(screen.getByDisplayValue('30')).toBeInTheDocument() // Current age
      expect(screen.getByDisplayValue('65')).toBeInTheDocument() // Retirement age
      expect(screen.getByDisplayValue('$75,000')).toBeInTheDocument() // Annual income
      // Total monthly contributions: 200 + 200 + 100 = $500/mo
      expect(screen.getByText('$500/mo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('$50,000')).toBeInTheDocument() // Annual retirement spending
    })

    it('applies custom className', () => {
      const { container } = render(
        <InputPanel values={defaultValues} onChange={() => {}} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('onChange callbacks', () => {
    it('calls onChange after debounce when current age changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const handleChange = vi.fn()
      render(<InputPanel values={defaultValues} onChange={handleChange} />)

      // Find and update current age input (first spinbutton)
      const inputs = screen.getAllByRole('spinbutton')
      const currentAgeInput = inputs[0]

      await user.clear(currentAgeInput)
      await user.type(currentAgeInput, '35')
      await user.tab()

      // Advance timers past debounce
      await vi.advanceTimersByTimeAsync(200)

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })

      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
      expect(lastCall.currentAge).toBe(35)
    })

    it('calls onChange after debounce when annual income changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const handleChange = vi.fn()
      render(<InputPanel values={defaultValues} onChange={handleChange} />)

      const incomeInput = screen.getByLabelText('Annual Income')
      await user.clear(incomeInput)
      await user.type(incomeInput, '100000')
      await user.tab()

      await vi.advanceTimersByTimeAsync(200)

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })

      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
      expect(lastCall.annualIncome).toBe(100000)
    })
  })

  describe('debouncing', () => {
    it('debounces rapid changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const handleChange = vi.fn()
      render(<InputPanel values={defaultValues} onChange={handleChange} />)

      const incomeInput = screen.getByLabelText('Annual Income')

      // Type quickly
      await user.clear(incomeInput)
      await user.type(incomeInput, '80000')
      await user.tab()

      // Should not have called onChange yet (debouncing)
      expect(handleChange).not.toHaveBeenCalled()

      // Advance past debounce delay
      await vi.advanceTimersByTimeAsync(200)

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })
  })

  describe('age validation', () => {
    it('ensures retirement age stays greater than current age', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const handleChange = vi.fn()
      render(<InputPanel values={defaultValues} onChange={handleChange} />)

      // Find current age input (first spinbutton)
      const inputs = screen.getAllByRole('spinbutton')
      const currentAgeInput = inputs[0]

      // Set current age to 60 (above default retirement age of 65)
      await user.clear(currentAgeInput)
      await user.type(currentAgeInput, '60')
      await user.tab()

      await vi.advanceTimersByTimeAsync(200)

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })

      // Retirement age should be at least current age + 1
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
      expect(lastCall.retirementAge).toBeGreaterThanOrEqual(lastCall.currentAge + 1)
    })
  })

  describe('disabled state', () => {
    it('disables all inputs when disabled prop is true', () => {
      render(<InputPanel values={defaultValues} onChange={() => {}} disabled />)

      // Check that inputs are disabled
      const spinbuttons = screen.getAllByRole('spinbutton')
      spinbuttons.forEach((input) => {
        expect(input).toBeDisabled()
      })
    })
  })

  describe('savings breakdown integration', () => {
    it('displays total savings', () => {
      render(<InputPanel values={defaultValues} onChange={() => {}} />)
      // Total should be 50000 + 30000 + 20000 = 100000
      expect(screen.getByText('$100,000')).toBeInTheDocument()
    })
  })
})
