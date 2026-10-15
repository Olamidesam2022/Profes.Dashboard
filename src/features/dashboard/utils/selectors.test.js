import { describe, expect, it } from 'vitest'
import {
  aggregateByCategory,
  aggregateByChannel,
  aggregateKpis,
  aggregateRevenueTrend,
  aggregateTopRegions,
  calculateDelta,
  filterSalesData,
  getPreviousPeriodFilters,
  selectDashboardData,
} from './selectors.js'

const rows = [
  {
    id: '1',
    date: '2025-01-01',
    category: 'Apparel',
    region: 'West',
    channel: 'Online',
    revenue: 100,
    orders: 4,
    customers: 3,
    refunds: 1,
  },
  {
    id: '2',
    date: '2025-01-02',
    category: 'Home',
    region: 'East',
    channel: 'Retail',
    revenue: 60,
    orders: 2,
    customers: 2,
    refunds: 0,
  },
  {
    id: '3',
    date: '2025-01-08',
    category: 'Apparel',
    region: 'West',
    channel: 'Retail',
    revenue: 90,
    orders: 3,
    customers: 3,
    refunds: 0,
  },
]

const noFilters = { startDate: '', endDate: '', categories: [], region: '' }

describe('dashboard selectors', () => {
  it('filters inclusively by date, multiple categories, and region', () => {
    expect(
      filterSalesData(rows, {
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        categories: ['Apparel', 'Home'],
        region: 'West',
      }).map((row) => row.id),
    ).toEqual(['1'])
    expect(filterSalesData(rows, { ...noFilters, startDate: '2025-01-03' })).toEqual([
      rows[2],
    ])
    expect(filterSalesData(rows, { ...noFilters, categories: ['Unknown'] })).toEqual([])
  })

  it('aggregates KPI totals, average order value, and refund rate', () => {
    expect(aggregateKpis(rows)).toEqual({
      revenue: 250,
      orders: 9,
      customers: 8,
      refunds: 1,
      averageOrderValue: 250 / 9,
      refundRate: (1 / 9) * 100,
    })
    expect(aggregateKpis([])).toEqual({
      revenue: 0,
      orders: 0,
      customers: 0,
      refunds: 0,
      averageOrderValue: 0,
      refundRate: 0,
    })
  })

  it('computes signed deltas including a zero-baseline percentage', () => {
    expect(calculateDelta(125, 100)).toEqual({
      change: 25,
      percent: 25,
      direction: 'up',
    })
    expect(calculateDelta(75, 100)).toEqual({
      change: -25,
      percent: -25,
      direction: 'down',
    })
    expect(calculateDelta(0, 0)).toEqual({ change: 0, percent: 0, direction: 'flat' })
    expect(calculateDelta(4, 0)).toEqual({ change: 4, percent: null, direction: 'up' })
  })

  it('groups revenue by day, ISO-week start, and month', () => {
    expect(aggregateRevenueTrend(rows, 'day')).toEqual([
      { period: '2025-01-01', revenue: 100, orders: 4 },
      { period: '2025-01-02', revenue: 60, orders: 2 },
      { period: '2025-01-08', revenue: 90, orders: 3 },
    ])
    expect(aggregateRevenueTrend(rows, 'week')).toEqual([
      { period: '2024-12-30', revenue: 160, orders: 6 },
      { period: '2025-01-06', revenue: 90, orders: 3 },
    ])
    expect(aggregateRevenueTrend(rows, 'month')).toEqual([
      { period: '2025-01', revenue: 250, orders: 9 },
    ])
    expect(() => aggregateRevenueTrend(rows, 'quarter')).toThrow(RangeError)
  })

  it('aggregates categories and channels, and sorts regions by revenue', () => {
    expect(aggregateByCategory(rows)).toEqual([
      { category: 'Apparel', revenue: 190, orders: 7 },
      { category: 'Home', revenue: 60, orders: 2 },
    ])
    expect(aggregateByChannel(rows)).toEqual([
      { channel: 'Online', revenue: 100, orders: 4 },
      { channel: 'Retail', revenue: 150, orders: 5 },
    ])
    expect(aggregateTopRegions(rows, 1)).toEqual([
      { region: 'West', revenue: 190, orders: 7 },
    ])
    expect(aggregateTopRegions(rows, 0)).toEqual([])
  })

  it('selects a previous inclusive period with the same dimension filters', () => {
    expect(
      getPreviousPeriodFilters({
        startDate: '2025-01-08',
        endDate: '2025-01-14',
        categories: ['Home'],
        region: 'East',
      }),
    ).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      categories: ['Home'],
      region: 'East',
    })
    expect(getPreviousPeriodFilters(noFilters)).toBeNull()
    expect(
      getPreviousPeriodFilters({
        ...noFilters,
        startDate: '2025-01-02',
        endDate: '2025-01-01',
      }),
    ).toBeNull()
  })

  it('returns coordinated filtered rows, KPIs, trends, dimensions, and deltas', () => {
    const result = selectDashboardData(
      rows,
      {
        startDate: '2025-01-08',
        endDate: '2025-01-14',
        categories: [],
        region: '',
      },
      'day',
    )

    expect(result.filteredRows.map((row) => row.id)).toEqual(['3'])
    expect(result.kpis.revenue).toBe(90)
    expect(result.revenueTrend).toEqual([
      { period: '2025-01-08', revenue: 90, orders: 3 },
    ])
    expect(result.deltas.revenue).toEqual({
      change: -70,
      percent: -43.75,
      direction: 'down',
    })
    expect(
      selectDashboardData(rows, {
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        categories: [],
        region: '',
      }).deltas,
    ).toBeNull()
    expect(selectDashboardData(rows, noFilters).deltas).toBeNull()
  })
})
