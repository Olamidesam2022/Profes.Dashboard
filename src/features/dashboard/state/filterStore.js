import { create } from 'zustand'
import { INITIAL_FILTERS, parseFiltersFromSearch, reduceFilters } from './filterState.js'

/**
 * @param {Window | null | undefined} [browserWindow]
 */
export function createFilterStore(
  browserWindow = typeof window === 'undefined' ? undefined : window,
) {
  const initialFilters = browserWindow
    ? parseFiltersFromSearch(browserWindow.location.search)
    : { ...INITIAL_FILTERS, categories: [] }

  return create((set) => ({
    filters: initialFilters,
    /**
     * @param {{type: string, filters?: import('./filterState.js').DashboardFilters, category?: string}} action
     */
    dispatch: (action) =>
      set((state) => ({
        filters: reduceFilters(state.filters, action),
      })),
  }))
}

export const useFilterStore = createFilterStore()
