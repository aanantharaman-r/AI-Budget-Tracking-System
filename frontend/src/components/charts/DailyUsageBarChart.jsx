import { useState, useRef, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { fmtMoney } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-xl shadow-black/40">
      <p className="mb-1.5 text-xs font-semibold text-ink-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-ink-2">{p.name || (p.dataKey === 'income' ? 'Incoming' : 'Spending')}</span>
          <span className="ml-auto pl-3 font-semibold text-slate-100">{fmtMoney(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

function getDailySeries(transactions, range = '7d') {
  const today = new Date()
  let daysCount = 7
  if (range === '14d') daysCount = 14
  if (range === '30d') {
    // Use full current month total days (e.g. 31 for August) so Aug 1 is included
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    daysCount = Math.max(30, daysInMonth)
  }

  const days = []
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    days.push(d)
  }

  return days.map((d) => {
    const y = d.getFullYear()
    const m = d.getMonth()
    const dateNum = d.getDate()

    let income = 0
    let expense = 0

    for (const t of transactions) {
      const txDate = new Date(t.date)
      if (
        txDate.getFullYear() === y &&
        txDate.getMonth() === m &&
        txDate.getDate() === dateNum
      ) {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      }
    }

    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return {
      label,
      income,
      expense,
    }
  })
}

export default function DailyUsageBarChart() {
  const { transactions, profile } = useBudget()
  const [range, setRange] = useState('30d') // Default to 30d for full daily tracking
  const scrollContainerRef = useRef(null)

  const data = getDailySeries(transactions, range)

  // Dynamic minimum width to guarantee every single day gets its own spacious bar slot
  const getMinWidth = () => {
    if (range === '30d') return '1600px' // ~50px per day bar slot
    if (range === '14d') return '750px'
    return '100%'
  }

  // Auto scroll to latest date when range changes or mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [range, data.length])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-ink-2 font-medium">Incoming Money</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-ink-2 font-medium">Spending Money</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRange('7d')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              range === '7d'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-ink-3 hover:text-slate-100'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange('14d')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              range === '14d'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-ink-3 hover:text-slate-100'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              range === '30d'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-ink-3 hover:text-slate-100'
            }`}
          >
            Full Month ({data.length} Days)
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Hint for Mobile */}
      {(range === '30d' || range === '14d') && (
        <div className="flex items-center justify-between text-[11px] text-ink-3 px-1">
          <span className="flex items-center gap-1 font-medium text-emerald-400/90">
            ← Scroll horizontally to track day by day →
          </span>
          <span>Showing {data.length} daily bars</span>
        </div>
      )}

      {/* Horizontally Scrollable Bar Chart Container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-line/40 bg-surface-2/40 p-2 sm:p-4 touch-pan-x"
      >
        <div className="h-80" style={{ minWidth: getMinWidth() }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 25, left: 35, bottom: 25 }}
              barGap={3}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#5b6b8c', fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                dy={6}
                angle={-25}
                textAnchor="end"
                height={45}
              />
              <YAxis
                tick={{ fill: '#5b6b8c', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={54}
                tickFormatter={(v) => {
                  if (profile?.currency === 'INR') return `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  if (profile?.currency === 'USD') return `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  return `${v}`
                }}
              />
              <Tooltip content={<ChartTooltip currency={profile?.currency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="income"
                name="Incoming Money"
                fill="#34d399"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="expense"
                name="Spending Money"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
