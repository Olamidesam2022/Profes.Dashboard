import PropTypes from 'prop-types'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../shared/ui/ChartCard.jsx'
import ChartTooltip from '../../../shared/ui/ChartTooltip.jsx'
import { formatCurrency, formatPeriodLabel } from '../utils/formatters.js'

const columns = [
  { key: 'period', label: 'Period', format: formatPeriodLabel },
  { key: 'revenue', label: 'Current revenue', format: (value) => formatCurrency(value, 2) },
  { key: 'previousRevenue', label: 'Previous revenue', format: (value) => value == null ? '—' : formatCurrency(value, 2) },
  { key: 'orders', label: 'Orders' },
]

function ComparisonLegend({ payload = [] }) {
  return (
    <div className="chart-legend">
      {payload.map((entry) => (
        <span key={entry.value}><i style={{ backgroundColor: entry.color }} />{entry.value}</span>
      ))}
    </div>
  )
}

ComparisonLegend.propTypes = { payload: PropTypes.array }

export default function RevenueTrendChart({ data, interval }) {
  const hasPrevious = data.some((point) => point.previousRevenue !== null)
  const summary = data.length
    ? `Revenue by ${interval}. ${hasPrevious ? 'Current and previous periods are compared.' : 'Choose a date range to compare with the previous period.'} Exact values are available in the table.`
    : 'No revenue data is available for this selection.'

  return (
    <ChartCard id="sales-overview" title="Sales overview" summary={summary} data={data} columns={columns}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={formatPeriodLabel}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            width={68}
            tickFormatter={(value) => formatCurrency(value, 0)}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={(value) => formatCurrency(Number(value), 2)} labelFormatter={formatPeriodLabel} />}
            cursor={{ stroke: 'var(--color-muted)', strokeDasharray: '4 4' }}
          />
          <Legend content={<ComparisonLegend />} />
          {hasPrevious && (
            <Area
              type="monotone"
              dataKey="previousRevenue"
              name="Previous period"
              stroke="var(--color-chart-2)"
              fill="var(--color-chart-tint-2)"
              strokeWidth={2}
              connectNulls
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Current period"
            stroke="var(--color-chart-1)"
            fill="var(--color-chart-tint-1)"
            strokeWidth={2.5}
            activeDot={{ r: 4, stroke: 'var(--color-bg)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

RevenueTrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    period: PropTypes.string.isRequired,
    revenue: PropTypes.number.isRequired,
    previousRevenue: PropTypes.number,
    orders: PropTypes.number.isRequired,
  })).isRequired,
  interval: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
}
