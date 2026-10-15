/**
 * @typedef {{key: string, label: string}} CsvColumn
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeCsvValue(value) {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/**
 * @template {Record<string, unknown>} Row
 * @param {Row[]} rows
 * @param {CsvColumn[]} columns
 * @returns {string}
 */
export function createCsv(rows, columns) {
  const header = columns.map(({ label }) => escapeCsvValue(label)).join(',')
  const body = rows.map((row) =>
    columns.map(({ key }) => escapeCsvValue(row[key])).join(','),
  )

  return [header, ...body].join('\r\n')
}
