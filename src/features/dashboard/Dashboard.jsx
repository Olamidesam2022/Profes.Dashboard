import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { loadSalesData } from '../../data/salesRepository.js'
import { useFilterStore } from './state/filterStore.js'
import { startFilterUrlSync } from './state/filterState.js'
import { selectDashboardData } from './utils/selectors.js'
import { formatCurrency, formatNumber, formatPercent } from './utils/formatters.js'
import ChartCardSkeleton from './components/ChartCardSkeleton.jsx'
import DashboardErrorBoundary from './components/DashboardErrorBoundary.jsx'
import KpiCard from './components/KpiCard.jsx'
import KpiCardSkeleton from './components/KpiCardSkeleton.jsx'
import DashboardFilters from './components/DashboardFilters.jsx'
import styles from './Dashboard.module.css'

const RevenueTrendChart = lazy(() => import('./charts/RevenueTrendChart.jsx'))
const CategoryChart = lazy(() => import('./charts/CategoryChart.jsx'))
const RegionsChart = lazy(() => import('./charts/RegionsChart.jsx'))
const ChannelChart = lazy(() => import('./charts/ChannelChart.jsx'))

const intervals = ['day', 'week', 'month']

export default function Dashboard() {
  const filters = useFilterStore((state) => state.filters)
  const dispatch = useFilterStore((state) => state.dispatch)
  const [interval, setInterval] = useState('month')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [loadState, setLoadState] = useState({
    status: 'loading',
    records: [],
    error: null,
  })

  useEffect(() => startFilterUrlSync(useFilterStore), [])

  useEffect(() => {
    let active = true
    setLoadState({ status: 'loading', records: [], error: null })

    loadSalesData()
      .then((records) => {
        if (active) setLoadState({ status: 'success', records, error: null })
      })
      .catch((error) => {
        if (active) setLoadState({ status: 'error', records: [], error })
      })

    return () => {
      active = false
    }
  }, [loadAttempt])

  const dashboardData = useMemo(
    () =>
      loadState.status === 'success'
        ? selectDashboardData(loadState.records, filters, interval)
        : null,
    [filters, interval, loadState],
  )

  const retryLoading = () => setLoadAttempt((attempt) => attempt + 1)

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Dashboard sidebar">
        <a className={styles.brand} href="#dashboard-title" aria-label="Commerce analytics home">
          <span className={styles.brandMark} aria-hidden="true">C</span>
          <span>Commerce<span className={styles.brandDetail}> / Analytics</span></span>
        </a>
        <p className={styles.navLabel}>WORKSPACE</p>
        <nav className={styles.sideNav} aria-label="Dashboard sections">
          <a href="#dashboard-title" aria-current="page" aria-label="Overview"><span aria-hidden="true">◫</span> Overview</a>
          <a href="#sales-overview"><span aria-hidden="true">⌁</span> Sales</a>
          <a href="#category-performance"><span aria-hidden="true">▥</span> Categories</a>
          <a href="#regional-performance"><span aria-hidden="true">◎</span> Regions</a>
          <a href="#channel-distribution"><span aria-hidden="true">◉</span> Channels</a>
        </nav>
        <div className={styles.sidebarNote}>
          <span className={styles.noteEyebrow}>LIVE REPORT</span>
          <strong>Sales at a glance</strong>
          <p>Track revenue and customer activity across your business.</p>
          <span className={styles.liveStatus}><i aria-hidden="true" /> Data is up to date</span>
        </div>
        <div className={styles.sidebarFooter}>Commerce analytics <span>v1.0</span></div>
      </aside>
      <div className={styles.workspace}>
      <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <p className={styles.eyebrow}>COMMERCE / REPORTS</p>
          <h1 id="dashboard-title">Sales overview</h1>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.periodBadge}>FY 2025</span>
          <button className={styles.profileButton} type="button" aria-label="Account">AD</button>
        </div>
      </header>

      <main className={styles.main} aria-labelledby="dashboard-title">
        <p className={styles.subtitle}>A clear view of revenue, orders, and customer activity.</p>
        {loadState.status === 'success' && (
          <>
            <DashboardFilters records={loadState.records} filters={filters} dispatch={dispatch} />
            <p className={styles.resultCount} aria-live="polite">
              Showing {formatNumber(dashboardData.filteredRows.length)} of {formatNumber(loadState.records.length)} records
            </p>
          </>
        )}

        {loadState.status === 'error' ? (
          <section className={styles.loadError} role="alert">
            <h2>Analytics could not be loaded</h2>
            <p>Please check your connection and try again.</p>
            <button className={styles.retryButton} type="button" onClick={retryLoading}>
              Retry loading data
            </button>
          </section>
        ) : (
          <>
            {loadState.status === 'loading' ? (
              <KpiCardSkeleton />
            ) : (
              <section className={styles.kpiGrid} aria-label="Key performance indicators">
                <KpiCard
                  title="Total revenue"
                  value={formatCurrency(dashboardData.kpis.revenue, 0)}
                  delta={dashboardData.deltas?.revenue ?? null}
                  trend={dashboardData.kpiTrend.map((point) => point.revenue)}
                />
                <KpiCard
                  title="New customers"
                  value={formatNumber(dashboardData.kpis.customers)}
                  delta={dashboardData.deltas?.customers ?? null}
                  trend={dashboardData.kpiTrend.map((point) => point.orders)}
                />
                <KpiCard
                  title="Sales growth"
                  value={dashboardData.deltas?.revenue?.percent == null
                    ? '—'
                    : formatPercent(dashboardData.deltas.revenue.percent)}
                  delta={dashboardData.deltas?.revenue ?? null}
                  trend={dashboardData.kpiTrend.map((point) => point.revenue)}
                />
                <KpiCard
                  title="Average order value"
                  value={formatCurrency(dashboardData.kpis.averageOrderValue, 2)}
                  delta={dashboardData.deltas?.averageOrderValue ?? null}
                  trend={dashboardData.kpiTrend.map((point) => point.revenue)}
                />
              </section>
            )}

            <div className={styles.chartSectionHeading}>
              <div>
                <h2>Sales performance</h2>
                <p>Revenue across your business.</p>
              </div>
              <div
                className={styles.intervalControl}
                role="group"
                aria-label="Trend interval"
              >
                {intervals.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={interval === value}
                    onClick={() => setInterval(value)}
                  >
                    {value[0].toUpperCase()}
                    {value.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.chartGrid} aria-busy={loadState.status === 'loading'}>
              {loadState.status === 'loading' ? (
                <>
                  <ChartCardSkeleton className={styles.trendChart} />
                  <ChartCardSkeleton />
                  <ChartCardSkeleton />
                  <ChartCardSkeleton />
                </>
              ) : (
                <>
                  <DashboardErrorBoundary>
                    <Suspense
                      fallback={<ChartCardSkeleton className={styles.trendChart} />}
                    >
                      <RevenueTrendChart
                        data={dashboardData.revenueTrend}
                        interval={interval}
                      />
                    </Suspense>
                  </DashboardErrorBoundary>
                  <DashboardErrorBoundary>
                    <Suspense fallback={<ChartCardSkeleton className={styles.distributionChart} />}>
                      <ChannelChart data={dashboardData.channelSplit} />
                    </Suspense>
                  </DashboardErrorBoundary>
                  <DashboardErrorBoundary>
                    <Suspense fallback={<ChartCardSkeleton className={styles.categoryChart} />}>
                      <CategoryChart data={dashboardData.categoryBreakdown} />
                    </Suspense>
                  </DashboardErrorBoundary>
                  <DashboardErrorBoundary>
                    <Suspense fallback={<ChartCardSkeleton className={styles.regionChart} />}>
                      <RegionsChart data={dashboardData.topRegions} />
                    </Suspense>
                  </DashboardErrorBoundary>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <span><i aria-hidden="true" /> All figures in USD</span>
        {loadState.status === 'success' && (
          <span>{formatNumber(dashboardData.filteredRows.length)} source records</span>
        )}
      </footer>
    </div>
      </div>
    </div>
  )
}
