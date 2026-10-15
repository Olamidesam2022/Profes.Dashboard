import PropTypes from 'prop-types'
import styles from './ChartTooltip.module.css'

export default function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  valueFormatters,
  labelFormatter,
}) {
  if (!active || !payload?.length) return null

  return (
    <div className={styles.tooltip}>
      <p className={styles.label}>{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((item) => (
        <p className={styles.value} key={item.dataKey ?? item.name}>
          <span>{item.name ?? item.dataKey}</span>
          <strong>
            {valueFormatters?.[item.dataKey]
              ? valueFormatters[item.dataKey](item.value)
              : valueFormatter
                ? valueFormatter(item.value)
                : item.value}
          </strong>
        </p>
      ))}
    </div>
  )
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string,
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueFormatter: PropTypes.func,
  valueFormatters: PropTypes.objectOf(PropTypes.func),
  labelFormatter: PropTypes.func,
}
