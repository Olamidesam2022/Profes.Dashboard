import PropTypes from 'prop-types'
import styles from './ChartCard.module.css'

/**
 * @typedef {{key: string, label: string, format?: (value: unknown) => string}} ChartColumn
 */

/**
 * @param {{title: string, summary: string, data: Record<string, unknown>[], columns: ChartColumn[], children: import('react').ReactNode, className?: string}} props
 */
export default function ChartCard({
  title,
  summary,
  data,
  columns,
  children,
  className = '',
  id,
}) {
  const firstKey = columns[0]?.key ?? 'row'

  return (
    <section id={id} className={`${styles.card} ${className}`} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.summary}>{summary}</p>
      </header>
      <div
        className={styles.plot}
        role="img"
        aria-label={data.length > 0 ? summary : `${title}: no data for this selection.`}
      >
        {data.length > 0 ? (
          <div className={styles.visual} aria-hidden="true">
            {children}
          </div>
        ) : (
          <p className={styles.empty}>No data for this selection.</p>
        )}
      </div>
      <details className={styles.dataDetails}>
        <summary>View as table</summary>
        <div className={styles.tableScroll}>
          <table>
            <caption className={styles.visuallyHidden}>{title} data</caption>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>No data</td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={String(row[firstKey] ?? index)}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.format
                          ? column.format(row[column.key])
                          : String(row[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      format: PropTypes.func,
    }),
  ).isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
}
