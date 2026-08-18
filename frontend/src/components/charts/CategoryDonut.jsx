import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { categoryById } from '../../data/mockData'
import { fmtMoney } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'
import { categoryTotals } from '../../lib/utils'

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const cat = categoryById[item.name]
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-xl shadow-black/40">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full" style={{ background: item.payload.color }} />
        <span className="font-medium text-slate-100">{cat?.name}</span>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {fmtMoney(item.value)} · {item.payload.pct}%
      </p>
    </div>
  )
}

export default function CategoryDonut() {
  const { transactions, profile } = useBudget()
  const totals = categoryTotals(transactions, new Date(), 'expense')
  const total = Object.values(totals).reduce((a, b) => a + b, 0)

  const data = Object.entries(totals)
    .map(([id, value]) => ({
      name: id,
      value: Math.round(value * 100) / 100,
      color: categoryById[id]?.color || '#64748b',
      pct: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-3">
        No expense data this month yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] text-ink-3">Spent</p>
          <p className="text-lg font-bold text-slate-100">{fmtMoney(total, profile.currency)}</p>
        </div>
      </div>
      <ul className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {data.slice(0, 6).map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="truncate text-ink-2">{categoryById[d.name]?.name}</span>
            <span className="ml-auto font-semibold text-slate-200">{d.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
