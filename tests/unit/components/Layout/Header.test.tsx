import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../../../../src/components/Layout/Header'

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('displays the app name', () => {
    render(<Header />)
    expect(screen.getByText('RetireCal')).toBeInTheDocument()
  })

  it('has correct aria-label on logo', () => {
    render(<Header />)
    expect(screen.getByLabelText('RetireCal')).toBeInTheDocument()
  })

  it('contains navigation element', () => {
    render(<Header />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Header className="custom-class" />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('custom-class')
  })

  it('has sticky positioning classes', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
  })
})
