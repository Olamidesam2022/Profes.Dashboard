/**
 * @typedef {import('../../../data/salesRepository.js').SalesRecord} SalesRecord
 * @typedef {import('../state/filterState.js').DashboardFilters} DashboardFilters
 */

/**
 * @param {SalesRecord[]} rows
 * @param {DashboardFilters} filters
 * @returns {SalesRecord[]}
 */
export function filterSalesData(rows, filters) {
  return rows.filter((row) => {
    if (filters.startDate && row.date < filters.startDate) return false
    if (filters.endDate && row.date > filters.endDate) return false
    if (filters.categories.length > 0 && !filters.categories.includes(row.category)) {
      return false
    }
    if (filters.region && row.region !== filters.region) return false
    return true
  })
}

/**
 * @param {SalesRecord[]} rows
 * @returns {{revenue: number, orders: number, customers: number, refunds: number, averageOrderValue: number, refundRate: number}}
 */
export function aggregateKpis(rows) {
  const totals = rows.reduce(
    (result, row) => ({
      revenue: result.revenue + row.revenue,
      orders: result.orders + row.orders,
      customers: result.customers + row.customers,
      refunds: result.refunds + row.refunds,
    }),
    { revenue: 0, orders: 0, customers: 0, refunds: 0 },
  )

  return {
    ...totals,
    averageOrderValue: totals.orders === 0 ? 0 : totals.revenue / totals.orders,
    refundRate: totals.orders === 0 ? 0 : (totals.refunds / totals.orders) * 100,
  }
}

/**
 * @param {number} current
 * @param {number} previous
 * @returns {{change: number, percent: number | null, direction: 'up' | 'down' | 'flat'}}
 */
export function calculateDelta(current, previous) {
  const change = current - previous
  const percent = previous === 0 ? (current === 0 ? 0 : null) : (change / previous) * 100

  return {
    change,
    percent,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  }
}

/**
 * @param {SalesRecord[]} rows
 * @param {'day' | 'week' | 'month'} interval
 * @returns {{period: string, revenue: number, orders: number}[]}
 */
export function aggregateRevenueTrend(rows, interval = 'month') {
  const totals = new Map()

  for (const row of rows) {
    const period = toPeriod(row.date, interval)
    const total = totals.get(period) ?? { period, revenue: 0, orders: 0 }
    total.revenue += row.revenue
    total.orders += row.orders
    totals.set(period, total)
  }

  return [...totals.values()].sort((first, second) =>
    first.period.localeCompare(second.period),
  )
}

/**
 * @param {SalesRecord[]} rows
 * @returns {{category: string, revenue: number, orders: number}[]}
 */
export function aggregateByCategory(rows) {
  return aggregateByDimension(rows, 'category')
}

/**
 * @param {SalesRecord[]} rows
 * @param {number} [limit]
 * @returns {{region: string, revenue: number, orders: number}[]}
 */
export function aggregateTopRegions(rows, limit = 5) {
  return aggregateByDimension(rows, 'region')
    .sort((first, second) => second.revenue - first.revenue)
    .slice(0, limit)
}

/**
 * @param {SalesRecord[]} rows
 * @returns {{channel: string, revenue: number, orders: number}[]}
 */
export function aggregateByChannel(rows) {
  return aggregateByDimension(rows, 'channel')
}

/**
 * @param {SalesRecord[]} rows
 * @param {DashboardFilters} filters
 * @param {'day' | 'week' | 'month'} [interval]
 */
export function selectDashboardData(rows, filters, interval = 'month') {
  const filteredRows = filterSalesData(rows, filters)
  const kpis = aggregateKpis(filteredRows)
  const previousFilters = getPreviousPeriodFilters(filters)
  const previousRows = previousFilters ? filterSalesData(rows, previousFilters) : []
  const previousKpis = previousRows.length > 0 ? aggregateKpis(previousRows) : null
  const deltas = previousKpis
    ? {
        revenue: calculateDelta(kpis.revenue, previousKpis.revenue),
        orders: calculateDelta(kpis.orders, previousKpis.orders),
        customers: calculateDelta(kpis.customers, previousKpis.customers),
        averageOrderValue: calculateDelta(
          kpis.averageOrderValue,
          previousKpis.averageOrderValue,
        ),
        refundRate: calculateDelta(kpis.refundRate, previousKpis.refundRate),
      }
    : null

  return {
    filteredRows,
    kpis,
    deltas,
    revenueTrend: mergeRevenueComparison(
      aggregateRevenueTrend(filteredRows, interval),
      aggregateRevenueTrend(previousRows, interval),
    ),
    categoryBreakdown: aggregateByCategory(filteredRows),
    topRegions: aggregateTopRegions(filteredRows),
    channelSplit: aggregateByChannel(filteredRows),
    kpiTrend: aggregateRevenueTrend(filteredRows, 'month'),
  }
}

/**
 * Aligns the matching prior-period points to the current period's labels.
 * @param {{period: string, revenue: number, orders: number}[]} current
 * @param {{period: string, revenue: number, orders: number}[]} previous
 */
function mergeRevenueComparison(current, previous) {
  return current.map((point, index) => ({
    ...point,
    previousRevenue: previous[index]?.revenue ?? null,
  }))
}

/**
 * @param {DashboardFilters} filters
 * @returns {DashboardFilters | null}
 */
export function getPreviousPeriodFilters(filters) {
  if (!filters.startDate || !filters.endDate) return null

  const start = new Date(`${filters.startDate}T00:00:00.000Z`)
  const end = new Date(`${filters.endDate}T00:00:00.000Z`)
  const periodLength = Math.floor((end - start) / 86_400_000) + 1
  if (!Number.isFinite(periodLength) || periodLength < 1) return null

  const previousEnd = new Date(start.valueOf() - 86_400_000)
  const previousStart = new Date(previousEnd.valueOf() - (periodLength - 1) * 86_400_000)

  return {
    ...filters,
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10),
  }
}

/**
 * @param {SalesRecord[]} rows
 * @param {'category' | 'region' | 'channel'} key
 * @returns {{[key: string]: string | number}[]}
 */
function aggregateByDimension(rows, key) {
  const totals = new Map()

  for (const row of rows) {
    const dimension = row[key]
    const total = totals.get(dimension) ?? {
      [key]: dimension,
      revenue: 0,
      orders: 0,
    }
    total.revenue += row.revenue
    total.orders += row.orders
    totals.set(dimension, total)
  }

  return [...totals.values()].sort((first, second) =>
    String(first[key]).localeCompare(String(second[key])),
  )
}

/**
 * @param {string} dateValue
 * @param {'day' | 'week' | 'month'} interval
 * @returns {string}
 */
function toPeriod(dateValue, interval) {
  if (interval === 'day') return dateValue
  if (interval === 'month') return dateValue.slice(0, 7)
  if (interval !== 'week') throw new RangeError(`Unsupported trend interval: ${interval}`)

  const date = new Date(`${dateValue}T00:00:00.000Z`)
  const daysFromMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - daysFromMonday)
  return date.toISOString().slice(0, 10)
}
