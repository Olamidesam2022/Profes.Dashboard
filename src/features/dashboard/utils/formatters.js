const currencyFormatters = new Map()

/**
 * @param {number} value
 * @param {number} [maximumFractionDigits]
 * @returns {string}
 */
export function formatCurrency(value, maximumFractionDigits = 0) {
  if (!currencyFormatters.has(maximumFractionDigits)) {
    currencyFormatters.set(
      maximumFractionDigits,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits,
      }),
    )
  }

  return currencyFormatters.get(maximumFractionDigits).format(value)
}

const numberFormatter = new Intl.NumberFormat('en-US')
const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

/**
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return numberFormatter.format(value)
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
  return `${percentFormatter.format(value)}%`
}

/**
 * @param {string} value
 * @returns {string}
 */
export function formatPeriodLabel(value) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00.000Z`)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'UTC',
    }).format(date)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`)
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(date)
  }

  return value
}
