import PropTypes from 'prop-types'
import styles from './DashboardFilters.module.css'

const presets = [7, 30, 90]

function shiftDate(value, days) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getPreset(filters, lastDate) {
  if (!filters.startDate && !filters.endDate) return 'all'
  if (!filters.startDate || !filters.endDate) return 'custom'
  return presets.find((days) =>
    filters.endDate === lastDate && filters.startDate === shiftDate(lastDate, -(days - 1)),
  )?.toString() ?? 'custom'
}

export default function DashboardFilters({ records, filters, dispatch }) {
  const regions = [...new Set(records.map((row) => row.region))].sort()
  const categories = [...new Set(records.map((row) => row.category))].sort()
  const lastDate = records.reduce((latest, row) => row.date > latest ? row.date : latest, '')
  const preset = getPreset(filters, lastDate)

  function choosePreset(value) {
    if (value === 'all') {
      dispatch({ type: 'set', filters: { startDate: '', endDate: '' } })
    } else if (value === 'custom') {
      const endDate = filters.endDate || lastDate
      dispatch({ type: 'set', filters: { startDate: filters.startDate || shiftDate(endDate, -29), endDate } })
    } else {
      const endDate = lastDate
      dispatch({ type: 'set', filters: { startDate: shiftDate(endDate, -(Number(value) - 1)), endDate } })
    }
  }

  return (
    <form className={styles.filters} aria-label="Dashboard filters" onSubmit={(event) => event.preventDefault()}>
      <label>
        <span>Region</span>
        <select value={filters.region} onChange={(event) => dispatch({ type: 'set', filters: { region: event.target.value } })}>
          <option value="">All regions</option>
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </label>
      <label>
        <span>Product category</span>
        <select value={filters.categories[0] ?? ''} onChange={(event) => dispatch({ type: 'set', filters: { categories: event.target.value ? [event.target.value] : [] } })}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label>
        <span>Date range</span>
        <select value={preset} onChange={(event) => choosePreset(event.target.value)}>
          <option value="all">All dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>
      </label>
      {preset === 'custom' && (
        <div className={styles.customDates}>
          <label><span>From</span><input type="date" value={filters.startDate} max={filters.endDate || lastDate} onChange={(event) => dispatch({ type: 'set', filters: { startDate: event.target.value } })} /></label>
          <label><span>To</span><input type="date" value={filters.endDate} min={filters.startDate} max={lastDate} onChange={(event) => dispatch({ type: 'set', filters: { endDate: event.target.value } })} /></label>
        </div>
      )}
      <button type="button" onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </form>
  )
}

DashboardFilters.propTypes = {
  records: PropTypes.arrayOf(PropTypes.shape({ region: PropTypes.string, category: PropTypes.string, date: PropTypes.string })).isRequired,
  filters: PropTypes.shape({ startDate: PropTypes.string, endDate: PropTypes.string, region: PropTypes.string, categories: PropTypes.arrayOf(PropTypes.string) }).isRequired,
  dispatch: PropTypes.func.isRequired,
}
