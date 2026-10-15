import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  INITIAL_FILTERS,
  normalizeFilters,
  parseFiltersFromSearch,
  reduceFilters,
  serializeFilters,
  startFilterUrlSync,
} from './filterState.js'
import { createFilterStore } from './filterStore.js'

describe('filter reducer', () => {
  it('merges date, region, and category updates into normalized state', () => {
    expect(
      reduceFilters(INITIAL_FILTERS, {
        type: 'set',
        filters: {
          startDate: '2025-01-01',
          region: 'West',
          categories: ['Home', 'Apparel', 'Home'],
        },
      }),
    ).toEqual({
      startDate: '2025-01-01',
      endDate: '',
      region: 'West',
      categories: ['Apparel', 'Home'],
    })
  })

  it('toggles selected categories and resets to the empty filter state', () => {
    const selected = reduceFilters(INITIAL_FILTERS, {
      type: 'toggle-category',
      category: 'Beauty',
    })

    expect(selected.categories).toEqual(['Beauty'])
    expect(
      reduceFilters(selected, { type: 'toggle-category', category: 'Beauty' }).categories,
    ).toEqual([])
    expect(reduceFilters(selected, { type: 'reset' })).toEqual(INITIAL_FILTERS)
  })

  it('replaces state and rejects malformed actions or filter values', () => {
    expect(
      reduceFilters(INITIAL_FILTERS, {
        type: 'replace',
        filters: { endDate: '2025-12-31' },
      }),
    ).toEqual({ ...INITIAL_FILTERS, endDate: '2025-12-31' })
    expect(() => reduceFilters(INITIAL_FILTERS, { type: 'unknown' })).toThrow(
      'Unknown filter action',
    )
    expect(() => normalizeFilters({ startDate: '2025-02-30' })).toThrow(TypeError)
    expect(() => normalizeFilters({ categories: 'Beauty' })).toThrow(TypeError)
    expect(() => normalizeFilters({ region: 3 })).toThrow(TypeError)
  })
})

describe('filter URL state', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('round-trips all filter fields using a canonical query string', () => {
    const filters = {
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      categories: ['Apparel', 'Home & Living'],
      region: 'West',
    }
    const query = serializeFilters(filters)

    expect(query).toBe(
      'from=2025-01-01&to=2025-03-31&category=Apparel&category=Home+%26+Living&region=West',
    )
    expect(parseFiltersFromSearch(`?${query}`)).toEqual(filters)
  })

  it('ignores invalid date query parameters and normalizes repeated categories', () => {
    expect(
      parseFiltersFromSearch(
        '?from=2025-02-30&to=2025-05-01&category=Home&category=Home',
      ),
    ).toEqual({
      startDate: '',
      endDate: '2025-05-01',
      categories: ['Home'],
      region: '',
    })
  })

  it('syncs store updates to history and applies browser back/forward navigation', () => {
    const store = createFilterStore(window)
    const pushState = vi.spyOn(window.history, 'pushState')
    const stopSync = startFilterUrlSync(store, window)

    store.getState().dispatch({ type: 'set', filters: {} })
    expect(pushState).not.toHaveBeenCalled()

    store.getState().dispatch({
      type: 'set',
      filters: { startDate: '2025-04-01', categories: ['Home'] },
    })
    expect(window.location.search).toBe('?from=2025-04-01&category=Home')
    expect(pushState).toHaveBeenCalledTimes(1)

    window.history.replaceState({}, '', '/?region=West')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(store.getState().filters).toEqual({
      startDate: '',
      endDate: '',
      categories: [],
      region: 'West',
    })
    expect(pushState).toHaveBeenCalledTimes(1)

    stopSync()
    pushState.mockRestore()
  })

  it('supports a server environment without a browser global', () => {
    vi.stubGlobal('window', undefined)
    try {
      const store = createFilterStore()
      expect(store.getState().filters).toEqual(INITIAL_FILTERS)
      expect(startFilterUrlSync(store, null)).toBeTypeOf('function')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
