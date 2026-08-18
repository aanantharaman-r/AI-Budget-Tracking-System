export function computeStats(transactions, ref = new Date(), startingBalance = 0, monthlySalary = 0) {
  const current = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
  })

  let otherIncome = 0
  let expense = 0
  let totalIn = 0
  let totalOut = 0

  for (const t of transactions) {
    if (t.type === 'income') totalIn += t.amount
    else totalOut += t.amount
  }

  for (const t of current) {
    if (t.type === 'income') otherIncome += t.amount
    else expense += t.amount
  }

  const income = (monthlySalary || 0) + otherIncome
  const balance = startingBalance + (monthlySalary || 0) + totalIn - totalOut
  const savings = income - expense
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  return { income, expense, savings, savingsRate, balance, monthlySalary, otherIncome }
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
  const totals = {}
  for (const t of transactions) {
    const d = new Date(t.date)
    if (t.type !== type) continue
    if (d.getMonth() !== ref.getMonth() || d.getFullYear() !== ref.getFullYear()) continue
    totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount
  }
  return totals
}

export function spentByCategory(transactions, categoryId, ref = new Date()) {
  return transactions
    .filter(
      (t) =>
        t.categoryId === categoryId &&
        t.type === 'expense' &&
        new Date(t.date).getMonth() === ref.getMonth() &&
        new Date(t.date).getFullYear() === ref.getFullYear(),
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
