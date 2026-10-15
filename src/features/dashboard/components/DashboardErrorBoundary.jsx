import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './DashboardErrorBoundary.module.css'

export default class DashboardErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Dashboard chart failed to render.', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className={styles.error} role="alert">
          <h2>Chart unavailable</h2>
          <p>
            This chart could not be displayed. The rest of the dashboard is still
            available.
          </p>
        </section>
      )
    }

    return this.props.children
  }
}
