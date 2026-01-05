import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormulasTab } from '@/components/Calculator/FormulasTab'
import type { CalculatorResults, Assumptions } from '@/lib/types/calculator'

describe('FormulasTab', () => {
  const defaultResults: CalculatorResults = {
    projectedSavings: 500000,
    yearsUntilRetirement: 15,
    retirementRunway: 25,
    monthlyIncome: 3500,
    monthlyIncomeToday: 2800,
    incomeGap: 500,
    savingsGrowth: 200000,
    contributionGrowth: 150000,
    grossMonthlyIncome: 4000,
    inflationAdjustedSpending: 60000,
  }

  const defaultAssumptions: Assumptions = {
    inflationRate: 0.025,
    preRetirementReturn: 0.06,
    retirementReturn: 0.04,
    taxRate: null,
    lifeExpectancy: 90,
  }

  const defaultProps = {
    results: defaultResults,
    assumptions: defaultAssumptions,
    yearsUntilRetirement: 15,
    annualRetirementSpending: 50000,
  }

  describe('Inflation Comparison Table', () => {
    it('renders the inflation-adjusted values card', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText('Inflation-Adjusted Values')).toBeInTheDocument()
    })

    it('displays monthly income in both today and at retirement values', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText('Monthly Income')).toBeInTheDocument()
      // Today's value
      expect(screen.getByText('$2,800')).toBeInTheDocument()
      // At retirement value
      expect(screen.getByText('$3,500')).toBeInTheDocument()
    })

    it('displays monthly spending in both today and at retirement values', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText('Monthly Spending')).toBeInTheDocument()
    })

    it('shows surplus when income exceeds spending', () => {
      // Income of 5000/mo > spending of 2000/mo = surplus
      const surplusProps = {
        ...defaultProps,
        results: {
          ...defaultResults,
          monthlyIncomeToday: 5000,
          monthlyIncome: 6000,
        },
        annualRetirementSpending: 24000, // 2000/mo
      }
      render(<FormulasTab {...surplusProps} />)
      expect(screen.getByText(/Monthly Surplus/)).toBeInTheDocument()
    })

    it('shows gap when spending exceeds income', () => {
      const resultsWithGap = {
        ...defaultResults,
        monthlyIncomeToday: 3000,
        monthlyIncome: 3800,
        inflationAdjustedSpending: 72000, // 6000/month at retirement
      }
      render(<FormulasTab {...defaultProps} results={resultsWithGap} />)
      expect(screen.getByText('Monthly Gap')).toBeInTheDocument()
    })

    it('displays inflation multiplier info', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText(/Inflation multiplier.*15 years/)).toBeInTheDocument()
    })
  })

  describe('Formula Explanations', () => {
    it('renders the How We Calculate card', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText('How We Calculate')).toBeInTheDocument()
    })

    it('renders all formula collapsibles', () => {
      render(<FormulasTab {...defaultProps} />)
      expect(screen.getByText('Savings Growth')).toBeInTheDocument()
      expect(screen.getByText('Contribution Growth')).toBeInTheDocument()
      expect(screen.getByText('Inflation Adjustment')).toBeInTheDocument()
      expect(screen.getByText('Sustainable Income')).toBeInTheDocument()
      expect(screen.getByText('Retirement Runway')).toBeInTheDocument()
    })

    it('expands formula section on click', async () => {
      const user = userEvent.setup()
      render(<FormulasTab {...defaultProps} />)

      const savingsGrowthTrigger = screen.getByText('Savings Growth')
      await user.click(savingsGrowthTrigger)

      // After expanding, should show formula content
      expect(screen.getByText('Future Value of Current Savings')).toBeInTheDocument()
      expect(screen.getByText('PV (Current Savings)')).toBeInTheDocument()
    })

    it('collapses formula section on second click', async () => {
      const user = userEvent.setup()
      render(<FormulasTab {...defaultProps} />)

      const savingsGrowthTrigger = screen.getByText('Savings Growth')
      // Open
      await user.click(savingsGrowthTrigger)
      expect(screen.getByText('Future Value of Current Savings')).toBeInTheDocument()

      // Close
      await user.click(savingsGrowthTrigger)
      // Content should be hidden - Radix Collapsible removes content from DOM when closed
      expect(screen.queryByText('Future Value of Current Savings')).not.toBeInTheDocument()
    })
  })

  describe('with custom assumptions', () => {
    it('uses custom inflation rate', () => {
      const customAssumptions = {
        ...defaultAssumptions,
        inflationRate: 0.03,
      }
      render(<FormulasTab {...defaultProps} assumptions={customAssumptions} />)
      expect(screen.getByText(/3\.0%\/year/)).toBeInTheDocument()
    })

    it('handles undefined assumptions gracefully', () => {
      render(<FormulasTab {...defaultProps} assumptions={undefined} />)
      // Should use default values and not throw
      expect(screen.getByText('Inflation-Adjusted Values')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('all collapsible triggers are keyboard accessible', () => {
      render(<FormulasTab {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})
