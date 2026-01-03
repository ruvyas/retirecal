import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsPanel } from '../../../../src/components/Calculator/ResultsPanel'
import type { CalculatorResults } from '../../../../src/lib/types/calculator'

const mockResults: CalculatorResults = {
  projectedSavings: 1500000,
  yearsUntilRetirement: 30,
  retirementRunway: 25,
  monthlyIncome: 5000,
  incomeGap: 500,
}

const negativeGapResults: CalculatorResults = {
  ...mockResults,
  incomeGap: -1000,
}

describe('ResultsPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('Projected Savings at Retirement')).toBeInTheDocument()
    })

    it('displays all result values', () => {
      render(<ResultsPanel results={mockResults} />)

      expect(screen.getByText('Projected Savings at Retirement')).toBeInTheDocument()
      expect(screen.getByText('Years Until Retirement')).toBeInTheDocument()
      expect(screen.getByText('Retirement Runway')).toBeInTheDocument()
      expect(screen.getByText('Sustainable Monthly Income')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<ResultsPanel results={mockResults} className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('value formatting', () => {
    it('formats projected savings as currency', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('$1,500,000')).toBeInTheDocument()
    })

    it('formats years until retirement as number', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('formats retirement runway as years', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('25 years')).toBeInTheDocument()
    })

    it('formats monthly income as currency', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('$5,000')).toBeInTheDocument()
    })
  })

  describe('status indicator', () => {
    it('shows on-track status for positive gap', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('On Track')).toBeInTheDocument()
    })

    it('shows significant-gap status for large negative gap', () => {
      render(<ResultsPanel results={negativeGapResults} />)
      expect(screen.getByText('Significant Gap')).toBeInTheDocument()
    })

    it('shows attention-needed status for small negative gap', () => {
      const attentionResults = { ...mockResults, incomeGap: -300 }
      render(<ResultsPanel results={attentionResults} />)
      expect(screen.getByText('Attention Needed')).toBeInTheDocument()
    })
  })

  describe('gap/surplus display', () => {
    it('shows Surplus label for positive gap', () => {
      render(<ResultsPanel results={mockResults} />)
      expect(screen.getByText('Monthly Surplus')).toBeInTheDocument()
    })

    it('shows Gap label for negative gap', () => {
      render(<ResultsPanel results={negativeGapResults} />)
      expect(screen.getByText('Monthly Gap')).toBeInTheDocument()
    })

    it('formats gap as absolute value', () => {
      render(<ResultsPanel results={negativeGapResults} />)
      // Should show $1,000 (absolute value of -1000)
      expect(screen.getByText('$1,000')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      const { container } = render(<ResultsPanel results={null} isLoading />)
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('shows loading skeleton when results is null', () => {
      const { container } = render(<ResultsPanel results={null} />)
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('does not show loading skeleton when results are provided', () => {
      const { container } = render(<ResultsPanel results={mockResults} />)
      expect(container.querySelectorAll('.animate-pulse').length).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles zero gap', () => {
      const zeroGapResults = { ...mockResults, incomeGap: 0 }
      render(<ResultsPanel results={zeroGapResults} />)
      expect(screen.getByText('On Track')).toBeInTheDocument()
      expect(screen.getByText('Monthly Surplus')).toBeInTheDocument()
    })

    it('handles infinite runway', () => {
      const infiniteResults = { ...mockResults, retirementRunway: Infinity }
      render(<ResultsPanel results={infiniteResults} />)
      expect(screen.getByText('Indefinitely')).toBeInTheDocument()
    })
  })
})
