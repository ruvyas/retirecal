import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsPanel } from '../../../../src/components/Calculator/ResultsPanel'
import type { CalculatorResults } from '../../../../src/lib/types/calculator'
import type { ProjectionDataPoint } from '../../../../src/components/Charts/ProjectionChart'

const mockResults: CalculatorResults = {
  projectedSavings: 1500000,
  yearsUntilRetirement: 30,
  retirementRunway: 25,
  monthlyIncome: 5000,
  monthlyIncomeToday: 2760, // Discounted by ~2% inflation over 30 years
  incomeGap: 500,
  // Breakdown values
  savingsGrowth: 600000,
  contributionGrowth: 900000,
  grossMonthlyIncome: 6667,
  inflationAdjustedSpending: 54000,
}

// Helper to create a complete ProjectionDataPoint with defaults
function createDataPoint(
  overrides: Partial<ProjectionDataPoint> & { age: number; savings: number; isRetirement: boolean }
): ProjectionDataPoint {
  return {
    phase: overrides.isRetirement ? 'retirement' : 'accumulation',
    annualContribution: overrides.isRetirement ? 0 : 6000,
    annualWithdrawal: overrides.isRetirement ? 50000 : 0,
    originalWithdrawal: overrides.isRetirement ? 30000 : 0,
    growthAmount: overrides.savings * 0.06,
    returnRate: overrides.isRetirement ? 0.04 : 0.06,
    postTaxIncome: overrides.isRetirement ? 35000 : 0,
    postTaxIncomeToday: overrides.isRetirement ? 28000 : 0,
    cumulativeContributions: 0,
    previousSavings: 0,
    ...overrides,
  }
}

const mockProjectionData: ProjectionDataPoint[] = [
  createDataPoint({ age: 30, savings: 100000, isRetirement: false }),
  createDataPoint({ age: 45, savings: 500000, isRetirement: false }),
  createDataPoint({ age: 65, savings: 1500000, isRetirement: false }),
  createDataPoint({ age: 80, savings: 1000000, isRetirement: true }),
  createDataPoint({ age: 95, savings: 200000, isRetirement: true }),
]

const negativeGapResults: CalculatorResults = {
  ...mockResults,
  incomeGap: -1000,
}

const mockAssumptions = {
  inflationRate: 0.02,
  preRetirementReturn: 0.055,
  retirementReturn: 0.035,
  taxRate: null,
  lifeExpectancy: 95,
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
      expect(screen.getByText('Monthly Surplus')).toBeInTheDocument()
    })

    it('handles infinite runway', () => {
      const infiniteResults = { ...mockResults, retirementRunway: Infinity }
      render(<ResultsPanel results={infiniteResults} />)
      expect(screen.getByText('Indefinitely')).toBeInTheDocument()
    })
  })

  describe('tooltips', () => {
    // Note: Radix UI tooltips use portals and may not reliably show content on hover in jsdom.
    // We test that the tooltip triggers are correctly configured with aria-labels.

    it('projected savings has tooltip trigger with correct aria-label', () => {
      render(<ResultsPanel results={mockResults} />)

      // The value should be wrapped in a tooltip trigger with the correct aria-label
      const triggers = screen.getAllByRole('button')
      const savingsTrigger = triggers.find((t) =>
        t.getAttribute('aria-label')?.includes('How this is calculated')
      )
      expect(savingsTrigger).toBeInTheDocument()
    })

    it('monthly income has tooltip trigger with correct aria-label', () => {
      render(<ResultsPanel results={mockResults} />)

      const triggers = screen.getAllByRole('button')
      const incomeTrigger = triggers.find((t) =>
        t.getAttribute('aria-label')?.includes('Income calculation')
      )
      expect(incomeTrigger).toBeInTheDocument()
    })

    it('retirement runway has tooltip trigger with correct aria-label', () => {
      render(<ResultsPanel results={mockResults} assumptions={mockAssumptions} />)

      const triggers = screen.getAllByRole('button')
      const runwayTrigger = triggers.find((t) =>
        t.getAttribute('aria-label')?.includes('Retirement runway breakdown')
      )
      expect(runwayTrigger).toBeInTheDocument()
    })

    it('income gap has tooltip trigger with correct aria-label', () => {
      render(<ResultsPanel results={mockResults} />)

      const triggers = screen.getAllByRole('button')
      const gapTrigger = triggers.find((t) =>
        t.getAttribute('aria-label')?.includes('Income gap breakdown')
      )
      expect(gapTrigger).toBeInTheDocument()
    })

    it('tooltip triggers are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<ResultsPanel results={mockResults} />)

      // Tab to the first result value
      await user.tab()
      const focusedElement = document.activeElement
      expect(focusedElement).toHaveAttribute('aria-label')
    })
  })

  describe('projection chart integration', () => {
    it('renders projection chart when data is provided', () => {
      render(
        <ResultsPanel
          results={mockResults}
          projectionData={mockProjectionData}
          retirementAge={65}
          currentAge={30}
          lifeExpectancy={95}
        />
      )

      expect(screen.getByText('Savings Projection')).toBeInTheDocument()
    })

    it('does not render chart when projectionData is undefined', () => {
      render(<ResultsPanel results={mockResults} />)

      expect(screen.queryByText('Savings Projection')).not.toBeInTheDocument()
    })

    it('does not render chart when retirementAge is undefined', () => {
      render(
        <ResultsPanel
          results={mockResults}
          projectionData={mockProjectionData}
          currentAge={30}
          lifeExpectancy={95}
        />
      )

      expect(screen.queryByText('Savings Projection')).not.toBeInTheDocument()
    })

    it('does not render chart when currentAge is undefined', () => {
      render(
        <ResultsPanel
          results={mockResults}
          projectionData={mockProjectionData}
          retirementAge={65}
          lifeExpectancy={95}
        />
      )

      expect(screen.queryByText('Savings Projection')).not.toBeInTheDocument()
    })

    it('does not render chart when lifeExpectancy is undefined', () => {
      render(
        <ResultsPanel
          results={mockResults}
          projectionData={mockProjectionData}
          retirementAge={65}
          currentAge={30}
        />
      )

      expect(screen.queryByText('Savings Projection')).not.toBeInTheDocument()
    })

    it('renders chart with accessible table', () => {
      render(
        <ResultsPanel
          results={mockResults}
          projectionData={mockProjectionData}
          retirementAge={65}
          currentAge={30}
          lifeExpectancy={95}
        />
      )

      // ProjectionChart should render its accessible table
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('includes chart in loading skeleton', () => {
      const { container } = render(<ResultsPanel results={null} isLoading />)

      // Should have multiple skeleton elements including one for chart
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(5) // Cards + chart skeleton
    })
  })
})
