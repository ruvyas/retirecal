import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyInput } from '../../../../src/components/Calculator/CurrencyInput'

describe('CurrencyInput', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} />)
      expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('displays formatted value when not focused', () => {
      render(<CurrencyInput label="Amount" value={1234} onChange={() => {}} />)
      expect(screen.getByDisplayValue('$1,234')).toBeInTheDocument()
    })

    it('displays zero as $0', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} />)
      expect(screen.getByDisplayValue('$0')).toBeInTheDocument()
    })

    it('renders help text when provided', () => {
      render(
        <CurrencyInput label="Amount" value={0} onChange={() => {}} helpText="Enter your amount" />
      )
      expect(screen.getByText('Enter your amount')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <CurrencyInput label="Amount" value={0} onChange={() => {}} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('input behavior', () => {
    it('shows raw value when focused', async () => {
      const user = userEvent.setup()
      render(<CurrencyInput label="Amount" value={1234} onChange={() => {}} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)

      expect(input).toHaveValue('1234')
    })

    it('shows empty string when focused with zero value', async () => {
      const user = userEvent.setup()
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)

      expect(input).toHaveValue('')
    })

    it('calls onChange with parsed number on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput label="Amount" value={0} onChange={handleChange} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)
      await user.type(input, '5000')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(5000)
    })

    it('strips non-numeric characters', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput label="Amount" value={0} onChange={handleChange} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)
      await user.type(input, '$1,234.56')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(1234.56)
    })

    it('handles empty input as zero', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput label="Amount" value={1000} onChange={handleChange} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)
      await user.clear(input)
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(0)
    })
  })

  describe('min/max constraints', () => {
    it('clamps value to min on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput label="Amount" value={0} onChange={handleChange} min={100} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)
      await user.type(input, '50')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(100)
    })

    it('clamps value to max on blur', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(<CurrencyInput label="Amount" value={0} onChange={handleChange} max={1000} />)

      const input = screen.getByLabelText('Amount')
      await user.click(input)
      await user.type(input, '5000')
      await user.tab()

      expect(handleChange).toHaveBeenCalledWith(1000)
    })
  })

  describe('accessibility', () => {
    it('associates label with input', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} />)
      expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('has inputMode="decimal" for mobile keyboards', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} />)
      expect(screen.getByLabelText('Amount')).toHaveAttribute('inputMode', 'decimal')
    })

    it('links help text via aria-describedby', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} helpText="Help text" />)
      const input = screen.getByLabelText('Amount')
      expect(input).toHaveAttribute('aria-describedby')
      expect(screen.getByText('Help text')).toBeInTheDocument()
    })

    it('supports custom aria-describedby', () => {
      render(
        <>
          <CurrencyInput
            label="Amount"
            value={0}
            onChange={() => {}}
            aria-describedby="custom-desc"
          />
          <div id="custom-desc">Custom description</div>
        </>
      )
      const input = screen.getByLabelText('Amount')
      expect(input.getAttribute('aria-describedby')).toContain('custom-desc')
    })

    it('can be disabled', () => {
      render(<CurrencyInput label="Amount" value={0} onChange={() => {}} disabled />)
      expect(screen.getByLabelText('Amount')).toBeDisabled()
    })
  })
})
