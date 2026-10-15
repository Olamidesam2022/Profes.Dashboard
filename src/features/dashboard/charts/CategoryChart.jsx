import PropTypes from 'prop-types'
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../shared/ui/ChartCard.jsx'
import ChartTooltip from '../../../shared/ui/ChartTooltip.jsx'
import { formatCurrency, formatNumber } from '../utils/formatters.js'

const palette = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
]
const columns = [
  { key: 'category', label: 'Category' },
  { key: 'revenue', label: 'Revenue', format: (value) => formatCurrency(value, 2) },
  { key: 'orders', label: 'Orders' },
]

function MetricLegend({ payload = [] }) {
  return (
    <div className="chart-legend">
      {payload.map((entry) => (
        <span key={entry.value}><i style={{ backgroundColor: entry.color }} />{entry.value}</span>
      ))}
    </div>
  )
}

MetricLegend.propTypes = { payload: PropTypes.array }

export default function CategoryChart({ data }) {
  const summary =
    data.length > 0
      ? `Revenue and order volume across ${data.length} product categories. Values are available in the table.`
      : 'No category revenue data is available for this selection.'

  return (
    <ChartCard
      title="Revenue by category"
      id="category-performance"
      summary={summary}
      data={data}
      columns={columns}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="revenue"
            width={60}
            tickFormatter={(value) => formatCurrency(value, 0)}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            width={42}
            tick={{ fill: 'var(--color-muted)', fontSize: 'var(--font-size-xs)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFormatters={{
                  revenue: (value) => formatCurrency(Number(value), 2),
                  orders: (value) => formatNumber(Number(value)),
                }}
              />
            }
            cursor={{ fill: 'var(--color-surface-2)' }}
          />
          <Legend content={<MetricLegend />} />
          <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={palette[index % palette.length]}
                stroke="var(--color-chart-outline)"
                strokeWidth={1}
              />
            ))}
          </Bar>
          <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-chart-2)', stroke: 'var(--color-surface)' }} activeDot={{ r: 5 }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

CategoryChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    }),
  ).isRequired,
}
