import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { fmtMoney } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'
import { monthlySeries, getRefDate } from '../../lib/utils'
import { lastMonths } from '../../lib/format'

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-xl shadow-black/40">
      <p className="mb-1.5 text-xs font-semibold text-ink-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink-2">{p.dataKey === 'income' ? 'Income' : 'Expenses'}</span>
          <span className="ml-auto pl-3 font-semibold text-slate-100">{fmtMoney(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

function currentMonthSeries(transactions, stats) {
  const refDate = getRefDate(transactions, new Date())
  const year = refDate.getFullYear()
  const month = refDate.getMonth()

  // Weeks breakdown of the current month
  const weeks = [
    { label: 'Week 1 (1-7)', minDay: 1, maxDay: 7, income: 0, expense: 0 },
    { label: 'Week 2 (8-14)', minDay: 8, maxDay: 14, income: 0, expense: 0 },
    { label: 'Week 3 (15-21)', minDay: 15, maxDay: 21, income: 0, expense: 0 },
    { label: 'Week 4 (22-31)', minDay: 22, maxDay: 31, income: 0, expense: 0 },
  ]

  // Add monthly base salary to Week 1
  if (stats?.monthlySalary) {
    weeks[0].income += stats.monthlySalary
  }

  for (const t of transactions) {
    const d = new Date(t.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      const weekIndex = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3
      if (t.type === 'income') weeks[weekIndex].income += t.amount
      else weeks[weekIndex].expense += t.amount
    }
  }

  return weeks
}

function yearlySeries(transactions, numYears = 3) {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = numYears - 1; i >= 0; i--) {
    years.push(currentYear - i)
  }

  return years.map((y) => {
    let income = 0
    let expense = 0
    for (const t of transactions) {
      const d = new Date(t.date)
      if (d.getFullYear() === y) {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      }
    }
    return { label: `${y}`, income: Math.round(income), expense: Math.round(expense) }
  })
}

export default function CashflowChart() {
  const { transactions, profile, stats } = useBudget()
  const [range, setRange] = useState('monthly') // 'monthly', '6m', 'yearly'

  let data = []
  if (range === 'monthly') {
    data = currentMonthSeries(transactions, stats)
  } else if (range === '6m') {
    data = monthlySeries(transactions, lastMonths(6))
  } else {
    data = yearlySeries(transactions, 3)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => setRange('monthly')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            range === 'monthly' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-ink-3 hover:text-slate-100'
          }`}
        >
          Monthly (This Month)
        </button>
        <button
          onClick={() => setRange('6m')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            range === '6m' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-ink-3 hover:text-slate-100'
          }`}
        >
          6 Months
        </button>
        <button
          onClick={() => setRange('yearly')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            range === 'yearly' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-ink-3 hover:text-slate-100'
          }`}
        >
          Yearly View
        </button>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#5b6b8c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#5b6b8c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(v) => {
                if (profile.currency === 'INR') return `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                if (profile.currency === 'USD') return `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                return `${v}`
              }}
            />
            <Tooltip content={<ChartTooltip currency={profile.currency} />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#gIncome)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#gExpense)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
