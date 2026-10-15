import PropTypes from 'prop-types'
import styles from './ChartCardSkeleton.module.css'

export default function ChartCardSkeleton({ className = '' }) {
  return (
    <div
      className={`${styles.card} ${className}`}
      role="status"
      aria-label="Loading chart"
      aria-busy="true"
    >
      <span className={styles.heading} aria-hidden="true" />
      <span className={styles.summary} aria-hidden="true" />
      <span className={styles.chart} aria-hidden="true" />
    </div>
  )
}

ChartCardSkeleton.propTypes = {
  className: PropTypes.string,
}
