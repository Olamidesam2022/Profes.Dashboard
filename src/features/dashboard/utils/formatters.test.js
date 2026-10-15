import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPeriodLabel,
} from './formatters.js'

describe('dashboard value formatters', () => {
  it('formats USD, grouped numbers, and percentages consistently', () => {
    expect(formatCurrency(1234.5)).toBe('$1,235')
    expect(formatCurrency(1234.5, 2)).toBe('$1,234.50')
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatPercent(12.345)).toBe('12.3%')
  })

  it('formats month and day periods while preserving unknown labels', () => {
    expect(formatPeriodLabel('2025-01')).toBe('Jan')
    expect(formatPeriodLabel('2025-01-06')).toBe('Jan 6')
    expect(formatPeriodLabel('Other')).toBe('Other')
  })
})
