import PropTypes from 'prop-types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../shared/ui/ChartCard.jsx'
import ChartTooltip from '../../../shared/ui/ChartTooltip.jsx'
import { formatCurrency } from '../utils/formatters.js'

const columns = [
  { key: 'region', label: 'Region' },
  { key: 'revenue', label: 'Revenue', format: (value) => formatCurrency(value, 2) },
  { key: 'orders', label: 'Orders' },
]
const palette = [
  'var(--color-chart-4)',
  'var(--color-chart-1)',
  'var(--color-chart-3)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
]

export default function RegionsChart({ data }) {
  const summary =
    data.length > 0
      ? `Top ${data.length} regions ranked by revenue. Exact values are available in the table.`
      : 'No region revenue data is available for this selection.'

  return (
    <ChartCard id="regional-performance" title="Sales by region" summary={summary} data={data} columns={columns}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid stroke="var(--color-border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(value, 0)}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            dataKey="region"
            type="category"
            width={82}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={(value) => formatCurrency(Number(value), 2)}
              />
            }
            cursor={{ fill: 'var(--color-bg)' }}
          />
          <Bar dataKey="revenue" name="Revenue" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell
                key={entry.region}
                fill={palette[index % palette.length]}
                stroke="var(--color-chart-outline)"
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

RegionsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      region: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    }),
  ).isRequired,
}
