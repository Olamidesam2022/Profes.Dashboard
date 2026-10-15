export const INITIAL_FILTERS = Object.freeze({
  startDate: '',
  endDate: '',
  categories: [],
  region: '',
})

/**
 * @typedef {Object} DashboardFilters
 * @property {string} startDate Inclusive YYYY-MM-DD lower date bound, or empty.
 * @property {string} endDate Inclusive YYYY-MM-DD upper date bound, or empty.
 * @property {string[]} categories Selected categories; an empty list means all.
 * @property {string} region Selected region, or empty for all regions.
 */

/**
 * @param {DashboardFilters} current
 * @param {{type: string, filters?: Partial<DashboardFilters>, category?: string}} action
 * @returns {DashboardFilters}
 */
export function reduceFilters(current, action) {
  switch (action.type) {
    case 'set':
      return normalizeFilters({ ...current, ...action.filters })
    case 'toggle-category': {
      const categories = new Set(current.categories)
      if (categories.has(action.category)) categories.delete(action.category)
      else categories.add(action.category)
      return normalizeFilters({ ...current, categories: [...categories] })
    }
    case 'reset':
      return { ...INITIAL_FILTERS, categories: [] }
    case 'replace':
      return normalizeFilters(action.filters)
    default:
      throw new Error(`Unknown filter action: ${action.type}`)
  }
}

/**
 * @param {Partial<DashboardFilters>} filters
 * @returns {DashboardFilters}
 */
export function normalizeFilters(filters) {
  const startDate = filters.startDate ?? ''
  const endDate = filters.endDate ?? ''
  const categories = filters.categories ?? []
  const region = filters.region ?? ''

  if (!isIsoDateOrEmpty(startDate) || !isIsoDateOrEmpty(endDate)) {
    throw new TypeError('Filter dates must be valid YYYY-MM-DD calendar dates.')
  }
  if (
    !Array.isArray(categories) ||
    categories.some((category) => typeof category !== 'string')
  ) {
    throw new TypeError('Filter categories must be an array of strings.')
  }
  if (typeof region !== 'string') {
    throw new TypeError('Filter region must be a string.')
  }

  return {
    startDate,
    endDate,
    categories: [...new Set(categories)].sort(),
    region,
  }
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isIsoDateOrEmpty(value) {
  if (value === '') return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

/**
 * @param {string} search URL query string, with or without a leading question mark.
 * @returns {DashboardFilters}
 */
export function parseFiltersFromSearch(search) {
  const params = new URLSearchParams(search)
  const startDate = params.get('from') ?? ''
  const endDate = params.get('to') ?? ''
  const categories = params.getAll('category')
  const region = params.get('region') ?? ''

  return normalizeFilters({
    startDate: isIsoDateOrEmpty(startDate) ? startDate : '',
    endDate: isIsoDateOrEmpty(endDate) ? endDate : '',
    categories,
    region,
  })
}

/**
 * @param {DashboardFilters} filters
 * @returns {string} Canonical query string without a leading question mark.
 */
export function serializeFilters(filters) {
  const normalized = normalizeFilters(filters)
  const params = new URLSearchParams()

  if (normalized.startDate) params.set('from', normalized.startDate)
  if (normalized.endDate) params.set('to', normalized.endDate)
  normalized.categories.forEach((category) => params.append('category', category))
  if (normalized.region) params.set('region', normalized.region)

  return params.toString()
}

/**
 * @param {import('zustand/vanilla').StoreApi<{filters: DashboardFilters}>} store
 * @param {Window | null} [browserWindow]
 * @returns {() => void} Removes history and store listeners.
 */
export function startFilterUrlSync(
  store,
  browserWindow = typeof window === 'undefined' ? undefined : window,
) {
  if (!browserWindow) return () => {}

  let handlingPopState = false
  const unsubscribe = store.subscribe((nextState, previousState) => {
    if (handlingPopState || filtersMatch(nextState.filters, previousState.filters)) return

    const query = serializeFilters(nextState.filters)
    const url = new URL(browserWindow.location.href)
    url.search = query
    const nextLocation = `${url.pathname}${url.search}${url.hash}`
    const currentLocation = `${browserWindow.location.pathname}${browserWindow.location.search}${browserWindow.location.hash}`

    if (nextLocation !== currentLocation) {
      browserWindow.history.pushState(browserWindow.history.state, '', nextLocation)
    }
  })

  const handlePopState = () => {
    handlingPopState = true
    try {
      store.setState((state) => ({
        ...state,
        filters: reduceFilters(state.filters, {
          type: 'replace',
          filters: parseFiltersFromSearch(browserWindow.location.search),
        }),
      }))
    } finally {
      handlingPopState = false
    }
  }

  browserWindow.addEventListener('popstate', handlePopState)
  return () => {
    unsubscribe()
    browserWindow.removeEventListener('popstate', handlePopState)
  }
}

/**
 * @param {DashboardFilters} first
 * @param {DashboardFilters} second
 * @returns {boolean}
 */
function filtersMatch(first, second) {
  return (
    first.startDate === second.startDate &&
    first.endDate === second.endDate &&
    first.region === second.region &&
    first.categories.length === second.categories.length &&
    first.categories.every((category, index) => category === second.categories[index])
  )
}
