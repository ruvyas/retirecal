import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../../../../src/components/Layout/Footer'

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays disclaimer text', () => {
    render(<Footer />)
    expect(screen.getByText(/disclaimer/i)).toBeInTheDocument()
    expect(screen.getByText(/educational purposes/i)).toBeInTheDocument()
  })

  it('displays financial advisor recommendation', () => {
    render(<Footer />)
    expect(screen.getByText(/financial advisor/i)).toBeInTheDocument()
  })

  it('displays copyright notice', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
    expect(screen.getByText(/RetireCal/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Footer className="custom-class" />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('custom-class')
  })

  it('has border styling', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('border-t')
  })
})
