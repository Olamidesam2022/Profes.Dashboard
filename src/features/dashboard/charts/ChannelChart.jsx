import PropTypes from 'prop-types'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import ChartCard from '../../../shared/ui/ChartCard.jsx'
import ChartTooltip from '../../../shared/ui/ChartTooltip.jsx'
import { formatCurrency, formatNumber } from '../utils/formatters.js'
import styles from './ChannelChart.module.css'

const palette = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
]
const columns = [
  { key: 'channel', label: 'Channel' },
  { key: 'revenue', label: 'Revenue', format: (value) => formatCurrency(value, 2) },
  { key: 'orders', label: 'Orders' },
]

export default function ChannelChart({ data }) {
  const total = data.reduce((sum, row) => sum + row.revenue, 0)
  const summary = data.length
    ? `Revenue distribution across ${data.length} sales channels. Total ${formatCurrency(total, 0)}. Exact values and percentages are listed below.`
    : 'No sales channel revenue data is available for this selection.'

  return (
    <ChartCard id="channel-distribution" title="Sales by channel" summary={summary} data={data} columns={columns}>
      <div className={styles.distribution}>
        <div className={styles.donut}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="channel"
                innerRadius="67%"
                outerRadius="91%"
                paddingAngle={3}
                cornerRadius={3}
                stroke="var(--color-surface)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.channel} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueFormatter={(value) => formatCurrency(Number(value), 2)} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.centerLabel}>
            <span>Total revenue</span>
            <strong>{formatCurrency(total, 0)}</strong>
          </div>
        </div>
        <ul className={styles.legend} aria-label="Revenue share by sales channel">
          {data.map((entry, index) => {
            const share = total ? (entry.revenue / total) * 100 : 0
            return (
              <li key={entry.channel}>
                <span className={styles.channelName}>
                  <i style={{ backgroundColor: palette[index % palette.length] }} />
                  {entry.channel}
                </span>
                <span className={styles.channelValues}>{formatNumber(share)}% <small>{formatCurrency(entry.revenue, 0)}</small></span>
              </li>
            )
          })}
        </ul>
      </div>
    </ChartCard>
  )
}

ChannelChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    channel: PropTypes.string.isRequired,
    revenue: PropTypes.number.isRequired,
    orders: PropTypes.number.isRequired,
  })).isRequired,
}
