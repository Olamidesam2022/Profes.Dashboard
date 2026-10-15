/**
 * @typedef {Object} SalesRecord
 * @property {string} id Stable unique identifier.
 * @property {string} date Calendar date in ISO 8601 format (YYYY-MM-DD).
 * @property {string} category Product category.
 * @property {string} region Sales region.
 * @property {string} channel Sales channel.
 * @property {number} revenue Gross revenue in the dataset's currency unit.
 * @property {number} orders Number of orders in this aggregate record.
 * @property {number} customers Number of customers in this aggregate record.
 * @property {number} refunds Number of refunded orders in this aggregate record.
 */

/**
 * Load the bundled sales dataset asynchronously. Keeping I/O behind this
 * boundary allows replacing the static source with an API without changing
 * consumers.
 *
 * @returns {Promise<SalesRecord[]>}
 */
export async function loadSalesData() {
  const { default: sales } = await import('./sales.json')
  return sales
}
