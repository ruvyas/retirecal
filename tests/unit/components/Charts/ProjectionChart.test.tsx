import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ProjectionChart,
  type ProjectionDataPoint,
} from '../../../../src/components/Charts/ProjectionChart'

const mockData: ProjectionDataPoint[] = [
  { age: 30, savings: 100000, isRetirement: false },
  { age: 35, savings: 200000, isRetirement: false },
  { age: 40, savings: 350000, isRetirement: false },
  { age: 45, savings: 550000, isRetirement: false },
  { age: 50, savings: 800000, isRetirement: false },
  { age: 55, savings: 1100000, isRetirement: false },
  { age: 60, savings: 1500000, isRetirement: false },
  { age: 65, savings: 1400000, isRetirement: true },
  { age: 70, savings: 1250000, isRetirement: true },
  { age: 75, savings: 1050000, isRetirement: true },
  { age: 80, savings: 800000, isRetirement: true },
  { age: 85, savings: 500000, isRetirement: true },
  { age: 90, savings: 150000, isRetirement: true },
]

describe('ProjectionChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)
      // Chart should render - check for accessible table
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <ProjectionChart data={mockData} retirementAge={65} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('empty state', () => {
    it('displays message when data is empty', () => {
      render(<ProjectionChart data={[]} retirementAge={65} />)
      expect(screen.getByText('No projection data available')).toBeInTheDocument()
    })

    it('displays message when data is null-ish', () => {
      render(
        <ProjectionChart data={undefined as unknown as ProjectionDataPoint[]} retirementAge={65} />
      )
      expect(screen.getByText('No projection data available')).toBeInTheDocument()
    })

    it('has appropriate aria-label for empty state', () => {
      render(<ProjectionChart data={[]} retirementAge={65} />)
      expect(screen.getByRole('img', { name: /no projection data/i })).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders accessible data table for screen readers', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(table).toHaveClass('sr-only')
    })

    it('includes table caption', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)

      expect(screen.getByText('Savings projection by age')).toBeInTheDocument()
    })

    it('displays data rows in accessible table', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)

      // Check for column headers
      expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Projected Savings' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Phase' })).toBeInTheDocument()

      // Check for data rows
      const rows = screen.getAllByRole('row')
      // 1 header row + 13 data rows
      expect(rows).toHaveLength(14)
    })

    it('shows phase as Accumulation before retirement', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)

      // Find cells with "Accumulation" text
      const accumulationCells = screen.getAllByRole('cell', { name: 'Accumulation' })
      expect(accumulationCells.length).toBeGreaterThan(0)
    })

    it('shows phase as Retirement after retirement age', () => {
      render(<ProjectionChart data={mockData} retirementAge={65} />)

      // Find cells with "Retirement" text
      const retirementCells = screen.getAllByRole('cell', { name: 'Retirement' })
      expect(retirementCells.length).toBeGreaterThan(0)
    })
  })

  describe('data formatting', () => {
    it('formats savings values in accessible table', () => {
      const smallData: ProjectionDataPoint[] = [{ age: 30, savings: 1234567, isRetirement: false }]

      render(<ProjectionChart data={smallData} retirementAge={65} />)

      // Should format as currency with commas
      expect(screen.getByText('$1,234,567')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles single data point', () => {
      const singlePoint: ProjectionDataPoint[] = [{ age: 30, savings: 100000, isRetirement: false }]

      render(<ProjectionChart data={singlePoint} retirementAge={65} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('handles zero savings', () => {
      const zeroData: ProjectionDataPoint[] = [
        { age: 30, savings: 0, isRetirement: false },
        { age: 65, savings: 0, isRetirement: true },
      ]

      render(<ProjectionChart data={zeroData} retirementAge={65} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByText('$0')).toHaveLength(2)
    })

    it('handles negative savings (debt scenario)', () => {
      const negativeData: ProjectionDataPoint[] = [{ age: 80, savings: -50000, isRetirement: true }]

      render(<ProjectionChart data={negativeData} retirementAge={65} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('handles large savings values', () => {
      const largeData: ProjectionDataPoint[] = [{ age: 65, savings: 10000000, isRetirement: true }]

      render(<ProjectionChart data={largeData} retirementAge={65} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('$10,000,000')).toBeInTheDocument()
    })
  })
})
