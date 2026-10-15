import { describe, expect, it } from 'vitest'
import { createCsv, escapeCsvValue } from './csv.js'

describe('CSV serialization', () => {
  it('escapes quotes, commas, and line breaks according to CSV rules', () => {
    expect(escapeCsvValue('plain text')).toBe('plain text')
    expect(escapeCsvValue('West, Coast')).toBe('"West, Coast"')
    expect(escapeCsvValue('He said "yes"')).toBe('"He said ""yes"""')
    expect(escapeCsvValue('first\r\nsecond')).toBe('"first\r\nsecond"')
    expect(escapeCsvValue(null)).toBe('')
  })

  it('creates a header and correctly escaped rows using CRLF separators', () => {
    expect(
      createCsv(
        [
          { name: 'Tee, shirt', amount: 24 },
          { name: 'Socks', amount: null },
        ],
        [
          { key: 'name', label: 'Product' },
          { key: 'amount', label: 'Revenue' },
        ],
      ),
    ).toBe('Product,Revenue\r\n"Tee, shirt",24\r\nSocks,')
  })

  it('supports an empty result while retaining requested column headers', () => {
    expect(createCsv([], [{ key: 'date', label: 'Date' }])).toBe('Date')
  })
})
