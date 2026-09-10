export function getRefDate(transactions, ref = new Date()) {
  if (!transactions || transactions.length === 0) return ref
  const hasCurrent = transactions.some((t) => {
    const d = new Date(t.date)
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
  })
  if (hasCurrent) return ref

  let latest = new Date(transactions[0].date)
  for (let i = 1; i < transactions.length; i++) {
    const d = new Date(transactions[i].date)
    if (d > latest) latest = d
  }
  return latest
}

export function computeStats(transactions, ref = new Date(), startingBalance = 0) {
  const effectiveRef = getRefDate(transactions, ref)
  const current = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === effectiveRef.getMonth() && d.getFullYear() === effectiveRef.getFullYear()
  })

  let income = 0
  let expense = 0
  let totalIn = 0
  let totalOut = 0

  for (const t of transactions) {
    if (t.type === 'income') totalIn += t.amount
    else totalOut += t.amount
  }

  for (const t of current) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }

  const balance = startingBalance + totalIn - totalOut
  const savings = income - expense
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  return { income, expense, savings, savingsRate, balance, monthlySalary: 0, otherIncome: income }
}

export function monthlySeries(transactions, months) {
  return months.map((m) => {
    let income = 0
    let expense = 0
    for (const t of transactions) {
      const d = new Date(t.date)
      if (d.getFullYear() === m.date.getFullYear() && d.getMonth() === m.date.getMonth()) {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      }
    }
    return { ...m, income: Math.round(income), expense: Math.round(expense) }
  })
}

export function categoryTotals(transactions, ref = new Date(), type = 'expense') {
  const effectiveRef = getRefDate(transactions, ref)
  const totals = {}
  for (const t of transactions) {
    const d = new Date(t.date)
    if (t.type !== type) continue
    if (d.getMonth() !== effectiveRef.getMonth() || d.getFullYear() !== effectiveRef.getFullYear()) continue
    totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount
  }
  return totals
}

export function spentByCategory(transactions, categoryId, ref = new Date()) {
  const effectiveRef = getRefDate(transactions, ref)
  return transactions
    .filter(
      (t) =>
        t.categoryId === categoryId &&
        t.type === 'expense' &&
        new Date(t.date).getMonth() === effectiveRef.getMonth() &&
        new Date(t.date).getFullYear() === effectiveRef.getFullYear(),
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

export function filterTransactions(transactions, { query = '', category = 'all', type = 'all' }) {
  const q = query.trim().toLowerCase()
  return transactions.filter((t) => {
    if (type !== 'all' && t.type !== type) return false
    if (category !== 'all' && t.categoryId !== category) return false
    if (!q) return true
    const haystack = `${t.title} ${t.categoryId} ${t.amount}`.toLowerCase()
    return haystack.includes(q)
  })
}

export function uid() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
