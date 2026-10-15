import PropTypes from 'prop-types'
import styles from './KpiCard.module.css'

/**
 * @typedef {{change: number, percent: number | null, direction: 'up' | 'down' | 'flat'}} KpiDelta
 * @param {{title: string, value: string, delta: KpiDelta | null, inverse?: boolean}} props
 */
export default function KpiCard({ title, value, delta, inverse = false, trend = [] }) {
  const favorable =
    delta && (inverse ? delta.direction === 'down' : delta.direction === 'up')
  const tone =
    !delta || delta.direction === 'flat' ? 'neutral' : favorable ? 'positive' : 'negative'
  const directionLabel = delta
    ? delta.direction === 'flat'
      ? 'No change'
      : delta.direction === 'up'
        ? 'Up'
        : 'Down'
    : 'Comparison unavailable'
  const deltaText =
    delta?.percent === null
      ? 'No previous value'
      : delta
        ? `${Math.abs(delta.percent).toFixed(1)}%`
        : 'No previous period'

  return (
    <article className={styles.card} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.value}>{value}</p>
      {trend.length > 1 && (
        <svg className={styles.sparkline} viewBox="0 0 100 24" role="img" aria-label={`${title} trend`}>
          <polyline points={trend.map((point, index) => {
            const max = Math.max(...trend)
            const min = Math.min(...trend)
            const y = max === min ? 12 : 22 - ((point - min) / (max - min)) * 20
            return `${(index / (trend.length - 1)) * 100},${y}`
          }).join(' ')} />
        </svg>
      )}
      <p className={`${styles.delta} ${styles[tone]}`}>
        {delta && delta.percent !== null && (
          <span aria-hidden="true" className={styles.directionIcon}>
            {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '→'}
          </span>
        )}
        <span>
          {directionLabel}
          {delta && delta.percent !== null ? ` ${deltaText}` : ` · ${deltaText}`}
        </span>
        <span className={styles.comparison}>vs previous period</span>
      </p>
    </article>
  )
}

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  delta: PropTypes.shape({
    change: PropTypes.number.isRequired,
    percent: PropTypes.number,
    direction: PropTypes.oneOf(['up', 'down', 'flat']).isRequired,
  }),
  inverse: PropTypes.bool,
  trend: PropTypes.arrayOf(PropTypes.number),
}
