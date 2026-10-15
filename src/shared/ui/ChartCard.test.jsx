import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ChartCard from './ChartCard.jsx'

describe('ChartCard', () => {
  it('exposes the chart summary and a keyboard-operable table fallback', async () => {
    const user = userEvent.setup()
    render(
      <ChartCard
        title="Revenue over time"
        summary="Revenue by month, 12 periods shown."
        data={[{ period: 'Jan', revenue: 250 }]}
        columns={[
          { key: 'period', label: 'Period' },
          { key: 'revenue', label: 'Revenue', format: (value) => `$${value}` },
        ]}
      >
        <span>Chart visual</span>
      </ChartCard>,
    )

    expect(screen.getByRole('region', { name: 'Revenue over time' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Revenue by month, 12 periods shown.' }),
    ).toBeInTheDocument()
    await user.click(screen.getByText('View as table'))
    expect(
      screen.getByRole('table', { name: 'Revenue over time data' }),
    ).toBeInTheDocument()
    expect(screen.getByText('$250')).toBeInTheDocument()
  })

  it('provides a readable empty chart and table state', () => {
    render(
      <ChartCard
        title="Revenue by region"
        summary="No regions match the current view."
        data={[]}
        columns={[{ key: 'region', label: 'Region' }]}
      >
        <span>Unused chart</span>
      </ChartCard>,
    )

    expect(screen.getByText('No data for this selection.')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Revenue by region' })).toBeInTheDocument()
  })
})
