import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const categories = ['Apparel', 'Beauty', 'Home', 'Electronics', 'Sports', 'Grocery']
const regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
const channels = ['Online', 'Retail', 'Marketplace']
const records = []

for (let dayOfYear = 0; dayOfYear < 365; dayOfYear += 1) {
  const date = new Date(Date.UTC(2025, 0, dayOfYear + 1))
  const dateString = date.toISOString().slice(0, 10)

  for (let segment = 0; segment < 2; segment += 1) {
    const seed = dayOfYear * 2 + segment
    const category = categories[(dayOfYear + segment * 3) % categories.length]
    const region = regions[(dayOfYear * 2 + segment) % regions.length]
    const channel = channels[(dayOfYear + segment) % channels.length]
    const orders = 12 + ((seed * 17) % 89)
    const customers = Math.max(1, orders - ((seed * 7) % 13))
    const refunds = (seed * 11) % Math.max(1, Math.floor(orders / 5))
    const averageOrderValue = 24 + ((seed * 29) % 176) / 2

    records.push({
      id: `sale-${String(seed + 1).padStart(4, '0')}`,
      date: dateString,
      category,
      region,
      channel,
      revenue: Number((orders * averageOrderValue).toFixed(2)),
      orders,
      customers,
      refunds,
    })
  }
}

const outputPath = fileURLToPath(new URL('./sales.json', import.meta.url))
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`)
console.log(`Wrote ${records.length} sales records to ${outputPath}`)
