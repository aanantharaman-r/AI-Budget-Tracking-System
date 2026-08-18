export function fmtMoney(n, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n)
}

export function fmtSigned(n, currency = 'INR') {
  return `${n >= 0 ? '+' : '-'}${fmtMoney(Math.abs(n), currency)}`
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function fmtDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function isSameMonth(iso, ref = new Date()) {
  const d = new Date(iso)
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
}

export function monthShortLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function lastMonths(n) {
  const out = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({
      key: monthKey(d),
      label: monthShortLabel(d),
      date: d,
    })
  }
  return out
}
