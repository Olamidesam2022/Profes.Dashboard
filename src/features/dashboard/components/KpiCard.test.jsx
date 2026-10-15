import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import KpiCard from './KpiCard.jsx'

describe('KpiCard', () => {
  it('shows the value and a directional comparison, not relying on color alone', () => {
    render(
      <KpiCard
        title="Revenue"
        value="$12,500"
        delta={{ change: 500, percent: 4.2, direction: 'up' }}
      />,
    )

    expect(screen.getByRole('article', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByText('$12,500')).toBeInTheDocument()
    expect(screen.getByText('Up 4.2%')).toBeInTheDocument()
    expect(screen.getByText('vs previous period')).toBeInTheDocument()
  })

  it('treats a refund-rate decrease as favorable and identifies unavailable comparison data', () => {
    const { rerender } = render(
      <KpiCard
        title="Refund rate"
        value="2.5%"
        delta={{ change: -0.5, percent: -16.7, direction: 'down' }}
        inverse
      />,
    )

    expect(screen.getByText('Down 16.7%').closest('p')).toHaveClass(/positive/)

    rerender(<KpiCard title="Revenue" value="$0" delta={null} />)
    expect(
      screen.getByText('Comparison unavailable · No previous period'),
    ).toBeInTheDocument()
  })

  it('handles a zero-baseline percentage as unavailable', () => {
    render(
      <KpiCard
        title="Orders"
        value="4"
        delta={{ change: 4, percent: null, direction: 'up' }}
      />,
    )
    expect(screen.getByText('Up · No previous value')).toBeInTheDocument()
  })
})
